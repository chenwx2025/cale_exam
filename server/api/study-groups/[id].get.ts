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
    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                nickname: true
              }
            }
          },
          orderBy: {
            joinedAt: 'asc'
          }
        },
        posts: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                nickname: true
              }
            },
            _count: {
              select: {
                replies: true,
                likes: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20
        },
        _count: {
          select: {
            members: true,
            posts: true
          }
        }
      }
    })

    if (!group) {
      throw createError({
        statusCode: 404,
        message: '学习小组不存在'
      })
    }

    // 检查是否是小组成员
    const membership = group.members.find(m => m.userId === user.userId)
    const isMember = !!membership

    // 如果是非公开小组且不是成员，隐藏部分信息
    if (!group.isPublic && !isMember) {
      return {
        success: true,
        data: {
          id: group.id,
          name: group.name,
          description: group.description,
          examType: group.examType,
          isPrivate: !group.isPublic, // 转换为前端使用的字段
          memberCount: group._count.members,
          maxMembers: group.maxMembers,
          createdAt: group.createdAt,
          isMember: false,
          canJoin: group._count.members < group.maxMembers
        }
      }
    }

    // 获取用户对帖子的点赞状态
    const postIds = group.posts.map(p => p.id)
    const userLikes = await prisma.studyGroupPostLike.findMany({
      where: {
        postId: { in: postIds },
        userId: user.userId
      },
      select: {
        postId: true
      }
    })
    const likedPostIds = new Set(userLikes.map(like => like.postId))

    // 为每个帖子添加点赞信息
    const postsWithLikes = group.posts.map(post => ({
      ...post,
      author: post.user, // 映射 user 到 author 以保持前端兼容性
      likeCount: post._count.likes,
      replyCount: post._count.replies,
      isLiked: likedPostIds.has(post.id),
      user: undefined, // 移除 user 字段
      _count: undefined
    }))

    return {
      success: true,
      data: {
        ...group,
        posts: postsWithLikes,
        isPrivate: !group.isPublic, // 转换为前端使用的字段
        memberCount: group._count.members,
        postCount: group._count.posts,
        isMember,
        memberRole: membership?.role || null,
        canPost: isMember,
        canManage: membership?.role === 'owner' || membership?.role === 'admin',
        canJoin: !isMember && group._count.members < group.maxMembers, // 不是成员且未满员
        _count: undefined
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('获取学习小组详情失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取学习小组详情失败'
    })
  }
})
