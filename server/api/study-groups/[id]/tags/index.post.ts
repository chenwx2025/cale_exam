import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

// 预定义的标签颜色
const TAG_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316'  // orange
]

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
    const body = await readBody(event)
    const { name, color, description } = body

    if (!name || name.trim().length === 0) {
      throw createError({
        statusCode: 400,
        message: '标签名称不能为空'
      })
    }

    // 验证用户是管理员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员可以创建标签'
      })
    }

    const isAdmin = ['owner', 'admin', 'moderator'].includes(membership.role)
    if (!isAdmin) {
      throw createError({
        statusCode: 403,
        message: '只有管理员可以创建标签'
      })
    }

    // 检查标签是否已存在
    const existingTag = await prisma.postTag.findUnique({
      where: {
        groupId_name: {
          groupId,
          name: name.trim()
        }
      }
    })

    if (existingTag) {
      throw createError({
        statusCode: 400,
        message: '该标签已存在'
      })
    }

    // 如果没有指定颜色，随机选择一个
    const tagColor = color || TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]

    // 创建标签
    const tag = await prisma.postTag.create({
      data: {
        groupId,
        name: name.trim(),
        color: tagColor,
        description: description?.trim() || null
      }
    })

    console.log(`[Create Tag] 标签 ${tag.name} 已创建`)

    return {
      success: true,
      message: '标签创建成功',
      tag
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('创建标签失败:', error)
    throw createError({
      statusCode: 500,
      message: '创建标签失败'
    })
  }
})
