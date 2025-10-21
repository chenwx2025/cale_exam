/**
 * AI 难度调整 API
 * 根据用户表现智能调整题目难度
 */

import { requireAuth } from '../../utils/auth-helpers'
import { adjustDifficulty } from '../../utils/ai-learning-assistant'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const user = requireAuth(event)

    // 获取请求参数
    const body = await readBody(event)
    let examType = body.examType || body.exam || 'cale'

    // 如果传入的是对象，提取type字段
    if (typeof examType === 'object' && examType !== null) {
      examType = examType.type || examType.examType || 'cale'
    }

    // 确保examType是字符串
    examType = String(examType)

    console.log(`[AI-DifficultyAdj] Adjusting difficulty for user ${user.id}`)

    // 调整难度
    const result = await adjustDifficulty(user.id, examType)

    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    console.error('[AI-DifficultyAdj] Error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to adjust difficulty'
    })
  }
})
