import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../../utils/admin-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  const admin = requireAdmin(event)

  try {
    const userId = event.context.params?.id

    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'User ID is required'
      })
    }

    const body = await readBody(event)
    const { examType, action, expiresAt } = body

    // 验证参数
    if (!examType || !['cale', 'nccaom'].includes(examType)) {
      throw createError({
        statusCode: 400,
        message: 'Valid exam type is required (cale or nccaom)'
      })
    }

    if (!action || !['add', 'remove', 'activate', 'deactivate'].includes(action)) {
      throw createError({
        statusCode: 400,
        message: 'Valid action is required (add, remove, activate, deactivate)'
      })
    }

    // 验证用户存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }

    let result

    switch (action) {
      case 'add':
        // 检查订阅是否已存在
        const existing = await prisma.userExamSubscription.findUnique({
          where: {
            userId_examType: {
              userId,
              examType
            }
          }
        })

        if (existing) {
          // 如果已存在但不活跃，则激活
          if (!existing.isActive) {
            result = await prisma.userExamSubscription.update({
              where: { id: existing.id },
              data: {
                isActive: true,
                expiresAt: expiresAt ? new Date(expiresAt) : null
              }
            })
          } else {
            throw createError({
              statusCode: 400,
              message: 'User already has an active subscription for this exam type'
            })
          }
        } else {
          // 创建新订阅
          result = await prisma.userExamSubscription.create({
            data: {
              userId,
              examType,
              isActive: true,
              expiresAt: expiresAt ? new Date(expiresAt) : null
            }
          })
        }
        break

      case 'remove':
        // 删除订阅
        result = await prisma.userExamSubscription.deleteMany({
          where: {
            userId,
            examType
          }
        })
        break

      case 'activate':
        // 激活订阅
        result = await prisma.userExamSubscription.updateMany({
          where: {
            userId,
            examType
          },
          data: {
            isActive: true,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined
          }
        })
        break

      case 'deactivate':
        // 停用订阅
        result = await prisma.userExamSubscription.updateMany({
          where: {
            userId,
            examType
          },
          data: {
            isActive: false
          }
        })
        break
    }

    // 记录管理员操作日志
    await prisma.adminLog.create({
      data: {
        adminId: admin.userId,
        action: 'manage_subscription',
        targetType: 'subscription',
        targetId: userId,
        details: JSON.stringify({
          examType,
          action,
          expiresAt,
          userEmail: user.email
        })
      }
    })

    // 获取更新后的订阅列表
    const subscriptions = await prisma.userExamSubscription.findMany({
      where: { userId },
      select: {
        id: true,
        examType: true,
        isActive: true,
        subscribedAt: true,
        expiresAt: true
      }
    })

    return {
      success: true,
      message: `Subscription ${action}ed successfully`,
      data: subscriptions
    }
  } catch (error: any) {
    console.error('Admin manage subscription error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to manage subscription'
    })
  }
})
