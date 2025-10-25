import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT POST DETAIL] ========== 请求到达 ==========')
  const user = await requireAuth(event)
  const query = getQuery(event)
  const groupId = query.groupId as string
  const postId = query.postId as string

  console.log('[FLAT POST DETAIL] 参数:', { groupId, postId, userId: user.userId })

  if (!groupId || !postId) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数'
    })
  }

  try {
    // Check if user is a member of the group
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId,
        isActive: true
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '您不是该小组成员，无法查看帖子'
      })
    }

    // Get post with full details
    const post = await prisma.studyGroupPost.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        replies: {
          orderBy: {
            createdAt: 'asc'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            },
            _count: {
              select: {
                likes: true
              }
            }
          }
        },
        poll: {
          include: {
            options: {
              orderBy: {
                order: 'asc'
              },
              include: {
                votes: {
                  select: {
                    userId: true
                  }
                }
              }
            },
            votes: {
              select: {
                userId: true,
                optionId: true
              }
            }
          }
        },
        _count: {
          select: {
            replies: true,
            likes: true
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

    if (post.groupId !== groupId) {
      throw createError({
        statusCode: 403,
        message: '无权访问该帖子'
      })
    }

    // Check if user has liked the post
    const userLike = await prisma.studyGroupPostLike.findFirst({
      where: {
        postId,
        userId: user.userId
      }
    })

    // Check if user has bookmarked the post
    const userBookmark = await prisma.studyGroupPostBookmark.findFirst({
      where: {
        postId,
        userId: user.userId
      }
    })

    // Check which replies the user has liked
    const userReplyLikes = await prisma.studyGroupReplyLike.findMany({
      where: {
        replyId: {
          in: post.replies.map(r => r.id)
        },
        userId: user.userId
      },
      select: {
        replyId: true
      }
    })

    const likedReplyIds = new Set(userReplyLikes.map(l => l.replyId))

    // Process replies with like status
    const processedReplies = post.replies.map(reply => ({
      ...reply,
      likeCount: reply._count.likes,
      isLiked: likedReplyIds.has(reply.id)
    }))

    // Process poll if exists
    let processedPoll = null
    if (post.poll) {
      const userVote = post.poll.votes.find(v => v.userId === user.userId)
      processedPoll = {
        ...post.poll,
        hasVoted: !!userVote,
        userVotedOptionId: userVote?.optionId || null,
        options: post.poll.options.map(option => ({
          ...option,
          voteCount: option.votes.length,
          hasUserVoted: option.votes.some(v => v.userId === user.userId)
        }))
      }
    }

    const result = {
      ...post,
      author: post.user,  // Map user to author for frontend compatibility
      likeCount: post._count.likes,
      replyCount: post._count.replies,
      isLiked: !!userLike,
      isBookmarked: !!userBookmark,
      replies: processedReplies.map(r => ({
        ...r,
        author: r.user  // Map user to author for replies too
      })),
      poll: processedPoll
    }

    console.log('[FLAT POST DETAIL] 帖子详情加载成功')
    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT POST DETAIL] 获取帖子详情失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取帖子详情失败'
    })
  }
})
