import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = query.userId as string
  const examType = query.examType as string

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'userId is required'
    })
  }

  // 构建查询条件
  const where: any = { userId }
  if (examType) {
    where.examType = examType
  }

  // 获取用户的所有学习计划
  const studyPlans = await prisma.studyPlan.findMany({
    where,
    include: {
      items: {
        select: {
          id: true,
          completed: true,
          scheduledFor: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // 为每个计划计算统计信息
  const plansWithStats = studyPlans.map(plan => {
    const totalQuestions = plan.items.length
    const completedQuestions = plan.items.filter(item => item.completed).length
    const progress = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0

    const start = new Date(plan.startDate)
    const end = new Date(plan.endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    return {
      ...plan,
      stats: {
        totalQuestions,
        completedQuestions,
        progress,
        totalDays: days,
        questionsPerDay: Math.ceil(totalQuestions / days)
      }
    }
  })

  return plansWithStats
})
