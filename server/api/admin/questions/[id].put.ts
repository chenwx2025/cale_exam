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

    // 处理选项和正确答案的格式
    let parsedOptions: string[] = []

    if (body.options !== undefined) {
      if (Array.isArray(body.options)) {
        // 给选项添加 A. B. C. D. 前缀
        parsedOptions = body.options.map((opt: string, index: number) => {
          const letter = String.fromCharCode(65 + index) // A, B, C, D
          const optText = opt.trim()
          // 如果已经有前缀，不重复添加
          if (optText.match(/^[A-Z]\.\s*/)) {
            return optText
          }
          return `${letter}. ${optText}`
        })
        updateData.options = JSON.stringify(parsedOptions)
      } else if (typeof body.options === 'string') {
        updateData.options = body.options
        // 尝试解析字符串格式的选项
        try {
          parsedOptions = JSON.parse(body.options)
        } catch (e) {
          parsedOptions = []
        }
      } else {
        updateData.options = null
      }
    }

    // 处理正确答案 - 需要包含完整的 "B. 选项文本" 格式
    if (body.correctAnswer && body.correctAnswer.trim().length > 0) {
      const answerLetter = body.correctAnswer.trim().toUpperCase()

      // 如果已经是完整格式（包含点号和文本），直接使用
      if (answerLetter.match(/^[A-Z]\.\s+.+/)) {
        updateData.correctAnswer = answerLetter
      }
      // 如果只是字母，需要从选项中找到对应的完整文本
      else if (answerLetter.match(/^[A-Z]$/)) {
        const answerIndex = answerLetter.charCodeAt(0) - 65 // A=0, B=1, C=2, D=3

        // 如果有更新的选项，使用新选项
        if (parsedOptions.length > answerIndex) {
          updateData.correctAnswer = parsedOptions[answerIndex]
        }
        // 否则，从现有题目中获取选项
        else if (existingQuestion.options) {
          try {
            const existingOptions = JSON.parse(existingQuestion.options)
            if (existingOptions.length > answerIndex) {
              updateData.correctAnswer = existingOptions[answerIndex]
            } else {
              updateData.correctAnswer = `${answerLetter}. `
            }
          } catch (e) {
            updateData.correctAnswer = `${answerLetter}. `
          }
        } else {
          updateData.correctAnswer = `${answerLetter}. `
        }
      }
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
