import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const currentUser = requireAuth(event)
    const body = await readBody(event)
    const { examType } = body

    if (!examType) {
      throw createError({
        statusCode: 400,
        message: '请指定考试类型'
      })
    }

    // 检查是否已订阅
    const existingSubscription = await prisma.userExamSubscription.findUnique({
      where: {
        userId_examType: {
          userId: currentUser.userId,
          examType
        }
      }
    })

    if (existingSubscription) {
      // 如果已存在但未激活，则激活它
      if (!existingSubscription.isActive) {
        await prisma.userExamSubscription.update({
          where: { id: existingSubscription.id },
          data: { isActive: true }
        })
        return {
          success: true,
          message: '订阅已重新激活'
        }
      }

      return {
        success: false,
        message: '您已订阅该考试类型'
      }
    }

    // 创建新订阅
    const subscription = await prisma.userExamSubscription.create({
      data: {
        userId: currentUser.userId,
        examType,
        isActive: true
      }
    })

    return {
      success: true,
      message: '订阅成功',
      subscription: {
        examType: subscription.examType,
        subscribedAt: subscription.subscribedAt
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Subscribe exam error:', error)
    throw createError({
      statusCode: 500,
      message: '订阅失败'
    })
  }
})
