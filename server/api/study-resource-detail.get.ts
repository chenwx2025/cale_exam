import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT RESOURCE DETAIL] ========== 请求到达 ==========')
  const user = await requireAuth(event)
  const query = getQuery(event)
  const groupId = query.groupId as string
  const resourceId = query.resourceId as string

  console.log('[FLAT RESOURCE DETAIL] 参数:', { groupId, resourceId, userId: user.userId })

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
        message: '您不是该小组成员，无法查看资料'
      })
    }

    // 获取资料详情
    const resource = await prisma.studyResource.findUnique({
      where: { id: resourceId },
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
            parentId: null
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
        files: {
          orderBy: {
            displayOrder: 'asc'
          }
        },
        _count: {
          select: {
            ratings: true,
            comments: true,
            downloads: true,
            favorites: true,
            files: true
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
        userId: user.userId
      }
    })

    // 检查当前用户的评分
    const userRating = await prisma.resourceRating.findFirst({
      where: {
        resourceId,
        userId: user.userId
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

    console.log('[FLAT RESOURCE DETAIL] 资料详情加载成功')
    return {
      success: true,
      data: processedResource
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT RESOURCE DETAIL] 获取资料详情失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取资料详情失败'
    })
  }
})
