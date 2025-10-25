import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const query = getQuery(event)

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  try {
    console.log('[Search Posts] 搜索帖子, groupId:', groupId, 'query:', query)

    // 验证用户是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员可以搜索帖子'
      })
    }

    // 构建搜索条件
    const where: any = {
      groupId
    }

    // 关键词搜索（标题或内容）
    if (query.keyword) {
      where.OR = [
        { title: { contains: query.keyword as string } },
        { content: { contains: query.keyword as string } }
      ]
    }

    // 帖子类型过滤
    if (query.type && query.type !== 'all') {
      where.type = query.type
    }

    // 帖子状态过滤
    if (query.status && query.status !== 'all') {
      where.status = query.status
    }

    // 作者过滤
    if (query.authorId) {
      where.userId = query.authorId
    }

    // 精华帖过滤
    if (query.isFeatured === 'true') {
      where.isFeatured = true
    }

    // 置顶帖过滤
    if (query.isPinned === 'true') {
      where.isPinned = true
    }

    // 已解决问题过滤
    if (query.solved === 'true') {
      where.type = 'question'
      where.status = 'solved'
    }

    // 分页参数
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20
    const skip = (page - 1) * pageSize

    console.log('[Search Posts] 搜索条件:', JSON.stringify(where, null, 2))

    // 查询帖子
    const [posts, total] = await Promise.all([
      prisma.studyGroupPost.findMany({
        where,
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
              userId: true
            }
          },
          replies: {
            select: {
              id: true
            }
          }
        },
        orderBy: [
          { isPinned: 'desc' },
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: pageSize
      }),
      prisma.studyGroupPost.count({ where })
    ])

    console.log('[Search Posts] 找到 ' + posts.length + ' 个帖子，共 ' + total + ' 个')

    // 格式化返回数据
    const formattedPosts = posts.map(post => ({
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
      replyCount: post.replies.length,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isLiked: post.likes.some(like => like.userId === user.userId),
      author: post.user
    }))

    return {
      success: true,
      data: formattedPosts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[Search Posts] 搜索失败:', error)
    throw createError({
      statusCode: 500,
      message: '搜索帖子失败'
    })
  }
})
