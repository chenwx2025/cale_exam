import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const query = getQuery(event)
  const examType = query.examType as string || 'all'
  const search = query.search as string || ''
  const page = parseInt(query.page as string) || 1
  const pageSize = Math.min(parseInt(query.pageSize as string) || 20, 100)

  try {
    // 构建查询条件
    const where: any = {}

    if (examType !== 'all') {
      where.examType = examType
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    }

    // 获取小组列表
    const [groups, total] = await Promise.all([
      prisma.studyGroup.findMany({
        where,
        include: {
          _count: {
            select: {
              members: true,
              posts: true
            }
          },
          members: {
            where: {
              userId: user.userId
            },
            select: {
              id: true,
              role: true
            }
          },
          joinRequests: {
            where: {
              userId: user.userId,
              status: 'pending'
            },
            select: {
              id: true,
              status: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.studyGroup.count({ where })
    ])

    // 添加是否已加入标记和申请状态
    const groupsWithMemberStatus = groups.map(group => ({
      ...group,
      isMember: group.members.length > 0,
      memberRole: group.members[0]?.role || null,
      memberCount: group._count.members,
      postCount: group._count.posts,
      hasPendingRequest: group.joinRequests.length > 0,
      pendingRequest: group.joinRequests[0] || null,
      members: undefined,
      joinRequests: undefined,
      _count: undefined
    }))

    return {
      success: true,
      data: groupsWithMemberStatus,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  } catch (error: any) {
    console.error('获取学习小组列表失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取学习小组列表失败'
    })
  }
})
