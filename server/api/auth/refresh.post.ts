import { PrismaClient } from '@prisma/client'
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '../../utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { refreshToken } = body

    if (!refreshToken) {
      throw createError({
        statusCode: 400,
        message: '缺少 Refresh Token'
      })
    }

    // 验证 Refresh Token
    let payload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch (error) {
      throw createError({
        statusCode: 401,
        message: 'Refresh Token 无效或已过期'
      })
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        subscribedExams: {
          where: { isActive: true }
        }
      }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: '用户不存在'
      })
    }

    // 检查 token 版本（用于撤销所有 token）
    if (user.tokenVersion !== payload.tokenVersion) {
      throw createError({
        statusCode: 401,
        message: 'Token 已失效，请重新登录'
      })
    }

    // 检查账号状态
    if (user.status !== 'active') {
      throw createError({
        statusCode: 403,
        message: '账号已被停用'
      })
    }

    // 获取订阅的考试类型
    const subscribedExams = user.subscribedExams.map(s => s.examType)

    // 生成新的 Access Token
    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      subscribedExams
    })

    // 可选：同时生成新的 Refresh Token（延长会话）
    const newRefreshToken = signRefreshToken({
      userId: user.id,
      tokenVersion: user.tokenVersion
    })

    return {
      success: true,
      message: 'Token 刷新成功',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Refresh token error:', error)
    throw createError({
      statusCode: 500,
      message: 'Token 刷新失败'
    })
  }
})
