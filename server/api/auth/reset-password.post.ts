import { PrismaClient } from '@prisma/client'
import { hashPassword, validatePasswordStrength } from '../../utils/password'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { token, password } = body

    // 验证必填字段
    if (!token || !password) {
      throw createError({
        statusCode: 400,
        message: '缺少必填字段'
      })
    }

    // 验证密码强度
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      throw createError({
        statusCode: 400,
        message: passwordValidation.message
      })
    }

    // 查找有效的重置token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date() // token 未过期
        },
        status: 'active'
      }
    })

    if (!user) {
      throw createError({
        statusCode: 400,
        message: '重置链接无效或已过期，请重新申请'
      })
    }

    // 加密新密码
    const hashedPassword = await hashPassword(password)

    // 更新密码并清除重置token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        tokenVersion: user.tokenVersion + 1, // 撤销所有现有token
        updatedAt: new Date()
      }
    })

    // 记录操作日志
    console.log(`[${new Date().toISOString()}] 用户 ${user.email} 成功重置密码`)

    return {
      success: true,
      message: '密码重置成功，请使用新密码登录'
    }
  } catch (error: any) {
    console.error('Reset password error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '密码重置失败，请稍后重试'
    })
  }
})
