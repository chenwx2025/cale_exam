import { PrismaClient } from '@prisma/client'
import { getUserFromEvent } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = getUserFromEvent(event)

  try {
    // 获取或创建默认设置
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: user.userId }
    })

    if (!settings) {
      // 创建默认设置
      settings = await prisma.notificationSettings.create({
        data: {
          userId: user.userId
        }
      })
    }

    // 解析 JSON 字段
    const reminderDays = JSON.parse(settings.reminderDays)

    return {
      success: true,
      data: {
        ...settings,
        reminderDays
      }
    }
  } catch (error: any) {
    console.error('Get notification settings error:', error)

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch notification settings'
    })
  }
})
