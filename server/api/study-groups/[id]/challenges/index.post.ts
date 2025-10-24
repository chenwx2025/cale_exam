import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const {
    name,
    description,
    examType,
    categoryId,
    targetType,
    targetValue,
    startDate,
    endDate,
    rewardPoints,
    maxParticipants
  } = body

  if (!groupId || !name || !examType || !targetType || !targetValue || !startDate || !endDate) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数'
    })
  }

  // 验证targetType
  const validTargetTypes = [
    'questions_count', 'study_time', 'exam_score', 'accuracy',
    'daily_questions', 'total_questions', 'accuracy_target', 'knowledge_mastery', 'study_streak'
  ]
  if (!validTargetTypes.includes(targetType)) {
    throw createError({
      statusCode: 400,
      message: `无效的目标类型: ${targetType}。有效类型: ${validTargetTypes.join(', ')}`
    })
  }

  try {
    // 验证用户是小组成员且有权限创建挑战（admin或owner）
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能创建挑战'
      })
    }

    if (!['owner', 'admin'].includes(membership.role)) {
      throw createError({
        statusCode: 403,
        message: '只有小组管理员才能创建挑战'
      })
    }

    // 验证日期
    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()

    if (start >= end) {
      throw createError({
        statusCode: 400,
        message: '结束日期必须晚于开始日期'
      })
    }

    if (end <= now) {
      throw createError({
        statusCode: 400,
        message: '结束日期必须是未来时间'
      })
    }

    // 确定挑战状态
    const status = start <= now ? 'active' : 'upcoming'

    // 创建挑战
    const challenge = await prisma.groupChallenge.create({
      data: {
        groupId,
        name,
        description: description || '',
        examType,
        categoryId: categoryId || null,
        targetType,
        targetValue: parseInt(targetValue),
        startDate: start,
        endDate: end,
        status,
        rewardPoints: parseInt(rewardPoints) || 0,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        createdBy: user.userId
      }
    })

    return {
      success: true,
      data: challenge,
      message: '挑战创建成功'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('创建挑战失败:', error)
    throw createError({
      statusCode: 500,
      message: '创建挑战失败'
    })
  }
})
