import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

// CALE官方考试配置
const CALE_MOCK_EXAM_CONFIG = {
  totalQuestions: 200,  // CALE考试总题数：200道
  duration: 300,        // 考试时长：300分钟 (5小时)
  domainDistribution: {
    // 官方Domain占比 (基于CALE Examination Bulletin)
    'DOMAIN_1_ASSESSMENT': 27,      // Domain 1: Patient Assessment (27%)
    'DOMAIN_2_DIAGNOSIS': 17,       // Domain 2: Diagnosis & Treatment Planning (17%)
    // Domain 3 (32%) 分为4个子域
    'DOMAIN_3A_ACU_SELECTION': 16,  // Domain 3A: Point Selection (约一半)
    'DOMAIN_3B_ACU_TECHNIQUE': 8,   // Domain 3B: Needling Technique (约1/4)
    'DOMAIN_3C_ADJUNCTIVE': 5,      // Domain 3C: Adjunctive Therapies (约15%)
    'DOMAIN_3D_HERBAL': 15,         // Domain 4: Herbal Therapy (15%)
    'DOMAIN_4_PROFESSIONAL': 11     // Domain 5: Professional Development (11%)
  }
}

export default defineEventHandler(async (event) => {
  try {
    // 从认证中间件获取当前用户
    const currentUser = requireAuth(event)

    const config = CALE_MOCK_EXAM_CONFIG
    const selectedQuestionIds: string[] = []
    const domainBreakdown: Record<string, number> = {}

    // 按Domain占比从题库中抽取题目
    for (const [domainCode, percentage] of Object.entries(config.domainDistribution)) {
      const questionCount = Math.round((percentage / 100) * config.totalQuestions)

      // 获取该Domain的分类ID
      const category = await prisma.category.findFirst({
        where: {
          code: domainCode,
          examType: 'cale'
        }
      })

      if (!category) {
        console.warn(`Category not found for domain: ${domainCode}`)
        continue
      }

      // 获取该Domain的所有可用题目
      const availableQuestions = await prisma.question.findMany({
        where: {
          examType: 'cale',
          categoryId: category.id
        },
        select: {
          id: true
        }
      })

      if (availableQuestions.length < questionCount) {
        throw createError({
          statusCode: 400,
          message: `${domainCode} 题目不足：需要 ${questionCount} 道，但只有 ${availableQuestions.length} 道`
        })
      }

      // 随机抽取题目
      const shuffled = availableQuestions.sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, questionCount)

      selectedQuestionIds.push(...selected.map(q => q.id))
      domainBreakdown[domainCode] = questionCount
    }

    // 验证总题数
    if (selectedQuestionIds.length !== config.totalQuestions) {
      console.warn(`Total questions mismatch: expected ${config.totalQuestions}, got ${selectedQuestionIds.length}`)
    }

    // 获取当前日期用于标题
    const dateStr = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })

    // 创建模拟考试 - 使用认证用户的 ID
    const exam = await prisma.exam.create({
      data: {
        userId: currentUser.userId,
        examType: 'cale',
        title: `CALE 全真模拟考试 - ${dateStr}`,
        mode: 'mock',  // 标记为模拟考试
        generatedBy: 'system',
        questionCount: selectedQuestionIds.length,
        duration: config.duration,
        difficulty: 'mixed',
        status: 'not_started',
        totalScore: selectedQuestionIds.length,
        answers: {
          create: selectedQuestionIds.map((questionId) => ({
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

    return {
      success: true,
      examId: exam.id,
      message: '模拟考试创建成功',
      config: {
        totalQuestions: config.totalQuestions,
        duration: config.duration,
        domainBreakdown
      }
    }
  } catch (error: any) {
    console.error('Create mock exam error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || '创建模拟考试失败'
    })
  }
})
