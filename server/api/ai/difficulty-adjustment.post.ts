/**
 * AI 难度调整 API
 * 根据用户表现智能调整题目难度
 */

import { getUserFromToken } from '../../utils/auth-helpers'
import { adjustDifficulty } from '../../utils/ai-learning-assistant'

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
