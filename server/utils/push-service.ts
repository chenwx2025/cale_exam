import { PrismaClient } from '@prisma/client'
import webpush from 'web-push'

const prisma = new PrismaClient()

// 配置 VAPID
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@cale-exam.com'

// 初始化 web-push
if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
  )
  console.log('[Push] Web Push configured successfully')
} else {
  console.warn('[Push] VAPID keys not configured. Push notifications will not work.')
}

/**
 * 发送 Push 通知给单个用户
 */
export async function sendPushToUser(
  userId: string,
  payload: {
    title: string
    body: string
    icon?: string
    badge?: string
    tag?: string
    url?: string
    actions?: Array<{ action: string; title: string }>
  }
) {
  try {
    // 检查 VAPID 配置
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn('[Push] VAPID not configured, skipping push notification')
      return {
        success: false,
        sent: 0,
        failed: 0,
        message: 'VAPID not configured'
      }
    }

    // 获取用户的所有订阅
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    })

    if (subscriptions.length === 0) {
      console.log(`[Push] No subscriptions found for user ${userId}`)
      return {
        success: true,
        sent: 0,
        failed: 0,
        message: 'No subscriptions'
      }
    }

    // 准备推送数据
    const pushData = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/badge-72x72.png',
      tag: payload.tag || 'notification',
      requireInteraction: false,
      data: {
        url: payload.url || '/notifications'
      },
      actions: payload.actions || []
    }

    let sent = 0
    let failed = 0
    const failedEndpoints: string[] = []

    // 发送到所有订阅端点
    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              auth: sub.auth,
              p256dh: sub.p256dh
            }
          }

          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(pushData)
          )

          sent++
          console.log(`[Push] Sent to ${sub.endpoint.substring(0, 50)}...`)
        } catch (error: any) {
          failed++
          failedEndpoints.push(sub.endpoint)
          console.error(`[Push] Failed to send to ${sub.endpoint}:`, error.message)

          // 如果订阅失效（410 Gone 或 404），删除它
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`[Push] Deleting expired subscription: ${sub.endpoint}`)
            await prisma.pushSubscription.delete({
              where: { id: sub.id }
            }).catch(err => console.error('[Push] Failed to delete subscription:', err))
          }
        }
      })
    )

    console.log(`[Push] Sent ${sent} notifications, ${failed} failed for user ${userId}`)

    return {
      success: true,
      sent,
      failed,
      failedEndpoints
    }
  } catch (error) {
    console.error('[Push] Error sending push notification:', error)
    return {
      success: false,
      sent: 0,
      failed: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * 发送 Push 通知给多个用户
 */
export async function sendPushToUsers(
  userIds: string[],
  payload: {
    title: string
    body: string
    icon?: string
    badge?: string
    tag?: string
    url?: string
  }
) {
  const results = await Promise.all(
    userIds.map(userId => sendPushToUser(userId, payload))
  )

  const totalSent = results.reduce((sum, r) => sum + r.sent, 0)
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)

  return {
    success: true,
    sent: totalSent,
    failed: totalFailed,
    results
  }
}

/**
 * 发送学习提醒 Push 通知
 */
export async function sendStudyReminderPush(
  userId: string,
  message: string
) {
  return sendPushToUser(userId, {
    title: '📚 学习提醒',
    body: message,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'study-reminder',
    url: '/practice',
    actions: [
      { action: 'start', title: '开始学习' },
      { action: 'dismiss', title: '稍后提醒' }
    ]
  })
}

/**
 * 发送成就通知 Push
 */
export async function sendAchievementPush(
  userId: string,
  title: string,
  message: string
) {
  return sendPushToUser(userId, {
    title: `🏆 ${title}`,
    body: message,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'achievement',
    url: '/stats'
  })
}

/**
 * 发送系统通知 Push
 */
export async function sendSystemPush(
  userId: string,
  title: string,
  message: string,
  url?: string
) {
  return sendPushToUser(userId, {
    title: `🔔 ${title}`,
    body: message,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'system',
    url: url || '/notifications'
  })
}

/**
 * 清理过期的订阅
 */
export async function cleanupExpiredSubscriptions() {
  try {
    // 删除30天未更新的订阅
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const result = await prisma.pushSubscription.deleteMany({
      where: {
        updatedAt: {
          lt: thirtyDaysAgo
        }
      }
    })

    console.log(`[Push] Cleaned up ${result.count} expired subscriptions`)

    return {
      success: true,
      deleted: result.count
    }
  } catch (error) {
    console.error('[Push] Error cleaning up subscriptions:', error)
    return {
      success: false,
      deleted: 0
    }
  }
}

/**
 * 获取用户的订阅数量
 */
export async function getUserSubscriptionCount(userId: string): Promise<number> {
  return prisma.pushSubscription.count({
    where: { userId }
  })
}

/**
 * 测试 Push 通知
 */
export async function testPushNotification(userId: string) {
  return sendPushToUser(userId, {
    title: '测试通知',
    body: '这是一条测试 Push 通知。如果您看到这条消息，说明 Push 通知已正常工作！',
    icon: '/icon-192x192.png',
    tag: 'test',
    url: '/notifications'
  })
}
