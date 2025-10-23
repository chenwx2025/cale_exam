import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'
import { questionCache } from '~/server/utils/question-cache'

const prisma = new PrismaClient()

/**
 * 获取题目列表（支持分页和缓存）
 * GET /api/questions/list
 *
 * 查询参数：
 * - examType: 考试类型（cale/nccaom）
 * - categoryId: 分类ID（可选）
 * - difficulty: 难度（easy/medium/hard，可选）
 * - page: 页码（默认1）
 * - limit: 每页数量（默认20，最大100）
 * - search: 搜索关键词（可选）
 */
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)

  try {
    const query = getQuery(event)

    const examType = (query.examType as string) || 'cale'
    const categoryId = query.categoryId as string | undefined
    const difficulty = query.difficulty as string | undefined
    const page = Math.max(1, parseInt((query.page as string) || '1'))
    const limit = Math.min(100, Math.max(1, parseInt((query.limit as string) || '20')))
    const search = query.search as string | undefined

    const skip = (page - 1) * limit

    // 生成缓存键
    const cacheKey = questionCache.getQuestionListKey({
      examType,
      categoryId,
      difficulty,
      page,
      limit
    })

    // 如果没有搜索条件，尝试从缓存获取
    if (!search) {
      const cached = questionCache.get<any>(cacheKey)
      if (cached) {
        console.log('[QuestionList] Cache hit:', cacheKey)
        return {
          ...cached,
          fromCache: true
        }
      }
    }

    // 构建查询条件
    const where: any = {
      examType
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (search) {
      where.OR = [
        { question: { contains: search } },
        { explanation: { contains: search } }
      ]
    }

    // 查询题目总数
    const total = await prisma.question.count({ where })

    // 查询题目列表
    const questions = await prisma.question.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        question: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        difficulty: true,
        categoryId: true,
        tags: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    // 格式化题目数据
    const formattedQuestions = questions.map(q => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null,
      tags: q.tags ? JSON.parse(q.tags) : null
    }))

    const result = {
      success: true,
      questions: formattedQuestions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      },
      fromCache: false
    }

    // 如果没有搜索条件，缓存结果
    if (!search) {
      questionCache.set(cacheKey, result, 5 * 60 * 1000) // 缓存5分钟
      console.log('[QuestionList] Cached:', cacheKey)
    }

    return result
  } catch (error: any) {
    console.error('获取题目列表失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取题目列表失败'
    })
  }
})
