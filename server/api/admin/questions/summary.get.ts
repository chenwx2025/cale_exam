import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  requireAdmin(event)

  try {
    const query = getQuery(event)
    const examType = query.examType as string || 'cale'

    // 1. 按分类（Domain/Category）统计题目数量
    const categoryStats = await prisma.category.findMany({
      where: {
        examType
      },
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: {
        code: 'asc'
      }
    })

    // 2. 按难度统计
    const difficultyStats = await prisma.question.groupBy({
      by: ['difficulty'],
      where: {
        examType
      },
      _count: {
        id: true
      }
    })

    // 3. 总题目数
    const totalQuestions = await prisma.question.count({
      where: {
        examType
      }
    })

    // 4. 按 Domain 分组统计（从 Category.code 提取 Domain 信息）
    // 例如: "DOMAIN_1_ASSESSMENT" -> "Domain 1"
    const domainMap = new Map<string, number>()

    categoryStats.forEach(cat => {
      const match = cat.code.match(/DOMAIN_(\d+)/)
      if (match) {
        const domainKey = `Domain ${match[1]}`
        const currentCount = domainMap.get(domainKey) || 0
        domainMap.set(domainKey, currentCount + cat._count.questions)
      }
    })

    const domainStats = Array.from(domainMap.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => a.domain.localeCompare(b.domain))

    // 5. 最近添加的题目数量（最近 30 天）
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentQuestions = await prisma.question.count({
      where: {
        examType,
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // 6. 获取每个分类的详细信息（包括父子关系）
    const categoryTree = buildCategoryTree(categoryStats)

    return {
      success: true,
      data: {
        examType,
        totalQuestions,
        recentQuestions,
        categoryStats: categoryStats.map(cat => ({
          id: cat.id,
          name: cat.name,
          code: cat.code,
          parentId: cat.parentId,
          questionCount: cat._count.questions,
          color: cat.color
        })),
        categoryTree,
        difficultyStats: difficultyStats.map(stat => ({
          difficulty: stat.difficulty,
          count: Number(stat._count.id)
        })),
        domainStats
      }
    }
  } catch (error: any) {
    console.error('Get questions summary error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get questions summary: ' + error.message
    })
  }
})

// 构建分类树结构
function buildCategoryTree(categories: any[]): any[] {
  const categoryMap = new Map()
  const tree: any[] = []

  // 第一遍：创建所有节点
  categories.forEach(cat => {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      code: cat.code,
      parentId: cat.parentId,
      questionCount: cat._count.questions,
      color: cat.color,
      children: []
    })
  })

  // 第二遍：建立父子关系
  categories.forEach(cat => {
    const node = categoryMap.get(cat.id)
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId)
      if (parent) {
        parent.children.push(node)
      } else {
        tree.push(node)
      }
    } else {
      tree.push(node)
    }
  })

  return tree
}
