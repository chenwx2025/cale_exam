import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    console.log('[Get Bookmarks] 获取用户收藏, userId:', user.userId)

    // 获取用户所有收藏的帖子
    const bookmarks = await prisma.studyGroupPostBookmark.findMany({
      where: {
        userId: user.userId
      },
      include: {
        post: {
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
            group: {
              select: {
                id: true,
                name: true
              }
            },
            likes: {
              select: {
                userId: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // 最新收藏的排在前面
      }
    })

    console.log('[Get Bookmarks] 找到收藏数量:', bookmarks.length)

    // 格式化数据
    const formattedBookmarks = bookmarks.map(bookmark => {
      const post = bookmark.post
      const isLiked = post.likes.some(like => like.userId === user.userId)

      return {
        bookmarkId: bookmark.id,
        bookmarkedAt: bookmark.createdAt,
        post: {
          id: post.id,
          groupId: post.groupId,
          groupName: post.group.name,
          title: post.title,
          content: post.content,
          type: post.type,
          status: post.status,
          isPinned: post.isPinned,
          isFeatured: post.isFeatured,
          viewCount: post.viewCount,
          likeCount: post.likeCount,
          replyCount: post.replyCount,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          isLiked,
          author: post.user
        }
      }
    })

    return {
      success: true,
      data: formattedBookmarks
    }
  } catch (error: any) {
    console.error('[Get Bookmarks] 获取收藏失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取收藏列表失败'
    })
  }
})
