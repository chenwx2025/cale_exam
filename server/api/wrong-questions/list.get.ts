// API：获取用户错题列表
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userId as string
    const examType = query.examType as string || 'cale'
    const mastered = query.mastered === 'true' ? true : query.mastered === 'false' ? false : undefined
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20

    if (!userId) {
      return {
        success: false,
        error: '缺少用户ID'
      }
    }

    // 构建查询条件
    const where: any = {
      userId,
      question: {
        examType
      }
    }

    if (mastered !== undefined) {
      where.mastered = mastered
    }

    // 获取总数
    const total = await prisma.wrongQuestion.count({ where })

    // 获取错题列表
    const wrongQuestions = await prisma.wrongQuestion.findMany({
      where,
      include: {
        question: {
          include: {
            category: true
          }
        }
      },
      orderBy: [
        { mastered: 'asc' }, // 未掌握的在前
        { lastWrong: 'desc' } // 最近答错的在前
      ],
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    return {
      success: true,
      data: wrongQuestions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  } catch (error: any) {
    console.error('获取错题列表失败:', error)
    return {
      success: false,
      error: error.message || '获取错题列表失败'
    }
  }
})
