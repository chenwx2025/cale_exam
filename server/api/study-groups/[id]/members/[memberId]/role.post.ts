import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const memberId = getRouterParam(event, 'memberId')
  const body = await readBody(event)

  const { role } = body

  if (!groupId || !memberId) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数'
    })
  }

  if (!role || !['member', 'admin'].includes(role)) {
    throw createError({
      statusCode: 400,
      message: '无效的角色类型'
    })
  }

  try {
    // 检查操作者是否是组长
    const operatorMembership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId,
        role: 'owner'
      }
    })

    if (!operatorMembership) {
      throw createError({
        statusCode: 403,
        message: '只有组长可以修改成员角色'
      })
    }

    // 检查目标成员
    const targetMembership = await prisma.studyGroupMember.findUnique({
      where: { id: memberId }
    })

    if (!targetMembership || targetMembership.groupId !== groupId) {
      throw createError({
        statusCode: 404,
        message: '成员不存在'
      })
    }

    // 不能修改组长角色
    if (targetMembership.role === 'owner') {
      throw createError({
        statusCode: 400,
        message: '不能修改组长角色'
      })
    }

    // 更新角色
    const updatedMember = await prisma.studyGroupMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    return {
      success: true,
      data: updatedMember,
      message: '成员角色已更新'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('修改成员角色失败:', error)
    throw createError({
      statusCode: 500,
      message: '修改成员角色失败'
    })
  }
})
