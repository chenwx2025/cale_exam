import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  try {
    // 检查操作者是否是组长
    const ownerMembership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId,
        role: 'owner'
      }
    })

    if (!ownerMembership) {
      throw createError({
        statusCode: 403,
        message: '只有组长可以解散小组'
      })
    }

    // 删除小组（级联删除会自动删除成员、帖子等）
    await prisma.studyGroup.delete({
      where: { id: groupId }
    })

    return {
      success: true,
      message: '学习小组已解散'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('解散小组失败:', error)
    throw createError({
      statusCode: 500,
      message: '解散小组失败'
    })
  }
})
