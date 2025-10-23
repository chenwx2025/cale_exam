import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  requireAdmin(event)

  try {
    const query = getQuery(event)
    const examType = (query.examType as string) || 'cale'
    const type = (query.type as string) || 'all'

    // 构建查询条件
    const where: any = {
      examType
    }

    if (type !== 'all') {
      where.type = type
    }

    // 查询所有分类（包含题目数量）
    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: {
            questions: true,
            children: true
          }
        },
        parent: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { code: 'asc' }
      ]
    })

    // 格式化数据
    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      nameEn: cat.nameEn,
      code: cat.code,
      examType: cat.examType,
      type: cat.type,
      description: cat.description,
      questionCount: cat.questionCount,
      weight: cat.weight,
      order: cat.order,
      parentId: cat.parentId,
      parent: cat.parent,
      color: cat.color,
      actualQuestionCount: cat._count.questions,
      childrenCount: cat._count.children,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt
    }))

    // 构建树形结构
    const categoryTree = buildTree(formattedCategories)

    return {
      success: true,
      categories: formattedCategories,
      categoryTree,
      total: formattedCategories.length
    }
  } catch (error: any) {
    console.error('Get categories error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get categories: ' + error.message
    })
  }
})

// 构建树形结构
function buildTree(categories: any[]): any[] {
  const map = new Map()
  const roots: any[] = []

  // 创建映射
  categories.forEach(cat => {
    map.set(cat.id, { ...cat, children: [] })
  })

  // 构建树
  categories.forEach(cat => {
    const node = map.get(cat.id)
    if (cat.parentId) {
      const parent = map.get(cat.parentId)
      if (parent) {
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    } else {
      roots.push(node)
    }
  })

  return roots
}
