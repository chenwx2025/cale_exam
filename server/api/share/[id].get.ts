/**
 * 获取分享内容 API
 * 通过分享ID获取分享的内容
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 获取分享ID
    const shareId = getRouterParam(event, 'id')

    if (!shareId) {
      throw createError({
        statusCode: 400,
        message: 'Missing share ID'
      })
    }

    // 查询分享记录
    const share = await prisma.share.findUnique({
      where: { id: shareId }
    })

    // 验证分享存在
    if (!share) {
      throw createError({
        statusCode: 404,
        message: 'Share not found'
      })
    }

    // 验证分享是否公开
    if (!share.isPublic) {
      throw createError({
        statusCode: 403,
        message: 'This share is not public'
      })
    }

    // 检查是否过期
    if (share.expiresAt && new Date() > share.expiresAt) {
      throw createError({
        statusCode: 410,
        message: 'This share has expired'
      })
    }

    // 增加浏览次数
    await prisma.share.update({
      where: { id: shareId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })

    console.log(`[ShareGet] Share ${shareId} viewed (count: ${share.viewCount + 1})`)

    // 返回分享内容
    return {
      success: true,
      share: {
        id: share.id,
        type: share.shareType,
        title: share.title,
        description: share.description,
        content: JSON.parse(share.content),
        viewCount: share.viewCount + 1,
        likeCount: share.likeCount,
        createdAt: share.createdAt
      }
    }
  } catch (error: any) {
    console.error('[ShareGet] Error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to get share'
    })
  }
})
