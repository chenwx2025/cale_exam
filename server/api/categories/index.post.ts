import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const category = await prisma.category.create({
    data: {
      name: body.name,
      code: body.code,
      examType: body.examType || 'cale',
      type: body.type,
      description: body.description,
      parentId: body.parentId,
      order: body.order || 0
    }
  })

  // Convert to plain object to avoid Pinia serialization issues
  return JSON.parse(JSON.stringify(category))
})
