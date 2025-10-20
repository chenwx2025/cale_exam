import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 验证用户登录
    const currentUser = requireAuth(event)

    const body = await readBody(event)
    const { endpoint } = body

    // 验证端点
    if (!endpoint) {
      throw createError({
        statusCode: 400,
        message: '缺少订阅端点'
      })
    }

    // 查找订阅
    const subscription = await prisma.pushSubscription.findUnique({
      where: { endpoint }
    })

    if (!subscription) {
      return {
        success: true,
        message: '订阅不存在或已被删除'
      }
    }

    // 验证所有权
    if (subscription.userId !== currentUser.userId) {
      throw createError({
        statusCode: 403,
        message: '无权删除此订阅'
      })
    }

    // 删除订阅
    await prisma.pushSubscription.delete({
      where: { endpoint }
    })

    console.log(`[Push] Unsubscribed user ${currentUser.userId}`)

    return {
      success: true,
      message: 'Push 通知已取消订阅'
    }
  } catch (error: any) {
    console.error('[Push Unsubscribe] Error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '取消订阅失败，请稍后重试'
    })
  }
})
