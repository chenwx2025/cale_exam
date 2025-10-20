import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/admin-helpers'

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

    // 验证分类存在
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            questions: true,
            children: true
          }
        }
      }
    })

    if (!existingCategory) {
      throw createError({
        statusCode: 404,
        message: 'Category not found'
      })
    }

    // 检查是否有关联的题目
    if (existingCategory._count.questions > 0) {
      throw createError({
        statusCode: 400,
        message: `Cannot delete category with ${existingCategory._count.questions} associated questions. Please reassign or delete the questions first.`
      })
    }

    // 检查是否有子分类
    if (existingCategory._count.children > 0) {
      throw createError({
        statusCode: 400,
        message: `Cannot delete category with ${existingCategory._count.children} sub-categories. Please delete or reassign the sub-categories first.`
      })
    }

    // 删除分类
    await prisma.category.delete({
      where: { id: categoryId }
    })

    // 记录管理员操作日志
    await prisma.adminLog.create({
      data: {
        adminId: admin.userId,
        action: 'delete_category',
        targetType: 'category',
        targetId: categoryId,
        details: JSON.stringify({
          code: existingCategory.code,
          name: existingCategory.name,
          examType: existingCategory.examType
        })
      }
    })

    return {
      success: true,
      message: 'Category deleted successfully'
    }
  } catch (error: any) {
    console.error('Admin delete category error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to delete category'
    })
  }
})
