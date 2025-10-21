import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-helpers'
import { ExamConfigFactory } from '../../exam-configs'
import type { ExamType } from '../../../types/exam-configs'

/**
 * 创建模拟考试 API (使用新的配置架构)
 *
 * POST /api/exam/create-mock
 * Body: { examType?: 'cale' | 'nccaom' }
 *
 * 如果不提供 examType，默认使用用户当前选择的考试类型
 */
export default defineEventHandler(async (event) => {
  try {
    // 认证检查
    const currentUser = requireAuth(event)

    // 获取请求参数
    const body = await readBody(event)

    // 从请求体或 query 参数获取考试类型
    let examType = (body.examType || getQuery(event).examType || 'cale') as ExamType

    // 验证考试类型
    if (!ExamConfigFactory.isSupported(examType)) {
      throw createError({
        statusCode: 400,
        message: `不支持的考试类型: ${examType}。支持的类型: ${ExamConfigFactory.getSupportedExamTypes().join(', ')}`
      })
    }

    console.log(`[CREATE-MOCK] Creating ${examType.toUpperCase()} mock exam for user ${currentUser.userId}`)

    // 获取该考试类型的配置
    const examConfig = ExamConfigFactory.getConfig(examType)

    // 使用配置生成题目
    const { questionIds, breakdown } = await examConfig.questionGenerator.generateQuestions(
      examConfig.mockExamConfig
    )

    // 验证题目数量
    if (questionIds.length !== examConfig.mockExamConfig.totalQuestions) {
      console.warn(
        `[${examType.toUpperCase()}] Total questions mismatch: ` +
        `expected ${examConfig.mockExamConfig.totalQuestions}, got ${questionIds.length}`
      )
    }

    // 生成考试标题
    const dateStr = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })

    const examNames: Record<ExamType, string> = {
      cale: 'CALE 全真模拟考试',
      nccaom: 'NCCAOM 全真模拟考试'
    }

    const examTitle = `${examNames[examType]} - ${dateStr}`

    // 创建模拟考试
    const exam = await prisma.exam.create({
      data: {
        userId: currentUser.userId,
        examType,
        title: examTitle,
        mode: 'mock',
        generatedBy: 'system',
        questionCount: questionIds.length,
        duration: examConfig.mockExamConfig.duration,
        difficulty: 'mixed',
        status: 'not_started',
        totalScore: questionIds.length,
        answers: {
          create: questionIds.map((questionId) => ({
            questionId
          }))
        }
      },
      include: {
        answers: {
          include: {
            question: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })

    console.log(`[CREATE-MOCK] Successfully created exam ${exam.id} with ${questionIds.length} questions`)

    return {
      success: true,
      examId: exam.id,
      message: `${examType.toUpperCase()} 模拟考试创建成功`,
      config: {
        examType,
        totalQuestions: examConfig.mockExamConfig.totalQuestions,
        duration: examConfig.mockExamConfig.duration,
        passingScore: examConfig.mockExamConfig.passingScore,
        breakdown,
        metadata: examConfig.mockExamConfig.metadata
      }
    }
  } catch (error: any) {
    console.error('[CREATE-MOCK] Error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || '创建模拟考试失败'
    })
  }
})
