import { requireAuth } from '~/server/utils/auth-helpers'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  const query = getQuery(event)
  let examType = String(query.examType || 'cale')

  // 如果传入的是对象，提取type字段
  if (typeof examType === 'object' && examType !== null) {
    examType = (examType as any).type || (examType as any).examType || 'cale'
  }

  // 确保examType是字符串
  examType = String(examType)

  try {
    // 获取学习计划数量
    const studyPlans = await prisma.studyPlan.count({
      where: {
        userId: user.userId,
        examType,
        isActive: true
      }
    })

    // 获取已完成的考试数量
    const exams = await prisma.exam.count({
      where: {
        userId: user.userId,
        examType,
        status: 'completed'
      }
    })

    // 获取错题数量
    const wrongQuestions = await prisma.wrongQuestion.count({
      where: {
        userId: user.userId,
        question: {
          examType
        }
      }
    })

    // 获取题目总数
    const totalQuestions = await prisma.question.count({
      where: {
        examType
      }
    })

    return {
      success: true,
      data: {
        studyPlans,
        exams,
        wrongQuestions,
        totalQuestions
      }
    }
  } catch (error: any) {
    console.error('Error fetching exam summary:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch exam summary',
      message: error.message
    })
  }
})
