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
        message: '只有小组成员才能查看回复'
      })
    }

    // 获取帖子的所有回复
    const replies = await prisma.studyGroupPostReply.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            nickname: true
          }
        },
        _count: {
          select: {
            likes: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // 获取用户对回复的点赞状态
    const replyIds = replies.map(r => r.id)
    const userLikes = await prisma.studyGroupReplyLike.findMany({
      where: {
        replyId: { in: replyIds },
        userId: user.userId
      },
      select: {
        replyId: true
      }
    })
    const likedReplyIds = new Set(userLikes.map(like => like.replyId))

    // 为每个回复添加点赞信息
    const repliesWithLikes = replies.map(reply => ({
      ...reply,
      likeCount: reply._count.likes,
      isLiked: likedReplyIds.has(reply.id),
      _count: undefined
    }))

    return {
      success: true,
      data: repliesWithLikes
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('获取回复失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取回复失败'
    })
  }
})
