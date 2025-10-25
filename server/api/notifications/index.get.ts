import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 要求用户必须登录
  const user = await requireAuth(event)

  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const type = query.type as string
    const unreadOnly = query.unreadOnly === 'true'

    // 构建查询条件
    const where: any = {
      userId: user.id
    }

    if (type) {
      where.type = type
    }

    if (unreadOnly) {
      where.isRead = false
    }

    // 获取通知列表
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: user.id,
          isRead: false
        }
      })
    ])

    return {
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        unreadCount
      }
    }
  } catch (error: any) {
    console.error('Get notifications error:', error)

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch notifications'
    })
  }
})
