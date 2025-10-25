import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 成就解锁服务
 * 负责检查和解锁用户成就
 */

// 成就类型定义
interface AchievementCriteria {
  type: string
  value: number
  operator?: 'gte' | 'eq' | 'lte'
}

/**
 * 检查并更新用户的所有成就
 * @param userId 用户ID
 * @param examType 考试类型（可选，检查特定考试类型的成就）
 */
export async function checkAndUpdateAchievements(userId: string, examType?: string) {
  try {
    // 获取用户统计数据（按考试类型）
    const userStatsByType: Record<string, any> = {}

    if (examType) {
      // 只获取特定考试类型的统计
      userStatsByType[examType] = await getUserStats(userId, examType)
      userStatsByType['all'] = await getUserStats(userId, 'all')
    } else {
      // 获取所有考试类型的统计
      userStatsByType['cale'] = await getUserStats(userId, 'cale')
      userStatsByType['nccaom'] = await getUserStats(userId, 'nccaom')
      userStatsByType['all'] = await getUserStats(userId, 'all')
    }

    // 获取相关的活跃成就
    const achievementFilter: any = { isActive: true }
    if (examType) {
      // 检查特定考试类型和全平台的成就
      achievementFilter.examType = { in: [examType, 'all'] }
    }

    const achievements = await prisma.achievement.findMany({
      where: achievementFilter
    })

    // 获取用户已有的成就记录
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId }
    })

    const userAchievementMap = new Map(
      userAchievements.map(ua => [ua.achievementId, ua])
    )

    const newlyUnlocked: string[] = []

    // 检查每个成就
    for (const achievement of achievements) {
      const criteria = JSON.parse(achievement.criteria) as AchievementCriteria

      // 根据成就的考试类型选择对应的用户统计
      const stats = userStatsByType[achievement.examType] || userStatsByType['all']

      // 计算进度
      const progress = calculateProgress(criteria, stats)
      const isUnlocked = progress >= 100

      const existingUA = userAchievementMap.get(achievement.id)

      if (existingUA) {
        // 更新现有成就记录
        if (!existingUA.isUnlocked && isUnlocked) {
          await prisma.userAchievement.update({
            where: { id: existingUA.id },
            data: {
              progress: 100,
              isUnlocked: true,
              unlockedAt: new Date()
            }
          })
          newlyUnlocked.push(achievement.id)

          // 奖励积分（奖励到对应的考试类型）
          await awardPoints(userId, achievement.points, `achievement:${achievement.code}`, achievement.examType)
        } else if (existingUA.progress !== progress) {
          // 更新进度
          await prisma.userAchievement.update({
            where: { id: existingUA.id },
            data: { progress: Math.min(100, progress) }
          })
        }
      } else {
        // 创建新成就记录
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            progress: Math.min(100, progress),
            isUnlocked,
            unlockedAt: isUnlocked ? new Date() : null
          }
        })

        if (isUnlocked) {
          newlyUnlocked.push(achievement.id)
          await awardPoints(userId, achievement.points, `achievement:${achievement.code}`, achievement.examType)
        }
      }
    }

    // 为新解锁的成就发送通知
    if (newlyUnlocked.length > 0) {
      await sendAchievementNotifications(userId, newlyUnlocked)
    }

    return newlyUnlocked
  } catch (error) {
    console.error('检查成就失败:', error)
    throw error
  }
}

/**
 * 获取用户统计数据
 * @param userId 用户ID
 * @param examType 考试类型 ('cale', 'nccaom', 'all')
 */
