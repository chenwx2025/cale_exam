/**
 * AI 错题分析 API
 * 分析错题模式，提供针对性建议
 */

import { getUserFromToken } from '../../utils/auth-helpers'
import { analyzeWrongQuestionPatterns } from '../../utils/ai-learning-assistant'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const user = await getUserFromToken(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    // 获取请求参数
    const body = await readBody(event)
    const { examType = 'cale' } = body

    console.log(`[AI-WrongAnalysis] Analyzing wrong questions for user ${user.id}`)

    // 分析错题模式
    const analysis = await analyzeWrongQuestionPatterns(user.id, examType)

    return {
      success: true,
      data: analysis
    }
  } catch (error: any) {
    console.error('[AI-WrongAnalysis] Error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to analyze wrong questions'
    })
  }
})
