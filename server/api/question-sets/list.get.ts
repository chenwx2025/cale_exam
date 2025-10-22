import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  try {
    // 从认证中间件获取当前用户
    const currentUser = requireAuth(event)

    const query = getQuery(event)
    const examType = query.examType as string || 'cale'

    // 获取所有题目集和考试 - 只返回当前用户的数据
    const questionSets = await prisma.exam.findMany({
      where: {
        userId: currentUser.userId,
        examType
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                difficulty: true,
                categoryId: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 统计每个题目集的信息
    const setsWithStats = questionSets.map(set => {
      const difficulties = {
        easy: 0,
        medium: 0,
        hard: 0
      }

      set.answers.forEach(answer => {
        // 跳过question为null的记录（题目已被删除）
        if (!answer.question) return

        const difficulty = answer.question.difficulty
        if (difficulty === 'easy') difficulties.easy++
        else if (difficulty === 'medium') difficulties.medium++
        else if (difficulty === 'hard') difficulties.hard++
      })

      // 计算已答题数量和正确数量
      const answeredCount = set.answers.filter(a => a.selectedAnswer !== null).length
      const correctCount = set.answers.filter(a => a.isCorrect === true).length

      return {
        id: set.id,
        title: set.title,
        questionCount: set.questionCount,
        duration: set.duration,
        mode: set.mode,
        generatedBy: set.generatedBy,
        categoryId: set.categoryId,
        status: set.status,
        score: set.status === 'completed' ? correctCount : null,
        createdAt: set.createdAt,
        completedAt: set.completedAt,
        answeredCount: answeredCount,
        difficulties
      }
    })

    return {
      success: true,
      questionSets: setsWithStats
    }
  } catch (error: any) {
    console.error('List question sets error:', error)

    // 如果是 HTTP 错误（401, 403 等），重新抛出以便前端正确处理
    if (error.statusCode) {
      throw error
    }

    // 其他错误返回通用错误消息
    throw createError({
      statusCode: 500,
      message: error.message || '获取题目集列表失败'
    })
  }
})
