import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { token } = body

    if (!token) {
      throw createError({
        statusCode: 400,
        message: '缺少验证token'
      })
    }

    // 查找有效的验证token
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpires: {
          gt: new Date() // token 未过期
        },
        emailVerified: false // 尚未验证
      }
    })

    if (!user) {
      throw createError({
        statusCode: 400,
        message: '验证链接无效或已过期'
      })
    }

    // 更新用户邮箱验证状态
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
        updatedAt: new Date()
      }
    })

    // 记录操作日志
    console.log(`[${new Date().toISOString()}] 用户 ${user.email} 成功验证邮箱`)

    return {
      success: true,
      message: '邮箱验证成功，您现在可以正常使用所有功能'
    }
  } catch (error: any) {
    console.error('Email verification error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '邮箱验证失败，请稍后重试'
    })
  }
})
