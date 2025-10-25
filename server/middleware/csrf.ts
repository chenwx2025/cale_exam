/**
 * CSRF (跨站请求伪造) 保护中间件
 * 防止恶意网站冒用用户身份执行操作
 */

import { defineEventHandler, getHeader, getCookie, setCookie } from 'h3'
import crypto from 'crypto'

// 生成 CSRF Token
function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// 需要 CSRF 保护的方法
const PROTECTED_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH']

// 豁免路径（不需要 CSRF 检查）
const EXEMPT_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh-token',
  '/api/push/vapid-public-key', // 公开端点
  '/_nuxt', // Nuxt 内部资源
]

export default defineEventHandler((event) => {
  const method = event.method
  const path = event.path || ''

  // 只检查状态修改操作
  if (!PROTECTED_METHODS.includes(method)) {
    return
  }

  // 检查是否在豁免列表中
  const isExempt = EXEMPT_PATHS.some(exemptPath => path.startsWith(exemptPath))
  if (isExempt) {
    return
  }

  // 获取 CSRF Token
  const csrfTokenFromHeader = getHeader(event, 'x-csrf-token')
  const csrfTokenFromCookie = getCookie(event, 'csrf-token')

  // 验证 CSRF Token
  if (!csrfTokenFromHeader || !csrfTokenFromCookie) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'CSRF token missing'
    })
  }

  if (csrfTokenFromHeader !== csrfTokenFromCookie) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Invalid CSRF token'
    })
  }

  // Token 验证通过
})

// 为 GET 请求生成和设置 CSRF Token
export const csrfTokenHandler = defineEventHandler((event) => {
  const method = event.method
  const path = event.path || ''

  // 只为 GET 请求设置 CSRF Token
  if (method === 'GET' && !path.startsWith('/_nuxt')) {
    let csrfToken = getCookie(event, 'csrf-token')

    if (!csrfToken) {
      csrfToken = generateCSRFToken()

      setCookie(event, 'csrf-token', csrfToken, {
        httpOnly: false, // 需要被 JavaScript 读取
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 小时
      })
    }
  }
})
