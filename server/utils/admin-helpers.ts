import type { H3Event } from 'h3'
import { requireAuth } from './auth-helpers'

/**
 * 要求管理员权限的中间件
 *
 * 使用方法:
 * const admin = requireAdmin(event)
 *
 * 如果用户未登录或不是管理员，将抛出错误
 */
export function requireAdmin(event: H3Event) {
  // 首先验证用户已登录
  const currentUser = requireAuth(event)

  // 检查用户是否是管理员
  if (currentUser.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Admin access required. You do not have permission to access this resource.'
    })
  }

  return currentUser
}

/**
 * 检查用户是否是管理员（不抛出错误）
 */
export function isAdmin(event: H3Event): boolean {
  try {
    const currentUser = requireAuth(event)
    return currentUser.role === 'admin'
  } catch {
    return false
  }
}
