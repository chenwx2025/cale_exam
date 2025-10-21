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
    const role = query.role as string || 'all'
    const status = query.status as string || 'all'
    const examType = query.examType as string || 'all'

    // 构建查询条件
    const where: any = {}

    // 搜索条件（邮箱或姓名）
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 角色过滤
    if (role !== 'all') {
      where.role = role
    }

    // 状态过滤
    if (status !== 'all') {
      where.status = status
    }

    // 考试类型过滤
    if (examType !== 'all') {
      where.subscribedExams = {
        some: {
          examType,
          isActive: true
        }
      }
    }

    // 获取总数
    const total = await prisma.user.count({ where })

    // 获取用户列表
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
        updatedAt: true,
        subscribedExams: {
          where: { isActive: true },
          select: {
            examType: true,
            subscribedAt: true,
            expiresAt: true
          }
        },
        _count: {
          select: {
            userAnswers: true,
            exams: true,
            studyPlans: true,
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
      subscriptionDetails: user.subscribedExams,
      stats: {
        totalAnswers: user._count.userAnswers,
        totalExams: user._count.exams,
        totalStudyPlans: user._count.studyPlans,
        totalWrongQuestions: user._count.wrongQuestions
      }
    }))

    return {
      success: true,
      data: formattedUsers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  } catch (error) {
    console.error('Admin get users error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch users'
    })
  }
})
