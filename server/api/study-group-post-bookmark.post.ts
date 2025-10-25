import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT POST BOOKMARK] ========== 请求到达 ==========')
  const user = await requireAuth(event)
  const body = await readBody(event)
  const { groupId, postId } = body

  if (!groupId || !postId) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数'
    })
  }

  try {
    // Check if already bookmarked
    const existingBookmark = await prisma.studyGroupPostBookmark.findFirst({
      where: {
        postId,
        userId: user.userId
      }
    })

    let isBookmarked = false
    if (existingBookmark) {
      await prisma.studyGroupPostBookmark.delete({
        where: { id: existingBookmark.id }
      })
      isBookmarked = false
    } else {
      await prisma.studyGroupPostBookmark.create({
        data: {
          postId,
          userId: user.userId
        }
      })
      isBookmarked = true
    }

    console.log('[FLAT POST BOOKMARK] 收藏操作成功, isBookmarked:', isBookmarked)
    return {
      success: true,
      data: { isBookmarked }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT POST BOOKMARK] 收藏操作失败:', error)
    throw createError({
      statusCode: 500,
      message: '收藏操作失败'
    })
  }
})
