import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT POST LIKE] ========== 请求到达 ==========')
  const user = await requireAuth(event)
  const body = await readBody(event)
  const { groupId, postId } = body

  console.log('[FLAT POST LIKE] 参数:', { groupId, postId, userId: user.userId })

  if (!groupId || !postId) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数'
    })
  }

  try {
    // Check membership
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
        message: '您不是该小组成员'
      })
    }

    // Check if already liked
    const existingLike = await prisma.studyGroupPostLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.userId
        }
      }
    })

    let isLiked = false
    if (existingLike) {
      // Unlike
      await prisma.studyGroupPostLike.delete({
        where: { id: existingLike.id }
      })
      isLiked = false
    } else {
      // Like
      await prisma.studyGroupPostLike.create({
        data: {
          postId,
          userId: user.userId
        }
      })
      isLiked = true
    }

    // Get updated like count
    const likeCount = await prisma.studyGroupPostLike.count({
      where: { postId }
    })

    console.log('[FLAT POST LIKE] 点赞操作成功, isLiked:', isLiked)
    return {
      success: true,
      data: {
        isLiked,
        likeCount
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT POST LIKE] 点赞操作失败:', error)
    throw createError({
      statusCode: 500,
      message: '点赞操作失败'
    })
  }
})
