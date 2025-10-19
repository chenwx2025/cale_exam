import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Question ID is required'
    })
  }

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          code: true,
          type: true,
          parent: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      }
    }
  })

  if (!question) {
    throw createError({
      statusCode: 404,
      message: 'Question not found'
    })
  }

  // Convert to plain object to avoid Pinia serialization issues
  return JSON.parse(JSON.stringify(question))
})
