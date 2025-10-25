import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const postId = getRouterParam(event, 'postId')

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  if (!postId) {
    throw createError({
      statusCode: 400,
      message: '缺少帖子ID'
    })
  }

  try {
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
        message: '只有小组成员可以查看讨论'
      })
    }

    // 获取帖子详情
    const post = await prisma.studyGroupPost.findUnique({
      where: {
        id: postId,
        groupId // 确保帖子属于这个小组
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
        replies: {
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
            likes: {
              select: {
                id: true,
                userId: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        likes: {
          select: {
            id: true,
            userId: true,
            createdAt: true
          }
        },
        bookmarks: {
          select: {
            id: true,
            userId: true,
            createdAt: true
          }
        },
        poll: {
          select: {
            id: true
          }
        }
      }
    })

    if (!post) {
      throw createError({
        statusCode: 404,
        message: '帖子不存在'
      })
    }

    // 增加浏览量
    await prisma.studyGroupPost.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } }
    })

    // 检查当前用户是否点赞了这个帖子
    const isLiked = post.likes.some(like => like.userId === user.userId)

    // 检查当前用户是否收藏了这个帖子
    const isBookmarked = post.bookmarks.some(bookmark => bookmark.userId === user.userId)

    // 格式化回复数据并添加楼层号（基于时间顺序）
    const formattedReplies = post.replies.map((reply, originalIndex) => {
      const isReplyLiked = reply.likes.some(like => like.userId === user.userId)

      return {
        id: reply.id,
        postId: reply.postId,
        userId: reply.userId,
        content: reply.content,
        isBestAnswer: reply.isBestAnswer, // 是否为最佳答案
        floorNumber: originalIndex + 2, // 楼层号：1楼是主帖，回复从2楼开始
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        likeCount: reply.likes?.length || 0,
        isLiked: isReplyLiked,
        author: reply.user
      }
    })

    // 对回复进行排序：最佳答案置顶，其他按时间顺序
    formattedReplies.sort((a, b) => {
      // 最佳答案优先
      if (a.isBestAnswer && !b.isBestAnswer) return -1
      if (!a.isBestAnswer && b.isBestAnswer) return 1
      // 其他情况按创建时间排序
      return new Date(a.createdAt) - new Date(b.createdAt)
    })

    // 返回格式化的帖子数据
    return {
      id: post.id,
      groupId: post.groupId,
      userId: post.userId,
      title: post.title,
      content: post.content,
      type: post.type,
      status: post.status,
      isPinned: post.isPinned,
      isFeatured: post.isFeatured, // 是否精华帖
      viewCount: post.viewCount + 1, // 返回增加后的浏览量
      likeCount: post.likeCount,
      replyCount: post.replyCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isLiked,
      isBookmarked,
      hasPoll: !!post.poll, // 是否有投票
      author: post.user,
      replies: formattedReplies
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('获取帖子详情失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取帖子详情失败'
    })
  }
})
