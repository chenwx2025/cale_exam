import { PrismaClient } from '@prisma/client'
import { hashPassword, validateEmail, validatePasswordStrength } from '../../utils/password'
import { signAccessToken, signRefreshToken } from '../../utils/jwt'
import { sendVerificationEmail, sendWelcomeEmail } from '../../utils/email-service'
import crypto from 'crypto'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password, name, examTypes } = body

    // 验证必填字段
    if (!email || !password || !name) {
      throw createError({
        statusCode: 400,
        message: '请填写所有必填字段'
      })
    }

    // 将邮箱转为小写（邮箱不区分大小写）
    const normalizedEmail = email.trim().toLowerCase()

    // 验证邮箱格式
    if (!validateEmail(normalizedEmail)) {
      throw createError({
        statusCode: 400,
        message: '邮箱格式不正确'
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

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: '该邮箱已被注册'
      })
    }

    // 加密密码
    const hashedPassword = await hashPassword(password)

    // 生成邮箱验证 token
    const emailVerifyToken = crypto.randomBytes(32).toString('hex')

    // 创建用户（默认未验证邮箱）
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name,
        role: 'user',
        emailVerified: false, // 需要验证邮箱
        emailVerifyToken,
        emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后过期
        status: 'active'
      }
    })

    // 发送验证邮件（异步，不阻塞注册流程）
    sendVerificationEmail(normalizedEmail, emailVerifyToken).catch(error => {
      console.error('[Register] Failed to send verification email:', error)
    })

    // 发送欢迎邮件（异步）
    sendWelcomeEmail(normalizedEmail, name).catch(error => {
      console.error('[Register] Failed to send welcome email:', error)
    })

    // 创建考试订阅
    const examTypesToSubscribe = Array.isArray(examTypes) && examTypes.length > 0
      ? examTypes
      : ['cale'] // 默认订阅 CALE

    await Promise.all(
      examTypesToSubscribe.map(examType =>
        prisma.userExamSubscription.create({
          data: {
            userId: user.id,
            examType,
            isActive: true
          }
        })
      )
    )

    // 获取订阅信息
    const subscriptions = await prisma.userExamSubscription.findMany({
      where: { userId: user.id, isActive: true }
    })

    const subscribedExams = subscriptions.map(s => s.examType)

    // 生成 tokens
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      subscribedExams
    })

    const refreshToken = signRefreshToken({
      userId: user.id,
      tokenVersion: user.tokenVersion
    })

    // 更新登录信息
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: 1
      }
    })

    return {
      success: true,
      message: '注册成功',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscribedExams
      }
    }
  } catch (error: any) {
    // 如果是已知错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    // 其他错误
    console.error('Registration error:', error)
    throw createError({
      statusCode: 500,
      message: '注册失败，请稍后重试'
    })
  }
})
