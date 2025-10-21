import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  const admin = requireAdmin(event)

  try {
    const questionId = event.context.params?.id

    if (!questionId) {
      throw createError({
        statusCode: 400,
        message: 'Question ID is required'
      })
    }

    const body = await readBody(event)

    // 验证题目存在
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId }
    })

    if (!existingQuestion) {
      throw createError({
        statusCode: 404,
        message: 'Question not found'
      })
    }

    // 构建更新数据
    const updateData: any = {}

    if (body.examType && ['cale', 'nccaom'].includes(body.examType)) {
      updateData.examType = body.examType
    }

    if (body.type && ['multiple_choice', 'true_false', 'case_study'].includes(body.type)) {
      updateData.type = body.type
    }

    if (body.question && body.question.trim().length > 0) {
      updateData.question = body.question.trim()
    }

    if (body.correctAnswer && body.correctAnswer.trim().length > 0) {
      updateData.correctAnswer = body.correctAnswer.trim()
    }

    if (body.explanation !== undefined) {
      updateData.explanation = body.explanation?.trim() || null
    }

    if (body.difficulty && ['easy', 'medium', 'hard'].includes(body.difficulty)) {
      updateData.difficulty = body.difficulty
    }

    if (body.categoryId) {
      updateData.categoryId = body.categoryId
    }

    if (body.options !== undefined) {
      if (Array.isArray(body.options)) {
        updateData.options = JSON.stringify(body.options)
      } else if (typeof body.options === 'string') {
        updateData.options = body.options
      } else {
        updateData.options = null
      }
    }

    if (body.tags !== undefined) {
      if (Array.isArray(body.tags)) {
        updateData.tags = JSON.stringify(body.tags)
      } else {
        updateData.tags = null
      }
    }

    if (body.source !== undefined) {
      updateData.source = body.source?.trim() || null
    }

    // 更新题目
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: updateData,
      include: {
        category: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    // 记录管理员操作日志
    await prisma.adminLog.create({
      data: {
        adminId: admin.userId,
        action: 'update_question',
        targetType: 'question',
        targetId: questionId,
        details: JSON.stringify({ updates: Object.keys(updateData) })
      }
    })

    return {
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion
    }
  } catch (error: any) {
    console.error('Admin update question error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to update question'
    })
  }
})
