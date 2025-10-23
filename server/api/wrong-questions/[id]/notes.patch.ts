import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const wrongQuestionId = getRouterParam(event, 'id')

  if (!wrongQuestionId) {
    throw createError({
      statusCode: 400,
      message: '缺少错题ID'
    })
  }

  try {
    const body = await readBody(event)
    const { notes } = body

    if (notes === undefined) {
      throw createError({
        statusCode: 400,
        message: '缺少笔记内容'
      })
    }

    // 验证错题记录归属
    const wrongQuestion = await prisma.wrongQuestion.findUnique({
      where: { id: wrongQuestionId }
    })

    if (!wrongQuestion) {
      throw createError({
        statusCode: 404,
        message: '错题记录不存在'
      })
    }

    if (wrongQuestion.userId !== userId) {
      throw createError({
        statusCode: 403,
        message: '无权限修改此错题笔记'
      })
    }

    // 更新笔记
    const updated = await prisma.wrongQuestion.update({
      where: { id: wrongQuestionId },
      data: { notes: notes.trim() || null }
    })

    return {
      success: true,
      message: '笔记保存成功',
      notes: updated.notes
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('保存错题笔记失败:', error)
    throw createError({
      statusCode: 500,
      message: '保存笔记失败，请重试'
    })
  }
})
