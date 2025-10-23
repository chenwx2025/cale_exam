import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  requireAdmin(event)

  try {
    const categoryId = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!categoryId) {
      throw createError({
        statusCode: 400,
        message: 'Category ID is required'
      })
    }

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!existingCategory) {
      throw createError({
        statusCode: 404,
        message: 'Category not found'
      })
    }

    // 准备更新数据
    const updateData: any = {}

    // 允许更新的字段
    if (body.name !== undefined) updateData.name = body.name
    if (body.nameEn !== undefined) updateData.nameEn = body.nameEn
    if (body.description !== undefined) updateData.description = body.description
    if (body.detailedInfo !== undefined) updateData.detailedInfo = body.detailedInfo
    if (body.questionCount !== undefined) updateData.questionCount = body.questionCount
    if (body.weight !== undefined) updateData.weight = body.weight
    if (body.keyPoints !== undefined) updateData.keyPoints = body.keyPoints
    if (body.studyTips !== undefined) updateData.studyTips = body.studyTips
    if (body.order !== undefined) updateData.order = body.order
    if (body.color !== undefined) updateData.color = body.color

    // 更新分类
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
      include: {
        _count: {
          select: {
            questions: true,
            children: true
          }
        }
      }
    })

    // 记录管理员操作日志
    const adminUser = event.context.user
    await prisma.adminLog.create({
      data: {
        adminId: adminUser.userId,
        action: 'update_category',
        targetType: 'category',
        targetId: categoryId,
        details: JSON.stringify({
          changes: updateData,
          previousName: existingCategory.name
        }),
        ipAddress: getRequestIP(event) || undefined,
        userAgent: getRequestHeader(event, 'user-agent') || undefined
      }
    })

    return {
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    }
  } catch (error: any) {
    // 如果是已知错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    console.error('Update category error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update category: ' + error.message
    })
  }
})
