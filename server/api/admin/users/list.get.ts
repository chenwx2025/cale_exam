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
    const search = (query.search as string) || ''
    const role = (query.role as string) || 'all'
    const status = (query.status as string) || 'all'
    const examType = (query.examType as string) || 'all'

    // 构建查询条件
    const where: any = {}

    // 搜索条件
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
        { nickname: { contains: search } }
      ]
    }

    // 角色筛选
    if (role !== 'all') {
      where.role = role
    }

    // 状态筛选
    if (status !== 'all') {
      where.status = status
    }

    // 考试类型筛选
    if (examType !== 'all') {
      where.subscribedExams = {
        some: {
          examType,
          isActive: true
        }
      }
    }

    // 查询总数
    const total = await prisma.user.count({ where })

    // 查询用户列表
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        loginCount: true,
        createdAt: true,
        subscribedExams: {
          where: { isActive: true },
          select: {
            examType: true
          }
        },
        _count: {
          select: {
            userAnswers: true,
            exams: true,
            wrongQuestions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    // 格式化数据
    const formattedUsers = users.map(user => ({
      ...user,
      subscribedExams: user.subscribedExams.map(s => s.examType),
      stats: {
        answersCount: user._count.userAnswers,
        examsCount: user._count.exams,
        wrongQuestionsCount: user._count.wrongQuestions
      }
    }))

    return {
      success: true,
      users: formattedUsers.map(({ _count, ...user }) => user),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  } catch (error: any) {
    console.error('Get users list error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get users list: ' + error.message
    })
  }
})
