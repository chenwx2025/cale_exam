import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const postId = getRouterParam(event, 'postId')

  if (!groupId || !postId) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数'
    })
  }

  try {
    console.log('[Like Post] 切换点赞, postId:', postId, 'userId:', user.userId)

    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员可以点赞帖子'
      })
    }

    // 检查是否已点赞
    const existing = await prisma.studyGroupPostLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.userId
        }
      }
    })

    if (existing) {
      console.log('[Like Post] 取消点赞')
      // 取消点赞
      await prisma.$transaction([
        prisma.studyGroupPostLike.delete({
          where: { id: existing.id }
        }),
        prisma.studyGroupPost.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } }
        })
      ])

      return {
        success: true,
        action: 'unliked',
        message: '已取消点赞'
      }
    } else {
      console.log('[Like Post] 添加点赞')
      // 添加点赞
      await prisma.$transaction([
        prisma.studyGroupPostLike.create({
          data: {
            postId,
            userId: user.userId
          }
        }),
        prisma.studyGroupPost.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } }
        })
      ])

      return {
        success: true,
        action: 'liked',
        message: '点赞成功'
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[Like Post] 操作失败:', error)
    throw createError({
      statusCode: 500,
      message: '点赞操作失败'
    })
  }
})
