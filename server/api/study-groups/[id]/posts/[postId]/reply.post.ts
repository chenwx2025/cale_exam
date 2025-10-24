import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const postId = getRouterParam(event, 'postId')
  const body = await readBody(event)

  if (!body.content || !body.content.trim()) {
    throw createError({
      statusCode: 400,
      message: '回复内容不能为空'
    })
  }

  try {
    console.log('[CREATE Reply] 开始创建回复, postId:', postId, 'userId:', user.userId)

    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      console.log('[CREATE Reply] 用户不是小组成员')
      throw createError({
        statusCode: 403,
        message: '只有小组成员可以回复'
      })
    }

    // 检查帖子是否存在
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

    // 创建回复并更新帖子的回复计数
    const reply = await prisma.$transaction(async (tx) => {
      const newReply = await tx.studyGroupPostReply.create({
        data: {
          postId,
          userId: user.userId,
          content: body.content.trim()
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

      // 更新帖子的回复计数
      await tx.studyGroupPost.update({
        where: { id: postId },
        data: { replyCount: { increment: 1 } }
      })

      return newReply
    })

    console.log('[CREATE Reply] 回复创建成功, replyId:', reply.id)

    return {
      success: true,
      data: {
        id: reply.id,
        postId: reply.postId,
        userId: reply.userId,
        content: reply.content,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        author: reply.user
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[CREATE Reply] 创建回复失败:', error)
    throw createError({
      statusCode: 500,
      message: '创建回复失败'
    })
  }
})
