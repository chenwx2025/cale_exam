import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 要求用户认证
  const currentUser = requireAuth(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Plan ID is required'
    })
  }

  // 查找学习计划并验证所有权
  const studyPlan = await prisma.studyPlan.findUnique({
    where: { id }
  })

  if (!studyPlan) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Study plan not found'
    })
  }

  // 验证用户是否拥有该学习计划
  if (studyPlan.userId !== currentUser.userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You do not have permission to delete this study plan'
    })
  }

  // 删除学习计划项目和学习计划
  await prisma.studyPlanItem.deleteMany({
    where: { studyPlanId: id }
  })

  await prisma.studyPlan.delete({
    where: { id }
  })

  return {
    success: true,
    message: 'Study plan deleted successfully'
  }
})
