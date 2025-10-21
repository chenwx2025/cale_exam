import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

/**
 * 获取用户已做过的题目列表
 * 用于"已做题目"功能
 */
export default defineEventHandler(async (event) => {
  // 验证用户身份
  const user = requireAuth(event)

  try {
    const query = getQuery(event)
    const examType = String(query.examType || 'cale')
    const page = Math.max(1, parseInt(String(query.page || '1')))
    const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '20'))))
    const categoryId = query.categoryId ? String(query.categoryId) : undefined
    const filterType = String(query.filter || 'all') // all, correct, wrong

    // 计算分页偏移量
    const skip = (page - 1) * limit

    // 构建查询条件
    const whereConditions: any = {
      userId: user.id,
      question: {
        examType
      }
    }

    // 如果指定了分类
    if (categoryId) {
      whereConditions.question.categoryId = categoryId
    }

    // 如果指定了过滤类型
    if (filterType === 'correct') {
      whereConditions.isCorrect = true
    } else if (filterType === 'wrong') {
      whereConditions.isCorrect = false
    }

    // 获取用户答题记录（按最近答题时间排序）
    const [answers, total] = await Promise.all([
      prisma.userAnswer.findMany({
        where: whereConditions,
        include: {
          question: {
            include: {
              category: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
        distinct: ['questionId'] // 去重，每道题只显示最近的一次答题记录
      }),
      prisma.userAnswer.groupBy({
        by: ['questionId'],
        where: whereConditions
      }).then(result => result.length) // 计算去重后的总数
    ])

    // 统计信息
    const stats = {
      total,
      correct: await prisma.userAnswer.groupBy({
        by: ['questionId'],
        where: {
          ...whereConditions,
          isCorrect: true
        }
      }).then(result => result.length),
      wrong: await prisma.userAnswer.groupBy({
        by: ['questionId'],
        where: {
          ...whereConditions,
          isCorrect: false
        }
      }).then(result => result.length)
    }

    // 格式化返回数据
    const questions = answers.map(answer => ({
      questionId: answer.questionId,
      question: answer.question,
      userAnswer: answer.userAnswer,
      isCorrect: answer.isCorrect,
      answeredAt: answer.createdAt,
      timeTaken: answer.timeTaken || 0
    }))

    return {
      success: true,
      data: {
        questions,
        stats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }
  } catch (error) {
    console.error('[Practiced Questions] Error fetching practiced questions:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch practiced questions'
    })
  }
})
