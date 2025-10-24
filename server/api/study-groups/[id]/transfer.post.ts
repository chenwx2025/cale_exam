import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const { newOwnerId } = body

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  if (!newOwnerId) {
    throw createError({
      statusCode: 400,
      message: '缺少新组长ID'
    })
  }

  try {
    // 检查操作者是否是当前组长
    const currentOwner = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId,
        role: 'owner'
      }
    })

    if (!currentOwner) {
      throw createError({
        statusCode: 403,
        message: '只有组长可以转让组长身份'
      })
    }

    // 检查新组长是否是成员
    const newOwnerMember = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: newOwnerId
      }
    })

    if (!newOwnerMember) {
      throw createError({
        statusCode: 400,
        message: '新组长必须是小组成员'
      })
    }

    // 事务处理：将当前组长降为管理员，将新组长升为组长
    await prisma.$transaction([
      // 当前组长变为管理员
      prisma.studyGroupMember.update({
        where: { id: currentOwner.id },
        data: { role: 'admin' }
      }),
      // 新成员变为组长
      prisma.studyGroupMember.update({
        where: { id: newOwnerMember.id },
        data: { role: 'owner' }
      }),
      // 更新小组的创建者ID
      prisma.studyGroup.update({
        where: { id: groupId },
        data: { creatorId: newOwnerId }
      })
    ])

    return {
      success: true,
      message: '组长身份已转让'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('转让组长失败:', error)
    throw createError({
      statusCode: 500,
      message: '转让组长失败'
    })
  }
})
