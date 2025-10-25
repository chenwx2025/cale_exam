import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT RESOURCES GET] ========== 请求到达 ==========')
  const user = await requireAuth(event)
  const query = getQuery(event)
  const groupId = query.groupId as string

  console.log('[FLAT RESOURCES GET] 参数:', { groupId, userId: user.userId })

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  try {
    // 检查用户是否是小组成员
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
        message: '您不是该小组成员，无法查看资料'
      })
    }

    // 获取查询参数
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20
    const category = query.category as string
    const type = query.type as string
    const search = query.search as string
    const sortBy = (query.sortBy as string) || 'createdAt'
    const sortOrder = (query.sortOrder as string) || 'desc'

    // 构建查询条件
    const where: any = {
      groupId,
      deletedAt: null,
      status: 'approved'
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (type && type !== 'all') {
      where.type = type
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ]
    }

    // 构建排序条件
    const orderBy: any = {}
    if (sortBy === 'downloadCount') {
      orderBy.downloadCount = sortOrder
    } else if (sortBy === 'averageRating') {
      orderBy.averageRating = sortOrder
    } else if (sortBy === 'viewCount') {
      orderBy.viewCount = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    // 查询资料列表
    const [resources, total] = await Promise.all([
      prisma.studyResource.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          files: {
            orderBy: {
              displayOrder: 'asc'
            }
          },
          _count: {
            select: {
              ratings: true,
              comments: true,
              downloads: true,
              favorites: true,
              files: true
            }
          }
        }
      }),
      prisma.studyResource.count({ where })
    ])

    // 处理资料数据
    const processedResources = resources.map(resource => ({
      ...resource,
      tags: resource.tags ? JSON.parse(resource.tags) : [],
      ratingCount: resource._count.ratings,
      commentCount: resource._count.comments,
      favoriteCount: resource._count.favorites
    }))

    console.log('[FLAT RESOURCES GET] 加载到资料数量:', processedResources.length)
    return {
      success: true,
      data: {
        resources: processedResources,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT RESOURCES GET] 获取资料列表失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取资料列表失败'
    })
  }
})
