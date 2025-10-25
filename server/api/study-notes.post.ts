import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT NOTES POST] ========== 请求到达 ==========')

  const user = await requireAuth(event)
  console.log('[FLAT NOTES POST] 用户:', user.userId)

  const body = await readBody(event)
  const {
    groupId,
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
    status
  } = body

  console.log('[FLAT NOTES POST] groupId:', groupId, 'title:', title)

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  // 验证必填字段
  if (!title || !title.trim()) {
    throw createError({
      statusCode: 400,
      message: '笔记标题不能为空'
    })
  }

  if (!content || !content.trim()) {
    throw createError({
      statusCode: 400,
      message: '笔记内容不能为空'
    })
  }

  try {
    console.log('[FLAT NOTES POST] 开始验证用户权限')

    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      console.log('[FLAT NOTES POST] 用户不是小组成员')
      throw createError({
        statusCode: 403,
        message: '只有小组成员可以创建笔记'
      })
    }

    console.log('[FLAT NOTES POST] 用户是小组成员，开始创建笔记')

    // 处理关联知识点（转换为JSON字符串）
    const relatedKnowledgeStr = relatedKnowledge && Array.isArray(relatedKnowledge)
      ? JSON.stringify(relatedKnowledge)
      : null

    // 创建笔记
    const note = await prisma.studyNote.create({
      data: {
        groupId,
        authorId: user.userId,
        title: title.trim(),
        content: content.trim(),
        summary: summary?.trim() || null,
        coverImage: coverImage || null,
        category: category || null,
        relatedChapter: relatedChapter || null,
        relatedKnowledge: relatedKnowledgeStr,
        allowEdit: allowEdit === true,
        visibility: visibility || 'group',
        status: status || 'draft',
        publishedAt: status === 'published' ? new Date() : null,
        // 创建标签关联
        tags: tagIds && tagIds.length > 0 ? {
          create: tagIds.map((tagId: string) => ({
            tagId
          }))
        } : undefined,
        // 创建初始版本
        versions: {
          create: {
            version: 1,
            title: title.trim(),
            content: content.trim(),
            editorId: user.userId,
            changeLog: '初始创建'
          }
        }
      },
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

    console.log('[FLAT NOTES POST] 笔记创建成功:', note.id)
    console.log('[FLAT NOTES POST] 准备返回响应...')

    return {
      success: true,
      message: status === 'published' ? '笔记发布成功' : '笔记保存成功',
      data: note
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT NOTES POST] 创建笔记失败:', error)
    throw createError({
      statusCode: 500,
      message: '创建笔记失败'
    })
  }
})
