import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const postId = getRouterParam(event, 'postId')
  const replyId = getRouterParam(event, 'replyId')

  if (!groupId || !postId || !replyId) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数'
    })
  }

  try {
    // 获取回复
    const reply = await prisma.studyGroupPostReply.findUnique({
      where: { id: replyId },
      include: {
        post: {
          include: {
            group: {
              include: {
                members: {
                  where: { userId: user.userId }
                }
              }
            }
          }
        }
      }
    })

    if (!reply) {
      throw createError({
        statusCode: 404,
        message: '回复不存在'
      })
    }

    if (reply.postId !== postId) {
      throw createError({
        statusCode: 400,
        message: '回复不属于该帖子'
      })
    }

    // 验证权限：只有回复作者或管理员可以删除
    const membership = reply.post.group.members[0]
    const isAuthor = reply.userId === user.userId
    const isAdmin = membership && ['owner', 'admin', 'moderator'].includes(membership.role)

    if (!isAuthor && !isAdmin) {
      throw createError({
        statusCode: 403,
        message: '只有回复作者或管理员可以删除回复'
      })
    }

    // 软删除回复
    await prisma.studyGroupPostReply.update({
      where: { id: replyId },
      data: {
        deletedAt: new Date()
      }
    })

    console.log(`[Delete Reply] 回复 ${replyId} 已软删除`)

    return {
      success: true,
      message: '回复已删除'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('删除回复失败:', error)
    throw createError({
      statusCode: 500,
      message: '删除回复失败'
    })
  }
})
