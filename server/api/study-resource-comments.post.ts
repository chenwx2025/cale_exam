import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT RESOURCE COMMENTS] ========== 请求到达 ==========')
  const user = await requireAuth(event)
  const body = await readBody(event)
  const { groupId, resourceId, content, parentId } = body

  console.log('[FLAT RESOURCE COMMENTS] 参数:', { groupId, resourceId, userId: user.userId, parentId })

  if (!groupId || !resourceId) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数'
    })
  }

  // 验证评论内容
  if (!content || content.trim().length === 0) {
    throw createError({
      statusCode: 400,
      message: '评论内容不能为空'
    })
  }

  try {
    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId,
        isActive: true
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
        userId: user.userId,
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

    console.log('[FLAT RESOURCE COMMENTS] 评论成功')
    return {
      success: true,
      data: comment,
      message: parentId ? '回复成功' : '评论成功'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT RESOURCE COMMENTS] 发表评论失败:', error)
    throw createError({
      statusCode: 500,
      message: '发表评论失败'
    })
  }
})
