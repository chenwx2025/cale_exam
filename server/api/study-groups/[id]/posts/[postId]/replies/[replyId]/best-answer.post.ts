import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
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
    console.log('[Best Answer] 设置最佳答案, postId:', postId, 'replyId:', replyId, 'userId:', user.userId)

    // 1. 获取帖子信息
    const post = await prisma.studyGroupPost.findUnique({
      where: {
        id: postId,
        groupId
      },
      include: {
        group: {
          include: {
            members: {
              where: {
                userId: user.userId
              }
            }
          }
        }
      }
    })

    if (!post) {
      throw createError({
        statusCode: 404,
        message: '帖子不存在'
      })
    }

    // 2. 验证权限：只有帖子作者或管理员可以设置最佳答案
    const membership = post.group.members[0]
    const isPostAuthor = post.userId === user.userId
    const isAdmin = membership && ['owner', 'admin', 'moderator'].includes(membership.role)

    if (!isPostAuthor && !isAdmin) {
      throw createError({
        statusCode: 403,
        message: '只有帖子作者或管理员可以设置最佳答案'
      })
    }

    // 3. 验证帖子类型：只有问题类型的帖子可以设置最佳答案
    if (post.type !== 'question') {
      throw createError({
        statusCode: 400,
        message: '只有问题类型的帖子可以设置最佳答案'
      })
    }

    // 4. 验证回复是否存在
    const reply = await prisma.studyGroupPostReply.findUnique({
      where: {
        id: replyId,
        postId
      }
    })

    if (!reply) {
      throw createError({
        statusCode: 404,
        message: '回复不存在'
      })
    }

    // 5. 如果该回复已经是最佳答案，则取消最佳答案
    if (reply.isBestAnswer) {
      console.log('[Best Answer] 取消最佳答案')

      // 取消最佳答案
      await prisma.studyGroupPostReply.update({
        where: { id: replyId },
        data: { isBestAnswer: false }
      })

      // 更新帖子状态为 pending
      await prisma.studyGroupPost.update({
        where: { id: postId },
        data: { status: 'pending' }
      })

      return {
        success: true,
        action: 'unset',
        message: '已取消最佳答案',
        isBestAnswer: false
      }
    } else {
      console.log('[Best Answer] 设置最佳答案')

      // 6. 取消该帖子的其他最佳答案（一个问题只能有一个最佳答案）
      await prisma.studyGroupPostReply.updateMany({
        where: {
          postId,
          isBestAnswer: true
        },
        data: {
          isBestAnswer: false
        }
      })

      // 7. 设置新的最佳答案
      await prisma.studyGroupPostReply.update({
        where: { id: replyId },
        data: { isBestAnswer: true }
      })

      // 8. 更新帖子状态为 solved
      await prisma.studyGroupPost.update({
        where: { id: postId },
        data: { status: 'solved' }
      })

      return {
        success: true,
        action: 'set',
        message: '已设为最佳答案',
        isBestAnswer: true
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[Best Answer] 设置失败:', error)
    throw createError({
      statusCode: 500,
      message: '设置最佳答案失败'
    })
  }
})
