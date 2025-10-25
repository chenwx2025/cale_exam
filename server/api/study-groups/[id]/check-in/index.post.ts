import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[Check-in POST] ========== 开始处理打卡请求 ==========')

  const user = await requireAuth(event)
  console.log('[Check-in POST] 用户认证成功:', user.userId)

  const groupId = getRouterParam(event, 'id')
  console.log('[Check-in POST] 小组ID:', groupId)

  if (!groupId) {
    console.error('[Check-in POST] 错误: 缺少小组ID')
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  try {
    console.log('[Check-in POST] 开始检查小组成员身份...')
    // 检查是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })
    console.log('[Check-in POST] 小组成员查询结果:', membership ? '是成员' : '不是成员')

    if (!membership) {
      console.error('[Check-in POST] 错误: 用户不是小组成员')
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能打卡'
      })
    }

    // 获取今天的日期字符串 (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0]
    console.log('[Check-in POST] 今天日期:', today)

    // 检查今天是否已经打卡
    console.log('[Check-in POST] 检查是否已打卡...')
    const existingCheckIn = await prisma.studyGroupCheckIn.findUnique({
      where: {
        groupId_userId_checkInDate: {
          groupId,
          userId: user.userId,
          checkInDate: today
        }
      }
    })
    console.log('[Check-in POST] 已打卡查询结果:', existingCheckIn ? '已打卡' : '未打卡')

    if (existingCheckIn) {
      console.log('[Check-in POST] 返回: 今天已经打卡过了')
      return {
        success: false,
        message: '今天已经打卡过了！'
      }
    }

    // 创建打卡记录（一键打卡，无需任何参数）
    console.log('[Check-in POST] 开始创建打卡记录...')
    const checkIn = await prisma.studyGroupCheckIn.create({
      data: {
        groupId,
        userId: user.userId,
        checkInDate: today
      }
    })
    console.log('[Check-in POST] 打卡记录创建成功:', checkIn.id)

    console.log('[Check-in POST] 打卡成功:', {
      userId: user.userId,
      groupId,
      date: today,
      time: checkIn.createdAt
    })

    return {
      success: true,
      data: {
        checkIn: {
          id: checkIn.id,
          checkInDate: checkIn.checkInDate,
          checkInTime: checkIn.createdAt.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      },
      message: '打卡成功！'
    }
  } catch (error) {
    if (error.statusCode) throw error
    console.error('打卡失败:', error)
    throw createError({
      statusCode: 500,
      message: '打卡失败'
    })
  }
})
