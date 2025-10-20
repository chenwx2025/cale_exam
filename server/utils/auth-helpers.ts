import type { H3Event } from 'h3'
import type { JWTPayload } from './jwt'

/**
 * 获取当前用户（从 context）
 */
export function getCurrentUser(event: H3Event): JWTPayload | null {
  return event.context.user || null
}

/**
 * 要求用户已认证，否则抛出 401 错误
 */
export function requireAuth(event: H3Event): JWTPayload {
  const user = getCurrentUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: '请先登录'
    })
  }

  return user
}

/**
 * 要求用户是管理员，否则抛出 403 错误
 */
export function requireAdmin(event: H3Event): JWTPayload {
  const user = requireAuth(event)

  if (user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: '需要管理员权限'
    })
  }

  return user
}

/**
 * 检查用户是否订阅了指定考试类型
 */
export function requireExamSubscription(event: H3Event, examType: string): JWTPayload {
  const user = requireAuth(event)

  if (!user.subscribedExams.includes(examType)) {
    throw createError({
      statusCode: 403,
      message: `您未订阅 ${examType} 考试`
    })
  }

  return user
}

/**
 * 检查资源所有权（确保用户只能访问自己的数据）
 */
export function requireOwnership(event: H3Event, resourceUserId: string): void {
  const user = requireAuth(event)

  // 管理员可以访问所有资源
  if (user.role === 'admin') {
    return
  }

  // 普通用户只能访问自己的资源
  if (user.userId !== resourceUserId) {
    throw createError({
      statusCode: 403,
      message: '您无权访问此资源'
    })
  }
}
