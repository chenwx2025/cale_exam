import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const query = getQuery(event)

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  try {
    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员可以查看笔记'
      })
    }

    // 构建查询条件
    const whereCondition: any = {
      groupId,
      deletedAt: null
    }

    // 分类筛选
    if (query.category) {
      whereCondition.category = query.category
    }

    // 标签筛选
    if (query.tagId) {
      whereCondition.tags = {
        some: {
          tagId: query.tagId as string
        }
      }
    }

    // 作者筛选
    if (query.authorId) {
      whereCondition.authorId = query.authorId
    }

    // 状态筛选（默认只显示已发布的）
    const status = query.status || 'published'
    if (status === 'my') {
      // 查看我的笔记（包括草稿）
      whereCondition.authorId = user.userId
    } else if (status === 'draft') {
      // 只看草稿（仅自己的）
      whereCondition.status = 'draft'
      whereCondition.authorId = user.userId
    } else {
      whereCondition.status = status
    }

    // 搜索
    if (query.search) {
      whereCondition.OR = [
        { title: { contains: query.search as string } },
        { content: { contains: query.search as string } },
        { summary: { contains: query.search as string } }
      ]
    }

    // 排序方式
    const sortBy = query.sortBy || 'latest'
    let orderBy: any = {}

    switch (sortBy) {
      case 'hot':
        orderBy = [
          { isPinned: 'desc' },
          { isFeatured: 'desc' },
          { likeCount: 'desc' },
          { viewCount: 'desc' }
        ]
        break
      case 'mostLiked':
        orderBy = { likeCount: 'desc' }
        break
      case 'mostViewed':
        orderBy = { viewCount: 'desc' }
        break
      case 'mostFavorited':
        orderBy = { favoriteCount: 'desc' }
        break
      default: // latest
        orderBy = [
          { isPinned: 'desc' },
          { isFeatured: 'desc' },
          { publishedAt: 'desc' },
          { createdAt: 'desc' }
        ]
    }

    // 分页
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20
    const skip = (page - 1) * pageSize

    // 获取笔记列表
    const [notes, total] = await Promise.all([
      prisma.studyNote.findMany({
        where: whereCondition,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              nickname: true
            }
          },
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: {
              comments: true,
              attachments: true
            }
          }
        },
        orderBy,
        skip,
        take: pageSize
      }),
      prisma.studyNote.count({
        where: whereCondition
      })
    ])

    // 获取当前用户对每个笔记的互动状态
    const noteIds = notes.map(note => note.id)
    const [userLikes, userFavorites] = await Promise.all([
      prisma.noteLike.findMany({
        where: {
          noteId: { in: noteIds },
          userId: user.userId
        },
        select: { noteId: true }
      }),
      prisma.noteFavorite.findMany({
        where: {
          noteId: { in: noteIds },
          userId: user.userId
        },
        select: { noteId: true }
      })
    ])

    const likedNoteIds = new Set(userLikes.map(like => like.noteId))
    const favoritedNoteIds = new Set(userFavorites.map(fav => fav.noteId))

    // 格式化数据
    const formattedNotes = notes.map(note => {
      // 解析关联知识点
      let relatedKnowledge = []
      try {
        if (note.relatedKnowledge) {
          relatedKnowledge = JSON.parse(note.relatedKnowledge)
        }
      } catch (e) {
        // 忽略解析错误
      }

      return {
        id: note.id,
        title: note.title,
        summary: note.summary,
        coverImage: note.coverImage,
        category: note.category,
        relatedChapter: note.relatedChapter,
        relatedKnowledge,
        status: note.status,
        visibility: note.visibility,
        isPinned: note.isPinned,
        isFeatured: note.isFeatured,
        viewCount: note.viewCount,
        likeCount: note.likeCount,
        favoriteCount: note.favoriteCount,
        commentCount: note.commentCount,
        attachmentCount: note._count.attachments,
        publishedAt: note.publishedAt,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        author: note.author,
        tags: note.tags.map(t => t.tag),
        isLiked: likedNoteIds.has(note.id),
        isFavorited: favoritedNoteIds.has(note.id)
      }
    })

    return {
      success: true,
      data: {
        notes: formattedNotes,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('获取笔记列表失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取笔记列表失败'
    })
  }
})
