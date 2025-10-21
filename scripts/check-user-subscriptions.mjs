import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUserSubscriptions() {
  const user = await prisma.user.findUnique({
    where: { email: 'demo@cale.com' },
    select: { email: true, subscribedExams: true, name: true }
  })

  console.log('Demo用户订阅信息:')
  console.log(JSON.stringify(user, null, 2))

  await prisma.$disconnect()
}

checkUserSubscriptions()
