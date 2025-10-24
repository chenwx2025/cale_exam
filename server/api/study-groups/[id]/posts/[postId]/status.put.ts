import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const postId = getRouterParam(event, 'postId')
  const body = await readBody(event)

  const { status } = body

  if (!groupId || !postId || !status) {
    throw createError({
      statusCode: 400,
      message: '缺少参数'
    })
  }

  // 验证status值
  const validStatuses = ['pending', 'solved', 'closed']
  if (!validStatuses.includes(status)) {
    throw createError({
      statusCode: 400,
      message: '无效的状态值'
    })
  }

  try {
    // 获取帖子信息
    const post = await prisma.studyGroupPost.findFirst({
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

    // 权限检查：只有帖子作者、moderator、admin、owner可以修改状态
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能修改帖子状态'
      })
    }

    // 检查是否有权限修改
    const canModify = 
      post.userId === user.userId || // 是帖子作者
      ['owner', 'admin', 'moderator'].includes(membership.role) // 或是管理员

    if (!canModify) {
      throw createError({
        statusCode: 403,
        message: '只有帖子作者或管理员才能修改状态'
      })
    }

    // 更新帖子状态
    const updatedPost = await prisma.studyGroupPost.update({
      where: {
        id: postId
      },
      data: {
        status
      }
    })

    return {
      success: true,
      data: {
        id: updatedPost.id,
        status: updatedPost.status
      },
      message: '状态已更新'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('更新帖子状态失败:', error)
    throw createError({
      statusCode: 500,
      message: '更新帖子状态失败'
    })
  }
})
