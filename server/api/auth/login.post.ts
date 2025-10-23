import { PrismaClient } from '@prisma/client'
import { verifyPassword, validateEmail } from '../../utils/password'
import { signAccessToken, signRefreshToken } from '../../utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    // 验证必填字段
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: '请填写邮箱和密码'
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

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        subscribedExams: {
          where: { isActive: true }
        }
      }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: '邮箱或密码错误'
      })
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        message: '邮箱或密码错误'
      })
    }

    // 检查账号状态
    if (user.status === 'suspended') {
      throw createError({
        statusCode: 403,
        message: '账号已被停用，请联系管理员'
      })
    }

    if (user.status === 'deleted') {
      throw createError({
        statusCode: 403,
        message: '账号不存在'
      })
    }

    // 检查邮箱验证状态（可选）
    // if (!user.emailVerified) {
    //   throw createError({
    //     statusCode: 403,
    //     message: '请先验证邮箱'
    //   })
    // }

    // 获取订阅的考试类型
    const subscribedExams = user.subscribedExams.map(s => s.examType)

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
        loginCount: user.loginCount + 1
      }
    })

    return {
      success: true,
      message: '登录成功',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        subscribedExams,
        emailVerified: user.emailVerified
      }
    }
  } catch (error: any) {
    // 如果是已知错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    // 其他错误
    console.error('Login error:', error)
    throw createError({
      statusCode: 500,
      message: '登录失败，请稍后重试'
    })
  }
})
