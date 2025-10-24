import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const { name, description, examType, isPrivate, requireApproval, maxMembers } = body

  // 验证必填字段
  if (!name || !examType) {
    throw createError({
      statusCode: 400,
      message: '小组名称和考试类型为必填项'
    })
  }

  try {
    console.log('[创建学习小组] user对象:', { user, userId: user.userId })

    // 创建学习小组
    const group = await prisma.studyGroup.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        examType,
        isPublic: !(isPrivate || false), // 转换：isPrivate -> isPublic
        requireApproval: requireApproval || false, // 是否需要审批
        maxMembers: maxMembers || 50,
        createdBy: user.userId, // JWT payload 使用 userId 字段
        members: {
          create: {
            userId: user.userId,
            role: 'owner' // 创建者自动成为组长
          }
        }
      },
      include: {
        _count: {
          select: {
            members: true,
            posts: true
          }
        }
      }
    })

    return {
      success: true,
      data: {
        ...group,
        memberCount: group._count.members,
        postCount: group._count.posts,
        _count: undefined
      },
      message: '学习小组创建成功'
    }
  } catch (error: any) {
    console.error('创建学习小组失败:', error)
    console.error('错误详情:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })
    throw createError({
      statusCode: 500,
      message: `创建学习小组失败: ${error.message}`
    })
  }
})
