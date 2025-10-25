import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const postId = getRouterParam(event)

  if (!groupId || !postId) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数'
    })
  }

  try {
    // 获取帖子
    const post = await prisma.studyGroupPost.findUnique({
      where: { id: postId },
      include: {
        group: {
          include: {
            members: {
              where: { userId: user.userId }
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

    if (post.groupId !== groupId) {
      throw createError({
        statusCode: 400,
        message: '帖子不属于该小组'
      })
    }

    // 验证权限：只有帖子作者或管理员可以删除
    const membership = post.group.members[0]
    const isAuthor = post.userId === user.userId
    const isAdmin = membership && ['owner', 'admin', 'moderator'].includes(membership.role)

    if (!isAuthor && !isAdmin) {
      throw createError({
        statusCode: 403,
        message: '只有帖子作者或管理员可以删除帖子'
      })
    }

    // 软删除帖子
    await prisma.studyGroupPost.update({
      where: { id: postId },
      data: {
        deletedAt: new Date()
      }
    })

    console.log(`[Delete Post] 帖子 ${postId} 已软删除`)

    return {
      success: true,
      message: '帖子已删除'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('删除帖子失败:', error)
    throw createError({
      statusCode: 500,
      message: '删除帖子失败'
    })
  }
})
