import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkExamStats() {
  try {
    // 查找demo用户
    const user = await prisma.user.findUnique({
      where: { email: 'demo@cale.com' }
    })

    if (!user) {
      console.log('未找到demo用户')
      return
    }

    console.log('用户ID:', user.id)
    console.log('\n=== 统计数据 ===\n')

    // 学习计划数量
    const studyPlans = await prisma.studyPlan.count({
      where: {
        userId: user.id,
        examType: 'cale',
        isActive: true
      }
    })
    console.log('活跃学习计划:', studyPlans)

    // 已完成的考试数量
    const completedExams = await prisma.exam.count({
      where: {
        userId: user.id,
        examType: 'cale',
        status: 'completed'
      }
    })
    console.log('已完成考试:', completedExams)

    // 所有考试（不限状态）
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
        createdAt: true
      }
    })
    console.log('\n所有考试（不限状态）:', allExams.length)
    allExams.forEach((exam, index) => {
      console.log(`  ${index + 1}. ${exam.title} - 状态: ${exam.status}, 模式: ${exam.mode || 'null'}`)
    })

    // 错题数量
    const wrongQuestions = await prisma.wrongQuestion.count({
      where: {
        userId: user.id,
        question: {
          examType: 'cale'
        }
      }
    })
    console.log('\n错题数量:', wrongQuestions)

    // 题目总数
    const totalQuestions = await prisma.question.count({
      where: {
        examType: 'cale'
      }
    })
    console.log('CALE题目总数:', totalQuestions)

  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkExamStats()
