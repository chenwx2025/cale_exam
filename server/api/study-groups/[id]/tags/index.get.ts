import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  try {
    // 验证用户是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员可以查看标签'
      })
    }

    // 获取小组的所有标签，按使用次数排序
    const tags = await prisma.postTag.findMany({
      where: { groupId },
      orderBy: [
        { postCount: 'desc' },
        { name: 'asc' }
      ]
    })

    return {
      success: true,
      data: tags
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('获取标签列表失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取标签列表失败'
    })
  }
})
