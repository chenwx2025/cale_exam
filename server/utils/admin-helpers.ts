import type { H3Event } from 'h3'
import { requireAuth } from './auth-helpers'

/**
 * 检查用户是否是管理员（不抛出错误）
 *
 * 注意：如需强制要求管理员权限，请使用 auth-helpers.ts 中的 requireAdmin
 */
export function isAdmin(event: H3Event): boolean {
  try {
    const currentUser = requireAuth(event)
    return currentUser.role === 'admin'
  } catch {
    return false
  }
}
