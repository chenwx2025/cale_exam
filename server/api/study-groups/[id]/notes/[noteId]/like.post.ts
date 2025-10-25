import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const noteId = getRouterParam(event, 'noteId')

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  if (!noteId) {
    throw createError({
      statusCode: 400,
      message: '缺少笔记ID'
    })
  }

  try {
    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员可以点赞笔记'
      })
    }

    // 检查笔记是否存在
    const note = await prisma.studyNote.findUnique({
      where: { id: noteId }
    })

    if (!note || note.groupId !== groupId) {
      throw createError({
        statusCode: 404,
        message: '笔记不存在'
      })
    }

    // 检查是否已点赞
    const existingLike = await prisma.noteLike.findUnique({
      where: {
        noteId_userId: {
          noteId,
          userId: user.userId
        }
      }
    })

    if (existingLike) {
      // 取消点赞
      await prisma.$transaction([
        prisma.noteLike.delete({
          where: { id: existingLike.id }
        }),
        prisma.studyNote.update({
          where: { id: noteId },
          data: { likeCount: { decrement: 1 } }
        })
      ])

      return {
        success: true,
        message: '已取消点赞',
        data: { isLiked: false }
      }
    } else {
      // 点赞
      await prisma.$transaction([
        prisma.noteLike.create({
          data: {
            noteId,
            userId: user.userId
          }
        }),
        prisma.studyNote.update({
          where: { id: noteId },
          data: { likeCount: { increment: 1 } }
        })
      ])

      return {
        success: true,
        message: '点赞成功',
        data: { isLiked: true }
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('点赞操作失败:', error)
    throw createError({
      statusCode: 500,
      message: '点赞操作失败'
    })
  }
})
