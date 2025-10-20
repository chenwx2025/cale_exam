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

    // 安全考虑：即使用户不存在也返回成功消息
    if (!user) {
      return {
        success: true,
        message: '如果该邮箱已注册且未验证，您将收到验证邮件'
      }
    }

    // 如果已经验证，返回提示
    if (user.emailVerified) {
      return {
        success: true,
        message: '该邮箱已经验证过了'
      }
    }

    // 检查上次发送时间（防止频繁发送）
    if (user.emailVerifyExpires) {
      const timeSinceLastSend = Date.now() - (user.emailVerifyExpires.getTime() - 24 * 60 * 60 * 1000)
      const cooldownMs = 60 * 1000 // 1分钟冷却

      if (timeSinceLastSend < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastSend) / 1000)
        throw createError({
          statusCode: 429,
          message: `请等待 ${remainingSeconds} 秒后再重新发送`
        })
      }
    }

    // 生成新的验证 token
    const emailVerifyToken = crypto.randomBytes(32).toString('hex')
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时

    // 更新用户token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken,
        emailVerifyExpires
      }
    })

    // TODO: 发送验证邮件
    // 暂时在控制台打印验证链接（生产环境应该发送邮件）
    const verifyUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${emailVerifyToken}`
    console.log('\n========================================')
    console.log('📧 邮箱验证链接（24小时内有效）:')
    console.log(verifyUrl)
    console.log('========================================\n')

    // 记录操作日志
    console.log(`[${new Date().toISOString()}] 用户 ${email} 请求重发验证邮件`)

    return {
      success: true,
      message: '验证邮件已发送，请查收（包括垃圾邮件文件夹）',
      // 开发环境返回链接（生产环境应删除此行）
      ...(process.env.NODE_ENV === 'development' && { verifyUrl })
    }
  } catch (error: any) {
    console.error('Resend verification error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '发送失败，请稍后重试'
    })
  }
})
