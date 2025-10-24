import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const { content, type, title, status } = body

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  if (!content || !content.trim()) {
    throw createError({
      statusCode: 400,
      message: '帖子内容不能为空'
    })
  }

  // 如果是问题类型，标题是必需的
  if (type === 'question' && (!title || !title.trim())) {
    throw createError({
      statusCode: 400,
      message: '问题标题不能为空'
    })
  }

  try {
    // 检查是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能发帖'
      })
    }

    // 创建帖子
    const postData: any = {
      groupId,
      userId: user.userId,
      content: content.trim(),
      type: type || 'discussion'
    }

    // 如果是问题类型，添加标题和状态
    if (type === 'question') {
      postData.title = title.trim()
      postData.status = status || 'pending'
    }

    const post = await prisma.studyGroupPost.create({
      data: postData
    })

    return {
      success: true,
      data: post,
      message: '帖子发布成功'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('发布帖子失败:', error)
    throw createError({
      statusCode: 500,
      message: '发布帖子失败'
    })
  }
})
