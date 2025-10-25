import prisma from '~/server/utils/prisma'
import { questionCache } from '~/server/utils/question-cache'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Question ID is required'
    })
  }

  // 尝试从缓存获取
  const cacheKey = questionCache.getQuestionKey(id)
  const cached = questionCache.get<any>(cacheKey)

  if (cached) {
    console.log('[Question] Cache hit:', cacheKey)
    return {
      ...cached,
      fromCache: true
    }
  }

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          code: true,
          type: true,
          parent: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      }
    }
  })

  if (!question) {
    throw createError({
      statusCode: 404,
      message: 'Question not found'
    })
  }

  // Convert to plain object to avoid Pinia serialization issues
  const result = JSON.parse(JSON.stringify(question))

  // 缓存结果（10分钟）
  questionCache.set(cacheKey, result, 10 * 60 * 1000)
  console.log('[Question] Cached:', cacheKey)

  return {
    ...result,
    fromCache: false
  }
})
