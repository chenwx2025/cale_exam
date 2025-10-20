import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 验证用户登录
    const currentUser = requireAuth(event)

    const body = await readBody(event)
    const { subscription } = body

    // 验证订阅数据
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      throw createError({
        statusCode: 400,
        message: '无效的订阅数据'
      })
    }

    const { endpoint, keys } = subscription

    if (!keys.auth || !keys.p256dh) {
      throw createError({
        statusCode: 400,
        message: '缺少订阅密钥'
      })
    }

    // 获取用户代理信息
    const userAgent = getHeader(event, 'user-agent') || 'Unknown'

    // 检查是否已存在该订阅
    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: { endpoint }
    })

    if (existingSubscription) {
      // 更新现有订阅
      const updatedSubscription = await prisma.pushSubscription.update({
        where: { endpoint },
        data: {
          userId: currentUser.userId,
          auth: keys.auth,
          p256dh: keys.p256dh,
          userAgent
        }
      })

      console.log(`[Push] Updated subscription for user ${currentUser.userId}`)

      return {
        success: true,
        message: '订阅已更新',
        subscription: {
          id: updatedSubscription.id,
          endpoint: updatedSubscription.endpoint
        }
      }
    }

    // 创建新订阅
    const newSubscription = await prisma.pushSubscription.create({
      data: {
        userId: currentUser.userId,
        endpoint,
        auth: keys.auth,
        p256dh: keys.p256dh,
        userAgent
      }
    })

    console.log(`[Push] Created new subscription for user ${currentUser.userId}`)

    return {
      success: true,
      message: 'Push 通知订阅成功',
      subscription: {
        id: newSubscription.id,
        endpoint: newSubscription.endpoint
      }
    }
  } catch (error: any) {
    console.error('[Push Subscribe] Error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '订阅失败，请稍后重试'
    })
  }
})
