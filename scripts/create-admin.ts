import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  const email = 'admin@cale.com'
  const password = 'admin123'  // 请在生产环境中使用强密码
  const name = 'Admin User'

  try {
    // 检查管理员是否已存在
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', email)
      if (existingAdmin.role !== 'admin') {
        // 更新为管理员
        await prisma.user.update({
          where: { email },
          data: { role: 'admin' }
        })
        console.log('✅ Updated existing user to admin role')
      }
      return
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建管理员用户
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'admin',
        status: 'active',
        emailVerified: true
      }
    })

    // 创建 CALE 和 NCCAOM 订阅
    await prisma.userExamSubscription.createMany({
      data: [
        {
          userId: admin.id,
          examType: 'cale',
          isActive: true
        },
        {
          userId: admin.id,
          examType: 'nccaom',
          isActive: true
        }
      ]
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('⚠️  Please change the password after first login!')

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
