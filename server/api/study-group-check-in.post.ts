// 扁平路由的打卡 API - 绕过嵌套动态路由问题
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  // 从 query 参数或 body 获取 groupId
  const query = getQuery(event)
  const body = await readBody(event).catch(() => ({}))
  const groupId = query.groupId || body.groupId

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
        groupId: String(groupId),
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能打卡'
      })
    }

    // 获取今天的日期
    const today = new Date().toISOString().split('T')[0]

    // 检查今天是否已打卡
    const existingCheckIn = await prisma.studyGroupCheckIn.findUnique({
      where: {
        groupId_userId_checkInDate: {
          groupId: String(groupId),
          userId: user.userId,
          checkInDate: today
        }
      }
    })

    if (existingCheckIn) {
      return {
        success: false,
        message: '今天已经打卡过了！'
      }
    }

    // 创建打卡记录
    const checkIn = await prisma.studyGroupCheckIn.create({
      data: {
        groupId: String(groupId),
        userId: user.userId,
        checkInDate: today
      }
    })

    // 格式化时间（避免 toLocaleTimeString 在 Node.js 中的问题）
    const hours = checkIn.createdAt.getHours().toString().padStart(2, '0')
    const minutes = checkIn.createdAt.getMinutes().toString().padStart(2, '0')
    const checkInTime = `${hours}:${minutes}`

    return {
      success: true,
      data: {
        checkIn: {
          id: checkIn.id,
          checkInDate: checkIn.checkInDate,
          checkInTime
        }
      },
      message: '打卡成功！'
    }
  } catch (error) {
    if (error.statusCode) throw error
    console.error('[FLAT CHECK-IN POST] 错误:', error)
    throw createError({
      statusCode: 500,
      message: '打卡失败'
    })
  }
})
