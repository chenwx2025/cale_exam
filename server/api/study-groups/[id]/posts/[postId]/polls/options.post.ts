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
    const { text } = body

    // 验证必填字段
    if (!text || !text.trim()) {
      throw createError({
        statusCode: 400,
        message: '选项内容不能为空'
      })
    }

    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员可以添加选项'
      })
    }

    // 获取投票信息
    const poll = await prisma.poll.findUnique({
      where: { postId },
      include: {
        options: {
          orderBy: { order: 'desc' },
          take: 1
        }
      }
    })

    if (!poll) {
      throw createError({
        statusCode: 404,
        message: '投票不存在'
      })
    }

    // 检查是否允许添加选项
    if (!poll.allowAddOption) {
      throw createError({
        statusCode: 403,
        message: '此投票不允许添加选项'
      })
    }

    // 检查投票是否已结束
    if (poll.endAt && poll.endAt <= new Date()) {
      throw createError({
        statusCode: 400,
        message: '投票已结束，无法添加选项'
      })
    }

    // 获取最大的order值
    const maxOrder = poll.options.length > 0 ? poll.options[0].order : -1

    // 创建新选项
    const newOption = await prisma.pollOption.create({
      data: {
        pollId: poll.id,
        text: text.trim(),
        order: maxOrder + 1
      }
    })

    return {
      success: true,
      message: '选项添加成功',
      data: newOption
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('添加选项失败:', error)
    throw createError({
      statusCode: 500,
      message: '添加选项失败'
    })
  }
})
