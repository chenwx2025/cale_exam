import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  requireAdmin(event)

  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20
    const search = query.search as string || ''
    const examType = query.examType as string || 'all'
    const difficulty = query.difficulty as string || 'all'
    const categoryId = query.categoryId as string || 'all'
    const type = query.type as string || 'all'

    // 构建查询条件
    const where: any = {}

    // 搜索条件（题目内容）
    if (search) {
      where.question = { contains: search, mode: 'insensitive' }
    }

    // 考试类型过滤
    if (examType !== 'all') {
      where.examType = examType
    }

    // 难度过滤
    if (difficulty !== 'all') {
      where.difficulty = difficulty
    }

    // 分类过滤
    if (categoryId !== 'all') {
      where.categoryId = categoryId
    }

    // 题型过滤
    if (type !== 'all') {
      where.type = type
    }

    // 获取总数
    const total = await prisma.question.count({ where })

    // 获取题目列表
    const questions = await prisma.question.findMany({
      where,
      select: {
        id: true,
        examType: true,
        type: true,
        question: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        difficulty: true,
        categoryId: true,
        category: {
          select: {
            name: true,
            code: true
          }
        },
        tags: true,
        source: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            userAnswers: true,
            wrongQuestions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    // 格式化数据
    const formattedQuestions = questions.map(q => ({
      ...q,
      stats: {
        totalAnswers: q._count.userAnswers,
        wrongCount: q._count.wrongQuestions,
        accuracy: q._count.userAnswers > 0
          ? Math.round(((q._count.userAnswers - q._count.wrongQuestions) / q._count.userAnswers) * 100)
          : 0
      }
    }))

    return {
      success: true,
      data: formattedQuestions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  } catch (error) {
    console.error('Admin get questions error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch questions'
    })
  }
})
