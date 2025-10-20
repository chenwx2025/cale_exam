import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const currentUser = requireAuth(event)
    const body = await readBody(event)
    const { name, nickname, avatar } = body

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.userId },
      data: {
        name: name || undefined,
        nickname: nickname || undefined,
        avatar: avatar || undefined
      },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        avatar: true,
        role: true
      }
    })

    return {
      success: true,
      message: '个人信息更新成功',
      user: updatedUser
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Update profile error:', error)
    throw createError({
      statusCode: 500,
      message: '更新个人信息失败'
    })
  }
})
