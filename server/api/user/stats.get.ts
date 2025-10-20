import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 要求用户认证
  const currentUser = requireAuth(event)

  const query = getQuery(event)
  const examType = query.examType as string | undefined

  try {
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
