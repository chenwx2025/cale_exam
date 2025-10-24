import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const { newOwnerId } = body

  if (!groupId || !newOwnerId) {
    throw createError({
      statusCode: 400,
      message: '缺少参数'
    })
  }

  if (newOwnerId === user.userId) {
    throw createError({
      statusCode: 400,
      message: '你已经是小组所有者'
    })
  }

  try {
    // 获取当前用户的成员信息
    const currentMember = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!currentMember) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能转让所有权'
      })
    }

    // 只有owner可以转让所有权
    if (currentMember.role !== 'owner') {
      throw createError({
        statusCode: 403,
        message: '只有小组所有者才能转让所有权'
      })
    }

    // 获取新所有者的成员信息
    const newOwnerMember = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: newOwnerId
      }
    })

    if (!newOwnerMember) {
      throw createError({
        statusCode: 404,
        message: '新所有者不是小组成员'
      })
    }

    // 使用事务确保数据一致性
    await prisma.$transaction([
      // 将当前所有者降级为admin
      prisma.studyGroupMember.update({
        where: {
          id: currentMember.id
        },
        data: {
          role: 'admin'
        }
      }),
      // 将新成员提升为owner
      prisma.studyGroupMember.update({
        where: {
          id: newOwnerMember.id
        },
        data: {
          role: 'owner'
        }
      }),
      // 更新小组的createdBy字段
      prisma.studyGroup.update({
        where: {
          id: groupId
        },
        data: {
          createdBy: newOwnerId
        }
      })
    ])

    // TODO: 创建通知给新所有者

    return {
      success: true,
      message: '所有权已转让'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('转让所有权失败:', error)
    throw createError({
      statusCode: 500,
      message: '转让所有权失败'
    })
  }
})
