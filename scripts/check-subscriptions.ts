import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSubscriptions() {
  try {
    console.log('🔍 检查所有用户的订阅情况...\n')

    const users = await prisma.user.findMany({
      include: {
        subscribedExams: {
          where: { isActive: true }
        }
      }
    })

    if (users.length === 0) {
      console.log('❌ 数据库中没有用户')
      return
    }

    console.log(`找到 ${users.length} 个用户：\n`)

    for (const user of users) {
      console.log(`📧 ${user.email} (${user.name})`)
      console.log(`   角色: ${user.role}`)
      console.log(`   状态: ${user.status}`)
      console.log(`   订阅数: ${user.subscribedExams.length}`)

      if (user.subscribedExams.length > 0) {
        console.log('   已订阅:')
        user.subscribedExams.forEach(sub => {
          console.log(`   - ${sub.examType.toUpperCase()} (${new Date(sub.subscribedAt).toLocaleDateString()})`)
        })
      } else {
        console.log('   ⚠️  未订阅任何考试')
      }
      console.log('')
    }
  } catch (error) {
    console.error('❌ 错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSubscriptions()
