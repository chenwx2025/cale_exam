import { PrismaClient } from '@prisma/client'
import { verifyAccessToken } from '../../utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 从请求头获取 token
    const authHeader = getHeader(event, 'authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: '未授权访问'
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)

    if (!decoded || !decoded.userId) {
      throw createError({
        statusCode: 401,
        message: '无效的访问令牌'
      })
    }

    // 查询用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        subscribedExams: {
          where: { isActive: true }
        }
      }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        message: '用户不存在'
      })
    }

    // 获取订阅的考试类型
    const subscribedExams = user.subscribedExams.map(s => s.examType)

    return {
      success: true,
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
    console.error('Get user info error:', error)
    throw createError({
      statusCode: 500,
      message: '获取用户信息失败'
    })
  }
})
