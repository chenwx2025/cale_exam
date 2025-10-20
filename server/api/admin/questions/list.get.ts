import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20
    const examType = query.examType as string || 'cale'
    const categoryId = query.categoryId as string
    const difficulty = query.difficulty as string
    const search = query.search as string

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

    // 获取总数
    const total = await prisma.question.count({ where })

    // 获取分页数据
    const questions = await prisma.question.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            code: true,
            name: true,
            nameEn: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    return {
      success: true,
      questions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  } catch (error: any) {
    console.error('List questions error:', error)

    throw createError({
      statusCode: 500,
      message: error.message || '获取题目列表失败'
    })
  }
})
