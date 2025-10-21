/**
 * AI 学习报告 API
 * 生成个性化学习报告（周报/月报）
 */

import { requireAuth } from '../../utils/auth-helpers'
import { generateStudyReport } from '../../utils/ai-learning-assistant'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const user = await requireAuth(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    // 获取请求参数
    const body = await readBody(event)
    let examType = body.examType || body.exam || 'cale'

    // 如果传入的是对象，提取type字段
    if (typeof examType === 'object' && examType !== null) {
      examType = examType.type || examType.examType || 'cale'
    }

    // 确保examType是字符串
    examType = String(examType)

    const { period = 'week' } = body

    // 验证参数
    if (!['week', 'month'].includes(period)) {
      throw createError({
        statusCode: 400,
        message: 'Period must be "week" or "month"'
      })
    }

    console.log(`[AI-StudyReport] Generating ${period} report for user ${user.id}`)

    // 生成报告
    const report = await generateStudyReport(user.id, examType, period as 'week' | 'month')

    return {
      success: true,
      data: report
    }
  } catch (error: any) {
    console.error('[AI-StudyReport] Error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to generate study report'
    })
  }
})
