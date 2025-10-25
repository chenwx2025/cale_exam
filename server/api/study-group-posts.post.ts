import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'
import { parseMentions, createMentions } from '~/server/utils/mention-parser'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT POSTS POST] ========== 请求到达 ==========')

  const user = await requireAuth(event)
  console.log('[FLAT POSTS POST] 用户:', user.userId)

  const body = await readBody(event)
  const { groupId, content, type, title, status, tagIds } = body

  console.log('[FLAT POSTS POST] groupId:', groupId, 'title:', title)

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  if (!content || !content.trim()) {
    throw createError({
      statusCode: 400,
      message: '帖子内容不能为空'
    })
  }

  // 标题是必需的（BBS模式）
  if (!title || !title.trim()) {
    throw createError({
      statusCode: 400,
      message: '标题不能为空'
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
        message: '只有小组成员才能发帖'
      })
    }

    console.log('[FLAT POSTS POST] 用户是小组成员，开始创建帖子')

    // 创建帖子
    const postData: any = {
      groupId,
      userId: user.userId,
      title: title.trim(),
      content: content.trim(),
      type: type || 'discussion'
    }

    // 如果是问题类型，添加状态
    if (type === 'question') {
      postData.status = status || 'pending'
    }

    const post = await prisma.studyGroupPost.create({
      data: postData
    })

    console.log('[FLAT POSTS POST] 帖子创建成功:', post.id)

    // 处理@提及
    try {
      const mentionedUserIds = await parseMentions(content, groupId)
      if (mentionedUserIds.length > 0) {
        await createMentions(post.id, null, user.userId, mentionedUserIds)
        console.log(`[FLAT POSTS POST] 创建了 ${mentionedUserIds.length} 个@提及`)
      }
    } catch (error) {
      // @提及处理失败不影响帖子创建
      console.error('[FLAT POSTS POST] 处理@提及失败:', error)
    }

    // 处理标签关联
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      try {
        // 创建帖子-标签关联
        await prisma.postTagRelation.createMany({
          data: tagIds.map((tagId: string) => ({
            postId: post.id,
            tagId
          })),
          skipDuplicates: true
        })

        // 更新标签的使用计数
        await prisma.postTag.updateMany({
          where: {
            id: { in: tagIds }
          },
          data: {
            postCount: { increment: 1 }
          }
        })

        console.log(`[FLAT POSTS POST] 关联了 ${tagIds.length} 个标签`)
      } catch (error) {
        console.error('[FLAT POSTS POST] 处理标签失败:', error)
      }
    }

    console.log('[FLAT POSTS POST] 准备返回响应...')

    return {
      success: true,
      data: post,
      message: '帖子发布成功'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT POSTS POST] 发布帖子失败:', error)
    throw createError({
      statusCode: 500,
      message: '发布帖子失败'
    })
  }
})
