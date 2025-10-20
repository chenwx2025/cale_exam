import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/admin-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event)

  try {
    const body = await readBody(event)

    // 验证必填字段
    if (!body.code || !body.name || !body.examType) {
      throw createError({
        statusCode: 400,
        message: 'Code, name, and examType are required'
      })
    }

    // 验证 examType
    if (!['cale', 'nccaom'].includes(body.examType)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid examType. Must be "cale" or "nccaom"'
      })
    }

    // 检查 code 是否已存在
    const existingCategory = await prisma.category.findFirst({
      where: {
        code: body.code,
        examType: body.examType
      }
    })

    if (existingCategory) {
      throw createError({
        statusCode: 400,
        message: 'Category code already exists for this exam type'
      })
    }

    // 如果有 parentId，验证父分类是否存在
    if (body.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: body.parentId }
      })

      if (!parentCategory) {
        throw createError({
          statusCode: 400,
          message: 'Parent category not found'
        })
      }

      if (parentCategory.examType !== body.examType) {
        throw createError({
          statusCode: 400,
          message: 'Parent category must have the same examType'
        })
      }
    }

    // 创建分类
    const newCategory = await prisma.category.create({
      data: {
        code: body.code.trim(),
        name: body.name.trim(),
        description: body.description?.trim() || null,
        examType: body.examType,
        parentId: body.parentId || null
      },
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
        action: 'create_category',
        targetType: 'category',
        targetId: newCategory.id,
        details: JSON.stringify({
          code: newCategory.code,
          name: newCategory.name,
          examType: newCategory.examType
        })
      }
    })

    return {
      success: true,
      message: 'Category created successfully',
      data: newCategory
    }
  } catch (error: any) {
    console.error('Admin create category error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to create category'
    })
  }
})
