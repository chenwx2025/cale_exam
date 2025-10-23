import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireAuth(event)

    // Get recently unlocked achievements (last 10)
    const userAchievements = await prisma.userAchievement.findMany({
      where: {
        userId,
        isUnlocked: true
      },
      include: {
        achievement: true
      },
      orderBy: {
        unlockedAt: 'desc'
      },
      take: 10
    })

    const achievements = userAchievements.map(ua => ({
      id: ua.achievement.id,
      code: ua.achievement.code,
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      points: ua.achievement.points,
      rarity: ua.achievement.rarity,
      category: ua.achievement.category,
      isUnlocked: true,
      unlockedAt: ua.unlockedAt
    }))

    return {
      success: true,
      achievements
    }
  } catch (error: any) {
    console.error('Error fetching recent achievements:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch recent achievements',
      achievements: []
    }
  }
})
