/**
 * HTTP 安全头中间件
 * 添加各种安全响应头以防止常见的 Web 攻击
 */

import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  const headers = event.node.res

  // 1. X-Content-Type-Options
  // 防止 MIME 类型嗅探
  headers.setHeader('X-Content-Type-Options', 'nosniff')

  // 2. X-Frame-Options
  // 防止点击劫持攻击
  headers.setHeader('X-Frame-Options', 'DENY')

  // 3. X-XSS-Protection
  // 启用浏览器的 XSS 过滤器
  headers.setHeader('X-XSS-Protection', '1; mode=block')

  // 4. Strict-Transport-Security (HSTS)
  // 强制使用 HTTPS（仅在生产环境）
  if (process.env.NODE_ENV === 'production') {
    headers.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // 5. Referrer-Policy
  // 控制 Referrer 信息的发送
  headers.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // 6. Permissions-Policy
  // 控制浏览器功能的访问权限
  headers.setHeader(
    'Permissions-Policy',
    [
      'geolocation=()',        // 禁用地理位置
      'microphone=()',         // 禁用麦克风
      'camera=()',             // 禁用摄像头
      'payment=()',            // 禁用支付 API
      'usb=()',                // 禁用 USB
      'magnetometer=()',       // 禁用磁力计
      'accelerometer=()',      // 禁用加速度计
      'gyroscope=()',          // 禁用陀螺仪
    ].join(', ')
  )

  // 7. Content-Security-Policy (CSP)
  // 最强大的安全头，防止 XSS、数据注入等攻击
  const cspDirectives = [
    "default-src 'self'",                                    // 默认只允许同源
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",      // 脚本源（Nuxt 需要 unsafe-inline 和 unsafe-eval）
    "style-src 'self' 'unsafe-inline'",                     // 样式源（Tailwind 需要 unsafe-inline）
    "img-src 'self' data: https: blob:",                    // 图片源
    "font-src 'self' data:",                                // 字体源
    "connect-src 'self'",                                   // XHR/Fetch 连接
    "media-src 'self'",                                     // 音视频源
    "object-src 'none'",                                    // 禁用 Flash 等插件
    "frame-src 'none'",                                     // 禁用 iframe
    "frame-ancestors 'none'",                               // 防止被嵌入 iframe
    "base-uri 'self'",                                      // 限制 <base> 标签
    "form-action 'self'",                                   // 限制表单提交目标
    "upgrade-insecure-requests",                            // 自动升级到 HTTPS
  ]

  // 开发环境放宽限制
  if (process.env.NODE_ENV === 'development') {
    cspDirectives.push("connect-src 'self' ws: wss:")  // 允许 HMR WebSocket
  }

  headers.setHeader(
    'Content-Security-Policy',
    cspDirectives.join('; ')
  )

  // 8. X-Permitted-Cross-Domain-Policies
  // 防止 Flash/PDF 跨域策略
  headers.setHeader('X-Permitted-Cross-Domain-Policies', 'none')

  // 9. X-Download-Options
  // IE8+ 下载文件时防止自动执行
  headers.setHeader('X-Download-Options', 'noopen')

  // 10. Cache-Control (针对敏感端点)
  const path = event.path || ''
  if (path.startsWith('/api/')) {
    // API 响应不缓存敏感数据
    if (
      path.includes('/user') ||
      path.includes('/auth') ||
      path.includes('/admin')
    ) {
      headers.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, private'
      )
      headers.setHeader('Pragma', 'no-cache')
      headers.setHeader('Expires', '0')
    }
  }
})
