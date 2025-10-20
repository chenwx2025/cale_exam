import { PrismaClient } from '@prisma/client'
import { getUserFromEvent } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = getUserFromEvent(event)

  try {
    const notificationId = event.context.params?.id

    if (!notificationId) {
      throw createError({
        statusCode: 400,
        message: 'Notification ID is required'
      })
    }

    // 验证通知所有权
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification) {
      throw createError({
        statusCode: 404,
        message: 'Notification not found'
      })
    }

    if (notification.userId !== user.userId) {
      throw createError({
        statusCode: 403,
        message: 'Access denied'
      })
    }

    // 标记为已读
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return {
      success: true,
      message: 'Notification marked as read',
      data: updatedNotification
    }
  } catch (error: any) {
    console.error('Mark notification as read error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to mark notification as read'
    })
  }
})
