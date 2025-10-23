import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

/**
 * 获取用户成就列表
 * GET /api/achievements
 */
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)

  try {
    const query = getQuery(event)
    const examType = (query.examType as string) || 'all' // 支持 examType 参数

    // 获取成就（过滤对应考试类型和全平台成就）
    const achievements = await prisma.achievement.findMany({
      where: {
        isActive: true,
        examType: {
          in: examType === 'all' ? ['all', 'cale', 'nccaom'] : [examType, 'all']
        }
      },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' }
      ]
    })

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      }
    })

    // 创建用户成就映射
    const userAchievementMap = new Map(
      userAchievements.map(ua => [ua.achievementId, ua])
    )

    // 合并数据
    const result = achievements.map(achievement => {
      const userAchievement = userAchievementMap.get(achievement.id)

      return {
        id: achievement.id,
        code: achievement.code,
        name: achievement.name,
        nameEn: achievement.nameEn,
        description: achievement.description,
        descriptionEn: achievement.descriptionEn,
        category: achievement.category,
        icon: achievement.icon,
        rarity: achievement.rarity,
        points: achievement.points,
        criteria: JSON.parse(achievement.criteria),
        progress: userAchievement?.progress || 0,
        isUnlocked: userAchievement?.isUnlocked || false,
        unlockedAt: userAchievement?.unlockedAt || null
      }
    })

    // 按分类分组
    const grouped = result.reduce((acc, achievement) => {
      const category = achievement.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(achievement)
      return acc
    }, {} as Record<string, typeof result>)

    return {
      success: true,
      achievements: result,
      grouped,
      stats: {
        total: achievements.length,
        unlocked: userAchievements.filter(ua => ua.isUnlocked).length,
        points: userAchievements
          .filter(ua => ua.isUnlocked)
          .reduce((sum, ua) => sum + ua.achievement.points, 0)
      }
    }
  } catch (error: any) {
    console.error('获取成就列表失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取成就列表失败'
    })
  }
})
