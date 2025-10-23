import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  requireAdmin(event)

  try {
    // 1. 总用户数
    const totalUsers = await prisma.user.count()

    // 2. 按角色统计
    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    })

    // 3. 按状态统计
    const statusStats = await prisma.user.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    // 4. 邮箱验证统计
    const emailVerifiedCount = await prisma.user.count({
      where: { emailVerified: true }
    })

    const emailUnverifiedCount = await prisma.user.count({
      where: { emailVerified: false }
    })

    // 5. 最近注册用户（30天内）
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // 6. 活跃用户（7天内登录过）
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const activeUsers = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // 7. 按考试类型订阅统计
    const caleSubscribers = await prisma.userExamSubscription.count({
      where: {
        examType: 'cale',
        isActive: true
      }
    })

    const nccaomSubscribers = await prisma.userExamSubscription.count({
      where: {
        examType: 'nccaom',
        isActive: true
      }
    })

    return {
      success: true,
      data: {
        totalUsers,
        recentUsers,
        activeUsers,
        roleStats: roleStats.map(stat => ({
          role: stat.role,
          count: Number(stat._count.id)
        })),
        statusStats: statusStats.map(stat => ({
          status: stat.status,
          count: Number(stat._count.id)
        })),
        emailVerification: {
          verified: emailVerifiedCount,
          unverified: emailUnverifiedCount
        },
        examSubscriptions: {
          cale: caleSubscribers,
          nccaom: nccaomSubscribers
        }
      }
    }
  } catch (error: any) {
    console.error('Get users summary error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get users summary: ' + error.message
    })
  }
})
