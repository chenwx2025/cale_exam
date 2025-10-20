// API：获取学习统计概览
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userId as string
    const examType = query.examType as string || 'cale'

    if (!userId) {
      return {
        success: false,
        error: '缺少用户ID'
      }
    }

    // 获取总学习时长（最近30天）
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const studySessions = await prisma.studySession.findMany({
      where: {
        userId,
        examType,
        startTime: {
          gte: thirtyDaysAgo
        }
      }
    })

    const totalStudyTime = studySessions.reduce((sum, session) => {
      return sum + (session.duration || 0)
    }, 0)

    // 获取答题统计
    const userAnswers = await prisma.userAnswer.findMany({
      where: {
        userId,
        question: {
          examType
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    const totalQuestions = userAnswers.length
    const correctAnswers = userAnswers.filter(a => a.isCorrect).length
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(1) : '0'

    // 获取错题本统计
    const wrongQuestions = await prisma.wrongQuestion.findMany({
      where: {
        userId,
        question: {
          examType
        }
      }
    })

    const totalWrongQuestions = wrongQuestions.length
    const masteredQuestions = wrongQuestions.filter(q => q.mastered).length

    // 获取知识点掌握度
    const categoryStats = await prisma.$queryRaw`
      SELECT
        c.name,
        c.code,
        COUNT(DISTINCT wq.questionId) as wrongCount,
        COUNT(DISTINCT CASE WHEN wq.mastered = 1 THEN wq.questionId END) as masteredCount,
        COUNT(DISTINCT ua.questionId) as totalAttempted,
        SUM(CASE WHEN ua.isCorrect = 1 THEN 1 ELSE 0 END) as correctCount
      FROM Category c
      LEFT JOIN Question q ON q.categoryId = c.id
      LEFT JOIN WrongQuestion wq ON wq.questionId = q.id AND wq.userId = ${userId}
      LEFT JOIN UserAnswer ua ON ua.questionId = q.id AND ua.userId = ${userId}
      WHERE c.examType = ${examType} AND c.type = 'content'
      GROUP BY c.id, c.name, c.code
      ORDER BY c.code
    ` as any[]

    return {
      success: true,
      data: {
        studyTime: {
          total: totalStudyTime,
          totalHours: (totalStudyTime / 3600).toFixed(1),
          sessionsCount: studySessions.length
        },
        practice: {
          totalQuestions,
          correctAnswers,
          accuracy: parseFloat(accuracy)
        },
        wrongQuestions: {
          total: totalWrongQuestions,
          mastered: masteredQuestions,
          remaining: totalWrongQuestions - masteredQuestions,
          masteryRate: totalWrongQuestions > 0 ?
            ((masteredQuestions / totalWrongQuestions) * 100).toFixed(1) : '0'
        },
        categoryStats: categoryStats.map(stat => ({
          name: stat.name,
          code: stat.code,
          wrongCount: Number(stat.wrongCount || 0),
          masteredCount: Number(stat.masteredCount || 0),
          totalAttempted: Number(stat.totalAttempted || 0),
          accuracy: stat.totalAttempted > 0 ?
            ((stat.correctCount / stat.totalAttempted) * 100).toFixed(1) : '0'
        }))
      }
    }
  } catch (error: any) {
    console.error('获取统计数据失败:', error)
    return {
      success: false,
      error: error.message || '获取统计数据失败'
    }
  }
})
