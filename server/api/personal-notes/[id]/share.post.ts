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

    // 解析请求体
    const body = await readBody(event)
    const { groupId, shareMessage } = body

    if (!groupId) {
      throw createError({
        statusCode: 400,
        message: '缺少小组ID'
      })
    }

    // 检查笔记是否存在且属于当前用户
    const personalNote = await prisma.personalNote.findFirst({
      where: {
        id: noteId,
        userId,
        deletedAt: null
      }
    })

    if (!personalNote) {
      throw createError({
        statusCode: 404,
        message: '笔记不存在或无权限分享'
      })
    }

    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId,
        isActive: true
      },
      include: {
        group: true
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '您不是该小组的成员，无法分享笔记'
      })
    }

    // 检查是否已经分享过
    const existingShare = await prisma.personalNoteShare.findUnique({
      where: {
        personalNoteId_groupId: {
          personalNoteId: noteId,
          groupId
        }
      }
    })

    if (existingShare) {
      throw createError({
        statusCode: 400,
        message: '该笔记已分享到此小组'
      })
    }

    // 创建小组笔记副本
    const studyNote = await prisma.studyNote.create({
      data: {
        groupId,
        authorId: userId,
        title: personalNote.title,
        content: personalNote.content,
        summary: personalNote.summary,
        coverImage: personalNote.coverImage,
        category: personalNote.category,
        relatedChapter: personalNote.relatedChapter,
        relatedKnowledge: personalNote.relatedKnowledge,
        status: 'published',
        visibility: 'group',
        publishedAt: new Date()
      }
    })

    // 创建分享记录
    const shareRecord = await prisma.personalNoteShare.create({
      data: {
        personalNoteId: noteId,
        groupId,
        studyNoteId: studyNote.id,
        sharedBy: userId,
        shareMessage
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            examType: true
          }
        }
      }
    })

    return {
      success: true,
      data: {
        shareRecord,
        studyNoteId: studyNote.id
      },
      message: `笔记已成功分享到「${membership.group.name}」`
    }
  } catch (error: any) {
    console.error('分享个人笔记失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '分享个人笔记失败'
    })
  }
})
