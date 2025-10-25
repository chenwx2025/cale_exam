import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const postId = getRouterParam(event, 'postId')

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  if (!postId) {
    throw createError({
      statusCode: 400,
      message: '缺少帖子ID'
    })
  }

  try {
    const body = await readBody(event)
    const { question, options, allowMultiple, allowAddOption, endAt } = body

    // 验证必填字段
    if (!question || !question.trim()) {
      throw createError({
        statusCode: 400,
        message: '投票问题不能为空'
      })
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      throw createError({
        statusCode: 400,
        message: '至少需要2个投票选项'
      })
    }

    // 验证选项内容
    const validOptions = options.filter((opt: string) => opt && opt.trim())
    if (validOptions.length < 2) {
      throw createError({
        statusCode: 400,
        message: '至少需要2个有效的投票选项'
      })
    }

    // 检查帖子是否存在
    const post = await prisma.studyGroupPost.findUnique({
      where: {
        id: postId,
        groupId
      }
    })

    if (!post) {
      throw createError({
        statusCode: 404,
        message: '帖子不存在'
      })
    }

    // 检查是否是帖子作者
    if (post.userId !== user.userId) {
      throw createError({
        statusCode: 403,
        message: '只有帖子作者可以创建投票'
      })
    }

    // 检查是否已存在投票
    const existingPoll = await prisma.poll.findUnique({
      where: { postId }
    })

    if (existingPoll) {
      throw createError({
        statusCode: 400,
        message: '该帖子已经有投票了'
      })
    }

    // 验证截止时间
    let parsedEndAt = null
    if (endAt) {
      parsedEndAt = new Date(endAt)
      if (isNaN(parsedEndAt.getTime()) || parsedEndAt <= new Date()) {
        throw createError({
          statusCode: 400,
          message: '截止时间必须是未来的时间'
        })
      }
    }

    // 创建投票和选项
    const poll = await prisma.poll.create({
      data: {
        postId,
        question: question.trim(),
        allowMultiple: allowMultiple === true,
        allowAddOption: allowAddOption === true,
        endAt: parsedEndAt,
        options: {
          create: validOptions.map((text: string, index: number) => ({
            text: text.trim(),
            order: index
          }))
        }
      },
      include: {
        options: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return {
      success: true,
      message: '投票创建成功',
      data: poll
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('创建投票失败:', error)
    throw createError({
      statusCode: 500,
      message: '创建投票失败'
    })
  }
})
