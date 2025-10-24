import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const examType = getRouterParam(event, 'examType')

  if (!examType) {
    throw createError({
      statusCode: 400,
      message: '缺少考试类型参数'
    })
  }

  try {
    // 获取该考试类型的所有分类
    const categories = await prisma.category.findMany({
      where: {
        examType: examType
      },
      select: {
        id: true,
        name: true,
        nameEn: true,
        code: true,
        type: true,
        description: true
      },
      orderBy: {
        order: 'asc'
      }
    })

    return {
      success: true,
      data: categories
    }
  } catch (error) {
    console.error('[Categories API] 获取分类失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取分类失败'
    })
  }
})
