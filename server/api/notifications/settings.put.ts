import { PrismaClient } from '@prisma/client'
import { getCurrentUser } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = getCurrentUser(event)

  try {
    const body = await readBody(event)

    // 验证提醒时间格式 (HH:mm)
    if (body.reminderTime && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(body.reminderTime)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid reminder time format. Use HH:mm format.'
      })
    }

    // 验证提醒日期（必须是数组）
    if (body.reminderDays) {
      if (!Array.isArray(body.reminderDays)) {
        throw createError({
          statusCode: 400,
          message: 'reminderDays must be an array'
        })
      }

      // 验证日期范围 (0-6)
      if (body.reminderDays.some((day: number) => day < 0 || day > 6)) {
        throw createError({
          statusCode: 400,
          message: 'reminderDays must contain values between 0 and 6'
        })
      }
    }

    // 验证学习目标
    if (body.dailyGoalMinutes !== undefined && body.dailyGoalMinutes < 0) {
      throw createError({
        statusCode: 400,
        message: 'dailyGoalMinutes must be positive'
      })
    }

    if (body.dailyGoalQuestions !== undefined && body.dailyGoalQuestions < 0) {
      throw createError({
        statusCode: 400,
        message: 'dailyGoalQuestions must be positive'
      })
    }

    // 构建更新数据
    const updateData: any = {}

    // 通知渠道开关
    if (body.emailEnabled !== undefined) updateData.emailEnabled = body.emailEnabled
    if (body.siteEnabled !== undefined) updateData.siteEnabled = body.siteEnabled

    // 通知类型开关
    if (body.studyReminder !== undefined) updateData.studyReminder = body.studyReminder
    if (body.examReminder !== undefined) updateData.examReminder = body.examReminder
    if (body.achievementAlert !== undefined) updateData.achievementAlert = body.achievementAlert
    if (body.systemAlert !== undefined) updateData.systemAlert = body.systemAlert

    // 提醒设置
    if (body.reminderTime) updateData.reminderTime = body.reminderTime
    if (body.reminderDays) updateData.reminderDays = JSON.stringify(body.reminderDays)
    if (body.reminderFrequency) updateData.reminderFrequency = body.reminderFrequency

    // 学习目标
    if (body.dailyGoalMinutes !== undefined) updateData.dailyGoalMinutes = body.dailyGoalMinutes
    if (body.dailyGoalQuestions !== undefined) updateData.dailyGoalQuestions = body.dailyGoalQuestions

    // 更新或创建设置
    const settings = await prisma.notificationSettings.upsert({
      where: { userId: user.userId },
      update: updateData,
      create: {
        userId: user.userId,
        ...updateData
      }
    })

    // 解析 JSON 字段
    const reminderDays = JSON.parse(settings.reminderDays)

    return {
      success: true,
      message: 'Notification settings updated successfully',
      data: {
        ...settings,
        reminderDays
      }
    }
  } catch (error: any) {
    console.error('Update notification settings error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to update notification settings'
    })
  }
})
