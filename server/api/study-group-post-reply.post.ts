import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT POST REPLY] ========== 请求到达 ==========')
  const user = await requireAuth(event)
  const body = await readBody(event)
  const { groupId, postId, content } = body

  if (!groupId || !postId || !content) {
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
        message: '您不是该小组成员，无法回复'
      })
    }

    // Check if post exists and belongs to group
    const post = await prisma.studyGroupPost.findUnique({
      where: { id: postId }
    })

    if (!post || post.groupId !== groupId) {
      throw createError({
        statusCode: 404,
        message: '帖子不存在'
      })
    }

    // Check if post is locked
    if (post.isLocked) {
      throw createError({
        statusCode: 403,
        message: '帖子已锁定，无法回复'
      })
    }

    // Create reply
    const reply = await prisma.studyGroupPostReply.create({
      data: {
        postId,
        userId: user.userId,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    // Map user to author for frontend compatibility
    const result = {
      ...reply,
      author: reply.user
    }

    console.log('[FLAT POST REPLY] 回复创建成功, replyId:', reply.id)
    return {
      success: true,
      data: result,
      message: '回复发表成功'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT POST REPLY] 回复创建失败:', error)
    throw createError({
      statusCode: 500,
      message: '回复发表失败'
    })
  }
})
