import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) // requireAuth 返回 Promise
  const groupId = getRouterParam(event, 'id')
  const query = getQuery(event)
  const tagId = query.tagId as string | undefined

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  try {
    console.log('[GET Posts] 开始获取帖子列表, groupId:', groupId, 'userId:', user.userId, 'tagId:', tagId)

    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      console.log('[GET Posts] 用户不是小组成员')
      throw createError({
        statusCode: 403,
        message: '只有小组成员可以查看讨论'
      })
    }

    console.log('[GET Posts] 用户是小组成员，开始查询帖子')

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

    console.log('[GET Posts] 查询到帖子数量:', posts.length)

    // 打印每个帖子的回复信息
    posts.forEach(post => {
      console.log(`[GET Posts] 帖子 ${post.id}: ${post.replies.length} 个回复`)
    })

    // 映射数据格式以匹配前端期望
    const formattedPosts = posts.map(post => {
      // 检查当前用户是否点赞了这个帖子
      const isLiked = post.likes.some(like => like.userId === user.userId)

      console.log(`[GET Posts] 帖子 ${post.id} 格式化前 replies:`, JSON.stringify(post.replies))

      const formattedReplies = post.replies.map(reply => ({
        id: reply.id,
        postId: reply.postId,
        userId: reply.userId,
        content: reply.content,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        author: reply.user
      }))

      console.log(`[GET Posts] 帖子 ${post.id} 格式化后 replies:`, JSON.stringify(formattedReplies))

      const result = {
        id: post.id,
        groupId: post.groupId,
        userId: post.userId,
        title: post.title,
        content: post.content,
        type: post.type,
        status: post.status,
        isPinned: post.isPinned,
        isFeatured: post.isFeatured, // 是否精华帖
        viewCount: post.viewCount, // 浏览量
        likeCount: post.likeCount,
        replyCount: post.replyCount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        isLiked, // 当前用户是否点赞
        author: post.user, // 前端期望 author 字段
        replies: formattedReplies,
        tags: post.tags.map(t => t.tag) // 标签列表
      }

      console.log(`[GET Posts] 帖子 ${post.id} 最终返回对象:`, JSON.stringify(result))

      return result
    })

    console.log('[GET Posts] 格式化完成，返回数据:', JSON.stringify(formattedPosts))

    return {
      success: true,
      data: formattedPosts
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[GET Posts] 获取帖子列表失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取帖子列表失败'
    })
  }
})
