import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        message: '缺少题目ID'
      })
    }

    // 检查题目是否存在
    const existingQuestion = await prisma.question.findUnique({
      where: { id }
    })

    if (!existingQuestion) {
      throw createError({
        statusCode: 404,
        message: '题目不存在'
      })
    }

    // 验证必填字段
    if (!body.question || !body.question.trim()) {
      throw createError({
        statusCode: 400,
        message: '题目内容不能为空'
      })
    }

    if (!body.options || !Array.isArray(body.options) || body.options.length < 2) {
      throw createError({
        statusCode: 400,
        message: '选项至少需要2个'
      })
    }

    if (!body.correctAnswer || !body.correctAnswer.trim()) {
      throw createError({
        statusCode: 400,
        message: '正确答案不能为空'
      })
    }

    // 更新题目
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        question: body.question.trim(),
        options: JSON.stringify(body.options), // 将数组转换为JSON字符串
        correctAnswer: body.correctAnswer.trim(),
        explanation: body.explanation?.trim() || '',
        difficulty: body.difficulty || 'medium',
        categoryId: body.categoryId || null
      },
      include: {
        category: {
          select: {
            id: true,
            code: true,
            name: true,
            nameEn: true
          }
        }
      }
    })

    return {
      success: true,
      message: '题目更新成功',
      question: updatedQuestion
    }
  } catch (error: any) {
    console.error('Update question error:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '更新题目失败'
    })
  }
})
