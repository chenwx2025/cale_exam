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
    const body = await readBody(event)
    const { content } = body

    if (!content || content.trim().length === 0) {
      throw createError({
        statusCode: 400,
        message: '回复内容不能为空'
      })
    }

    // 获取回复并验证权限
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

    // 验证用户权限：只有回复作者或管理员可以编辑
    const membership = reply.post.group.members[0]
    const isAuthor = reply.userId === user.userId
    const isAdmin = membership && ['owner', 'admin', 'moderator'].includes(membership.role)

    if (!isAuthor && !isAdmin) {
      throw createError({
        statusCode: 403,
        message: '只有回复作者或管理员可以编辑回复'
      })
    }

    // 更新回复
    const updatedReply = await prisma.studyGroupPostReply.update({
      where: { id: replyId },
      data: {
        content: content.trim(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            nickname: true
          }
        }
      }
    })

    console.log(`[Edit Reply] 回复 ${replyId} 已更新`)

    return {
      success: true,
      message: '回复已更新',
      reply: {
        id: updatedReply.id,
        postId: updatedReply.postId,
        userId: updatedReply.userId,
        content: updatedReply.content,
        isBestAnswer: updatedReply.isBestAnswer,
        createdAt: updatedReply.createdAt,
        updatedAt: updatedReply.updatedAt,
        author: updatedReply.user
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('编辑回复失败:', error)
    throw createError({
      statusCode: 500,
      message: '编辑回复失败'
    })
  }
})
