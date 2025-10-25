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
    const body = await readBody(event)
    const {
      title,
      content,
      summary,
      coverImage,
      category,
      tagIds,
      relatedChapter,
      relatedKnowledge,
      allowEdit,
      visibility,
      status,
      changeLog
    } = body

    // 获取笔记信息
    const note = await prisma.studyNote.findUnique({
      where: { id: noteId },
      include: {
        contributors: true,
        versions: {
          orderBy: { version: 'desc' },
          take: 1
        }
      }
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
        message: '无权编辑该笔记'
      })
    }

    // 检查编辑权限
    const isAuthor = note.authorId === user.userId
    const isContributor = note.contributors.some(c => c.userId === user.userId)
    const canEdit = isAuthor || (note.allowEdit && isContributor)

    if (!canEdit) {
      throw createError({
        statusCode: 403,
        message: '无权编辑该笔记'
      })
    }

    // 处理关联知识点
    const relatedKnowledgeStr = relatedKnowledge && Array.isArray(relatedKnowledge)
      ? JSON.stringify(relatedKnowledge)
      : note.relatedKnowledge

    // 准备更新数据
    const updateData: any = {}

    if (title !== undefined) updateData.title = title.trim()
    if (content !== undefined) updateData.content = content.trim()
    if (summary !== undefined) updateData.summary = summary?.trim() || null
    if (coverImage !== undefined) updateData.coverImage = coverImage || null
    if (category !== undefined) updateData.category = category || null
    if (relatedChapter !== undefined) updateData.relatedChapter = relatedChapter || null
    if (relatedKnowledgeStr !== undefined) updateData.relatedKnowledge = relatedKnowledgeStr
    if (allowEdit !== undefined) updateData.allowEdit = allowEdit === true
    if (visibility !== undefined) updateData.visibility = visibility

    // 状态变更
    if (status !== undefined && status !== note.status) {
      updateData.status = status
      if (status === 'published' && !note.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    // 更新标签
    if (tagIds !== undefined) {
      // 删除旧标签
      await prisma.noteTag.deleteMany({
        where: { noteId }
      })

      // 添加新标签
      if (tagIds.length > 0) {
        updateData.tags = {
          create: tagIds.map((tagId: string) => ({ tagId }))
        }
      }
    }

    // 创建新版本
    const latestVersion = note.versions[0]
    const newVersionNumber = latestVersion ? latestVersion.version + 1 : 1

    updateData.versions = {
      create: {
        version: newVersionNumber,
        title: title?.trim() || note.title,
        content: content?.trim() || note.content,
        editorId: user.userId,
        changeLog: changeLog || (isAuthor ? '编辑笔记' : '协作编辑')
      }
    }

    // 更新贡献者信息
    if (!isAuthor) {
      const contributor = note.contributors.find(c => c.userId === user.userId)
      if (contributor) {
        await prisma.noteContributor.update({
          where: { id: contributor.id },
          data: { editCount: { increment: 1 } }
        })
      }
    }

    // 更新笔记
    const updatedNote = await prisma.studyNote.update({
      where: { id: noteId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            nickname: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return {
      success: true,
      message: '笔记更新成功',
      data: updatedNote
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('更新笔记失败:', error)
    throw createError({
      statusCode: 500,
      message: '更新笔记失败'
    })
  }
})
