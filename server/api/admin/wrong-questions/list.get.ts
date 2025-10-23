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
    const domain = (query.domain as string) || 'all'
    const search = (query.search as string) || ''
    const sortBy = (query.sortBy as string) || 'errorCount' // errorCount, lastErrorDate

    // 构建查询条件
    const where: any = {}

    // 考试类型筛选 - 通过 question 关联
    if (examType !== 'all') {
      where.question = {
        examType
      }
    }

    // 领域筛选
    if (domain !== 'all') {
      where.question = {
        ...where.question,
        domain
      }
    }

    // 搜索条件 - 按用户邮箱/名字
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
    const total = await prisma.wrongQuestion.count({ where })

    // 确定排序方式
    let orderBy: any
    if (sortBy === 'errorCount') {
      orderBy = { errorCount: 'desc' }
    } else {
      orderBy = { lastErrorDate: 'desc' }
    }

    // 查询错题列表
    const wrongQuestions = await prisma.wrongQuestion.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            nickname: true,
            avatar: true
          }
        },
        question: {
          select: {
            id: true,
            type: true,
            domain: true,
            examType: true,
            difficulty: true,
            chineseQuestion: true,
            englishQuestion: true,
            correctAnswer: true
          }
        }
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    return {
      success: true,
      wrongQuestions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  } catch (error: any) {
    console.error('Get wrong questions list error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get wrong questions list: ' + error.message
    })
  }
})
