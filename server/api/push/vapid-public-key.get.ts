/**
 * 获取 VAPID 公钥
 * 用于客户端订阅 Push 通知
 */

export default defineEventHandler((event) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY

  if (!publicKey) {
    throw createError({
      statusCode: 500,
      message: 'VAPID 公钥未配置'
    })
  }

  return {
    success: true,
    publicKey
  }
})
