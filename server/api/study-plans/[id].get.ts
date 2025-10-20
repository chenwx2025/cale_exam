import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Plan ID is required'
    })
  }

  const studyPlan = await prisma.studyPlan.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          question: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  nameEn: true,
                  code: true,
                  type: true
                }
              }
            }
          }
        },
        orderBy: {
          scheduledFor: 'asc'
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })

  if (!studyPlan) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Study plan not found'
    })
  }

  // 计算统计信息
  const totalQuestions = studyPlan.items.length
  const completedQuestions = studyPlan.items.filter(item => item.completed).length
  const progress = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0

  const start = new Date(studyPlan.startDate)
  const end = new Date(studyPlan.endDate)
  const today = new Date()
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const daysElapsed = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  const daysRemaining = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

  // 按日期分组题目
  const itemsByDate: Record<string, typeof studyPlan.items> = {}
  studyPlan.items.forEach(item => {
    const dateKey = new Date(item.scheduledFor).toISOString().split('T')[0]
    if (!itemsByDate[dateKey]) {
      itemsByDate[dateKey] = []
    }
    itemsByDate[dateKey].push(item)
  })

  // 按分类统计
  const categoryStats: Record<string, { name: string; total: number; completed: number }> = {}
  studyPlan.items.forEach(item => {
    const catId = item.question.categoryId
    const catName = item.question.category.name
    if (!categoryStats[catId]) {
      categoryStats[catId] = { name: catName, total: 0, completed: 0 }
    }
    categoryStats[catId].total++
    if (item.completed) {
      categoryStats[catId].completed++
    }
  })

  return {
    ...studyPlan,
    stats: {
      totalQuestions,
      completedQuestions,
      progress,
      totalDays: days,
      daysElapsed,
      daysRemaining,
      questionsPerDay: Math.ceil(totalQuestions / days),
      onTrack: completedQuestions >= Math.floor((daysElapsed / days) * totalQuestions)
    },
    itemsByDate,
    categoryStats
  }
})
