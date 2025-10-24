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
        message: '只有小组成员才能查看回复'
      })
    }

    // 验证帖子是否属于该小组
    const post = await prisma.studyGroupPost.findFirst({
      where: {
        id: postId,
        groupId
      }
    })

    if (!post) {
      throw createError({
        statusCode: 404,
        message: '帖子不存在'
      })
    }

    // 获取回复列表
    const replies = await prisma.studyGroupPostReply.findMany({
      where: {
        postId
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

    // 获取当前用户点赞的回复ID列表
    const likedReplyIds = new Set(
      (await prisma.studyGroupReplyLike.findMany({
        where: {
          userId: user.userId,
          replyId: {
            in: replies.map(r => r.id)
          }
        },
        select: {
          replyId: true
        }
      })).map(like => like.replyId)
    )

    // 添加点赞信息
    const repliesWithLikes = replies.map(reply => ({
      ...reply,
      author: reply.user,
      likeCount: reply._count.likes,
      isLiked: likedReplyIds.has(reply.id),
      user: undefined,
      _count: undefined
    }))

    return {
      success: true,
      data: repliesWithLikes
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('获取回复列表失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取回复列表失败'
    })
  }
})
