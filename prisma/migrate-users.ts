import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始迁移现有用户数据...\n')

  // 获取所有现有用户
  const users = await prisma.user.findMany()

  console.log(`找到 ${users.length} 个现有用户\n`)

  for (const user of users) {
    console.log(`处理用户: ${user.name} (${user.email || user.id})`)

    // 为现有用户生成默认密码
    const defaultPassword = 'Demo123456!' // 默认密码
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    // 更新用户数据
    await prisma.$executeRaw`
      UPDATE User
      SET
        email = ${user.email || `${user.id}@demo.com`},
        password = ${hashedPassword},
        role = 'user',
        emailVerified = 1,
        status = 'active',
        tokenVersion = 0,
        loginCount = 0
      WHERE id = ${user.id}
    `

    console.log(`  ✓ 已更新，默认密码: ${defaultPassword}\n`)
  }

  // 为现有用户创建 CALE 考试订阅
  console.log('为用户创建 CALE 考试订阅...\n')

  for (const user of users) {
    try {
      await prisma.userExamSubscription.create({
        data: {
          userId: user.id,
          examType: 'cale',
          isActive: true
        }
      })
      console.log(`  ✓ 已为 ${user.name} 创建 CALE 订阅`)
    } catch (error) {
      console.log(`  ⚠ ${user.name} 的 CALE 订阅可能已存在`)
    }
  }

  console.log('\n迁移完成！')
  console.log('\n现有用户登录信息:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const updatedUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  })

  updatedUsers.forEach(u => {
    console.log(`邮箱: ${u.email}`)
    console.log(`密码: Demo123456!`)
    console.log(`角色: ${u.role}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  })
}

main()
  .catch((e) => {
    console.error('迁移失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
