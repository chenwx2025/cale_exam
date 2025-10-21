/**
 * 成就分享 API
 * 创建一个可分享的成就卡片
 */

import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const user = await requireAuth(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    // 获取请求数据
    const body = await readBody(event)
    const {
      achievementType,
      title,
      description,
      stats,
      examType = 'cale',
      isPublic = true
    } = body

    // 验证必需字段
    if (!achievementType || !title) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields: achievementType, title'
      })
    }

    // 根据成就类型获取实际数据
    let achievementData: any = {}

    switch (achievementType) {
      case 'study_streak':
        // 连续学习天数成就
        achievementData = await getStudyStreakData(user.id)
        break

      case 'total_questions':
        // 累计答题数成就
        achievementData = await getTotalQuestionsData(user.id, examType)
        break

      case 'accuracy_milestone':
        // 正确率里程碑
        achievementData = await getAccuracyData(user.id, examType)
        break

      case 'exam_passed':
        // 考试通过成就
        achievementData = await getExamPassedData(user.id, examType)
        break

      case 'custom':
        // 自定义成就（使用传入的 stats）
        achievementData = { stats: stats || [] }
        break

      default:
        throw createError({
          statusCode: 400,
          message: 'Invalid achievement type'
        })
    }

    // 创建分享内容
    const content = JSON.stringify({
      achievementType,
      examType,
      stats: achievementData.stats || stats || [],
      userName: user.name,
      achievementIcon: getAchievementIcon(achievementType)
    })

    // 保存分享记录到数据库
    const share = await prisma.share.create({
      data: {
        userId: user.id,
        shareType: 'achievement',
        title,
        description: description || '',
        content,
        isPublic
      }
    })

    console.log(`[ShareAchievement] Created share ${share.id} for user ${user.id}`)

    return {
      success: true,
      shareId: share.id,
      shareUrl: `/share/${share.id}`,
      share: {
        id: share.id,
        type: share.shareType,
        title: share.title,
        description: share.description,
        content: JSON.parse(share.content),
        isPublic: share.isPublic,
        createdAt: share.createdAt
      }
    }
  } catch (error: any) {
    console.error('[ShareAchievement] Error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to create achievement share'
    })
  }
})

/**
 * 获取连续学习天数数据
 */
async function getStudyStreakData(userId: string) {
  // 获取最近30天的学习会话
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const sessions = await prisma.studySession.findMany({
    where: {
      userId,
      startTime: {
        gte: thirtyDaysAgo
      }
    },
    orderBy: {
      startTime: 'desc'
    }
  })

  // 计算连续学习天数
  let currentStreak = 0
  let longestStreak = 0
  let lastDate: Date | null = null

  const studyDates = new Set<string>()
  sessions.forEach(session => {
    const dateStr = session.startTime.toISOString().split('T')[0]
    studyDates.add(dateStr)
  })

  const sortedDates = Array.from(studyDates).sort().reverse()

  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i])

    if (i === 0) {
      currentStreak = 1
      lastDate = currentDate
    } else {
      const daysDiff = Math.floor((lastDate!.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 1) {
        currentStreak++
        lastDate = currentDate
      } else {
        break
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak)
  }

  // 计算总学习时长
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60

  return {
    stats: [
      { label: '连续学习', value: `${currentStreak}天` },
      { label: '累计学习', value: `${Math.round(totalMinutes)}分钟` },
      { label: '学习次数', value: sessions.length }
    ]
  }
}

/**
 * 获取累计答题数据
 */
async function getTotalQuestionsData(userId: string, examType: string) {
  const totalAnswers = await prisma.userAnswer.count({
    where: { userId }
  })

  const correctAnswers = await prisma.userAnswer.count({
    where: {
      userId,
      isCorrect: true
    }
  })

  const accuracy = totalAnswers > 0
    ? Math.round((correctAnswers / totalAnswers) * 100)
    : 0

  return {
    stats: [
      { label: '累计答题', value: totalAnswers },
      { label: '答对题数', value: correctAnswers },
      { label: '正确率', value: `${accuracy}%` }
    ]
  }
}

/**
 * 获取正确率数据
 */
async function getAccuracyData(userId: string, examType: string) {
  const recentAnswers = await prisma.userAnswer.findMany({
    where: { userId },
    orderBy: {
      createdAt: 'desc'
    },
    take: 100
  })

  const total = recentAnswers.length
  const correct = recentAnswers.filter(a => a.isCorrect).length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  return {
    stats: [
      { label: '正确率', value: `${accuracy}%` },
      { label: '最近100题', value: `${correct}/${total}` },
      { label: '正确数', value: correct }
    ]
  }
}

/**
 * 获取考试通过数据
 */
async function getExamPassedData(userId: string, examType: string) {
  const passedExams = await prisma.exam.count({
    where: {
      userId,
      examType,
      status: 'completed',
      passed: true
    }
  })

  const totalExams = await prisma.exam.count({
    where: {
      userId,
      examType,
      status: 'completed'
    }
  })

  const passRate = totalExams > 0
    ? Math.round((passedExams / totalExams) * 100)
    : 0

  return {
    stats: [
      { label: '通过考试', value: passedExams },
      { label: '总考试数', value: totalExams },
      { label: '通过率', value: `${passRate}%` }
    ]
  }
}

/**
 * 获取成就图标
 */
function getAchievementIcon(type: string): string {
  const icons: Record<string, string> = {
    study_streak: '🔥',
    total_questions: '📚',
    accuracy_milestone: '🎯',
    exam_passed: '🏆',
    custom: '🎉'
  }
  return icons[type] || '🎉'
}
