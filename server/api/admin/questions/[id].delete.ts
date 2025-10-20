import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: '缺少题目ID'
      })
    }

    // 检查题目是否存在
    const question = await prisma.question.findUnique({
      where: { id }
    })

    if (!question) {
      throw createError({
        statusCode: 404,
        message: '题目不存在'
      })
    }

    // 删除题目（会级联删除相关的ExamAnswer记录）
    await prisma.question.delete({
      where: { id }
    })

    return {
      success: true,
      message: '题目删除成功'
    }
  } catch (error: any) {
    console.error('Delete question error:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '删除题目失败'
    })
  }
})
