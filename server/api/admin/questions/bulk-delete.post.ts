import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { questionIds } = body

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      throw createError({
        statusCode: 400,
        message: '请选择要删除的题目'
      })
    }

    // 批量删除题目
    const result = await prisma.question.deleteMany({
      where: {
        id: {
          in: questionIds
        }
      }
    })

    return {
      success: true,
      message: `成功删除 ${result.count} 道题目`,
      deletedCount: result.count
    }
  } catch (error: any) {
    console.error('Bulk delete questions error:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '批量删除题目失败'
    })
  }
})
