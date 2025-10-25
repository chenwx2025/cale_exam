import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
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
    // 获取笔记信息
    const note = await prisma.studyNote.findUnique({
      where: { id: noteId }
    })

    if (!note) {
      throw createError({
        statusCode: 404,
        message: '笔记不存在'
      })
    }

    if (note.groupId !== groupId) {
      throw createError({
        statusCode: 403,
        message: '无权删除该笔记'
      })
    }

    // 检查权限：只有作者或小组管理员可以删除
    const isAuthor = note.authorId === user.userId

    if (!isAuthor) {
      // 检查是否是小组管理员
      const membership = await prisma.studyGroupMember.findFirst({
        where: {
          groupId,
          userId: user.userId
        }
      })

      const isAdmin = membership && (membership.role === 'owner' || membership.role === 'admin')

      if (!isAdmin) {
        throw createError({
          statusCode: 403,
          message: '只有笔记作者或小组管理员可以删除笔记'
        })
      }
    }

    // 软删除（设置deletedAt）
    await prisma.studyNote.update({
      where: { id: noteId },
      data: {
        deletedAt: new Date()
      }
    })

    return {
      success: true,
      message: '笔记删除成功'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('删除笔记失败:', error)
    throw createError({
      statusCode: 500,
      message: '删除笔记失败'
    })
  }
})
