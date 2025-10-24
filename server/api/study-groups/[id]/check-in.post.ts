import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const { questionsCount, studyMinutes, note } = body

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
        message: '只有小组成员才能打卡'
      })
    }

    // 获取今天的日期字符串 (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0]

    // 创建或更新打卡记录
    const checkIn = await prisma.studyGroupCheckIn.upsert({
      where: {
        groupId_userId_checkInDate: {
          groupId,
          userId: user.userId,
          checkInDate: today
        }
      },
      create: {
        groupId,
        userId: user.userId,
        checkInDate: today,
        questionsCount: questionsCount || 0,
        studyMinutes: studyMinutes || 0,
        note: note?.trim() || null
      },
      update: {
        questionsCount: questionsCount || 0,
        studyMinutes: studyMinutes || 0,
        note: note?.trim() || null
      }
    })

    // 计算连续打卡天数
    const recentCheckIns = await prisma.studyGroupCheckIn.findMany({
      where: {
        groupId,
        userId: user.userId
      },
      orderBy: {
        checkInDate: 'desc'
      },
      take: 100
    })

    let streakDays = 0
    let currentDate = new Date()

    for (const checkIn of recentCheckIns) {
      const checkInDateStr = currentDate.toISOString().split('T')[0]
      if (checkIn.checkInDate === checkInDateStr) {
        streakDays++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return {
      success: true,
      data: {
        ...checkIn,
        streakDays
      },
      message: '打卡成功！'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('打卡失败:', error)
    throw createError({
      statusCode: 500,
      message: '打卡失败'
    })
  }
})
