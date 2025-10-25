/**
 * Rate Limiting 中间件
 * 防止 API 滥用、暴力破解和 DDoS 攻击
 */

import { defineEventHandler, getRequestIP } from 'h3'

interface RateLimitEntry {
  count: number
  resetTime: number
}

// 内存存储（生产环境建议使用 Redis）
const rateLimitStore = new Map<string, RateLimitEntry>()

// 不同端点的速率限制配置
const rateLimits: Record<string, { max: number; window: number; message?: string }> = {
  // 认证端点 - 严格限制
  '/api/auth/login': {
    max: 5,
    window: 15 * 60 * 1000, // 15 分钟
    message: '登录尝试次数过多，请 15 分钟后再试'
  },
  '/api/auth/register': {
    max: 3,
    window: 60 * 60 * 1000, // 1 小时
    message: '注册次数过多，请 1 小时后再试'
  },
  '/api/auth/refresh-token': {
    max: 10,
    window: 60 * 1000, // 1 分钟
    message: 'Token 刷新过于频繁'
  },
  '/api/auth/forgot-password': {
    max: 3,
    window: 60 * 60 * 1000, // 1 小时
    message: '密码重置请求过多，请 1 小时后再试'
  },

  // 文件上传 - 中等限制
  'POST:/api/study-groups': {
    max: 10,
    window: 60 * 60 * 1000, // 1 小时 10 个小组
    message: '创建小组过于频繁'
  },
  'POST:/api/personal-notes': {
    max: 50,
    window: 60 * 60 * 1000, // 1 小时 50 条笔记
    message: '创建笔记过于频繁'
  },

  // 默认限制 - 宽松
  'default': {
    max: 100,
    window: 60 * 1000, // 1 分钟 100 次
    message: 'API 请求过于频繁，请稍后再试'
  }
}

// 清理过期条目（每 5 分钟运行一次）
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export default defineEventHandler((event) => {
  // 获取客户端 IP
  const ip = getRequestIP(event) || 'unknown'
  const path = event.path || ''
  const method = event.method

  // 跳过某些路径
  if (path.startsWith('/_nuxt') || path.startsWith('/api/health')) {
    return
  }

  // 确定使用哪个限制规则
  let limitConfig = rateLimits['default']

  // 1. 尝试精确匹配路径
  if (rateLimits[path]) {
    limitConfig = rateLimits[path]
  }
  // 2. 尝试方法+路径组合
  else if (rateLimits[`${method}:${path}`]) {
    limitConfig = rateLimits[`${method}:${path}`]
  }
  // 3. 尝试路径前缀匹配
  else {
    for (const [key, config] of Object.entries(rateLimits)) {
      if (key !== 'default' && path.startsWith(key)) {
        limitConfig = config
        break
      }
    }
  }

  // 生成唯一键：IP + 路径
  const rateLimitKey = `${ip}:${path}`

  const now = Date.now()
  const entry = rateLimitStore.get(rateLimitKey)

  if (!entry || entry.resetTime < now) {
    // 创建新条目
    rateLimitStore.set(rateLimitKey, {
      count: 1,
      resetTime: now + limitConfig.window
    })
  } else {
    // 更新现有条目
    entry.count++

    if (entry.count > limitConfig.max) {
      // 超过限制
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)

      throw createError({
        statusCode: 429,
        statusMessage: 'Too Many Requests',
        message: limitConfig.message || '请求过于频繁，请稍后再试',
        data: {
          retryAfter, // 秒数
          limit: limitConfig.max,
          window: limitConfig.window / 1000 // 转换为秒
        }
      })
    }
  }

  // 设置响应头（告知客户端限制信息）
  const currentEntry = rateLimitStore.get(rateLimitKey)!
  event.node.res.setHeader('X-RateLimit-Limit', limitConfig.max.toString())
  event.node.res.setHeader('X-RateLimit-Remaining', (limitConfig.max - currentEntry.count).toString())
  event.node.res.setHeader('X-RateLimit-Reset', new Date(currentEntry.resetTime).toISOString())
})
