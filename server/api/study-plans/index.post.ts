import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 要求用户认证
  const currentUser = requireAuth(event)

  const body = await readBody(event)

  const {
    name,
    description,
    startDate,
    endDate,
    questionsPerDay,
    focusCategory,
    examType = 'cale'
  } = body

  // 验证必填字段
  if (!name || !startDate || !endDate || !questionsPerDay) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: name, startDate, endDate, questionsPerDay'
    })
  }

  // 计算学习天数
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  if (days <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'End date must be after start date'
    })
  }

  // 获取题目
  let questions
  if (focusCategory) {
    // 如果指定了重点分类，只获取该分类的题目
    questions = await prisma.question.findMany({
      where: {
        categoryId: focusCategory,
        examType
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  } else {
    // 否则获取所有该考试类型的题目
    questions = await prisma.question.findMany({
      where: {
        examType
      },
      orderBy: [
        { category: { order: 'asc' } },
        { createdAt: 'desc' }
      ]
    })
  }

  if (questions.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No questions found for the specified criteria'
    })
  }

  // 创建学习计划
  const studyPlan = await prisma.studyPlan.create({
    data: {
      userId: currentUser.userId,
      examType,
      name,
      description: description || '',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: true
    }
  })

  // 生成学习计划项目
  const totalQuestionsNeeded = Math.min(days * questionsPerDay, questions.length)
  const selectedQuestions = questions.slice(0, totalQuestionsNeeded)

  // 将题目平均分配到每一天
  const questionsPerDayActual = Math.ceil(selectedQuestions.length / days)
  const planItems = []

  for (let day = 0; day < days; day++) {
    const currentDate = new Date(start)
    currentDate.setDate(currentDate.getDate() + day)

    const startIdx = day * questionsPerDayActual
    const endIdx = Math.min((day + 1) * questionsPerDayActual, selectedQuestions.length)

    for (let i = startIdx; i < endIdx; i++) {
      if (selectedQuestions[i]) {
        planItems.push({
          studyPlanId: studyPlan.id,
          questionId: selectedQuestions[i].id,
          scheduledFor: currentDate,
          completed: false
        })
      }
    }
  }

  // 批量创建学习计划项目
  await prisma.studyPlanItem.createMany({
    data: planItems
  })

  // 返回完整的学习计划（包含统计信息）
  const completePlan = await prisma.studyPlan.findUnique({
    where: { id: studyPlan.id },
    include: {
      items: {
        include: {
          question: {
            include: {
              category: true
            }
          }
        },
        orderBy: {
          scheduledFor: 'asc'
        }
      }
    }
  })

  // 计算统计信息
  const stats = {
    totalQuestions: completePlan?.items.length || 0,
    totalDays: days,
    questionsPerDay: Math.ceil((completePlan?.items.length || 0) / days),
    completedQuestions: 0,
    progress: 0
  }

  return {
    ...completePlan,
    stats
  }
})
