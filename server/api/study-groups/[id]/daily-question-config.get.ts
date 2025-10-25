import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  try {
    // 检查是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能查看配置'
      })
    }

    // 获取配置（如果不存在则返回默认配置）
    let config = await prisma.studyGroupDailyQuestionConfig.findUnique({
      where: { groupId }
    })

    // 如果配置不存在，返回默认值
    if (!config) {
      config = {
        id: '',
        groupId,
        enabled: false,
        generateTime: '00:00',
        difficulty: null,
        focusDomains: null,
        excludeRecent: 7,
        prioritizeWeak: true,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any
    }

    return {
      success: true,
      data: config
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[DailyQuestionConfig] 获取配置失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取配置失败'
    })
  }
})