async function getUserStats(userId: string, examType: string = 'all') {
  // 获取用户积分记录（按考试类型）
  let userPoints = await prisma.userPoints.findUnique({
    where: {
      userId_examType: {
        userId,
        examType
      }
    }
  })

  if (!userPoints) {
    // 如果不存在，创建初始记录
    userPoints = await prisma.userPoints.create({
      data: { userId, examType }
    })
  }

  // 获取考试统计（按考试类型过滤）
  const examFilter: any = {
    userId,
    status: 'completed'
  }

  // 如果不是 'all'，添加 examType 过滤
  if (examType !== 'all') {
    examFilter.examType = examType
  }

  const examsCompleted = await prisma.exam.count({
    where: examFilter
  })

  const examsPassed = await prisma.exam.count({
    where: {
      ...examFilter,
      passed: true
    }
  })

  const perfectScores = await prisma.exam.count({
    where: {
      ...examFilter,
      percentage: 100
    }
  })

  // 计算准确率（基于 UserPoints 表的数据）
  const accuracy = userPoints.questionsAnswered > 0
    ? (userPoints.correctAnswers / userPoints.questionsAnswered) * 100
    : 0

  return {
    streakDays: userPoints.streakDays,
    questionsAnswered: userPoints.questionsAnswered,
    correctAnswers: userPoints.correctAnswers,
    studyTimeMinutes: userPoints.studyTimeMinutes,
    examsCompleted,
    examsPassed,
    perfectScores,
    accuracy,
    totalPoints: userPoints.totalPoints
  }
}

/**
 * 计算成就进度
 */
function calculateProgress(criteria: AchievementCriteria, stats: any): number {
  const { type, value, operator = 'gte' } = criteria

  let currentValue = 0

  switch (type) {
    case 'streak_days':
      currentValue = stats.streakDays
      break
    case 'questions_answered':
      currentValue = stats.questionsAnswered
      break
    case 'correct_answers':
      currentValue = stats.correctAnswers
      break
    case 'study_time':
      currentValue = stats.studyTimeMinutes
      break
    case 'exams_completed':
      currentValue = stats.examsCompleted
      break
    case 'exams_passed':
      currentValue = stats.examsPassed
      break
    case 'perfect_scores':
      currentValue = stats.perfectScores
      break
    case 'accuracy':
      currentValue = stats.accuracy
      break
    default:
      return 0
  }

  // 计算百分比进度
  if (operator === 'gte') {
    return Math.min(100, (currentValue / value) * 100)
  } else if (operator === 'eq') {
    return currentValue === value ? 100 : (currentValue / value) * 100
  }

  return 0
}

/**
 * 奖励用户积分
 * @param userId 用户ID
 * @param points 积分数
 * @param reason 原因
 * @param examType 考试类型
 */
async function awardPoints(userId: string, points: number, reason: string, examType: string = 'all') {
  try {
    // 更新对应考试类型的积分
    await prisma.userPoints.upsert({
      where: {
        userId_examType: {
          userId,
          examType
        }
      },
      create: {
        userId,
        examType,
        totalPoints: points,
        weeklyPoints: points,
        monthlyPoints: points,
        lastActivityAt: new Date()
      },
      update: {
        totalPoints: { increment: points },
        weeklyPoints: { increment: points },
        monthlyPoints: { increment: points },
        lastActivityAt: new Date()
      }
    })

    // 同时更新全平台积分（如果不是already updating 'all'）
    if (examType !== 'all') {
      await prisma.userPoints.upsert({
        where: {
          userId_examType: {
            userId,
            examType: 'all'
          }
        },
        create: {
          userId,
          examType: 'all',
          totalPoints: points,
          weeklyPoints: points,
          monthlyPoints: points,
          lastActivityAt: new Date()
        },
        update: {
          totalPoints: { increment: points },
          weeklyPoints: { increment: points },
          monthlyPoints: { increment: points },
          lastActivityAt: new Date()
        }
      })
    }

    console.log(`奖励用户 ${userId} ${points} 积分 (原因: ${reason}, 考试类型: ${examType})`)
  } catch (error) {
    console.error('奖励积分失败:', error)
  }
}

/**
 * 发送成就解锁通知
 */
async function sendAchievementNotifications(userId: string, achievementIds: string[]) {
  try {
    const achievements = await prisma.achievement.findMany({
      where: {
        id: { in: achievementIds }
      }
    })

    for (const achievement of achievements) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'achievement',
          title: '🎉 成就解锁！',
          message: `恭喜您解锁了「${achievement.name}」成就！获得 ${achievement.points} 积分`,
          link: '/achievements',
          isRead: false
        }
      })
    }
  } catch (error) {
    console.error('发送成就通知失败:', error)
  }
}

