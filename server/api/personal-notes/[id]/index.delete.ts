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
        message: '笔记不存在或无权限删除'
      })
    }

    // 软删除笔记
    await prisma.personalNote.update({
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
    console.error('删除个人笔记失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '删除个人笔记失败'
    })
  }
})
