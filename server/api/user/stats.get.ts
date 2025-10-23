import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 要求用户认证
  const currentUser = requireAuth(event)

  const query = getQuery(event)
  const examType = query.examType as string | undefined
  const dashboard = query.dashboard as string | undefined

  try {
    // Dashboard overview statistics
    if (dashboard === 'true') {
      return await getDashboardStats(currentUser.userId)
    }

    // 如果指定了 examType，返回该考试类型的统计
    if (examType) {
      const stats = await getStatsForExamType(currentUser.userId, examType)
      return {
        success: true,
        examType,
        stats
      }
    }

    // 否则返回所有考试类型的统计
    const caleStats = await getStatsForExamType(currentUser.userId, 'cale')
    const nccaomStats = await getStatsForExamType(currentUser.userId, 'nccaom')

    return {
      success: true,
      stats: {
        cale: caleStats,
        nccaom: nccaomStats
      }
    }
  } catch (error: any) {
    console.error('Get stats error:', error)
    throw createError({
      statusCode: 500,
      message: '获取统计数据失败'
    })
  }
})

// 获取指定考试类型的统计数据
async function getStatsForExamType(userId: string, examType: string) {
  // 学习计划数量
  const studyPlansCount = await prisma.studyPlan.count({
    where: {
      userId,
      examType
    }
  })

  // 考试数量
  const examsCount = await prisma.exam.count({
    where: {
      userId,
      examType,
      status: 'completed'
    }
  })

  // 错题数量
  const wrongQuestionsCount = await prisma.wrongQuestion.count({
    where: {
      userId,
      question: {
        examType
      }
    }
  })

  // 答题总数和正确数
  const userAnswers = await prisma.userAnswer.findMany({
    where: {
      userId,
      question: {
        examType
      }
    },
    select: {
      isCorrect: true
    }
  })

  const totalAnswered = userAnswers.length
  const correctAnswers = userAnswers.filter(a => a.isCorrect).length
  const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0

  // 最近7天的学习记录
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentSessions = await prisma.studySession.count({
    where: {
      userId,
      examType,
      createdAt: {
        gte: sevenDaysAgo
      }
    }
  })

  return {
    studyPlans: studyPlansCount,
    exams: examsCount,
    wrongQuestions: wrongQuestionsCount,
    totalAnswered,
    correctAnswers,
    accuracy,
    recentSessions
  }
}

// Get dashboard overview statistics
async function getDashboardStats(userId: string) {
  // Get total study time (sum of all exam durations)
  const exams = await prisma.exam.findMany({
    where: { userId },
    select: {
      startTime: true,
      endTime: true
    }
  })

  let totalStudyTime = 0
  let weeklyStudyTime = 0
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  exams.forEach(exam => {
    if (exam.startTime && exam.endTime) {
      const duration = Math.floor((exam.endTime.getTime() - exam.startTime.getTime()) / 60000) // minutes
      totalStudyTime += duration

      if (exam.startTime >= oneWeekAgo) {
        weeklyStudyTime += duration
      }
    }
  })

  // Get total questions answered
  const totalQuestions = await prisma.userAnswer.count({
    where: { userId }
  })

  // Calculate accuracy
  const correctAnswers = await prisma.userAnswer.count({
    where: {
      userId,
      isCorrect: true
    }
  })

  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

  // Get exams completed
  const examsCompleted = await prisma.exam.count({
    where: {
      userId,
      status: 'completed'
    }
  })

  // Calculate average score
  const completedExams = await prisma.exam.findMany({
    where: {
      userId,
      status: 'completed'
    },
    select: { score: true }
  })

  let averageScore = 0
  if (completedExams.length > 0) {
    const totalScore = completedExams.reduce((sum, exam) => sum + (exam.score || 0), 0)
    averageScore = Math.round(totalScore / completedExams.length)
  }

  // Get achievements count
  const achievementsUnlocked = await prisma.userAchievement.count({
    where: {
      userId,
      isUnlocked: true
    }
  })

  const totalAchievements = await prisma.achievement.count()

  return {
    success: true,
    totalStudyTime,
    weeklyStudyTime,
    totalQuestions,
    accuracy,
    examsCompleted,
    averageScore,
    achievementsUnlocked,
    totalAchievements
  }
}
