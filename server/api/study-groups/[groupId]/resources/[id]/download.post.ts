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
        message: '您不是该小组成员，无法下载资料'
      })
    }

    // 获取资料信息
    const resource = await prisma.studyResource.findUnique({
      where: {
        id: resourceId
      }
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
        userId,
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

    return {
      success: true,
      data: {
        downloadUrl: resource.fileUrl,
        fileName: resource.fileName
      },
      message: '下载记录已保存'
    }
  } catch (error: any) {
    console.error('处理下载请求失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '处理下载请求失败'
    })
  }
})
