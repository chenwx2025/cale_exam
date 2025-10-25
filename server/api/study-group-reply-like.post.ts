import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT REPLY LIKE] ========== 请求到达 ==========')
  const user = await requireAuth(event)
  const body = await readBody(event)
  const { groupId, postId, replyId } = body

  if (!groupId || !postId || !replyId) {
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
    const existingLike = await prisma.studyGroupReplyLike.findUnique({
      where: {
        replyId_userId: {
          replyId,
          userId: user.userId
        }
      }
    })

    let isLiked = false
    if (existingLike) {
      await prisma.studyGroupReplyLike.delete({
        where: { id: existingLike.id }
      })
      isLiked = false
    } else {
      await prisma.studyGroupReplyLike.create({
        data: {
          replyId,
          userId: user.userId
        }
      })
      isLiked = true
    }

    // Get updated like count
    const likeCount = await prisma.studyGroupReplyLike.count({
      where: { replyId }
    })

    console.log('[FLAT REPLY LIKE] 回复点赞操作成功, isLiked:', isLiked)
    return {
      success: true,
      data: {
        isLiked,
        likeCount
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT REPLY LIKE] 回复点赞操作失败:', error)
    throw createError({
      statusCode: 500,
      message: '回复点赞操作失败'
    })
  }
})
