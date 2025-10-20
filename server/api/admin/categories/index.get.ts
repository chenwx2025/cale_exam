import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/admin-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  try {
    const query = getQuery(event)
    const examType = query.examType as string | undefined

    // 构建查询条件
    const where: any = {}
    if (examType && ['cale', 'nccaom'].includes(examType)) {
      where.examType = examType
    }

    // 获取所有分类
    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: [
        { examType: 'asc' },
        { code: 'asc' }
      ]
    })

    // 构建树形结构
    const categoryMap = new Map()
    const rootCategories: any[] = []

    // 第一遍：创建所有节点
    categories.forEach(category => {
      categoryMap.set(category.id, {
        id: category.id,
        code: category.code,
        name: category.name,
        description: category.description,
        examType: category.examType,
        parentId: category.parentId,
        questionCount: category._count.questions,
        children: []
      })
    })

    // 第二遍：建立父子关系
    categories.forEach(category => {
      const node = categoryMap.get(category.id)
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          parent.children.push(node)
        } else {
          rootCategories.push(node)
        }
      } else {
        rootCategories.push(node)
      }
    })

    return {
      success: true,
      data: {
        categories: rootCategories,
        total: categories.length
      }
    }
  } catch (error: any) {
    console.error('Admin get categories error:', error)

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch categories'
    })
  }
})
