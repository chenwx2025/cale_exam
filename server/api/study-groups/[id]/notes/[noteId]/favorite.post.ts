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
        message: '只有小组成员可以收藏笔记'
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

    // 检查是否已收藏
    const existingFavorite = await prisma.noteFavorite.findUnique({
      where: {
        noteId_userId: {
          noteId,
          userId: user.userId
        }
      }
    })

    if (existingFavorite) {
      // 取消收藏
      await prisma.$transaction([
        prisma.noteFavorite.delete({
          where: { id: existingFavorite.id }
        }),
        prisma.studyNote.update({
          where: { id: noteId },
          data: { favoriteCount: { decrement: 1 } }
        })
      ])

      return {
        success: true,
        message: '已取消收藏',
        data: { isFavorited: false }
      }
    } else {
      // 收藏
      await prisma.$transaction([
        prisma.noteFavorite.create({
          data: {
            noteId,
            userId: user.userId
          }
        }),
        prisma.studyNote.update({
          where: { id: noteId },
          data: { favoriteCount: { increment: 1 } }
        })
      ])

      return {
        success: true,
        message: '收藏成功',
        data: { isFavorited: true }
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('收藏操作失败:', error)
    throw createError({
      statusCode: 500,
      message: '收藏操作失败'
    })
  }
})
