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
        message: '您不是该小组成员，无法收藏资料'
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

    // 检查是否已收藏
    const existingFavorite = await prisma.resourceFavorite.findFirst({
      where: {
        resourceId,
        userId
      }
    })

    let isFavorited = false

    if (existingFavorite) {
      // 取消收藏
      await prisma.resourceFavorite.delete({
        where: { id: existingFavorite.id }
      })
      isFavorited = false
    } else {
      // 添加收藏
      await prisma.resourceFavorite.create({
        data: {
          resourceId,
          userId
        }
      })
      isFavorited = true
    }

    // 获取最新的收藏数
    const favoriteCount = await prisma.resourceFavorite.count({
      where: { resourceId }
    })

    return {
      success: true,
      data: {
        isFavorited,
        favoriteCount
      },
      message: isFavorited ? '收藏成功' : '已取消收藏'
    }
  } catch (error: any) {
    console.error('收藏操作失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '收藏操作失败'
    })
  }
})
