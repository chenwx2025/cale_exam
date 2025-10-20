import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 从认证中间件获取当前用户
    const currentUser = requireAuth(event)

    const query = getQuery(event)
    const examType = query.examType as string || 'cale'

    // 获取所有题目集：AI生成、模拟考试 - 只返回当前用户的数据
    const questionSets = await prisma.exam.findMany({
      where: {
        userId: currentUser.userId,
        examType,
        mode: {
          in: ['ai_generated', 'mock']
        }
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

      return {
        id: set.id,
        title: set.title,
        questionCount: set.questionCount,
        duration: set.duration,
        mode: set.mode,
        generatedBy: set.generatedBy,
        categoryId: set.categoryId,
        status: set.status,
        createdAt: set.createdAt,
        difficulties
      }
    })

    return {
      success: true,
      questionSets: setsWithStats
    }
  } catch (error: any) {
    console.error('List question sets error:', error)

    throw createError({
      statusCode: 500,
      message: error.message || '获取题目集列表失败'
    })
  }
})
