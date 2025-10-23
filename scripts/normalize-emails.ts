import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function normalizeEmails() {
  console.log('开始规范化数据库中的邮箱地址...\n')

  try {
    // 查找所有用户
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true
      }
    })

    console.log(`总共找到 ${allUsers.length} 个用户`)

    let updatedCount = 0
    let unchangedCount = 0
    const updates = []

    // 检查哪些邮箱需要更新
    for (const user of allUsers) {
      const normalizedEmail = user.email.trim().toLowerCase()

      if (user.email !== normalizedEmail) {
        updates.push({
          id: user.id,
          oldEmail: user.email,
          newEmail: normalizedEmail
        })
      }
    }

    if (updates.length === 0) {
      console.log('\n✅ 所有邮箱都已经是小写格式，无需更新！')
      return
    }

    console.log(`\n找到 ${updates.length} 个需要规范化的邮箱：`)
    updates.forEach((u, i) => {
      console.log(`${i + 1}. ${u.oldEmail} → ${u.newEmail}`)
    })

    // 检查是否有重复
    const normalizedEmails = updates.map(u => u.newEmail)
    const duplicates = normalizedEmails.filter((email, index) =>
      normalizedEmails.indexOf(email) !== index
    )

    if (duplicates.length > 0) {
      console.error('\n❌ 错误：规范化后会产生重复的邮箱地址：')
      duplicates.forEach(email => console.error(`  - ${email}`))
      console.error('\n请手动处理这些重复邮箱后再运行此脚本')
      return
    }

    // 执行更新
    console.log('\n开始更新...')
    for (const update of updates) {
      try {
        await prisma.user.update({
          where: { id: update.id },
          data: { email: update.newEmail }
        })
        updatedCount++
        console.log(`✅ 已更新: ${update.oldEmail} → ${update.newEmail}`)
      } catch (error) {
        console.error(`❌ 更新失败 (${update.oldEmail}):`, error)
      }
    }

    unchangedCount = allUsers.length - updatedCount

    console.log('\n=== 更新完成 ===')
    console.log(`总用户数: ${allUsers.length}`)
    console.log(`已更新: ${updatedCount}`)
    console.log(`未改变: ${unchangedCount}`)

  } catch (error) {
    console.error('规范化邮箱时出错:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 运行脚本
normalizeEmails()
  .then(() => {
    console.log('\n✅ 脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 脚本执行失败:', error)
    process.exit(1)
  })
