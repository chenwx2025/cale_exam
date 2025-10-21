import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  const admin = requireAdmin(event)

  try {
    const body = await readBody(event)
    const {
      examType,
      type,
      question,
      options,
      correctAnswer,
      explanation,
      difficulty,
      categoryId,
      tags,
      source
    } = body

    // 验证必填字段
    if (!examType || !['cale', 'nccaom'].includes(examType)) {
      throw createError({
        statusCode: 400,
        message: 'Valid exam type is required (cale or nccaom)'
      })
    }

    if (!type || !['multiple_choice', 'true_false', 'case_study'].includes(type)) {
      throw createError({
        statusCode: 400,
        message: 'Valid question type is required (multiple_choice, true_false, case_study)'
      })
    }

    if (!question || question.trim().length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Question content is required'
      })
    }

    if (!correctAnswer || correctAnswer.trim().length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Correct answer is required'
      })
    }

    if (!categoryId) {
      throw createError({
        statusCode: 400,
        message: 'Category is required'
      })
    }

    if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
      throw createError({
        statusCode: 400,
        message: 'Valid difficulty is required (easy, medium, hard)'
      })
    }

    // 验证分类存在
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      throw createError({
        statusCode: 400,
        message: 'Category not found'
      })
    }

    // 验证考试类型匹配
    if (category.examType !== examType) {
      throw createError({
        statusCode: 400,
        message: 'Category exam type does not match question exam type'
      })
    }

    // 处理选项（如果是选择题）
    let optionsJson = null
    if (type === 'multiple_choice' && options) {
      if (Array.isArray(options)) {
        optionsJson = JSON.stringify(options)
      } else if (typeof options === 'string') {
        optionsJson = options
      }
    }

    // 处理标签
    let tagsJson = null
    if (tags) {
      if (Array.isArray(tags)) {
        tagsJson = JSON.stringify(tags)
      } else if (typeof tags === 'string') {
        tagsJson = tags
      }
    }

    // 创建题目
    const newQuestion = await prisma.question.create({
      data: {
        examType,
        type,
        question: question.trim(),
        options: optionsJson,
        correctAnswer: correctAnswer.trim(),
        explanation: explanation?.trim() || null,
        difficulty,
        categoryId,
        tags: tagsJson,
        source: source?.trim() || null
      },
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
        action: 'create_question',
        targetType: 'question',
        targetId: newQuestion.id,
        details: JSON.stringify({
          examType,
          type,
          difficulty,
          categoryId
        })
      }
    })

    return {
      success: true,
      message: 'Question created successfully',
      data: newQuestion
    }
  } catch (error: any) {
    console.error('Admin create question error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to create question'
    })
  }
})
