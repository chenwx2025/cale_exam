/**
 * 输入验证中间件
 * 自动清理和验证常见的用户输入
 */

import { defineEventHandler, readBody } from 'h3'
import { sanitizeText, sanitizeHTML, sanitizeMarkdown } from '../utils/input-sanitizer'

// 需要清理的字段映射
const SANITIZE_CONFIG: Record<string, {
  fields: Record<string, 'text' | 'html' | 'markdown' | 'skip'>
}> = {
  '/api/study-groups': {
    fields: {
      name: 'text',
      description: 'markdown',
      rules: 'markdown'
    }
  },
  '/api/personal-notes': {
    fields: {
      title: 'text',
      content: 'markdown'
    }
  },
  '/api/study-groups/[id]/posts': {
    fields: {
      title: 'text',
      content: 'markdown'
    }
  },
  '/api/study-groups/[id]/posts/[postId]/replies': {
    fields: {
      content: 'markdown'
    }
  }
}

export default defineEventHandler(async (event) => {
  const method = event.method
  const path = event.path || ''

  // 只处理 POST, PUT, PATCH 请求
  if (!['POST', 'PUT', 'PATCH'].includes(method)) {
    return
  }

  // 跳过认证端点（已有专门验证）
  if (path.startsWith('/api/auth/')) {
    return
  }

  try {
    const body = await readBody(event)

    if (!body || typeof body !== 'object') {
      return
    }

    // 查找匹配的配置
    let config = null
    for (const [pattern, cfg] of Object.entries(SANITIZE_CONFIG)) {
      if (matchPath(path, pattern)) {
        config = cfg
        break
      }
    }

    if (!config) {
      // 没有特定配置，应用默认清理
      sanitizeObject(body)
    } else {
      // 应用特定配置
      for (const [field, type] of Object.entries(config.fields)) {
        if (body[field] && typeof body[field] === 'string') {
          switch (type) {
            case 'text':
              body[field] = sanitizeText(body[field])
              break
            case 'html':
              body[field] = sanitizeHTML(body[field])
              break
            case 'markdown':
              body[field] = sanitizeMarkdown(body[field])
              break
            case 'skip':
              // 不清理
              break
          }
        }
      }
    }

    // 将清理后的 body 存回 event
    event.context._sanitizedBody = body

  } catch (error) {
    // Body 读取失败，忽略
  }
})

// 简单的路径匹配（支持动态参数）
function matchPath(path: string, pattern: string): boolean {
  const pathParts = path.split('/').filter(Boolean)
  const patternParts = pattern.split('/').filter(Boolean)

  if (pathParts.length !== patternParts.length) {
    return false
  }

  return patternParts.every((part, i) => {
    return part.startsWith('[') || part === pathParts[i]
  })
}

// 递归清理对象中的所有字符串字段
function sanitizeObject(obj: any, depth: number = 0): void {
  if (depth > 5) return // 防止过深递归

  for (const key in obj) {
    const value = obj[key]

    if (typeof value === 'string') {
      // 默认使用 text 清理
      obj[key] = sanitizeText(value)
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitizeObject(value, depth + 1)
    } else if (Array.isArray(value)) {
      value.forEach(item => {
        if (item && typeof item === 'object') {
          sanitizeObject(item, depth + 1)
        }
      })
    }
  }
}
