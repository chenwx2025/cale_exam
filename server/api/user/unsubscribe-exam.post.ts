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

    // 查找订阅记录
    const subscription = await prisma.userExamSubscription.findUnique({
      where: {
        userId_examType: {
          userId: currentUser.userId,
          examType
        }
      }
    })

    if (!subscription) {
      return {
        success: false,
        message: '您未订阅该考试类型'
      }
    }

    // 软删除：将订阅标记为不活跃
    await prisma.userExamSubscription.update({
      where: { id: subscription.id },
      data: { isActive: false }
    })

    return {
      success: true,
      message: '退订成功'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Unsubscribe exam error:', error)
    throw createError({
      statusCode: 500,
      message: '退订失败'
    })
  }
})
