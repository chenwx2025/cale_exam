// API：获取知识点统计信息（练习情况）
import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = requireAuth(event)
    const query = getQuery(event)
    const categoryId = query.categoryId as string
    const examType = query.examType as string || 'cale'

    if (!categoryId) {
      throw createError({
        statusCode: 400,
        message: '缺少分类ID'
      })
    }

    console.log('[KNOWLEDGE-POINTS-STATS] 获取知识点统计:', {
      userId: currentUser.userId,
      categoryId,
      examType
    })

    // 获取该分类下的所有题目ID
    const questions = await prisma.question.findMany({
      where: {
        categoryId,
        examType
      },
      select: {
        id: true
      }
    })

    const questionIds = questions.map(q => q.id)

    if (questionIds.length === 0) {
      return {
        success: true,
        data: {
          total: 0,
          correct: 0,
          wrong: 0
        }
      }
    }

    // 统计用户在该分类下的答题情况（从ExamAnswer表）
    const examAnswers = await prisma.examAnswer.findMany({
      where: {
        questionId: { in: questionIds },
        exam: {
          userId: currentUser.userId,
          examType
        },
        userAnswer: { not: null }
      },
      select: {
        questionId: true,
        isCorrect: true
      }
    })

    // 按题目分组，统计每道题的最新答题结果
    const questionAnswerMap = new Map<string, boolean>()
    examAnswers.forEach(answer => {
      // 如果题目已经有记录，只保留最新的
      if (!questionAnswerMap.has(answer.questionId)) {
        questionAnswerMap.set(answer.questionId, answer.isCorrect || false)
      }
    })

    const correctCount = Array.from(questionAnswerMap.values()).filter(isCorrect => isCorrect).length
    const wrongCount = Array.from(questionAnswerMap.values()).filter(isCorrect => !isCorrect).length

    console.log('[KNOWLEDGE-POINTS-STATS] 统计结果:', {
      total: questionIds.length,
      answered: questionAnswerMap.size,
      correct: correctCount,
      wrong: wrongCount
    })

    return {
      success: true,
      data: {
        total: questionIds.length,
        correct: correctCount,
        wrong: wrongCount
      }
    }
  } catch (error: any) {
    console.error('[KNOWLEDGE-POINTS-STATS] 获取统计失败:', error)
    return {
      success: false,
      error: error.message || '获取统计失败'
    }
  }
})
