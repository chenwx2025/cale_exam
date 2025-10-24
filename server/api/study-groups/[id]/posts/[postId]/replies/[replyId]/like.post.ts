import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const replyId = getRouterParam(event, 'replyId')

  if (!groupId || !replyId) {
    throw createError({
      statusCode: 400,
      message: '缺少参数'
    })
  }

  try {
    // 验证是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能点赞'
      })
    }

    // 检查是否已经点赞
    const existingLike = await prisma.studyGroupReplyLike.findUnique({
      where: {
        userId_replyId: {
          userId: user.userId,
          replyId
        }
      }
    })

    if (existingLike) {
      // 取消点赞
      await prisma.studyGroupReplyLike.delete({
        where: {
          userId_replyId: {
            userId: user.userId,
            replyId
          }
        }
      })

      return {
        success: true,
        data: {
          isLiked: false
        },
        message: '已取消点赞'
      }
    } else {
      // 添加点赞
      await prisma.studyGroupReplyLike.create({
        data: {
          userId: user.userId,
          replyId
        }
      })

      return {
        success: true,
        data: {
          isLiked: true
        },
        message: '点赞成功'
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('点赞回复失败:', error)
    throw createError({
      statusCode: 500,
      message: '点赞回复失败'
    })
  }
})
