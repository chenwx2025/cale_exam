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

    // 检查笔记是否存在且属于当前用户
    const existingNote = await prisma.personalNote.findFirst({
      where: {
        id: noteId,
        userId,
        deletedAt: null
      }
    })

    if (!existingNote) {
      throw createError({
        statusCode: 404,
        message: '笔记不存在或无权限修改'
      })
    }

    // 解析请求体
    const body = await readBody(event)
    const {
      title,
      content,
      summary,
      coverImage,
      category,
      tags,
      examType,
      relatedChapter,
      relatedKnowledge,
      status,
      isFavorite,
      isPinned
    } = body

    // 构建更新数据
    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (summary !== undefined) updateData.summary = summary
    if (coverImage !== undefined) updateData.coverImage = coverImage
    if (category !== undefined) updateData.category = category
    if (tags !== undefined) updateData.tags = JSON.stringify(tags)
    if (examType !== undefined) updateData.examType = examType
    if (relatedChapter !== undefined) updateData.relatedChapter = relatedChapter
    if (relatedKnowledge !== undefined) updateData.relatedKnowledge = JSON.stringify(relatedKnowledge)
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite
    if (isPinned !== undefined) updateData.isPinned = isPinned

    // 状态变更处理
    if (status !== undefined) {
      updateData.status = status
      // 如果从非发布状态变为发布状态，设置发布时间
      if (status === 'published' && existingNote.status !== 'published') {
        updateData.publishedAt = new Date()
      }
    }

    // 更新笔记
    const note = await prisma.personalNote.update({
      where: { id: noteId },
      data: updateData
    })

    return {
      success: true,
      data: note,
      message: '笔记更新成功'
    }
  } catch (error: any) {
    console.error('更新个人笔记失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '更新个人笔记失败'
    })
  }
})
