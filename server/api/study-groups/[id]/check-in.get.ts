import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const groupId = getRouterParam(event, 'id')

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  try {
    // 检查是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能查看打卡记录'
      })
    }

    // 获取今天的日期
    const today = new Date().toISOString().split('T')[0]

    // 检查今天是否已打卡
    const todayCheckIn = await prisma.studyGroupCheckIn.findUnique({
      where: {
        groupId_userId_checkInDate: {
          groupId,
          userId: user.userId,
          checkInDate: today
        }
      }
    })

    return {
      success: true,
      data: {
        todayCheckIn: todayCheckIn || null
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('获取打卡状态失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取打卡状态失败'
    })
  }
})
