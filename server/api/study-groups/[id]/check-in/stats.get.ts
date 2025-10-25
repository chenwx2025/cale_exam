import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
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
        message: '只有小组成员才能查看统计数据'
      })
    }

    // 获取当前用户的所有打卡记录
    const userCheckIns = await prisma.studyGroupCheckIn.findMany({
      where: {
        groupId,
        userId: user.userId
      },
      orderBy: {
        checkInDate: 'desc'
      },
      select: {
        checkInDate: true
      }
    })

    // 计算总打卡次数
    const totalCheckIns = userCheckIns.length

    // 计算当前连续打卡天数
    let currentStreak = 0
    let currentDate = new Date()

    for (const checkIn of userCheckIns) {
      const checkInDateStr = currentDate.toISOString().split('T')[0]
      if (checkIn.checkInDate === checkInDateStr) {
        currentStreak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    // 计算最长连续打卡天数
    let longestStreak = 0
    let tempStreak = 0
    let prevDate: Date | null = null

    // 按时间正序遍历
    const sortedCheckIns = [...userCheckIns].reverse()

    for (const checkIn of sortedCheckIns) {
      const checkInDate = new Date(checkIn.checkInDate + 'T00:00:00')

      if (prevDate === null) {
        tempStreak = 1
      } else {
        const daysDiff = Math.floor((checkInDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }

      prevDate = checkInDate
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    console.log('[Stats API] 统计数据:', {
      currentStreak,
      longestStreak,
      totalCheckIns,
      userId: user.userId,
      groupId
    })

    return {
      success: true,
      data: {
        currentStreak,
        longestStreak,
        totalCheckIns
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('获取打卡统计失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取打卡统计失败'
    })
  }
})
