import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event)

  try {
    const questionId = event.context.params?.id

    if (!questionId) {
      throw createError({
        statusCode: 400,
        message: 'Question ID is required'
      })
    }

    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId }
    })

    if (!existingQuestion) {
      throw createError({
        statusCode: 404,
        message: 'Question not found'
      })
    }

    await prisma.question.delete({
      where: { id: questionId }
    })

    await prisma.adminLog.create({
      data: {
        adminId: admin.userId,
        action: 'delete_question',
        targetType: 'question',
        targetId: questionId,
        details: JSON.stringify({
          question: existingQuestion.question.substring(0, 100),
          examType: existingQuestion.examType
        })
      }
    })

    return {
      success: true,
      message: 'Question deleted successfully'
    }
  } catch (error: any) {
    console.error('Admin delete question error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to delete question'
    })
  }
})
