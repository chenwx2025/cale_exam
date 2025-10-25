import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT RESOURCE DOWNLOAD] ========== 请求到达 ==========')
  const user = await requireAuth(event)
  const body = await readBody(event)
  const { groupId, resourceId } = body

  console.log('[FLAT RESOURCE DOWNLOAD] 参数:', { groupId, resourceId, userId: user.userId })

  if (!groupId || !resourceId) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数'
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
        message: '您不是该小组成员，无法下载资料'
      })
    }

    // 获取资料信息
    const resource = await prisma.studyResource.findUnique({
      where: { id: resourceId }
    })

    if (!resource) {
      throw createError({
        statusCode: 404,
        message: '资料不存在'
      })
    }

    if (resource.groupId !== groupId) {
      throw createError({
        statusCode: 403,
        message: '无权访问该资料'
      })
    }

    if (resource.deletedAt) {
      throw createError({
        statusCode: 404,
        message: '资料已被删除'
      })
    }

    if (resource.type === 'link') {
      throw createError({
        statusCode: 400,
        message: '外部链接无需下载'
      })
    }

    // 获取请求的 IP 和 User-Agent
    const ip = getRequestHeader(event, 'x-forwarded-for') ||
               getRequestHeader(event, 'x-real-ip') ||
               event.node.req.socket.remoteAddress ||
               'unknown'
    const userAgent = getRequestHeader(event, 'user-agent') || 'unknown'

    // 记录下载历史
    await prisma.resourceDownload.create({
      data: {
        resourceId,
        userId: user.userId,
        ip,
        userAgent
      }
    })

    // 增加下载次数
    await prisma.studyResource.update({
      where: { id: resourceId },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    })

    console.log('[FLAT RESOURCE DOWNLOAD] 下载记录已保存')
    return {
      success: true,
      data: {
        downloadUrl: resource.fileUrl,
        fileName: resource.fileName
      },
      message: '下载记录已保存'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT RESOURCE DOWNLOAD] 处理下载请求失败:', error)
    throw createError({
      statusCode: 500,
      message: '处理下载请求失败'
    })
  }
})
