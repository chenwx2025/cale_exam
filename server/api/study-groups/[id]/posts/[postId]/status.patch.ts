import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const postId = getRouterParam(event, 'postId')
  const body = await readBody(event)

  const { status } = body

  if (!groupId || !postId) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数'
    })
  }

  if (!status || !['pending', 'solved', 'closed'].includes(status)) {
    throw createError({
      statusCode: 400,
      message: '无效的状态值'
    })
  }

  try {
    // 检查帖子是否存在
    const post = await prisma.studyGroupPost.findUnique({
      where: { id: postId }
    })

    if (!post || post.groupId !== groupId) {
      throw createError({
        statusCode: 404,
        message: '帖子不存在'
      })
    }

    // 只有问题类型的帖子才有状态
    if (post.type !== 'question') {
      throw createError({
        statusCode: 400,
        message: '只有问题类型的帖子才能更新状态'
      })
    }

    // 只有帖子作者才能更新状态
    if (post.userId !== user.userId) {
      throw createError({
        statusCode: 403,
        message: '只有问题发布者才能更新状态'
      })
    }

    // 更新状态
    const updatedPost = await prisma.studyGroupPost.update({
      where: { id: postId },
      data: { status }
    })

    return {
      success: true,
      data: updatedPost,
      message: '状态更新成功'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('更新状态失败:', error)
    throw createError({
      statusCode: 500,
      message: '更新状态失败'
    })
  }
})
