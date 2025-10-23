import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAnalyticsQueries() {
  console.log('=== 测试数据分析查询 ===\n')

  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    console.log('30天前日期:', thirtyDaysAgo.toISOString())

    // 测试 1: 用户增长趋势
    console.log('\n1. 测试用户增长趋势查询...')
    try {
      const userGrowth = await prisma.$queryRaw`
        SELECT
          DATE(createdAt) as date,
          COUNT(*) as count
        FROM User
        WHERE createdAt >= ${thirtyDaysAgo}
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `
      console.log('✅ 用户增长查询成功，记录数:', Array.isArray(userGrowth) ? userGrowth.length : 0)
    } catch (error: any) {
      console.error('❌ 用户增长查询失败:', error.message)
    }

    // 测试 2: 每日活跃用户
    console.log('\n2. 测试每日活跃用户查询...')
    try {
      const dailyActiveUsers = await prisma.$queryRaw`
        SELECT
          DATE(createdAt) as date,
          COUNT(DISTINCT userId) as count
        FROM (
          SELECT userId, createdAt FROM Exam WHERE createdAt >= ${thirtyDaysAgo}
          UNION ALL
          SELECT userId, createdAt FROM UserAnswer WHERE createdAt >= ${thirtyDaysAgo}
        ) combined
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `
      console.log('✅ 每日活跃用户查询成功，记录数:', Array.isArray(dailyActiveUsers) ? dailyActiveUsers.length : 0)
    } catch (error: any) {
      console.error('❌ 每日活跃用户查询失败:', error.message)
    }

    // 测试 3: 题目难度分布
    console.log('\n3. 测试题目难度分布查询...')
    try {
      const difficultyDistribution = await prisma.question.groupBy({
        by: ['difficulty', 'examType'],
        _count: {
          id: true
        }
      })
      console.log('✅ 题目难度分布查询成功，记录数:', difficultyDistribution.length)
    } catch (error: any) {
      console.error('❌ 题目难度分布查询失败:', error.message)
    }

    // 测试 4: 分类统计
    console.log('\n4. 测试分类统计查询...')
    try {
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
      console.log('✅ 分类统计查询成功，记录数:', categoryStats.length)
    } catch (error: any) {
      console.error('❌ 分类统计查询失败:', error.message)
    }

    // 测试 5: 考试通过率
    console.log('\n5. 测试考试通过率查询...')
    try {
      const examPassRate = await prisma.exam.groupBy({
        by: ['status'],
        _count: {
          id: true
        },
        where: {
          status: {
            in: ['completed', 'graded']
          }
        }
      })
      console.log('✅ 考试通过率查询成功，记录数:', examPassRate.length)
    } catch (error: any) {
      console.error('❌ 考试通过率查询失败:', error.message)
    }

    // 测试 6: 每日考试数量
    console.log('\n6. 测试每日考试数量查询...')
    try {
      const dailyExams = await prisma.$queryRaw`
        SELECT
          DATE(createdAt) as date,
          COUNT(*) as count
        FROM Exam
        WHERE createdAt >= ${thirtyDaysAgo}
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `
      console.log('✅ 每日考试数量查询成功，记录数:', Array.isArray(dailyExams) ? dailyExams.length : 0)
    } catch (error: any) {
      console.error('❌ 每日考试数量查询失败:', error.message)
    }

    // 测试 7: 用户订阅分布
    console.log('\n7. 测试用户订阅分布查询...')
    try {
      const subscriptionStats = await prisma.userExamSubscription.groupBy({
        by: ['examType', 'isActive'],
        _count: {
          id: true
        }
      })
      console.log('✅ 用户订阅分布查询成功，记录数:', subscriptionStats.length)
    } catch (error: any) {
      console.error('❌ 用户订阅分布查询失败:', error.message)
    }

    // 测试 8: 题目答题统计
    console.log('\n8. 测试题目答题统计查询...')
    try {
      const lowAccuracyQuestions = await prisma.question.findMany({
        select: {
          id: true,
          question: true,
          examType: true,
          difficulty: true,
          _count: {
            select: {
              userAnswers: true
            }
          }
        },
        where: {
          userAnswers: {
            some: {}
          }
        },
        orderBy: {
          userAnswers: {
            _count: 'desc'
          }
        },
        take: 10
      })
      console.log('✅ 题目答题统计查询成功，记录数:', lowAccuracyQuestions.length)
    } catch (error: any) {
      console.error('❌ 题目答题统计查询失败:', error.message)
    }

    // 测试 9: 管理员操作日志
    console.log('\n9. 测试管理员操作日志查询...')
    try {
      const adminActivityStats = await prisma.adminLog.groupBy({
        by: ['action'],
        _count: {
          id: true
        },
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      })
      console.log('✅ 管理员操作日志查询成功，记录数:', adminActivityStats.length)
    } catch (error: any) {
      console.error('❌ 管理员操作日志查询失败:', error.message)
    }

    console.log('\n=== 测试完成 ===')

  } catch (error: any) {
    console.error('\n整体测试失败:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testAnalyticsQueries()
