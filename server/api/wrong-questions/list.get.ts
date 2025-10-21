// API：获取用户错题列表
import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  try {
    // 从认证中获取用户ID
    const currentUser = requireAuth(event)

    const query = getQuery(event)
    const examType = query.examType as string || 'cale'
    const mastered = query.mastered === 'true' ? true : query.mastered === 'false' ? false : undefined
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20

    console.log('[WRONG-QUESTIONS] 获取错题列表:', {
      userId: currentUser.userId,
      examType,
      mastered,
      page,
      pageSize
    })

    // 构建查询条件
    const where: any = {
      userId: currentUser.userId,
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

    console.log('[WRONG-QUESTIONS] 查询结果:', {
      total,
      count: wrongQuestions.length
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
