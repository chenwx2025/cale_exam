/**
 * 输入清理工具
 * 防止 XSS、注入攻击和恶意输入
 */

/**
 * 清理 HTML 内容（移除潜在危险标签和属性）
 * 注意：生产环境建议使用 DOMPurify 或 sanitize-html
 */
export function sanitizeHTML(html: string): string {
  if (!html) return ''

  // 移除 script 标签
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // 移除事件处理器
  cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  cleaned = cleaned.replace(/on\w+\s*=\s*[^\s>]*/gi, '')

  // 移除 javascript: 协议
  cleaned = cleaned.replace(/javascript:/gi, '')

  // 移除 data: 协议（除了图片）
  cleaned = cleaned.replace(/data:(?!image)/gi, '')

  // 移除 iframe（除非明确允许）
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')

  // 移除 object 和 embed 标签
  cleaned = cleaned.replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '')

  return cleaned
}

/**
 * 清理 Markdown 内容
 */
export function sanitizeMarkdown(markdown: string): string {
  if (!markdown) return ''

  let cleaned = markdown

  // 移除潜在的脚本注入
  cleaned = cleaned.replace(/<script[^>]*>.*?<\/script>/gis, '')

  // 移除内联 HTML 事件处理器
  cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')

  // 移除 javascript: 协议
  cleaned = cleaned.replace(/\[([^\]]+)\]\(javascript:[^\)]*\)/gi, '[$1](#)')

  // 移除 data: 协议（除了图片）
  cleaned = cleaned.replace(/\[([^\]]+)\]\(data:(?!image)[^\)]*\)/gi, '[$1](#)')

  return cleaned
}

/**
 * 验证和清理 URL
 */
export function sanitizeURL(url: string): string | null {
  if (!url) return null

  // 只允许 http, https, mailto 协议
  const allowedProtocols = ['http:', 'https:', 'mailto:']

  try {
    const parsed = new URL(url)

    if (!allowedProtocols.includes(parsed.protocol)) {
      return null
    }

    return parsed.toString()
  } catch {
    // 无效 URL
    return null
  }
}

/**
 * 清理用户输入的文本（通用）
 */
export function sanitizeText(text: string, maxLength: number = 10000): string {
  if (!text) return ''

  // 截断长度
  let cleaned = text.slice(0, maxLength)

  // 移除控制字符（保留换行和制表符）
  cleaned = cleaned.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')

  // Trim
  cleaned = cleaned.trim()

  return cleaned
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * 验证用户名
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: '用户名不能为空' }
  }

  if (username.length < 3) {
    return { valid: false, error: '用户名至少 3 个字符' }
  }

  if (username.length > 20) {
    return { valid: false, error: '用户名最多 20 个字符' }
  }

  // 只允许字母、数字、下划线、连字符
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: '用户名只能包含字母、数字、下划线和连字符' }
  }

  return { valid: true }
}

/**
 * 清理文件名
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed'

  // 移除路径分隔符
  let cleaned = filename.replace(/[\/\\]/g, '')

  // 移除特殊字符，保留字母、数字、点、连字符、下划线
  cleaned = cleaned.replace(/[^a-zA-Z0-9.\-_]/g, '_')

  // 防止多个连续的点（目录遍历攻击）
  cleaned = cleaned.replace(/\.{2,}/g, '.')

  // 截断长度
  if (cleaned.length > 255) {
    const ext = cleaned.split('.').pop() || ''
    const nameWithoutExt = cleaned.slice(0, cleaned.lastIndexOf('.'))
    cleaned = nameWithoutExt.slice(0, 255 - ext.length - 1) + '.' + ext
  }

  return cleaned || 'unnamed'
}

/**
 * SQL 注入防护 - 清理用于 LIKE 查询的输入
 */
export function escapeLikeString(str: string): string {
  // 转义 SQL LIKE 通配符
  return str
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
}

/**
 * 验证和清理整数
 */
export function sanitizeInteger(value: any, min?: number, max?: number): number | null {
  const num = parseInt(value, 10)

  if (isNaN(num)) {
    return null
  }

  if (min !== undefined && num < min) {
    return min
  }

  if (max !== undefined && num > max) {
    return max
  }

  return num
}

/**
 * 验证和清理分页参数
 */
export function sanitizePagination(page: any, limit: any) {
  const sanitizedPage = sanitizeInteger(page, 1, 1000) || 1
  const sanitizedLimit = sanitizeInteger(limit, 1, 100) || 20

  return {
    page: sanitizedPage,
    limit: sanitizedLimit,
    offset: (sanitizedPage - 1) * sanitizedLimit
  }
}
