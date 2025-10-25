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
      status = 'draft'
    } = body

    // 验证必填字段
    if (!title || !content) {
      throw createError({
        statusCode: 400,
        message: '标题和内容不能为空'
      })
    }

    // 创建个人笔记
    const note = await prisma.personalNote.create({
      data: {
        userId,
        title,
        content,
        summary,
        coverImage,
        category,
        tags: tags ? JSON.stringify(tags) : null,
        examType,
        relatedChapter,
        relatedKnowledge: relatedKnowledge ? JSON.stringify(relatedKnowledge) : null,
        status,
        publishedAt: status === 'published' ? new Date() : null
      }
    })

    return {
      success: true,
      data: note,
      message: status === 'published' ? '笔记发布成功' : '笔记保存成功'
    }
  } catch (error: any) {
    console.error('创建个人笔记失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '创建个人笔记失败'
    })
  }
})
