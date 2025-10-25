import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'
import { parseMentions, createMentions } from '~/server/utils/mention-parser'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const postId = getRouterParam(event, 'postId')
  const body = await readBody(event)

  const { content } = body

  if (!groupId || !postId) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数'
    })
  }

  if (!content || !content.trim()) {
    throw createError({
      statusCode: 400,
      message: '回复内容不能为空'
    })
  }

  try {
    // 检查是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能回复'
      })
    }

    // 检查帖子是否存在且属于该小组
    const post = await prisma.studyGroupPost.findUnique({
      where: { id: postId }
    })

    if (!post || post.groupId !== groupId) {
      throw createError({
        statusCode: 404,
        message: '帖子不存在'
      })
    }

    // 检查帖子是否已锁定
    if (post.isLocked) {
      throw createError({
        statusCode: 403,
        message: '该帖子已被锁定，无法添加回复'
      })
    }

    // 创建回复并更新帖子的回复计数
    const [reply] = await prisma.$transaction([
      prisma.studyGroupPostReply.create({
        data: {
          postId,
          userId: user.userId,
          content: content.trim()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              nickname: true
            }
          }
        }
      }),
      prisma.studyGroupPost.update({
        where: { id: postId },
        data: {
          replyCount: {
            increment: 1
          }
        }
      })
    ])

    // 处理@提及
    try {
      const mentionedUserIds = await parseMentions(content, groupId)
      if (mentionedUserIds.length > 0) {
        await createMentions(null, reply.id, user.userId, mentionedUserIds)
        console.log(`[Reply Create] 创建了 ${mentionedUserIds.length} 个@提及`)
      }
    } catch (error) {
      // @提及处理失败不影响回复创建
      console.error('[Reply Create] 处理@提及失败:', error)
    }

    return {
      success: true,
      data: reply,
      message: '回复发布成功'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('发布回复失败:', error)
    throw createError({
      statusCode: 500,
      message: '发布回复失败'
    })
  }
})
