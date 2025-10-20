import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Item ID is required'
    })
  }

  const { completed, notes } = body

  const updatedItem = await prisma.studyPlanItem.update({
    where: { id },
    data: {
      completed: completed !== undefined ? completed : undefined,
      completedAt: completed ? new Date() : null,
      notes: notes !== undefined ? notes : undefined
    },
    include: {
      question: true
    }
  })

  return updatedItem
})
