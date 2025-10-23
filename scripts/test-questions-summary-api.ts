/**
 * 测试题目统计摘要 API
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testQuestionsSummaryAPI() {
  console.log('=== 测试题目统计摘要 API ===\n')

  try {
    const examType = 'cale'

    // 1. Category stats
    console.log('📊 加载分类统计...')
    const categoryStats = await prisma.category.findMany({
      where: { examType },
      include: {
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { code: 'asc' }
    })
    console.log(`✅ 找到 ${categoryStats.length} 个分类`)
    console.log('前3个分类:', categoryStats.slice(0, 3).map(c => ({
      name: c.name,
      questionCount: c._count.questions
    })))

    // 2. Total questions
    const totalQuestions = await prisma.question.count({
      where: { examType }
    })
    console.log(`\n✅ 总题目数: ${totalQuestions}`)

    // 3. Domain stats
    const domainStats = await prisma.question.groupBy({
      by: ['domain'],
      where: {
        examType,
        domain: { not: null }
      },
      _count: { id: true },
      orderBy: { domain: 'asc' }
    })
    console.log(`\n✅ Domain 统计:`)
    domainStats.forEach(stat => {
      console.log(`  - ${stat.domain}: ${stat._count.id} 题`)
    })

    // 4. Difficulty stats
    const difficultyStats = await prisma.question.groupBy({
      by: ['difficulty'],
      where: { examType },
      _count: { id: true }
    })
    console.log(`\n✅ 难度统计:`)
    difficultyStats.forEach(stat => {
      console.log(`  - ${stat.difficulty}: ${stat._count.id} 题`)
    })

    // 5. Recent questions
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentQuestions = await prisma.question.count({
      where: {
        examType,
        createdAt: { gte: thirtyDaysAgo }
      }
    })
    console.log(`\n✅ 最近 30 天新增: ${recentQuestions} 题`)

    console.log('\n✅ 所有API调用成功！')

  } catch (error) {
    console.error('❌ 测试失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testQuestionsSummaryAPI()
