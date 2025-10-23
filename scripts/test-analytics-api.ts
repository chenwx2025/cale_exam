import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAnalyticsAPI() {
  console.log('=== 测试数据分析API ===\n')

  try {
    // 1. 获取管理员用户的访问令牌
    const admin = await prisma.user.findFirst({
      where: {
        role: 'admin'
      }
    })

    if (!admin) {
      console.error('❌ 找不到管理员用户')
      return
    }

    console.log('✅ 找到管理员用户:', admin.email)

    // 2. 获取访问令牌
    const session = await prisma.session.findFirst({
      where: {
        userId: admin.id,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!session) {
      console.error('❌ 找不到有效的会话令牌')
      console.log('提示：请先在浏览器登录管理员账号')
      return
    }

    console.log('✅ 找到有效会话令牌\n')

    // 3. 调用数据分析API
    console.log('正在调用数据分析API...')
    const response = await fetch('http://localhost:3000/api/admin/analytics', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    })

    if (!response.ok) {
      console.error('❌ API调用失败:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('错误详情:', errorText)
      return
    }

    const data = await response.json()
    console.log('✅ API调用成功\n')

    // 4. 验证数据结构
    console.log('数据验证：')
    console.log('- userGrowth 记录数:', data.data.userGrowth?.length || 0)
    console.log('- dailyActiveUsers 记录数:', data.data.dailyActiveUsers?.length || 0)
    console.log('- difficultyDistribution 记录数:', data.data.difficultyDistribution?.length || 0)
    console.log('- categoryStats 记录数:', data.data.categoryStats?.length || 0)
    console.log('- examPassRate 记录数:', data.data.examPassRate?.length || 0)
    console.log('- dailyExams 记录数:', data.data.dailyExams?.length || 0)
    console.log('- subscriptionStats 记录数:', data.data.subscriptionStats?.length || 0)
    console.log('- lowAccuracyQuestions 记录数:', data.data.lowAccuracyQuestions?.length || 0)
    console.log('- adminActivityStats 记录数:', data.data.adminActivityStats?.length || 0)

    // 5. 检查是否有 BigInt 类型（不应该有）
    const jsonString = JSON.stringify(data)
    if (jsonString.includes('BigInt')) {
      console.error('\n❌ 警告：响应中包含 BigInt 类型（未正确转换）')
    } else {
      console.log('\n✅ 所有数据类型正确（无 BigInt）')
    }

    console.log('\n=== 测试完成 ===')
    console.log('✅ 数据分析API工作正常！')

  } catch (error: any) {
    console.error('\n❌ 测试失败:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

testAnalyticsAPI()
