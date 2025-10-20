import { verifyAccessToken } from '../utils/jwt'
import type { H3Event } from 'h3'

/**
 * 认证中间件 - 验证 JWT Token 并注入用户信息到 context
 */
export default defineEventHandler(async (event: H3Event) => {
  // 跳过不需要认证的路由
  const path = event.path || ''

  const publicPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/auth/verify-email',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/_nuxt',
    '/api/_content'
  ]

  // 检查是否是公开路径
  const isPublicPath = publicPaths.some(publicPath => path.startsWith(publicPath))

  if (isPublicPath) {
    return
  }

  // 只对 /api 路径进行认证（跳过页面路由）
  if (!path.startsWith('/api/')) {
    return
  }

  // 从请求头获取 token
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    // 如果没有 token，不抛出错误，让各个 API 自行决定是否需要认证
    return
  }

  try {
    // 验证 token
    const payload = verifyAccessToken(token)

    // 将用户信息注入到 event context
    event.context.user = payload
  } catch (error) {
    // Token 无效或过期，清除 context
    event.context.user = null
  }
})