/**
 * 更新用户学习统计（在用户答题、完成考试等操作后调用）
 * @param userId 用户ID
 * @param action 动作信息
 */
export async function updateUserStats(userId: string, action: {
  type: 'answer' | 'exam' | 'study_session'
  examType?: string  // 考试类型
  questionsAnswered?: number
  correctAnswers?: number
  studyMinutes?: number
}) {
  try {
    const examType = action.examType || 'cale' // 默认 CALE

    const updateData: any = {
      lastActivityAt: new Date()
    }

    if (action.questionsAnswered) {
      updateData.questionsAnswered = { increment: action.questionsAnswered }
    }

    if (action.correctAnswers) {
      updateData.correctAnswers = { increment: action.correctAnswers }
    }

    if (action.studyMinutes) {
      updateData.studyTimeMinutes = { increment: action.studyMinutes }
    }

    // 更新对应考试类型的统计
    await prisma.userPoints.upsert({
      where: {
        userId_examType: {
          userId,
          examType
        }
      },
      create: {
        userId,
        examType,
        questionsAnswered: action.questionsAnswered || 0,
        correctAnswers: action.correctAnswers || 0,
        studyTimeMinutes: action.studyMinutes || 0,
        lastActivityAt: new Date()
      },
      update: updateData
    })

    // 同时更新全平台统计
    await prisma.userPoints.upsert({
      where: {
        userId_examType: {
          userId,
          examType: 'all'
        }
      },
      create: {
        userId,
        examType: 'all',
        questionsAnswered: action.questionsAnswered || 0,
        correctAnswers: action.correctAnswers || 0,
        studyTimeMinutes: action.studyMinutes || 0,
        lastActivityAt: new Date()
      },
      update: updateData
    })

    // 检查并更新成就（检查对应考试类型的成就）
    await checkAndUpdateAchievements(userId, examType)
  } catch (error) {
    console.error('更新用户统计失败:', error)
  }
}

/**
 * 更新用户连续学习天数
 * @param userId 用户ID
 * @param examType 考试类型（可选，默认更新所有类型）
 */
export async function updateStreakDays(userId: string, examType?: string) {
  try {
    // 如果指定了考试类型，只更新该类型
    const examTypes = examType ? [examType, 'all'] : ['cale', 'nccaom', 'all']

    for (const type of examTypes) {
      const userPoints = await prisma.userPoints.findUnique({
        where: {
          userId_examType: {
            userId,
            examType: type
          }
        }
      })

      if (!userPoints) {
        // 使用 upsert 避免 unique constraint 冲突
        await prisma.userPoints.upsert({
          where: {
            userId_examType: {
              userId,
              examType: type
            }
          },
          update: {
            lastActivityAt: new Date()
          },
          create: {
            userId,
            examType: type,
            streakDays: 1,
            lastActivityAt: new Date()
          }
        })
        continue
      }

      const lastActivity = userPoints.lastActivityAt
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 0) {
        // 同一天，不更新
        continue
      } else if (daysDiff === 1) {
        // 连续学习
        await prisma.userPoints.update({
          where: {
            userId_examType: {
              userId,
              examType: type
            }
          },
          data: {
            streakDays: { increment: 1 },
            lastActivityAt: now
          }
        })
      } else {
        // 中断了，重置为1
        await prisma.userPoints.update({
          where: {
            userId_examType: {
              userId,
              examType: type
            }
          },
          data: {
            streakDays: 1,
            lastActivityAt: now
          }
        })
      }
    }

    // 检查连续学习相关的成就
    if (examType) {
      await checkAndUpdateAchievements(userId, examType)
    } else {
      await checkAndUpdateAchievements(userId)
    }
  } catch (error) {
    console.error('更新连续学习天数失败:', error)
  }
}
