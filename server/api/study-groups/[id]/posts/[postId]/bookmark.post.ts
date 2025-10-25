import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const postId = getRouterParam(event, 'postId')

  if (!groupId || !postId) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数'
    })
  }

  try {
    console.log('[Bookmark Post] 切换收藏, postId:', postId, 'userId:', user.userId)

    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员可以收藏帖子'
      })
    }

    // 检查是否已收藏
    const existing = await prisma.studyGroupPostBookmark.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.userId
        }
      }
    })

    if (existing) {
      console.log('[Bookmark Post] 取消收藏')
      // 取消收藏
      await prisma.studyGroupPostBookmark.delete({
        where: { id: existing.id }
      })

      return {
        success: true,
        action: 'unbookmarked',
        message: '已取消收藏',
        isBookmarked: false
      }
    } else {
      console.log('[Bookmark Post] 添加收藏')
      // 添加收藏
      await prisma.studyGroupPostBookmark.create({
        data: {
          postId,
          userId: user.userId
        }
      })

      return {
        success: true,
        action: 'bookmarked',
        message: '收藏成功',
        isBookmarked: true
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[Bookmark Post] 操作失败:', error)
    throw createError({
      statusCode: 500,
      message: '收藏操作失败'
    })
  }
})
