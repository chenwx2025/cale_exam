import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  requireAdmin(event)

  try {
    const userId = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'User ID is required'
      })
    }

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }

    // 准备更新数据
    const updateData: any = {}

    // 允许更新的字段
    if (body.role !== undefined) {
      if (!['user', 'admin'].includes(body.role)) {
        throw createError({
          statusCode: 400,
          message: 'Invalid role. Must be "user" or "admin"'
        })
      }
      updateData.role = body.role
    }

    if (body.status !== undefined) {
      if (!['active', 'suspended', 'deleted'].includes(body.status)) {
        throw createError({
          statusCode: 400,
          message: 'Invalid status. Must be "active", "suspended", or "deleted"'
        })
      }
      updateData.status = body.status
    }

    if (body.emailVerified !== undefined) {
      updateData.emailVerified = body.emailVerified
    }

    if (body.name !== undefined) {
      updateData.name = body.name
    }

    if (body.nickname !== undefined) {
      updateData.nickname = body.nickname
    }

    // 更新用户
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        role: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // 记录管理员操作日志
    const adminUser = event.context.user
    await prisma.adminLog.create({
      data: {
        adminId: adminUser.userId,
        action: 'update_user',
        targetType: 'user',
        targetId: userId,
        details: JSON.stringify({
          changes: updateData,
          previousRole: existingUser.role,
          previousStatus: existingUser.status
        }),
        ipAddress: getRequestIP(event) || undefined,
        userAgent: getRequestHeader(event, 'user-agent') || undefined
      }
    })

    return {
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    }
  } catch (error: any) {
    // 如果是已知错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    console.error('Update user error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update user: ' + error.message
    })
  }
})
