// API：获取学习统计概览
import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  try {
    // 调试：检查认证信息
    const authHeader = getHeader(event, 'authorization')
    const contextUser = event.context.user
    console.log('[STATS-OVERVIEW] 认证调试:', {
      hasAuthHeader: !!authHeader,
      authHeaderPreview: authHeader?.substring(0, 30),
      hasContextUser: !!contextUser,
      userId: contextUser?.userId
    })

    // 使用认证获取当前用户
    const currentUser = requireAuth(event)

    const query = getQuery(event)
    const examType = query.examType as string || 'cale'

    console.log('[STATS-OVERVIEW] 获取学习统计:', {
      userId: currentUser.userId,
      examType
    })

    // 获取总学习时长（最近30天）
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const studySessions = await prisma.studySession.findMany({
      where: {
        userId: currentUser.userId,
        examType,
        startTime: {
          gte: thirtyDaysAgo
        }
      }
    })

    const totalStudyTime = studySessions.reduce((sum, session) => {
      return sum + (session.duration || 0)
    }, 0)

    // 获取答题统计 - 使用 ExamAnswer 表（考试模式答题记录）
    const examAnswers = await prisma.examAnswer.findMany({
      where: {
        exam: {
          userId: currentUser.userId,
          examType
        },
        userAnswer: {
          not: null  // 只统计已作答的题目
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    const totalQuestions = examAnswers.length
    const correctAnswers = examAnswers.filter(a => a.isCorrect).length
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(1) : '0'

    console.log('[STATS-OVERVIEW] 答题统计:', {
      totalQuestions,
      correctAnswers,
      accuracy: accuracy + '%'
    })

    // 获取错题本统计
    const wrongQuestions = await prisma.wrongQuestion.findMany({
      where: {
        userId: currentUser.userId,
        question: {
          examType
        }
      }
    })

    const totalWrongQuestions = wrongQuestions.length
    const masteredQuestions = wrongQuestions.filter(q => q.mastered).length

    console.log('[STATS-OVERVIEW] 错题统计:', {
      totalWrongQuestions,
      masteredQuestions,
      remaining: totalWrongQuestions - masteredQuestions
    })

    // 获取知识点掌握度 - 使用 ExamAnswer 表
    const categoryStats = await prisma.$queryRaw`
      SELECT
        c.name,
        c.code,
        COUNT(DISTINCT wq.questionId) as wrongCount,
        COUNT(DISTINCT CASE WHEN wq.mastered = 1 THEN wq.questionId END) as masteredCount,
        COUNT(DISTINCT ea.questionId) as totalAttempted,
        SUM(CASE WHEN ea.isCorrect = 1 THEN 1 ELSE 0 END) as correctCount
      FROM Category c
      LEFT JOIN Question q ON q.categoryId = c.id
      LEFT JOIN WrongQuestion wq ON wq.questionId = q.id AND wq.userId = ${currentUser.userId}
      LEFT JOIN ExamAnswer ea ON ea.questionId = q.id
      LEFT JOIN Exam e ON e.id = ea.examId AND e.userId = ${currentUser.userId} AND e.examType = ${examType}
      WHERE c.examType = ${examType} AND c.type = 'content'
      GROUP BY c.id, c.name, c.code
      ORDER BY c.code
    ` as any[]

    console.log('[STATS-OVERVIEW] 知识点统计:', {
      categoriesCount: categoryStats.length
    })

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
        categoryStats: categoryStats.map(stat => {
          // 显式转换所有BigInt为Number
          const wrongCount = Number(stat.wrongCount || 0)
          const masteredCount = Number(stat.masteredCount || 0)
          const totalAttempted = Number(stat.totalAttempted || 0)
          const correctCount = Number(stat.correctCount || 0)

          return {
            name: stat.name,
            code: stat.code,
            wrongCount,
            masteredCount,
            totalAttempted,
            accuracy: totalAttempted > 0 ?
              ((correctCount / totalAttempted) * 100).toFixed(1) : '0'
          }
        })
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
