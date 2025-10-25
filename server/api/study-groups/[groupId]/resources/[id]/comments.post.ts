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
    const groupId = event.context.params?.groupId
    const resourceId = event.context.params?.id

    if (!groupId || !resourceId) {
      throw createError({
        statusCode: 400,
        message: '缺少必要参数'
      })
    }

    // 解析请求体
    const body = await readBody(event)
    const { content, parentId } = body

    // 验证评论内容
    if (!content || content.trim().length === 0) {
      throw createError({
        statusCode: 400,
        message: '评论内容不能为空'
      })
    }

    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId,
        status: 'active'
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '您不是该小组成员，无法评论'
      })
    }

    // 检查资料是否存在
    const resource = await prisma.studyResource.findUnique({
      where: { id: resourceId }
    })

    if (!resource || resource.groupId !== groupId || resource.deletedAt) {
      throw createError({
        statusCode: 404,
        message: '资料不存在'
      })
    }

    // 如果是回复，检查父评论是否存在
    if (parentId) {
      const parentComment = await prisma.resourceComment.findUnique({
        where: { id: parentId }
      })

      if (!parentComment || parentComment.resourceId !== resourceId) {
        throw createError({
          statusCode: 404,
          message: '父评论不存在'
        })
      }
    }

    // 创建评论
    const comment = await prisma.resourceComment.create({
      data: {
        resourceId,
        userId,
        content: content.trim(),
        parentId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    return {
      success: true,
      data: comment,
      message: parentId ? '回复成功' : '评论成功'
    }
  } catch (error: any) {
    console.error('发表评论失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '发表评论失败'
    })
  }
})
