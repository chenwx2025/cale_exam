import { PrismaClient } from '@prisma/client'
import { requireAdmin, getRequestIP } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  const adminUser = requireAdmin(event)

  try {
    const body = await readBody(event)
    const { title, content, type, targetType, targetUserIds } = body

    // 验证必填字段
    if (!title || !content || !type) {
      throw createError({
        statusCode: 400,
        message: 'Title, content and type are required'
      })
    }

    // 验证类型
    const validTypes = ['system', 'exam', 'study', 'achievement', 'subscription', 'reminder', 'announcement']
    if (!validTypes.includes(type)) {
      throw createError({
        statusCode: 400,
        message: `Invalid type. Must be one of: ${validTypes.join(', ')}`
      })
    }

    let userIds: string[] = []

    // 根据目标类型获取用户ID列表
    if (targetType === 'all') {
      // 发送给所有用户
      const allUsers = await prisma.user.findMany({
        where: {
          status: 'active' // 只发送给活跃用户
        },
        select: { id: true }
      })
      userIds = allUsers.map(u => u.id)
    } else if (targetType === 'specific' && targetUserIds && Array.isArray(targetUserIds)) {
      // 发送给指定用户
      userIds = targetUserIds
    } else if (targetType === 'cale') {
      // 发送给CALE考试订阅用户
      const caleUsers = await prisma.user.findMany({
        where: {
          status: 'active',
          subscribedExams: {
            some: {
              examType: 'cale',
              isActive: true
            }
          }
        },
        select: { id: true }
      })
      userIds = caleUsers.map(u => u.id)
    } else if (targetType === 'nccaom') {
      // 发送给NCCAOM考试订阅用户
      const nccaomUsers = await prisma.user.findMany({
        where: {
          status: 'active',
          subscribedExams: {
            some: {
              examType: 'nccaom',
              isActive: true
            }
          }
        },
        select: { id: true }
      })
      userIds = nccaomUsers.map(u => u.id)
    } else {
      throw createError({
        statusCode: 400,
        message: 'Invalid targetType. Must be: all, specific, cale, or nccaom'
      })
    }

    if (userIds.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No users found for the specified target'
      })
    }

    // 批量创建通知
    const notifications = await prisma.notification.createMany({
      data: userIds.map(userId => ({
        userId,
        title,
        content,
        type,
        isRead: false
      }))
    })

    // 记录管理员操作日志
    await prisma.adminLog.create({
      data: {
        adminId: adminUser.userId,
        action: 'create_notification',
        targetType: 'notification',
        targetId: 'batch',
        details: JSON.stringify({
          title,
          type,
          targetType,
          userCount: userIds.length
        }),
        ipAddress: getRequestIP(event) || undefined,
        userAgent: getRequestHeader(event, 'user-agent') || undefined
      }
    })

    return {
      success: true,
      message: `Successfully sent ${notifications.count} notifications`,
      count: notifications.count
    }
  } catch (error: any) {
    // 如果是已知错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    console.error('Create notification error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create notification: ' + error.message
    })
  }
})
