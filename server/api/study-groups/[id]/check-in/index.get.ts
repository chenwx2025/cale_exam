import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

// 辅助函数：计算连续天数
function calculateStreakDays(checkInDates: string[]): number {
  if (checkInDates.length === 0) return 0

  const sortedDates = checkInDates.sort().reverse() // 从最近到最远
  const today = new Date().toISOString().split('T')[0]

  let streak = 0
  let currentDate = new Date()

  // 如果今天没打卡，从昨天开始算
  if (sortedDates[0] !== today) {
    currentDate.setDate(currentDate.getDate() - 1)
  }

  for (const dateStr of sortedDates) {
    const expectedDate = currentDate.toISOString().split('T')[0]
    if (dateStr === expectedDate) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

// 辅助函数：计算相对时间
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

// 辅助函数：获取本周日期范围
function getWeekDates(): { date: string, dayOfWeek: string, isToday: boolean }[] {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)) // 调整到本周一

  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const result = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    const dayIndex = date.getDay()

    result.push({
      date: dateStr,
      dayOfWeek: weekDays[dayIndex],
      isToday: dateStr === today.toISOString().split('T')[0]
    })
  }

  return result
}

export default defineEventHandler(async (event) => {
  console.log('[Check-in GET] ========== GET 请求到达 ==========')

  const user = requireAuth(event)
  console.log('[Check-in GET] 用户:', user.userId)

  const groupId = getRouterParam(event, 'id')
  console.log('[Check-in GET] groupId:', groupId)

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

    const today = new Date().toISOString().split('T')[0]

    // 1. 获取今天的打卡记录
    const todayCheckIn = await prisma.studyGroupCheckIn.findUnique({
      where: {
        groupId_userId_checkInDate: {
          groupId,
          userId: user.userId,
          checkInDate: today
        }
      }
    })

    // 2. 获取用户在该小组的所有打卡记录
    const allCheckIns = await prisma.studyGroupCheckIn.findMany({
      where: {
        groupId,
        userId: user.userId
      },
      select: {
        checkInDate: true
      },
      orderBy: {
        checkInDate: 'desc'
      }
    })

    // 3. 计算个人统计
    const checkInDates = allCheckIns.map(c => c.checkInDate)
    const streakDays = calculateStreakDays(checkInDates)
    const totalCheckIns = allCheckIns.length

    // 4. 计算出勤率
    const joinedAt = membership.createdAt
    const daysSinceJoined = Math.max(1, Math.ceil((Date.now() - joinedAt.getTime()) / 86400000))
    const attendanceRate = Math.round((totalCheckIns / daysSinceJoined) * 100)

    // 5. 获取本周日历
    const weekDates = getWeekDates()
    const weeklyCalendar = weekDates.map(day => ({
      ...day,
      checked: checkInDates.includes(day.date)
    }))

    // 6. 获取小组排行榜（优化：一次查询所有打卡记录，按userId分组）
    const allMembers = await prisma.studyGroupMember.findMany({
      where: { groupId },
      select: {
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // 获取小组所有打卡记录
    const allGroupCheckIns = await prisma.studyGroupCheckIn.findMany({
      where: { groupId },
      select: {
        userId: true,
        checkInDate: true
      }
    })

    // 按userId分组
    const checkInsByUser = new Map<string, string[]>()
    allGroupCheckIns.forEach(checkIn => {
      if (!checkInsByUser.has(checkIn.userId)) {
        checkInsByUser.set(checkIn.userId, [])
      }
      checkInsByUser.get(checkIn.userId)!.push(checkIn.checkInDate)
    })

    // 计算每个成员的连续天数
    const leaderboardData = allMembers.map(member => {
      const dates = checkInsByUser.get(member.userId) || []
      const streak = calculateStreakDays(dates)

      return {
        userId: member.user.id,
        userName: member.user.name || member.user.email,
        streakDays: streak,
        isCurrentUser: member.userId === user.userId
      }
    })

    // 排序并添加排名
    const sortedLeaderboard = leaderboardData
      .sort((a, b) => b.streakDays - a.streakDays)
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }))

    // 7. 获取今日小组打卡动态（最近5条）
    const recentCheckIns = await prisma.studyGroupCheckIn.findMany({
      where: {
        groupId,
        checkInDate: today
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    const recentActivity = recentCheckIns.map(checkIn => ({
      userId: checkIn.user.id,
      userName: checkIn.user.name || checkIn.user.email,
      checkInTime: getRelativeTime(checkIn.createdAt)
    }))

    // 8. 小组今日统计
    const todayGroupCheckIns = recentCheckIns.length // 已经查询过了，直接用长度
    const totalMembers = allMembers.length

    console.log('[Check-in GET] 返回数据:', {
      userId: user.userId,
      todayCheckIn: todayCheckIn ? '已打卡' : '未打卡',
      streakDays,
      totalCheckIns,
      attendanceRate,
      leaderboardCount: sortedLeaderboard.length
    })

    return {
      success: true,
      data: {
        // 今日打卡状态
        todayCheckIn: todayCheckIn ? {
          id: todayCheckIn.id,
          checkInTime: todayCheckIn.createdAt.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          })
        } : null,

        // 个人统计
        stats: {
          streakDays,
          totalCheckIns,
          attendanceRate,
          joinedDays: daysSinceJoined
        },

        // 本周打卡日历
        weeklyCalendar,

        // 小组排行榜
        leaderboard: sortedLeaderboard,

        // 今日打卡动态
        recentCheckIns: recentActivity,

        // 小组统计
        groupStats: {
          todayCheckInCount: todayGroupCheckIns,
          totalMembers
        }
      }
    }
  } catch (error) {
    if (error.statusCode) throw error
    console.error('[Check-in GET] 获取打卡状态失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取打卡状态失败'
    })
  }
})
