/**
 * CSRF Token 生成中间件
 * 文件名以 00. 开头确保在其他中间件之前运行
 */

import { defineEventHandler, getCookie, setCookie } from 'h3'
import crypto from 'crypto'

function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export default defineEventHandler((event) => {
  const method = event.method
  const path = event.path || ''

  // 跳过内部资源
  if (path.startsWith('/_nuxt')) {
    return
  }

  // 为所有请求检查并设置 CSRF Token
  let csrfToken = getCookie(event, 'csrf-token')

  if (!csrfToken) {
    csrfToken = generateCSRFToken()

    setCookie(event, 'csrf-token', csrfToken, {
      httpOnly: false, // JavaScript 需要读取此 cookie
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 小时
      path: '/'
    })
  }
})
