import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

/**
 * 检查用户新解锁的成就
 * GET /api/achievements/check-new
 *
 * 返回用户最近解锁但还未查看的成就列表
 */
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)

  try {
    // 获取用户最近5分钟内解锁的成就（还未通知的）
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    const newAchievements = await prisma.userAchievement.findMany({
      where: {
        userId,
        isUnlocked: true,
        unlockedAt: {
          gte: fiveMinutesAgo
        }
      },
      include: {
        achievement: true
      },
      orderBy: {
        unlockedAt: 'desc'
      }
    })

    // 如果有新成就，返回成就信息
    const achievements = newAchievements.map(ua => ({
      id: ua.achievement.id,
      code: ua.achievement.code,
      name: ua.achievement.name,
      nameEn: ua.achievement.nameEn,
      description: ua.achievement.description,
      descriptionEn: ua.achievement.descriptionEn,
      category: ua.achievement.category,
      icon: ua.achievement.icon,
      rarity: ua.achievement.rarity,
      points: ua.achievement.points,
      unlockedAt: ua.unlockedAt
    }))

    return {
      success: true,
      achievements,
      count: achievements.length
    }
  } catch (error) {
    console.error('检查新成就失败:', error)
    return {
      success: false,
      error: '检查新成就失败',
      achievements: [],
      count: 0
    }
  }
})
