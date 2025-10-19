import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'userId')

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: 'User ID is required'
    })
  }

  // 获取用户答题统计
  const totalAnswers = await prisma.userAnswer.count({
    where: { userId }
  })

  const correctAnswers = await prisma.userAnswer.count({
    where: {
      userId,
      isCorrect: true
    }
  })

  // 按分类统计
  const answersByCategory = await prisma.userAnswer.groupBy({
    by: ['questionId'],
    where: { userId },
    _count: true
  })

  const questionIds = answersByCategory.map(a => a.questionId)

  const questions = await prisma.question.findMany({
    where: {
      id: { in: questionIds }
    },
    include: {
      category: true,
      userAnswers: {
        where: { userId }
      }
    }
  })

  // 分类统计
  const categoryStats: Record<string, any> = {}

  questions.forEach(q => {
    const categoryName = q.category.name
    if (!categoryStats[categoryName]) {
      categoryStats[categoryName] = {
        total: 0,
        correct: 0,
        categoryCode: q.category.code,
        categoryType: q.category.type
      }
    }

    categoryStats[categoryName].total += q.userAnswers.length
    categoryStats[categoryName].correct += q.userAnswers.filter(a => a.isCorrect).length
  })

  // Convert to plain object to avoid Pinia serialization issues
  return JSON.parse(JSON.stringify({
    overall: {
      total: totalAnswers,
      correct: correctAnswers,
      accuracy: totalAnswers > 0 ? (correctAnswers / totalAnswers * 100).toFixed(2) : 0
    },
    byCategory: Object.entries(categoryStats).map(([name, stats]) => ({
      categoryName: name,
      ...stats,
      accuracy: stats.total > 0 ? (stats.correct / stats.total * 100).toFixed(2) : 0
    }))
  }))
})
