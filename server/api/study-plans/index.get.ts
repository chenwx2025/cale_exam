import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 从认证中间件获取当前用户
  const currentUser = requireAuth(event)

  const query = getQuery(event)
  const examType = query.examType as string

  // 构建查询条件 - 使用认证用户的 ID
  const where: any = { userId: currentUser.userId }
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
