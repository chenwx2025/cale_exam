import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  requireAdmin(event)

  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20
    const type = (query.type as string) || 'all'
    const status = (query.status as string) || 'all'
    const search = (query.search as string) || ''

    // 构建查询条件
    const where: any = {}

    // 类型筛选
    if (type !== 'all') {
      where.type = type
    }

    // 状态筛选 - 基于 isRead
    if (status === 'read') {
      where.isRead = true
    } else if (status === 'unread') {
      where.isRead = false
    }

    // 搜索条件 - 按标题或内容
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } }
      ]
    }

    // 查询总数
    const total = await prisma.notification.count({ where })

    // 查询通知列表
    const notifications = await prisma.notification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            nickname: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    return {
      success: true,
      notifications,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  } catch (error: any) {
    console.error('Get notifications list error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get notifications list: ' + error.message
    })
  }
})
