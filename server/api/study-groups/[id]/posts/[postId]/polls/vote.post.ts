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
    const { optionIds } = body

    // 验证必填字段
    if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
      throw createError({
        statusCode: 400,
        message: '请至少选择一个选项'
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
        message: '只有小组成员可以参与投票'
      })
    }

    // 获取投票信息
    const poll = await prisma.poll.findUnique({
      where: { postId },
      include: {
        options: true
      }
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
        message: '投票已结束'
      })
    }

    // 检查是否允许多选
    if (!poll.allowMultiple && optionIds.length > 1) {
      throw createError({
        statusCode: 400,
        message: '此投票不允许多选'
      })
    }

    // 验证所有选项ID是否有效
    const validOptionIds = poll.options.map(opt => opt.id)
    const invalidOptions = optionIds.filter((id: string) => !validOptionIds.includes(id))
    if (invalidOptions.length > 0) {
      throw createError({
        statusCode: 400,
        message: '包含无效的选项ID'
      })
    }

    // 检查用户是否已经投票
    const existingVotes = await prisma.pollVote.findMany({
      where: {
        pollId: poll.id,
        userId: user.userId
      }
    })

    // 使用事务处理投票
    const result = await prisma.$transaction(async (tx) => {
      // 如果用户已投票，先删除旧投票
      if (existingVotes.length > 0) {
        // 删除旧投票记录
        await tx.pollVote.deleteMany({
          where: {
            pollId: poll.id,
            userId: user.userId
          }
        })

        // 更新旧选项的投票数
        const oldOptionIds = [...new Set(existingVotes.map(v => v.optionId))]
        for (const optionId of oldOptionIds) {
          await tx.pollOption.update({
            where: { id: optionId },
            data: { voteCount: { decrement: 1 } }
          })
        }
      }

      // 创建新投票记录
      const newVotes = await Promise.all(
        optionIds.map((optionId: string) =>
          tx.pollVote.create({
            data: {
              pollId: poll.id,
              optionId,
              userId: user.userId
            }
          })
        )
      )

      // 更新选项投票数
      const uniqueOptionIds = [...new Set(optionIds)]
      for (const optionId of uniqueOptionIds) {
        await tx.pollOption.update({
          where: { id: optionId },
          data: { voteCount: { increment: 1 } }
        })
      }

      // 更新投票总人数（如果是新用户投票）
      if (existingVotes.length === 0) {
        await tx.poll.update({
          where: { id: poll.id },
          data: { totalVotes: { increment: 1 } }
        })
      }

      return newVotes
    })

    return {
      success: true,
      message: existingVotes.length > 0 ? '投票已更新' : '投票成功',
      data: {
        votes: result.map(v => ({
          id: v.id,
          optionId: v.optionId,
          createdAt: v.createdAt
        }))
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('投票失败:', error)
    throw createError({
      statusCode: 500,
      message: '投票失败'
    })
  }
})
