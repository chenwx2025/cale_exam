import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'
import { hashPassword, verifyPassword, validatePasswordStrength } from '../../utils/password'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const currentUser = requireAuth(event)
    const body = await readBody(event)
    const { oldPassword, newPassword } = body

    // 验证必填字段
    if (!oldPassword || !newPassword) {
      throw createError({
        statusCode: 400,
        message: '请填写旧密码和新密码'
      })
    }

    // 验证新密码强度
    const passwordValidation = validatePasswordStrength(newPassword)
    if (!passwordValidation.valid) {
      throw createError({
        statusCode: 400,
        message: passwordValidation.message
      })
    }

    // 查询用户
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        message: '用户不存在'
      })
    }

    // 验证旧密码
    const isOldPasswordValid = await verifyPassword(oldPassword, user.password)
    if (!isOldPasswordValid) {
      throw createError({
        statusCode: 401,
        message: '旧密码错误'
      })
    }

    // 加密新密码
    const hashedNewPassword = await hashPassword(newPassword)

    // 更新密码并增加 tokenVersion（使所有现有 token 失效）
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        tokenVersion: {
          increment: 1
        }
      }
    })

    return {
      success: true,
      message: '密码修改成功，请重新登录'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Change password error:', error)
    throw createError({
      statusCode: 500,
      message: '修改密码失败'
    })
  }
})
