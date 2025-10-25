import { PrismaClient } from '@prisma/client'
import { signAccessToken, signRefreshToken } from '../../server/utils/jwt'
import { hashPassword } from '../../server/utils/password'

// 测试数据库实例
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./test.db'
    }
  }
})

/**
 * 清理测试数据库
 */
export async function cleanupDatabase() {
  // 删除所有测试数据（注意顺序，避免外键约束）
  await testPrisma.studyGroupCheckIn.deleteMany()
  await testPrisma.studyGroupMember.deleteMany()
  await testPrisma.studyGroup.deleteMany()
  await testPrisma.userAnswer.deleteMany()
  await testPrisma.userPoints.deleteMany()
  await testPrisma.userAchievement.deleteMany()
  await testPrisma.user.deleteMany()
}

/**
 * 创建测试用户
 */
export async function createTestUser(data: {
  email?: string
  password?: string
  name?: string
  role?: string
  emailVerified?: boolean
}) {
  const email = data.email || `test-${Date.now()}@example.com`
  const password = data.password || 'TestPass123'
  const hashedPassword = await hashPassword(password)

  const user = await testPrisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: data.name || 'Test User',
      role: data.role || 'user',
      emailVerified: data.emailVerified ?? true,
      subscribedExams: ['cale']
    }
  })

  // 生成测试 token
  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    subscribedExams: user.subscribedExams
  })

  const refreshToken = signRefreshToken({
    userId: user.id,
    tokenVersion: user.tokenVersion
  })

  return {
    user,
    accessToken,
    refreshToken,
    password // 返回明文密码用于测试
  }
}

/**
 * 生成认证 Header
 */
export function getAuthHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`
  }
}

/**
 * Mock Nuxt 事件处理器
 */
export function mockEvent(options: {
  method?: string
  headers?: Record<string, string>
  body?: any
  query?: Record<string, any>
  params?: Record<string, string>
}) {
  return {
    node: {
      req: {
        method: options.method || 'GET',
        headers: options.headers || {}
      },
      res: {
        statusCode: 200,
        statusMessage: 'OK',
        setHeader: () => {},
        end: () => {}
      }
    },
    headers: options.headers || {},
    method: options.method || 'GET'
  }
}

/**
 * 等待异步操作
 */
export function waitFor(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
