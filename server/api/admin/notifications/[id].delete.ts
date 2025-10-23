import { PrismaClient } from '@prisma/client'
import { requireAdmin, getRequestIP } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  const adminUser = requireAdmin(event)

  try {
    const notificationId = getRouterParam(event, 'id')

    if (!notificationId) {
      throw createError({
        statusCode: 400,
        message: 'Notification ID is required'
      })
    }

    // 检查通知是否存在
    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!existingNotification) {
      throw createError({
        statusCode: 404,
        message: 'Notification not found'
      })
    }

    // 删除通知
    await prisma.notification.delete({
      where: { id: notificationId }
    })

    // 记录管理员操作日志
    await prisma.adminLog.create({
      data: {
        adminId: adminUser.userId,
        action: 'delete_notification',
        targetType: 'notification',
        targetId: notificationId,
        details: JSON.stringify({
          title: existingNotification.title,
          type: existingNotification.type,
          userId: existingNotification.userId
        }),
        ipAddress: getRequestIP(event) || undefined,
        userAgent: getRequestHeader(event, 'user-agent') || undefined
      }
    })

    return {
      success: true,
      message: 'Notification deleted successfully'
    }
  } catch (error: any) {
    // 如果是已知错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    console.error('Delete notification error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to delete notification: ' + error.message
    })
  }
})
