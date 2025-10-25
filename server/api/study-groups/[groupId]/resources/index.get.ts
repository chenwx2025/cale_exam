import { PrismaClient } from '@prisma/client'
import { verifyAccessToken } from '~/server/utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: '未授权访问'
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)
    if (!decoded || !decoded.userId) {
      throw createError({
        statusCode: 401,
        message: '无效的访问令牌'
      })
    }

    const userId = decoded.userId
    const groupId = event.context.params?.groupId

    if (!groupId) {
      throw createError({
        statusCode: 400,
        message: '缺少小组ID'
      })
    }

    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId,
        status: 'active'
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '您不是该小组成员，无法查看资料'
      })
    }

    // 获取查询参数
    const query = getQuery(event)
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
          _count: {
            select: {
              ratings: true,
              comments: true,
              downloads: true,
              favorites: true
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
    console.error('获取资料列表失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '获取资料列表失败'
    })
  }
})
