// 测试 analytics API 的实际响应
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAPI() {
  try {
    // 模拟 API 请求的逻辑
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    console.log('30天前日期:', thirtyDaysAgo)
    console.log('\n=== 测试各项数据 ===\n')

    // 1. 用户增长
    const userGrowth: any = await prisma.$queryRaw`
      SELECT
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM User
      WHERE createdAt >= ${thirtyDaysAgo}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `
    console.log('1. 用户增长数据:', JSON.stringify(userGrowth, null, 2))

    // 2. 题目难度分布
    const difficultyDistribution = await prisma.question.groupBy({
      by: ['difficulty', 'examType'],
      _count: {
        id: true
      }
    })
    console.log('\n2. 题目难度分布:', JSON.stringify(difficultyDistribution, null, 2))

    // 3. 分类统计
    const categoryStats = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: {
        questions: {
          _count: 'desc'
        }
      },
      take: 10
    })
    console.log('\n3. 分类统计 (Top 10):')
    categoryStats.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.code}): ${cat._count.questions} 题目`)
    })

    // 4. 订阅分布
    const subscriptionStats = await prisma.userExamSubscription.groupBy({
      by: ['examType', 'isActive'],
      _count: {
        id: true
      }
    })
    console.log('\n4. 订阅分布:', JSON.stringify(subscriptionStats, null, 2))

    // 检查 BigInt 问题
    console.log('\n=== 检查数据类型 ===')
    if (userGrowth.length > 0) {
      console.log('userGrowth[0].count 类型:', typeof userGrowth[0].count)
      console.log('userGrowth[0].count 值:', userGrowth[0].count)
    }

  } catch (error) {
    console.error('错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPI()
