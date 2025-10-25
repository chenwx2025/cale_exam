import { PrismaClient } from '@prisma/client'
import { verifyAccessToken } from '~/server/utils/jwt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: '未授权访问'
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)
    if (!decoded || !decoded.userId) {
      throw createError({
        statusCode: 401,
        message: '无效的访问令牌'
      })
    }

    const userId = decoded.userId
    const noteId = getRouterParam(event, 'id')

    if (!noteId) {
      throw createError({
        statusCode: 400,
        message: '缺少笔记ID'
      })
    }

    // 查询笔记
    const note = await prisma.personalNote.findFirst({
      where: {
        id: noteId,
        userId,
        deletedAt: null
      },
      include: {
        sharedToGroups: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                examType: true,
                avatarUrl: true
              }
            },
            studyNote: {
              select: {
                id: true,
                viewCount: true,
                likeCount: true,
                favoriteCount: true,
                commentCount: true
              }
            }
          }
        }
      }
    })

    if (!note) {
      throw createError({
        statusCode: 404,
        message: '笔记不存在或已被删除'
      })
    }

    // 处理返回数据
    const noteWithMeta = {
      ...note,
      tags: note.tags ? JSON.parse(note.tags) : [],
      relatedKnowledge: note.relatedKnowledge ? JSON.parse(note.relatedKnowledge) : [],
      sharedGroups: note.sharedToGroups.map(share => ({
        ...share.group,
        sharedAt: share.createdAt,
        shareMessage: share.shareMessage,
        studyNoteStats: share.studyNote
      }))
    }

    return {
      success: true,
      data: noteWithMeta
    }
  } catch (error: any) {
    console.error('获取个人笔记详情失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '获取个人笔记详情失败'
    })
  }
})
