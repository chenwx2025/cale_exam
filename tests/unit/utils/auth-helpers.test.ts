import { describe, it, expect, beforeEach } from 'vitest'
import { getCurrentUser, requireAuth, requireAdmin, requireExamSubscription, requireOwnership } from '../../../server/utils/auth-helpers'
import type { JWTPayload } from '../../../server/utils/jwt'

describe('Auth Helpers', () => {
  let mockEvent: any

  beforeEach(() => {
    mockEvent = {
      context: {}
    }
  })

  describe('getCurrentUser', () => {
    it('应该返回context中的用户', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: ['cale']
      }

      mockEvent.context.user = user

      const result = getCurrentUser(mockEvent)

      expect(result).toEqual(user)
    })

    it('应该在没有用户时返回 null', () => {
      const result = getCurrentUser(mockEvent)

      expect(result).toBeNull()
    })

    it('应该在 context.user 为 undefined 时返回 null', () => {
      mockEvent.context.user = undefined

      const result = getCurrentUser(mockEvent)

      expect(result).toBeNull()
    })
  })

  describe('requireAuth', () => {
    it('应该在用户已认证时返回用户信息', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: ['cale']
      }

      mockEvent.context.user = user

      const result = requireAuth(mockEvent)

      expect(result).toEqual(user)
    })

    it('应该在用户未认证时抛出错误', () => {
      expect(() => requireAuth(mockEvent)).toThrow('请先登录')
    })

    it('应该在 context.user 为 null 时抛出错误', () => {
      mockEvent.context.user = null

      expect(() => requireAuth(mockEvent)).toThrow()
    })
  })

  describe('requireAdmin', () => {
    it('应该在用户是管理员时返回用户信息', () => {
      const adminUser: JWTPayload = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
        subscribedExams: ['cale']
      }

      mockEvent.context.user = adminUser

      const result = requireAdmin(mockEvent)

      expect(result).toEqual(adminUser)
    })

    it('应该在用户不是管理员时抛出错误', () => {
      const regularUser: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: ['cale']
      }

      mockEvent.context.user = regularUser

      expect(() => requireAdmin(mockEvent)).toThrow('需要管理员权限')
    })

    it('应该在用户未认证时抛出错误', () => {
      expect(() => requireAdmin(mockEvent)).toThrow('请先登录')
    })

    it('应该在用户角色为其他值时抛出错误', () => {
      const moderatorUser: JWTPayload = {
        userId: 'mod-123',
        email: 'mod@example.com',
        role: 'moderator',
        subscribedExams: ['cale']
      }

      mockEvent.context.user = moderatorUser

      expect(() => requireAdmin(mockEvent)).toThrow('需要管理员权限')
    })
  })

  describe('requireExamSubscription', () => {
    it('应该在用户已订阅考试时返回用户信息', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: ['cale', 'pmp']
      }

      mockEvent.context.user = user

      const result = requireExamSubscription(mockEvent, 'cale')

      expect(result).toEqual(user)
    })

    it('应该在用户未订阅考试时抛出错误', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: ['pmp']
      }

      mockEvent.context.user = user

      expect(() => requireExamSubscription(mockEvent, 'cale')).toThrow()
    })

    it('应该区分大小写检查考试类型', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: ['cale']
      }

      mockEvent.context.user = user

      // 大小写不同，应该失败
      expect(() => requireExamSubscription(mockEvent, 'CALE')).toThrow()
    })

    it('应该处理订阅列表为空的情况', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: []
      }

      mockEvent.context.user = user

      expect(() => requireExamSubscription(mockEvent, 'cale')).toThrow()
    })

    it('应该处理用户订阅多个考试的情况', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: ['cale', 'pmp', 'comptia', 'cissp']
      }

      mockEvent.context.user = user

      // 检查中间的考试
      const result = requireExamSubscription(mockEvent, 'pmp')
      expect(result).toEqual(user)

      // 检查最后的考试
      const result2 = requireExamSubscription(mockEvent, 'cissp')
      expect(result2).toEqual(user)
    })
  })

  describe('requireOwnership', () => {
    it('应该允许用户访问自己的资源', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: ['cale']
      }

      mockEvent.context.user = user

      // 不应该抛出错误
      expect(() => requireOwnership(mockEvent, 'user-123')).not.toThrow()
    })

    it('应该阻止用户访问他人的资源', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: ['cale']
      }

      mockEvent.context.user = user

      expect(() => requireOwnership(mockEvent, 'user-456')).toThrow('您无权访问此资源')
    })

    it('应该允许管理员访问任何资源', () => {
      const adminUser: JWTPayload = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
        subscribedExams: ['cale']
      }

      mockEvent.context.user = adminUser

      // 管理员可以访问他人资源
      expect(() => requireOwnership(mockEvent, 'user-456')).not.toThrow()
      expect(() => requireOwnership(mockEvent, 'user-789')).not.toThrow()
    })

    it('应该允许管理员访问自己的资源', () => {
      const adminUser: JWTPayload = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
        subscribedExams: ['cale']
      }

      mockEvent.context.user = adminUser

      // 管理员也可以访问自己的资源
      expect(() => requireOwnership(mockEvent, 'admin-123')).not.toThrow()
    })

    it('应该区分大小写比较用户ID', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: ['cale']
      }

      mockEvent.context.user = user

      // 大小写不同，应该失败
      expect(() => requireOwnership(mockEvent, 'USER-123')).toThrow()
    })

    it('应该在用户未认证时抛出错误', () => {
      expect(() => requireOwnership(mockEvent, 'user-123')).toThrow('请先登录')
    })
  })

  describe('集成场景', () => {
    it('应该正确处理完整的权限检查流程', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: ['cale', 'pmp']
      }

      mockEvent.context.user = user

      // 1. 检查认证
      const authUser = requireAuth(mockEvent)
      expect(authUser).toEqual(user)

      // 2. 检查考试订阅
      const examUser = requireExamSubscription(mockEvent, 'cale')
      expect(examUser).toEqual(user)

      // 3. 检查资源所有权
      expect(() => requireOwnership(mockEvent, 'user-123')).not.toThrow()

      // 4. 尝试访问他人资源应该失败
      expect(() => requireOwnership(mockEvent, 'user-456')).toThrow()

      // 5. 尝试访问管理员功能应该失败
      expect(() => requireAdmin(mockEvent)).toThrow()
    })

    it('应该正确处理管理员的完整权限', () => {
      const adminUser: JWTPayload = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
        subscribedExams: ['cale']
      }

      mockEvent.context.user = adminUser

      // 1. 认证通过
      const authUser = requireAuth(mockEvent)
      expect(authUser).toEqual(adminUser)

      // 2. 管理员权限通过
      const admin = requireAdmin(mockEvent)
      expect(admin).toEqual(adminUser)

      // 3. 可以访问任何资源
      expect(() => requireOwnership(mockEvent, 'user-123')).not.toThrow()
      expect(() => requireOwnership(mockEvent, 'user-456')).not.toThrow()

      // 4. 考试订阅检查
      const examUser = requireExamSubscription(mockEvent, 'cale')
      expect(examUser).toEqual(adminUser)
    })
  })
})
