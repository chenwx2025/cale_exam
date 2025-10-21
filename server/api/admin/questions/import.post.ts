import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event)

  try {
    const body = await readBody(event)

    if (!body.questions || !Array.isArray(body.questions)) {
      throw createError({
        statusCode: 400,
        message: 'Questions array is required'
      })
    }

    const results = {
      total: body.questions.length,
      success: 0,
      failed: 0,
      errors: [] as any[]
    }

    // 验证和导入每个题目
    for (let i = 0; i < body.questions.length; i++) {
      const questionData = body.questions[i]

      try {
        // 验证必填字段
        if (!questionData.question || !questionData.categoryCode || !questionData.correctAnswer) {
          throw new Error('Missing required fields: question, categoryCode, or correctAnswer')
        }

        // 验证 examType
        const examType = questionData.examType || 'cale'
        if (!['cale', 'nccaom'].includes(examType)) {
          throw new Error('Invalid examType. Must be "cale" or "nccaom"')
        }

        // 查找分类
        const category = await prisma.category.findFirst({
          where: {
            code: questionData.categoryCode,
            examType: examType
          }
        })

        if (!category) {
          throw new Error(`Category not found: ${questionData.categoryCode} for ${examType}`)
        }

        // 验证题型
        const type = questionData.type || 'multiple_choice'
        if (!['multiple_choice', 'true_false', 'case_study'].includes(type)) {
          throw new Error('Invalid question type')
        }

        // 验证难度
        const difficulty = questionData.difficulty || 'medium'
        if (!['easy', 'medium', 'hard'].includes(difficulty)) {
          throw new Error('Invalid difficulty level')
        }

        // 处理选项
        let options = null
        if (questionData.options) {
          if (Array.isArray(questionData.options)) {
            options = JSON.stringify(questionData.options)
          } else if (typeof questionData.options === 'string') {
            // 尝试解析 JSON 字符串
            try {
              const parsed = JSON.parse(questionData.options)
              options = JSON.stringify(parsed)
            } catch {
              options = questionData.options
            }
          }
        }

        // 处理标签
        let tags = null
        if (questionData.tags) {
          if (Array.isArray(questionData.tags)) {
            tags = JSON.stringify(questionData.tags)
          } else if (typeof questionData.tags === 'string') {
            try {
              const parsed = JSON.parse(questionData.tags)
              tags = JSON.stringify(parsed)
            } catch {
              tags = JSON.stringify([questionData.tags])
            }
          }
        }

        // 创建题目
        await prisma.question.create({
          data: {
            examType: examType,
            type: type,
            question: questionData.question.trim(),
            correctAnswer: questionData.correctAnswer.trim(),
            options: options,
            explanation: questionData.explanation?.trim() || null,
            difficulty: difficulty,
            categoryId: category.id,
            tags: tags,
            source: questionData.source?.trim() || null
          }
        })

        results.success++
      } catch (error: any) {
        results.failed++
        results.errors.push({
          row: i + 1,
          question: questionData.question?.substring(0, 50) || 'N/A',
          error: error.message
        })
      }
    }

    // 记录管理员操作日志
    await prisma.adminLog.create({
      data: {
        adminId: admin.userId,
        action: 'import_questions',
        targetType: 'question',
        targetId: null,
        details: JSON.stringify({
          total: results.total,
          success: results.success,
          failed: results.failed
        })
      }
    })

    return {
      success: true,
      message: `导入完成: ${results.success} 成功, ${results.failed} 失败`,
      data: results
    }
  } catch (error: any) {
    console.error('Admin import questions error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to import questions'
    })
  }
})
