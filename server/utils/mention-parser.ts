import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 从文本中提取@提及
 * 支持格式：
 * - @用户名
 * - @用户ID
 * - @"用户名包含空格"
 */
export function extractMentions(content: string): string[] {
  const mentions: string[] = []

  // 匹配 @username 或 @"username with spaces"
  const mentionRegex = /@([a-zA-Z0-9_\u4e00-\u9fa5]+)|@"([^"]+)"/g
  let match

  while ((match = mentionRegex.exec(content)) !== null) {
    const mention = match[1] || match[2] // 获取用户名或引号内的用户名
    if (mention && !mentions.includes(mention)) {
      mentions.push(mention)
    }
  }

  return mentions
}

/**
 * 解析@提及并查找对应的用户ID
 * @param content 帖子/回复内容
 * @param groupId 小组ID（用于验证用户是否为成员）
 * @returns 被提及用户的ID列表
 */
export async function parseMentions(content: string, groupId: string): Promise<string[]> {
  const mentionNames = extractMentions(content)

  if (mentionNames.length === 0) {
    return []
  }

  console.log('[Mention Parser] 提取到的提及:', mentionNames)

  // 查找小组成员中匹配的用户
  const members = await prisma.studyGroupMember.findMany({
    where: {
      groupId,
      user: {
        OR: [
          { name: { in: mentionNames } },
          { email: { in: mentionNames } },
          { nickname: { in: mentionNames } },
          { id: { in: mentionNames } }
        ]
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          nickname: true
        }
      }
    }
  })

  const userIds = members.map(m => m.userId)
  console.log('[Mention Parser] 找到的用户ID:', userIds)

  return userIds
}

/**
 * 创建@提及记录
 * @param postId 帖子ID（可选）
 * @param replyId 回复ID（可选）
 * @param mentionerUserId 提及者的用户ID
 * @param mentionedUserIds 被提及用户的ID列表
 */
export async function createMentions(
  postId: string | null,
  replyId: string | null,
  mentionerUserId: string,
  mentionedUserIds: string[]
): Promise<void> {
  if (mentionedUserIds.length === 0) {
    return
  }

  // 不要提及自己
  const filteredUserIds = mentionedUserIds.filter(id => id !== mentionerUserId)

  if (filteredUserIds.length === 0) {
    return
  }

  console.log('[Mention Parser] 创建提及记录:', {
    postId,
    replyId,
    mentionerUserId,
    mentionedUserIds: filteredUserIds
  })

  // 批量创建提及记录
  const mentionRecords = filteredUserIds.map(mentionedUserId => ({
    postId,
    replyId,
    mentionedUserId,
    mentionerUserId,
    isRead: false
  }))

  await prisma.postMention.createMany({
    data: mentionRecords,
    skipDuplicates: true
  })

  console.log('[Mention Parser] 成功创建 ' + mentionRecords.length + ' 条提及记录')
}

/**
 * 将文本中的@提及转换为HTML链接
 * @param content 原始内容
 * @param groupId 小组ID
 * @returns 带有链接的HTML内容
 */
export async function renderMentions(content: string, groupId: string): Promise<string> {
  const mentionNames = extractMentions(content)

  if (mentionNames.length === 0) {
    return content
  }

  // 查找对应的用户
  const members = await prisma.studyGroupMember.findMany({
    where: {
      groupId,
      user: {
        OR: [
          { name: { in: mentionNames } },
          { email: { in: mentionNames } },
          { nickname: { in: mentionNames } }
        ]
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          nickname: true
        }
      }
    }
  })

  let result = content

  // 替换每个@提及为链接
  for (const member of members) {
    const user = member.user
    const displayName = user.nickname || user.name || user.email.split('@')[0]

    // 尝试替换不同格式的提及
    const patterns = [
      new RegExp(`@${user.name}\\b`, 'g'),
      new RegExp(`@${user.email}\\b`, 'g'),
      user.nickname ? new RegExp(`@${user.nickname}\\b`, 'g') : null,
      new RegExp(`@"${displayName}"`, 'g')
    ].filter(Boolean)

    for (const pattern of patterns) {
      if (pattern) {
        result = result.replace(
          pattern,
          `<a href="/profile/${user.id}" class="mention-link" data-user-id="${user.id}">@${displayName}</a>`
        )
      }
    }
  }

  return result
}
