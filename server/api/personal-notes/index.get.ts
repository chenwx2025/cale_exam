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

    // 解析查询参数
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 12
    const search = query.search as string
    const category = query.category as string
    const examType = query.examType as string
    const status = query.status as string
    const sortBy = query.sortBy as string || 'latest'
    const isFavorite = query.isFavorite === 'true'

    // 构建查询条件
    const whereCondition: any = {
      userId,
      deletedAt: null
    }

    // 状态筛选
    if (status) {
      whereCondition.status = status
    }

    // 分类筛选
    if (category) {
      whereCondition.category = category
    }

    // 考试类型筛选
    if (examType) {
      whereCondition.examType = examType
    }

    // 收藏筛选
    if (isFavorite) {
      whereCondition.isFavorite = true
    }

    // 搜索
    if (search) {
      whereCondition.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { summary: { contains: search } }
      ]
    }

    // 排序
    let orderBy: any = { createdAt: 'desc' }
    switch (sortBy) {
      case 'latest':
        orderBy = { createdAt: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'updated':
        orderBy = { updatedAt: 'desc' }
        break
      case 'title':
        orderBy = { title: 'asc' }
        break
    }

    // 查询总数
    const total = await prisma.personalNote.count({
      where: whereCondition
    })

    // 查询笔记列表
    const notes = await prisma.personalNote.findMany({
      where: whereCondition,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        sharedToGroups: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                examType: true
              }
            }
          }
        }
      }
    })

    // 处理返回数据
    const notesWithMeta = notes.map(note => ({
      ...note,
      tags: note.tags ? JSON.parse(note.tags) : [],
      relatedKnowledge: note.relatedKnowledge ? JSON.parse(note.relatedKnowledge) : [],
      sharedGroups: note.sharedToGroups.map(share => share.group)
    }))

    return {
      success: true,
      data: {
        notes: notesWithMeta,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    }
  } catch (error: any) {
    console.error('获取个人笔记列表失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '获取个人笔记列表失败'
    })
  }
})
