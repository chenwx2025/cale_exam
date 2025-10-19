import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const categoryId = query.categoryId as string | undefined
  const categoryIds = query.categoryIds as string | undefined
  const categoryType = query.categoryType as string | undefined
  const examType = query.examType as string | undefined
  const difficulty = query.difficulty as string | undefined
  const limit = query.limit ? parseInt(query.limit as string) : undefined
  const random = query.random === 'true'

  const where: any = {}

  // 支持单个分类ID
  if (categoryId) {
    where.categoryId = categoryId
  }
  // 支持多个分类ID（逗号分隔）
  else if (categoryIds) {
    where.categoryId = { in: categoryIds.split(',') }
  }
  // 支持按分类类型筛选
  else if (categoryType) {
    where.category = { type: categoryType }
  }

  if (examType) where.examType = examType
  if (difficulty) where.difficulty = difficulty

  let questions

  if (random && limit) {
    // 随机获取题目（用于模拟考试）
    const count = await prisma.question.count({ where })
    const skip = Math.max(0, Math.floor(Math.random() * (count - limit)))

    questions = await prisma.question.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true
          }
        }
      },
      take: limit,
      skip
    })
  } else {
    questions = await prisma.question.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true
          }
        }
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  // Convert to plain objects to avoid Pinia serialization issues
  return JSON.parse(JSON.stringify(questions))
})
