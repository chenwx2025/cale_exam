import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const type = query.type as string | undefined
  const examType = query.examType as string | undefined

  const where: any = {}
  if (type) where.type = type
  if (examType) where.examType = examType

  const categories = await prisma.category.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: {
      _count: {
        select: { questions: true }
      },
      children: {
        include: {
          _count: {
            select: { questions: true }
          }
        }
      }
    },
    orderBy: {
      order: 'asc'
    }
  })

  // Convert to plain objects to avoid Pinia serialization issues
  return JSON.parse(JSON.stringify(categories))
})
