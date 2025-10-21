import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  const admin = requireAdmin(event)

  try {
    const userId = event.context.params?.id

    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'User ID is required'
      })
    }

    const body = await readBody(event)
    const { name, nickname, role, status, emailVerified } = body

    // 验证用户存在
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }

    // 防止管理员修改自己的角色为普通用户
    if (admin.userId === userId && role && role !== 'admin') {
      throw createError({
        statusCode: 400,
        message: 'You cannot change your own admin role'
      })
    }

    // 构建更新数据
    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (nickname !== undefined) updateData.nickname = nickname
    if (role !== undefined && ['user', 'admin'].includes(role)) {
      updateData.role = role
    }
    if (status !== undefined && ['active', 'suspended', 'deleted'].includes(status)) {
      updateData.status = status
    }
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified

    // 更新用户
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        subscribedExams: {
          where: { isActive: true },
          select: {
            examType: true
          }
        }
      }
    })

    // 记录管理员操作日志
    await prisma.adminLog.create({
      data: {
        adminId: admin.userId,
        action: 'update_user',
        targetType: 'user',
        targetId: userId,
        details: JSON.stringify({
          updates: updateData,
          previousRole: existingUser.role,
          previousStatus: existingUser.status
        })
      }
    })

    return {
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    }
  } catch (error: any) {
    console.error('Admin update user error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to update user'
    })
  }
})
