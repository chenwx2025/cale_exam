// API：从错题本删除（已掌握的题目）
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userId as string
    const questionId = query.questionId as string

    if (!userId || !questionId) {
      return {
        success: false,
        error: '缺少必要参数'
      }
    }

    await prisma.wrongQuestion.delete({
      where: {
        userId_questionId: {
          userId,
          questionId
        }
      }
    })

    return {
      success: true,
      message: '已从错题本移除'
    }
  } catch (error: any) {
    console.error('删除错题失败:', error)
    return {
      success: false,
      error: error.message || '删除错题失败'
    }
  }
})
