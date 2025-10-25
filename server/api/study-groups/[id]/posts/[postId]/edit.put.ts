import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const postId = getRouterParam(event, 'postId')

  if (!groupId || !postId) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数'
    })
  }

  try {
    const body = await readBody(event)
    const { title, content, type } = body

    if (!content || content.trim().length === 0) {
      throw createError({
        statusCode: 400,
        message: '内容不能为空'
      })
    }

    // 获取帖子并验证权限
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

    // 验证用户权限：只有帖子作者或管理员可以编辑
    const membership = post.group.members[0]
    const isAuthor = post.userId === user.userId
    const isAdmin = membership && ['owner', 'admin', 'moderator'].includes(membership.role)

    if (!isAuthor && !isAdmin) {
      throw createError({
        statusCode: 403,
        message: '只有帖子作者或管理员可以编辑帖子'
      })
    }

    // 更新帖子
    const updatedPost = await prisma.studyGroupPost.update({
      where: { id: postId },
      data: {
        title: title?.trim() || post.title,
        content: content.trim(),
        type: type || post.type,
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

    console.log(`[Edit Post] 帖子 ${postId} 已更新`)

    return {
      success: true,
      message: '帖子已更新',
      post: {
        id: updatedPost.id,
        groupId: updatedPost.groupId,
        userId: updatedPost.userId,
        title: updatedPost.title,
        content: updatedPost.content,
        type: updatedPost.type,
        status: updatedPost.status,
        isPinned: updatedPost.isPinned,
        isFeatured: updatedPost.isFeatured,
        viewCount: updatedPost.viewCount,
        likeCount: updatedPost.likeCount,
        replyCount: updatedPost.replyCount,
        createdAt: updatedPost.createdAt,
        updatedAt: updatedPost.updatedAt,
        author: updatedPost.user
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('编辑帖子失败:', error)
    throw createError({
      statusCode: 500,
      message: '编辑帖子失败'
    })
  }
})
