import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT POSTS GET] ========== 请求到达 ==========')

  const user = await requireAuth(event)
  console.log('[FLAT POSTS GET] 用户:', user.userId)

  const query = getQuery(event)
  const groupId = query.groupId as string
  const tagId = query.tagId as string | undefined

  console.log('[FLAT POSTS GET] groupId:', groupId, 'tagId:', tagId)

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  try {
    console.log('[FLAT POSTS GET] 开始获取帖子列表, groupId:', groupId, 'userId:', user.userId, 'tagId:', tagId)

    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      console.log('[FLAT POSTS GET] 用户不是小组成员')
      throw createError({
        statusCode: 403,
        message: '只有小组成员可以查看讨论'
      })
    }

    console.log('[FLAT POSTS GET] 用户是小组成员，开始查询帖子')

    // 构建查询条件
    const whereCondition: any = {
      groupId,
      deletedAt: null  // 只显示未删除的帖子
    }

    // 如果指定了标签，添加标签过滤
    if (tagId) {
      whereCondition.tags = {
        some: {
          tagId: tagId
        }
      }
    }

    // 获取帖子列表 (排除已删除的帖子)
    const posts = await prisma.studyGroupPost.findMany({
      where: whereCondition,
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
        tags: {
          include: {
            tag: true
          }
        },
        poll: {
          select: {
            id: true,
            totalVotes: true
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },     // 置顶优先
        { isFeatured: 'desc' },   // 精华次之
        { createdAt: 'desc' }     // 最新排后
      ]
    })

    console.log('[FLAT POSTS GET] 查询到帖子数量:', posts.length)

    // 映射数据格式以匹配前端期望
    const formattedPosts = posts.map(post => {
      // 检查当前用户是否点赞了这个帖子
      const isLiked = post.likes.some(like => like.userId === user.userId)

      const formattedReplies = post.replies.map(reply => ({
        id: reply.id,
        postId: reply.postId,
        userId: reply.userId,
        content: reply.content,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        author: reply.user
      }))

      return {
        id: post.id,
        groupId: post.groupId,
        userId: post.userId,
        title: post.title,
        content: post.content,
        type: post.type,
        status: post.status,
        isPinned: post.isPinned,
        isFeatured: post.isFeatured,
        viewCount: post.viewCount,
        likeCount: post.likeCount,
        replyCount: post.replyCount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        isLiked,
        author: post.user,
        replies: formattedReplies,
        tags: post.tags.map(t => t.tag)
      }
    })

    console.log('[FLAT POSTS GET] 准备返回响应，帖子数量:', formattedPosts.length)

    return {
      success: true,
      data: formattedPosts
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT POSTS GET] 获取帖子列表失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取帖子列表失败'
    })
  }
})
