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
        message: '您不是该小组成员，无法查看资料'
      })
    }

    // 获取资料详情
    const resource = await prisma.studyResource.findUnique({
      where: {
        id: resourceId
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        comments: {
          where: {
            parentId: null // 只获取顶级评论
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true
                  }
                }
              },
              orderBy: {
                createdAt: 'asc'
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        previousVersion: {
          select: {
            id: true,
            version: true,
            title: true,
            createdAt: true
          }
        },
        nextVersions: {
          select: {
            id: true,
            version: true,
            title: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            ratings: true,
            comments: true,
            downloads: true,
            favorites: true
          }
        }
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

    // 增加浏览次数
    await prisma.studyResource.update({
      where: { id: resourceId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })

    // 检查当前用户是否已收藏
    const isFavorited = await prisma.resourceFavorite.findFirst({
      where: {
        resourceId,
        userId
      }
    })

    // 检查当前用户的评分
    const userRating = await prisma.resourceRating.findFirst({
      where: {
        resourceId,
        userId
      }
    })

    // 处理资料数据
    const processedResource = {
      ...resource,
      tags: resource.tags ? JSON.parse(resource.tags) : [],
      ratingCount: resource._count.ratings,
      commentCount: resource._count.comments,
      favoriteCount: resource._count.favorites,
      isFavorited: !!isFavorited,
      userRating: userRating?.rating || null
    }

    return {
      success: true,
      data: processedResource
    }
  } catch (error: any) {
    console.error('获取资料详情失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '获取资料详情失败'
    })
  }
})
