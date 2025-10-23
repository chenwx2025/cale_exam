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
    const examType = (query.examType as string) || 'all'
    const status = (query.status as string) || 'all'
    const search = (query.search as string) || ''

    // 构建查询条件
    const where: any = {}

    // 考试类型筛选
    if (examType !== 'all') {
      where.examType = examType
    }

    // 状态筛选
    if (status !== 'all') {
      where.status = status
    }

    // 搜索条件 - 按用户名/邮箱
    if (search) {
      where.user = {
        OR: [
          { email: { contains: search } },
          { name: { contains: search } },
          { nickname: { contains: search } }
        ]
      }
    }

    // 查询总数
    const total = await prisma.exam.count({ where })

    // 查询考试列表
    const exams = await prisma.exam.findMany({
      where,
      select: {
        id: true,
        examType: true,
        status: true,
        totalQuestions: true,
        correctAnswers: true,
        wrongAnswers: true,
        unansweredQuestions: true,
        score: true,
        passingScore: true,
        isPassed: true,
        timeSpent: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            nickname: true,
            avatar: true
          }
        },
        _count: {
          select: {
            userAnswers: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    // 格式化数据
    const formattedExams = exams.map(exam => ({
      ...exam,
      answersCount: exam._count.userAnswers,
      duration: exam.completedAt && exam.startedAt
        ? Math.round((exam.completedAt.getTime() - exam.startedAt.getTime()) / 1000)
        : null
    }))

    return {
      success: true,
      exams: formattedExams.map(({ _count, ...exam }) => exam),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  } catch (error: any) {
    console.error('Get exams list error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get exams list: ' + error.message
    })
  }
})
