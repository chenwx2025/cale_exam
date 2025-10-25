import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT RESOURCE FAVORITE] ========== 请求到达 ==========')
  const user = await requireAuth(event)
  const body = await readBody(event)
  const { groupId, resourceId } = body

  console.log('[FLAT RESOURCE FAVORITE] 参数:', { groupId, resourceId, userId: user.userId })

  if (!groupId || !resourceId) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数'
    })
  }

  try {
    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId,
        isActive: true
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
        userId: user.userId
      }
    })

    let isFavorited = false

    if (existingFavorite) {
      // 取消收藏
      await prisma.resourceFavorite.delete({
        where: { id: existingFavorite.id }
      })
      isFavorited = false
      console.log('[FLAT RESOURCE FAVORITE] 取消收藏成功')
    } else {
      // 添加收藏
      await prisma.resourceFavorite.create({
        data: {
          resourceId,
          userId: user.userId
        }
      })
      isFavorited = true
      console.log('[FLAT RESOURCE FAVORITE] 收藏成功')
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
    if (error.statusCode) throw error
    console.error('[FLAT RESOURCE FAVORITE] 收藏操作失败:', error)
    throw createError({
      statusCode: 500,
      message: '收藏操作失败'
    })
  }
})
