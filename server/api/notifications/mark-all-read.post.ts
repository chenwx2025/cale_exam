import { PrismaClient } from '@prisma/client'
import { getCurrentUser } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = getCurrentUser(event)

  try {
    // 标记所有未读通知为已读
    const result = await prisma.notification.updateMany({
      where: {
        userId: user.userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return {
      success: true,
      message: `Marked ${result.count} notifications as read`,
      data: {
        count: result.count
      }
    }
  } catch (error: any) {
    console.error('Mark all notifications as read error:', error)

    throw createError({
      statusCode: 500,
      message: 'Failed to mark all notifications as read'
    })
  }
})
