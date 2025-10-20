import { PrismaClient } from '@prisma/client'
import { validateEmail } from '../../utils/password'
import crypto from 'crypto'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email } = body

    // 验证邮箱格式
    if (!email || !validateEmail(email)) {
      throw createError({
        statusCode: 400,
        message: '请输入有效的邮箱地址'
      })
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // 安全考虑：即使用户不存在也返回成功消息（防止邮箱枚举攻击）
    if (!user) {
      return {
        success: true,
        message: '如果该邮箱已注册，您将收到密码重置邮件'
      }
    }

    // 检查用户状态
    if (user.status !== 'active') {
      throw createError({
        statusCode: 403,
        message: '该账户已被停用，请联系管理员'
      })
    }

    // 生成重置密码 token（32字节随机字符串）
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1小时后过期

    // 更新用户重置token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpires
      }
    })

    // TODO: 发送重置密码邮件
    // 暂时在控制台打印重置链接（生产环境应该发送邮件）
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    console.log('\n========================================')
    console.log('🔐 密码重置链接（1小时内有效）:')
    console.log(resetUrl)
    console.log('========================================\n')

    // 记录操作日志
    console.log(`[${new Date().toISOString()}] 用户 ${email} 请求重置密码`)

    return {
      success: true,
      message: '如果该邮箱已注册，您将收到密码重置邮件',
      // 开发环境返回token（生产环境应删除此行）
      ...(process.env.NODE_ENV === 'development' && { resetToken, resetUrl })
    }
  } catch (error: any) {
    console.error('Forgot password error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '请求失败，请稍后重试'
    })
  }
})
