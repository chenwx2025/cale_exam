import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCompletedExams() {
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
    console.log('\n所有已完成的考试:')

    const completedExams = await prisma.exam.findMany({
      where: {
        userId: user.id,
        examType: 'cale',
        status: 'completed'
      },
      select: {
        id: true,
        title: true,
        mode: true,
        status: true,
        score: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('已完成考试数量:', completedExams.length)
    completedExams.forEach((exam, index) => {
      console.log(`\n考试 ${index + 1}:`)
      console.log('  ID:', exam.id)
      console.log('  标题:', exam.title)
      console.log('  模式:', exam.mode)
      console.log('  状态:', exam.status)
      console.log('  分数:', exam.score)
      console.log('  创建时间:', exam.createdAt)
    })

    console.log('\n\n题目集列表查询条件的考试 (mode in ai_generated, mock, manual):')

    const questionSetExams = await prisma.exam.findMany({
      where: {
        userId: user.id,
        examType: 'cale',
        mode: {
          in: ['ai_generated', 'mock', 'manual']
        }
      },
      select: {
        id: true,
        title: true,
        mode: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('题目集数量:', questionSetExams.length)
    questionSetExams.forEach((exam, index) => {
      console.log(`\n题目集 ${index + 1}:`)
      console.log('  ID:', exam.id)
      console.log('  标题:', exam.title)
      console.log('  模式:', exam.mode)
      console.log('  状态:', exam.status)
      console.log('  创建时间:', exam.createdAt)
    })

  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCompletedExams()
