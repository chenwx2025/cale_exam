import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'
import { checkAndUpdateAchievements } from '~/server/utils/achievement-service'

const prisma = new PrismaClient()

/**
 * 检查并更新用户成就
 * POST /api/achievements/check
 *
 * 返回新解锁的成就列表
 */
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)

  try {
    // 检查成就
    const newlyUnlockedIds = await checkAndUpdateAchievements(userId)

    if (newlyUnlockedIds.length === 0) {
      return {
        success: true,
        newAchievements: []
      }
    }

    // 获取新解锁成就的详细信息
    const newAchievements = await prisma.achievement.findMany({
      where: {
        id: { in: newlyUnlockedIds }
      },
      select: {
        id: true,
        code: true,
        name: true,
        nameEn: true,
        description: true,
        descriptionEn: true,
        icon: true,
        rarity: true,
        points: true
      }
    })

    return {
      success: true,
      newAchievements
    }
  } catch (error: any) {
    console.error('检查成就失败:', error)
    throw createError({
      statusCode: 500,
      message: '检查成就失败'
    })
  }
})
