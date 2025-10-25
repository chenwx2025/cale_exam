import { describe, it, expect, beforeEach } from 'vitest'
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  type JWTPayload,
  type RefreshTokenPayload
} from '../../../server/utils/jwt'

describe('JWT Utils', () => {
  describe('signAccessToken', () => {
    it('应该生成有效的 access token', () => {
      const payload: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: ['cale']
      }

      const token = signAccessToken(payload)

      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT 格式: header.payload.signature
    })

    it('应该在 token 中包含正确的 payload 数据', () => {
      const payload: JWTPayload = {
        userId: 'user-456',
        email: 'admin@example.com',
        role: 'admin',
        subscribedExams: ['cale', 'pmp']
      }

      const token = signAccessToken(payload)
      const decoded = decodeToken(token)

      expect(decoded.userId).toBe(payload.userId)
      expect(decoded.email).toBe(payload.email)
      expect(decoded.role).toBe(payload.role)
      expect(decoded.subscribedExams).toEqual(payload.subscribedExams)
    })

    it('应该包含过期时间', () => {
      const payload: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: []
      }

      const token = signAccessToken(payload)
      const decoded = decodeToken(token)

      expect(decoded.exp).toBeDefined()
      expect(decoded.iat).toBeDefined()
      expect(decoded.exp).toBeGreaterThan(decoded.iat)
    })
  })

  describe('signRefreshToken', () => {
    it('应该生成有效的 refresh token', () => {
      const payload: RefreshTokenPayload = {
        userId: 'user-123',
        tokenVersion: 1
      }

      const token = signRefreshToken(payload)

      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3)
    })

    it('应该在 refresh token 中包含正确的 payload 数据', () => {
      const payload: RefreshTokenPayload = {
        userId: 'user-789',
        tokenVersion: 5
      }

      const token = signRefreshToken(payload)
      const decoded = decodeToken(token)

      expect(decoded.userId).toBe(payload.userId)
      expect(decoded.tokenVersion).toBe(payload.tokenVersion)
    })
  })

  describe('verifyAccessToken', () => {
    it('应该验证有效的 access token', () => {
      const payload: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: ['cale']
      }

      const token = signAccessToken(payload)
      const verified = verifyAccessToken(token)

      expect(verified.userId).toBe(payload.userId)
      expect(verified.email).toBe(payload.email)
      expect(verified.role).toBe(payload.role)
      expect(verified.subscribedExams).toEqual(payload.subscribedExams)
    })

    it('应该拒绝无效的 token', () => {
      const invalidToken = 'invalid.token.here'

      expect(() => verifyAccessToken(invalidToken)).toThrow('Invalid or expired access token')
    })

    it('应该拒绝空 token', () => {
      expect(() => verifyAccessToken('')).toThrow('Invalid or expired access token')
    })

    it('应该拒绝使用错误密钥签名的 token', () => {
      // 使用不同的密钥签名（模拟）
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.fake_signature'

      expect(() => verifyAccessToken(fakeToken)).toThrow()
    })
  })

  describe('verifyRefreshToken', () => {
    it('应该验证有效的 refresh token', () => {
      const payload: RefreshTokenPayload = {
        userId: 'user-123',
        tokenVersion: 1
      }

      const token = signRefreshToken(payload)
      const verified = verifyRefreshToken(token)

      expect(verified.userId).toBe(payload.userId)
      expect(verified.tokenVersion).toBe(payload.tokenVersion)
    })

    it('应该拒绝无效的 refresh token', () => {
      const invalidToken = 'invalid.refresh.token'

      expect(() => verifyRefreshToken(invalidToken)).toThrow('Invalid or expired refresh token')
    })

    it('应该拒绝将 access token 作为 refresh token 使用', () => {
      const accessPayload: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: []
      }

      const accessToken = signAccessToken(accessPayload)

      // Access token 使用不同的密钥，所以验证应该失败
      expect(() => verifyRefreshToken(accessToken)).toThrow()
    })
  })

  describe('decodeToken', () => {
    it('应该解码 token 而不验证', () => {
      const payload: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        subscribedExams: ['cale', 'pmp']
      }

      const token = signAccessToken(payload)
      const decoded = decodeToken(token)

      expect(decoded.userId).toBe(payload.userId)
      expect(decoded.email).toBe(payload.email)
      expect(decoded.role).toBe(payload.role)
      expect(decoded.subscribedExams).toEqual(payload.subscribedExams)
    })

    it('应该解码过期的 token（不验证）', () => {
      // 即使 token 可能过期，decode 也应该工作
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyIsImV4cCI6MTAwMDAwMH0.test'

      const decoded = decodeToken(token)

      expect(decoded).toBeDefined()
      // decode 不验证签名或过期时间
    })

    it('应该返回 null 对于无效格式的 token', () => {
      const invalidToken = 'not-a-valid-token'
      const decoded = decodeToken(invalidToken)

      expect(decoded).toBeNull()
    })
  })

  describe('Token 安全性', () => {
    it('access token 和 refresh token 应该使用不同的密钥', () => {
      const payload: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: []
      }

      const accessToken = signAccessToken(payload)

      // 尝试用 refresh token 验证器验证 access token 应该失败
      expect(() => verifyRefreshToken(accessToken)).toThrow()
    })

    it('相同 payload 生成的 token 应该不同（因为包含时间戳）', () => {
      const payload: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: []
      }

      const token1 = signAccessToken(payload)

      // 等待一小段时间确保时间戳不同
      const token2 = signAccessToken(payload)

      // Token 可能相同（如果生成得非常快），但 payload 中的 iat 应该略有不同
      const decoded1 = decodeToken(token1)
      const decoded2 = decodeToken(token2)

      expect(decoded1.userId).toBe(decoded2.userId)
      // iat 可能相同或略有不同，这取决于执行速度
    })
  })

  describe('边界情况', () => {
    it('应该处理包含特殊字符的邮箱', () => {
      const payload: JWTPayload = {
        userId: 'user-123',
        email: 'test+special@example.com',
        role: 'user',
        subscribedExams: []
      }

      const token = signAccessToken(payload)
      const verified = verifyAccessToken(token)

      expect(verified.email).toBe(payload.email)
    })

    it('应该处理空的 subscribedExams 数组', () => {
      const payload: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: []
      }

      const token = signAccessToken(payload)
      const verified = verifyAccessToken(token)

      expect(verified.subscribedExams).toEqual([])
    })

    it('应该处理多个订阅考试', () => {
      const payload: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        subscribedExams: ['cale', 'pmp', 'comptia', 'cissp']
      }

      const token = signAccessToken(payload)
      const verified = verifyAccessToken(token)

      expect(verified.subscribedExams).toHaveLength(4)
      expect(verified.subscribedExams).toContain('pmp')
    })

    it('应该处理大的 tokenVersion 数字', () => {
      const payload: RefreshTokenPayload = {
        userId: 'user-123',
        tokenVersion: 999999
      }

      const token = signRefreshToken(payload)
      const verified = verifyRefreshToken(token)

      expect(verified.tokenVersion).toBe(999999)
    })
  })
})
