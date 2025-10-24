import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const {
    enabled,
    generateTime,
    difficulty,
    focusDomains,
    excludeRecent,
    prioritizeWeak
  } = body

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  try {
    // 检查是否是组长或管理员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能操作'
      })
    }

    if (membership.role !== 'owner' && membership.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: '只有组长和管理员才能配置每日一题'
      })
    }

    // 验证生成时间格式
    if (generateTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(generateTime)) {
      throw createError({
        statusCode: 400,
        message: '生成时间格式错误，应为 HH:MM'
      })
    }

    // 准备更新数据
    const updateData: any = {}
    if (typeof enabled === 'boolean') updateData.enabled = enabled
    if (generateTime) updateData.generateTime = generateTime
    if (difficulty !== undefined) updateData.difficulty = difficulty
    if (focusDomains !== undefined) {
      updateData.focusDomains = Array.isArray(focusDomains)
        ? JSON.stringify(focusDomains)
        : focusDomains
    }
    if (typeof excludeRecent === 'number') updateData.excludeRecent = excludeRecent
    if (typeof prioritizeWeak === 'boolean') updateData.prioritizeWeak = prioritizeWeak

    // 创建或更新配置
    const config = await prisma.studyGroupDailyQuestionConfig.upsert({
      where: { groupId },
      create: {
        groupId,
        enabled: enabled ?? false,
        generateTime: generateTime ?? '00:00',
        difficulty,
        focusDomains: Array.isArray(focusDomains) ? JSON.stringify(focusDomains) : focusDomains,
        excludeRecent: excludeRecent ?? 7,
        prioritizeWeak: prioritizeWeak ?? true
      },
      update: updateData
    })

    console.log(`[DailyQuestionConfig] 配置已更新:`, config)

    return {
      success: true,
      data: config,
      message: '配置已保存'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[DailyQuestionConfig] 保存配置失败:', error)
    throw createError({
      statusCode: 500,
      message: '保存配置失败'
    })
  }
})
