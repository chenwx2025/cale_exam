import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const postId = getRouterParam(event, 'postId')
  const body = await readBody(event)

  const { content } = body

  if (!groupId || !postId) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数'
    })
  }

  if (!content || !content.trim()) {
    throw createError({
      statusCode: 400,
      message: '回复内容不能为空'
    })
  }

  try {
    // 检查是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能回复'
      })
    }

    // 检查帖子是否存在且属于该小组
    const post = await prisma.studyGroupPost.findUnique({
      where: { id: postId }
    })

    if (!post || post.groupId !== groupId) {
      throw createError({
        statusCode: 404,
        message: '帖子不存在'
      })
    }

    // 创建回复并更新帖子的回复计数
    const [reply] = await prisma.$transaction([
      prisma.studyGroupPostReply.create({
        data: {
          postId,
          userId: user.userId,
          content: content.trim()
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
      }),
      prisma.studyGroupPost.update({
        where: { id: postId },
        data: {
          replyCount: {
            increment: 1
          }
        }
      })
    ])

    return {
      success: true,
      data: reply,
      message: '回复发布成功'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('发布回复失败:', error)
    throw createError({
      statusCode: 500,
      message: '发布回复失败'
    })
  }
})
