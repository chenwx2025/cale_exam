import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { userId, questionId, userAnswer, timeSpent } = body

  // 获取题目信息
  const question = await prisma.question.findUnique({
    where: { id: questionId }
  })

  if (!question) {
    throw createError({
      statusCode: 404,
      message: '题目不存在'
    })
  }

  // 判断答案是否正确
  const isCorrect = userAnswer.trim() === question.correctAnswer.trim()

  // 检查是否已经答过这道题
  const existingAnswer = await prisma.userAnswer.findFirst({
    where: {
      userId,
      questionId
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const attemptCount = existingAnswer ? existingAnswer.attemptCount + 1 : 1

  // 保存答题记录
  const answer = await prisma.userAnswer.create({
    data: {
      userId,
      questionId,
      userAnswer,
      isCorrect,
      timeSpent,
      attemptCount
    }
  })

  // Convert to plain object to avoid Pinia serialization issues
  return JSON.parse(JSON.stringify({
    ...answer,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation
  }))
})
