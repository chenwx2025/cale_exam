import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
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
        message: '只有小组成员可以取消投票'
      })
    }

    // 获取投票信息
    const poll = await prisma.poll.findUnique({
      where: { postId }
    })

    if (!poll) {
      throw createError({
        statusCode: 404,
        message: '投票不存在'
      })
    }

    // 检查投票是否已结束
    if (poll.endAt && poll.endAt <= new Date()) {
      throw createError({
        statusCode: 400,
        message: '投票已结束，无法取消'
      })
    }

    // 获取用户的投票记录
    const existingVotes = await prisma.pollVote.findMany({
      where: {
        pollId: poll.id,
        userId: user.userId
      }
    })

    if (existingVotes.length === 0) {
      throw createError({
        statusCode: 400,
        message: '您还没有投票'
      })
    }

    // 使用事务处理取消投票
    await prisma.$transaction(async (tx) => {
      // 删除投票记录
      await tx.pollVote.deleteMany({
        where: {
          pollId: poll.id,
          userId: user.userId
        }
      })

      // 更新选项的投票数
      const optionIds = [...new Set(existingVotes.map(v => v.optionId))]
      for (const optionId of optionIds) {
        await tx.pollOption.update({
          where: { id: optionId },
          data: { voteCount: { decrement: 1 } }
        })
      }

      // 更新投票总人数
      await tx.poll.update({
        where: { id: poll.id },
        data: { totalVotes: { decrement: 1 } }
      })
    })

    return {
      success: true,
      message: '已取消投票'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('取消投票失败:', error)
    throw createError({
      statusCode: 500,
      message: '取消投票失败'
    })
  }
})
