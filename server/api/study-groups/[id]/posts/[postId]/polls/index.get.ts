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
        message: '只有小组成员可以查看投票'
      })
    }

    // 获取投票信息
    const poll = await prisma.poll.findUnique({
      where: { postId },
      include: {
        options: {
          orderBy: { order: 'asc' }
        },
        votes: {
          where: {
            userId: user.userId
          },
          select: {
            optionId: true
          }
        }
      }
    })

    if (!poll) {
      throw createError({
        statusCode: 404,
        message: '投票不存在'
      })
    }

    // 检查投票是否已结束
    const isEnded = poll.endAt && poll.endAt <= new Date()

    // 获取当前用户的投票选项
    const userVotes = poll.votes.map(vote => vote.optionId)

    // 格式化选项数据，添加百分比和用户投票状态
    const formattedOptions = poll.options.map(option => {
      const percentage = poll.totalVotes > 0
        ? Math.round((option.voteCount / poll.totalVotes) * 100)
        : 0

      return {
        id: option.id,
        text: option.text,
        order: option.order,
        voteCount: option.voteCount,
        percentage,
        isVoted: userVotes.includes(option.id)
      }
    })

    return {
      success: true,
      data: {
        id: poll.id,
        postId: poll.postId,
        question: poll.question,
        allowMultiple: poll.allowMultiple,
        allowAddOption: poll.allowAddOption,
        endAt: poll.endAt,
        totalVotes: poll.totalVotes,
        isEnded,
        options: formattedOptions,
        userVotes,
        createdAt: poll.createdAt,
        updatedAt: poll.updatedAt
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('获取投票详情失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取投票详情失败'
    })
  }
})
