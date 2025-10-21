import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event)

  try {
    const categoryId = event.context.params?.id

    if (!categoryId) {
      throw createError({
        statusCode: 400,
        message: 'Category ID is required'
      })
    }

    const body = await readBody(event)

    // 验证分类存在
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!existingCategory) {
      throw createError({
        statusCode: 404,
        message: 'Category not found'
      })
    }

    // 构建更新数据
    const updateData: any = {}

    if (body.code && body.code.trim().length > 0) {
      // 检查新 code 是否与其他分类冲突
      const codeConflict = await prisma.category.findFirst({
        where: {
          code: body.code.trim(),
          examType: existingCategory.examType,
          id: { not: categoryId }
        }
      })

      if (codeConflict) {
        throw createError({
          statusCode: 400,
          message: 'Category code already exists for this exam type'
        })
      }

      updateData.code = body.code.trim()
    }

    if (body.name && body.name.trim().length > 0) {
      updateData.name = body.name.trim()
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null
    }

    if (body.parentId !== undefined) {
      if (body.parentId === null) {
        updateData.parentId = null
      } else {
        // 验证父分类存在
        const parentCategory = await prisma.category.findUnique({
          where: { id: body.parentId }
        })

        if (!parentCategory) {
          throw createError({
            statusCode: 400,
            message: 'Parent category not found'
          })
        }

        // 检查是否会形成循环引用
        if (body.parentId === categoryId) {
          throw createError({
            statusCode: 400,
            message: 'Category cannot be its own parent'
          })
        }

        // 检查 examType 是否一致
        if (parentCategory.examType !== existingCategory.examType) {
          throw createError({
            statusCode: 400,
            message: 'Parent category must have the same examType'
          })
        }

        updateData.parentId = body.parentId
      }
    }

    // 更新分类
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      }
    })

    // 记录管理员操作日志
    await prisma.adminLog.create({
      data: {
        adminId: admin.userId,
        action: 'update_category',
        targetType: 'category',
        targetId: categoryId,
        details: JSON.stringify({ updates: Object.keys(updateData) })
      }
    })

    return {
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    }
  } catch (error: any) {
    console.error('Admin update category error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to update category'
    })
  }
})
