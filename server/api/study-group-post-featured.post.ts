import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
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
    // 检查用户是否是管理员或版主
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership || !['owner', 'admin', 'moderator'].includes(membership.role)) {
      throw createError({
        statusCode: 403,
        message: '只有管理员和版主可以设置精华帖'
      })
    }

    // 获取当前帖子状态
    const post = await prisma.studyGroupPost.findUnique({
      where: {
        id: postId,
        groupId
      }
    })

    if (!post) {
      throw createError({
        statusCode: 404,
        message: '帖子不存在'
      })
    }

    // 切换精华状态
    const updatedPost = await prisma.studyGroupPost.update({
      where: { id: postId },
      data: { isFeatured: !post.isFeatured }
    })

    return {
      success: true,
      action: updatedPost.isFeatured ? 'featured' : 'unfeatured',
      message: updatedPost.isFeatured ? '已设为精华帖' : '已取消精华帖',
      isFeatured: updatedPost.isFeatured
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[Set Featured] 操作失败:', error)
    throw createError({
      statusCode: 500,
      message: '精华帖操作失败'
    })
  }
})
