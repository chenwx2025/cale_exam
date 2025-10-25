import { PrismaClient } from '@prisma/client'
import { verifyAccessToken } from '~/server/utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: '未授权访问'
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)
    if (!decoded || !decoded.userId) {
      throw createError({
        statusCode: 401,
        message: '无效的访问令牌'
      })
    }

    const userId = decoded.userId
    const groupId = event.context.params?.groupId
    const resourceId = event.context.params?.id

    if (!groupId || !resourceId) {
      throw createError({
        statusCode: 400,
        message: '缺少必要参数'
      })
    }

    // 解析请求体
    const body = await readBody(event)
    const { rating, review } = body

    // 验证评分
    if (!rating || rating < 1 || rating > 5) {
      throw createError({
        statusCode: 400,
        message: '评分必须在1-5之间'
      })
    }

    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId,
        status: 'active'
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '您不是该小组成员，无法评分'
      })
    }

    // 检查资料是否存在
    const resource = await prisma.studyResource.findUnique({
      where: { id: resourceId }
    })

    if (!resource || resource.groupId !== groupId || resource.deletedAt) {
      throw createError({
        statusCode: 404,
        message: '资料不存在'
      })
    }

    // 检查是否已经评分过
    const existingRating = await prisma.resourceRating.findFirst({
      where: {
        resourceId,
        userId
      }
    })

    let savedRating

    if (existingRating) {
      // 更新评分
      savedRating = await prisma.resourceRating.update({
        where: { id: existingRating.id },
        data: {
          rating,
          review
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      })
    } else {
      // 创建新评分
      savedRating = await prisma.resourceRating.create({
        data: {
          resourceId,
          userId,
          rating,
          review
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      })
    }

    // 重新计算平均评分
    const allRatings = await prisma.resourceRating.findMany({
      where: { resourceId },
      select: { rating: true }
    })

    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
      : null

    // 更新资料的平均评分
    await prisma.studyResource.update({
      where: { id: resourceId },
      data: { averageRating }
    })

    return {
      success: true,
      data: {
        rating: savedRating,
        averageRating,
        ratingCount: allRatings.length
      },
      message: existingRating ? '评分已更新' : '评分成功'
    }
  } catch (error: any) {
    console.error('评分失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '评分失败'
    })
  }
})
