// API：获取知识点列表
import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-helpers'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = requireAuth(event)
    const query = getQuery(event)
    const examType = query.examType as string || 'cale'

    console.log('[KNOWLEDGE-POINTS] 获取知识点列表:', {
      userId: currentUser.userId,
      examType
    })

    // 获取所有内容类型的分类（知识点）
    const categories = await prisma.category.findMany({
      where: {
        examType,
        type: 'content' // 只获取内容部分的分类
      },
      orderBy: [
        { order: 'asc' },
        { code: 'asc' }
      ]
    })

    // 为每个分类统计题目数量
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const questionCount = await prisma.question.count({
          where: {
            categoryId: category.id,
            examType
          }
        })

        return {
          ...category,
          questionCount
        }
      })
    )

    console.log('[KNOWLEDGE-POINTS] 查询结果:', {
      count: categoriesWithCount.length,
      totalQuestions: categoriesWithCount.reduce((sum, cat) => sum + cat.questionCount, 0)
    })

    return {
      success: true,
      data: categoriesWithCount
    }
  } catch (error: any) {
    console.error('[KNOWLEDGE-POINTS] 获取知识点列表失败:', error)
    return {
      success: false,
      error: error.message || '获取知识点列表失败'
    }
  }
})
