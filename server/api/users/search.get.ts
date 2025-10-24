import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const searchTerm = query.q as string

  if (!searchTerm || searchTerm.trim().length < 2) {
    throw createError({
      statusCode: 400,
      message: '搜索关键词至少需要2个字符'
    })
  }

  try {
    // Search users by email or name
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            email: {
              contains: searchTerm.trim(),
              mode: 'insensitive'
            }
          },
          {
            name: {
              contains: searchTerm.trim(),
              mode: 'insensitive'
            }
          },
          {
            nickname: {
              contains: searchTerm.trim(),
              mode: 'insensitive'
            }
          }
        ],
        // Exclude current user
        NOT: {
          id: user.userId
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        avatar: true
      },
      take: 10 // Limit to 10 results
    })

    return {
      success: true,
      data: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name || u.nickname || u.email,
        nickname: u.nickname,
        avatar: u.avatar
      }))
    }
  } catch (error: any) {
    console.error('搜索用户失败:', error)
    throw createError({
      statusCode: 500,
      message: '搜索用户失败'
    })
  }
})
