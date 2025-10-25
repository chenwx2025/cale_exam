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
    // 检查用户是否有管理权限
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '您不是小组成员'
      })
    }

    // 只有owner/admin/moderator可以置顶
    const canManage = ['owner', 'admin', 'moderator'].includes(membership.role)
    if (!canManage) {
      throw createError({
        statusCode: 403,
        message: '只有管理员才能置顶帖子'
      })
    }

    // 获取帖子
    const post = await prisma.studyGroupPost.findUnique({
      where: { id: postId }
    })

    if (!post) {
      throw createError({
        statusCode: 404,
        message: '帖子不存在'
      })
    }

    if (post.groupId !== groupId) {
      throw createError({
        statusCode: 400,
        message: '帖子不属于该小组'
      })
    }

    // 切换置顶状态
    const newPinStatus = !post.isPinned

    await prisma.studyGroupPost.update({
      where: { id: postId },
      data: { isPinned: newPinStatus }
    })

    console.log(`[FLAT Pin Post] 帖子 ${postId} 置顶状态: ${post.isPinned} -> ${newPinStatus}`)

    return {
      success: true,
      action: newPinStatus ? 'pin' : 'unpin',
      isPinned: newPinStatus,
      message: newPinStatus ? '帖子已置顶' : '已取消置顶'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT Pin Post] 切换置顶状态失败:', error)
    throw createError({
      statusCode: 500,
      message: '操作失败'
    })
  }
})
