/**
 * AI 学习路径推荐 API
 * 基于用户学习数据生成个性化学习路径
 */

import { requireAuth } from '../../utils/auth-helpers'
import { generateLearningPath } from '../../utils/ai-learning-assistant'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const user = await requireAuth(event)

    // 获取请求参数
    const body = await readBody(event)
    let examType = body.examType || body.exam || 'cale'

    // 如果传入的是对象，提取type字段
    if (typeof examType === 'object' && examType !== null) {
      examType = examType.type || examType.examType || 'cale'
    }

    // 确保examType是字符串
    examType = String(examType)

    console.log(`[AI-LearningPath] Generating learning path for user ${user.id}, examType: ${examType}`)

    // 生成学习路径
    const result = await generateLearningPath(user.id, examType)

    return {
      success: true,
      data: {
        recommendations: result.recommendations,
        analysis: result.analysis,
        generatedAt: new Date()
      }
    }
  } catch (error: any) {
    console.error('[AI-LearningPath] Error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to generate learning path'
    })
  }
})
