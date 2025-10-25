import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT CHALLENGES POST] ========== 请求到达 ==========')

  const user = await requireAuth(event)
  console.log('[FLAT CHALLENGES POST] 用户:', user.userId)

  const body = await readBody(event)

  const {
    groupId,
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

  console.log('[FLAT CHALLENGES POST] groupId:', groupId, 'name:', name, 'targetType:', targetType)

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
    console.log('[FLAT CHALLENGES POST] 开始验证用户权限')

    // 验证用户是小组成员且有权限创建挑战（admin或owner）
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      console.log('[FLAT CHALLENGES POST] 用户不是小组成员')
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能创建挑战'
      })
    }

    if (!['owner', 'admin'].includes(membership.role)) {
      console.log('[FLAT CHALLENGES POST] 用户角色不足:', membership.role)
      throw createError({
        statusCode: 403,
        message: '只有小组管理员才能创建挑战'
      })
    }

    console.log('[FLAT CHALLENGES POST] 用户权限验证通过，角色:', membership.role)

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

    console.log('[FLAT CHALLENGES POST] 开始创建挑战，状态:', status)

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

    console.log('[FLAT CHALLENGES POST] 挑战创建成功:', challenge.id)
    console.log('[FLAT CHALLENGES POST] 准备返回响应...')

    return {
      success: true,
      data: challenge,
      message: '挑战创建成功'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT CHALLENGES POST] 创建挑战失败:', error)
    throw createError({
      statusCode: 500,
      message: '创建挑战失败'
    })
  }
})
