import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 获取当前用户
    const user = requireAuth(event)

    // 增加 tokenVersion，使所有现有 token 失效
    await prisma.user.update({
      where: { id: user.userId },
      data: {
        tokenVersion: {
          increment: 1
        }
      }
    })

    return {
      success: true,
      message: '登出成功'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Logout error:', error)
    throw createError({
      statusCode: 500,
      message: '登出失败'
    })
  }
})
