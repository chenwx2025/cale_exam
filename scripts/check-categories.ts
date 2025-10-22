import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCategories() {
  const categories = await prisma.category.findMany({
    where: { examType: 'CALE' },
    select: { id: true, code: true, name: true, order: true },
    orderBy: { order: 'asc' }
  })

  console.log('所有分类：')
  categories.forEach(cat => {
    console.log(`${cat.order}. ${cat.name} (${cat.code})`)
  })

  await prisma.$disconnect()
}

checkCategories()
