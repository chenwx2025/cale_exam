// 创建演示用户
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating demo user...')

  const hashedPassword = await bcrypt.hash('demo123', 10)

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@cale.com' },
    update: {},
    create: {
      id: 'demo-user',
      name: '演示用户',
      email: 'demo@cale.com',
      password: hashedPassword
    }
  })

  console.log('Demo user created:', demoUser)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
