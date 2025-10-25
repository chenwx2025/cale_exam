import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const noteId = getRouterParam(event, 'noteId')

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  if (!noteId) {
    throw createError({
      statusCode: 400,
      message: '缺少笔记ID'
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

    // 获取笔记详情
    const note = await prisma.studyNote.findUnique({
      where: {
        id: noteId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            nickname: true,
            signature: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        attachments: {
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        contributors: {
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
            editCount: 'desc'
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        favorites: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!note) {
      throw createError({
        statusCode: 404,
        message: '笔记不存在'
      })
    }

    // 检查权限
    if (note.groupId !== groupId) {
      throw createError({
        statusCode: 403,
        message: '无权访问该笔记'
      })
    }

    // 检查可见性
    if (note.status === 'draft' && note.authorId !== user.userId) {
      throw createError({
        statusCode: 403,
        message: '草稿笔记仅作者可见'
      })
    }

    if (note.visibility === 'private' && note.authorId !== user.userId) {
      throw createError({
        statusCode: 403,
        message: '私密笔记仅作者可见'
      })
    }

    // 增加浏览量（异步，不等待）
    prisma.studyNote.update({
      where: { id: noteId },
      data: { viewCount: { increment: 1 } }
    }).catch(err => console.error('更新浏览量失败:', err))

    // 解析关联知识点
    let relatedKnowledge = []
    try {
      if (note.relatedKnowledge) {
        relatedKnowledge = JSON.parse(note.relatedKnowledge)
      }
    } catch (e) {
      // 忽略解析错误
    }

    // 检查当前用户的互动状态
    const isLiked = note.likes.some(like => like.userId === user.userId)
    const isFavorited = note.favorites.some(fav => fav.userId === user.userId)
    const isAuthor = note.authorId === user.userId
    const isContributor = note.contributors.some(c => c.userId === user.userId)
    const canEdit = isAuthor || (note.allowEdit && isContributor)

    return {
      success: true,
      data: {
        id: note.id,
        title: note.title,
        content: note.content,
        summary: note.summary,
        coverImage: note.coverImage,
        category: note.category,
        relatedChapter: note.relatedChapter,
        relatedKnowledge,
        allowEdit: note.allowEdit,
        status: note.status,
        visibility: note.visibility,
        isPinned: note.isPinned,
        isFeatured: note.isFeatured,
        viewCount: note.viewCount + 1, // 返回增加后的
        likeCount: note.likeCount,
        favoriteCount: note.favoriteCount,
        commentCount: note.commentCount,
        publishedAt: note.publishedAt,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        author: note.author,
        tags: note.tags.map(t => t.tag),
        attachments: note.attachments,
        contributors: note.contributors.map(c => ({
          ...c.user,
          role: c.role,
          contribution: c.contribution,
          editCount: c.editCount
        })),
        // 当前用户状态
        isLiked,
        isFavorited,
        isAuthor,
        canEdit
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('获取笔记详情失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取笔记详情失败'
    })
  }
})
