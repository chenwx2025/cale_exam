/**
 * AI 题目推荐 API
 * 智能推荐最适合当前学习阶段的题目
 */

import { requireAuth } from '../../utils/auth-helpers'
import { recommendQuestions } from '../../utils/ai-learning-assistant'

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
    const {
      examType = 'cale',
      count = 20
    } = body

    // 验证参数
    if (count < 1 || count > 100) {
      throw createError({
        statusCode: 400,
        message: 'Count must be between 1 and 100'
      })
    }

    console.log(`[AI-QuestionRec] Recommending ${count} questions for user ${user.id}`)

    // 获取推荐题目
    const result = await recommendQuestions(user.id, examType, count)

    return {
      success: true,
      data: {
        questions: result.questions.map(q => ({
          id: q.id,
          type: q.type,
          question: q.question,
          options: q.options ? JSON.parse(q.options) : null,
          difficulty: q.difficulty,
          categoryId: q.categoryId,
          category: q.category
        })),
        strategy: result.strategy,
        count: result.questions.length
      }
    }
  } catch (error: any) {
    console.error('[AI-QuestionRec] Error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to recommend questions'
    })
  }
})
