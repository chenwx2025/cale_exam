import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDeletedExams() {
  try {
    console.log('=== 检查考试删除情况 ===\n')

    // 查找当前登录用户 (假设是 chenwx2011@yahoo.com，因为显示3次已完成考试)
    const user = await prisma.user.findUnique({
      where: { email: 'chenwx2011@yahoo.com' }
    })

    if (!user) {
      console.log('未找到 chenwx2011@yahoo.com 用户')
      return
    }

    console.log('用户信息:')
    console.log('  Email:', user.email)
    console.log('  ID:', user.id)
    console.log('  Name:', user.name)

    console.log('\n=== 所有考试记录（包括已删除） ===\n')

    // 获取该用户的所有考试（Prisma软删除不会真正删除记录）
    const allExams = await prisma.exam.findMany({
      where: {
        userId: user.id,
        examType: 'cale'
      },
      select: {
        id: true,
        title: true,
        status: true,
        mode: true,
        score: true,
        questionCount: true,
        createdAt: true,
        completedAt: true,
        _count: {
          select: {
            answers: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`找到 ${allExams.length} 个考试记录\n`)

    if (allExams.length === 0) {
      console.log('该用户没有任何考试记录。')
      return
    }

    // 分类统计
    const statusCounts = {
      not_started: 0,
      in_progress: 0,
      completed: 0
    }

    allExams.forEach(exam => {
      if (exam.status in statusCounts) {
        statusCounts[exam.status]++
      }
    })

    console.log('📊 按状态统计:')
    console.log(`  未开始 (not_started): ${statusCounts.not_started}`)
    console.log(`  进行中 (in_progress): ${statusCounts.in_progress}`)
    console.log(`  已完成 (completed): ${statusCounts.completed}`)
    console.log(`  总计: ${allExams.length}\n`)

    // 显示所有考试详情
    console.log('📝 所有考试详情:\n')
    allExams.forEach((exam, index) => {
      console.log(`${index + 1}. ${exam.title}`)
      console.log(`   ID: ${exam.id}`)
      console.log(`   状态: ${exam.status}`)
      console.log(`   模式: ${exam.mode || 'null'}`)
      console.log(`   分数: ${exam.score !== null ? exam.score : 'N/A'}`)
      console.log(`   题目数: ${exam.questionCount}`)
      console.log(`   答案记录数: ${exam._count.answers}`)
      console.log(`   创建时间: ${exam.createdAt}`)
      console.log(`   完成时间: ${exam.completedAt || 'N/A'}`)
      console.log('')
    })

    // 检查是否有答案记录但考试已被删除的情况
    console.log('=== 检查孤立的答案记录 ===\n')

    const orphanAnswers = await prisma.examAnswer.findMany({
      where: {
        userId: user.id,
        exam: null  // 考试已被删除
      },
      select: {
        id: true,
        examId: true,
        createdAt: true
      }
    })

    if (orphanAnswers.length > 0) {
      console.log(`⚠️  发现 ${orphanAnswers.length} 条孤立的答案记录（对应的考试已被删除）`)

      // 按 examId 分组统计
      const examIdGroups = {}
      orphanAnswers.forEach(answer => {
        if (!examIdGroups[answer.examId]) {
          examIdGroups[answer.examId] = []
        }
        examIdGroups[answer.examId].push(answer)
      })

      console.log(`\n这些答案原本属于 ${Object.keys(examIdGroups).length} 个已删除的考试：`)
      Object.entries(examIdGroups).forEach(([examId, answers]) => {
        console.log(`  - 考试ID: ${examId} (${answers.length} 条答案记录)`)
      })
    } else {
      console.log('✓ 没有发现孤立的答案记录')
    }

    console.log('\n=== 结论 ===\n')
    console.log(`当前用户 ${user.email} 有:`)
    console.log(`  - ${allExams.length} 个考试记录在数据库中`)
    console.log(`  - ${statusCounts.completed} 个状态为 'completed' 的考试`)
    console.log('\n如果您之前删除过考试，这些考试应该已经从数据库中完全删除了。')
    console.log('Dashboard 显示的统计数据应该基于当前数据库中实际存在的记录。')

  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDeletedExams()
