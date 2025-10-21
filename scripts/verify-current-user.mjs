import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyCurrentUser() {
  try {
    console.log('=== 验证所有用户的考试统计 ===\n')

    // 获取所有用户
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    console.log(`系统中共有 ${allUsers.length} 个用户\n`)

    // 为每个用户统计数据
    for (const user of allUsers) {
      console.log('─'.repeat(60))
      console.log(`用户: ${user.email} (${user.name || '无名称'})`)
      console.log(`ID: ${user.id}`)
      console.log('─'.repeat(60))

      // 统计学习计划
      const studyPlans = await prisma.studyPlan.count({
        where: {
          userId: user.id,
          examType: 'cale',
          isActive: true
        }
      })

      // 统计已完成的考试
      const completedExams = await prisma.exam.count({
        where: {
          userId: user.id,
          examType: 'cale',
          status: 'completed'
        }
      })

      // 统计所有考试
      const allExams = await prisma.exam.count({
        where: {
          userId: user.id,
          examType: 'cale'
        }
      })

      // 统计错题
      const wrongQuestions = await prisma.wrongQuestion.count({
        where: {
          userId: user.id,
          question: {
            examType: 'cale'
          }
        }
      })

      // 获取已完成考试的详细信息
      const completedExamDetails = await prisma.exam.findMany({
        where: {
          userId: user.id,
          examType: 'cale',
          status: 'completed'
        },
        select: {
          id: true,
          title: true,
          score: true,
          completedAt: true
        },
        orderBy: {
          completedAt: 'desc'
        }
      })

      console.log('\n📊 统计数据（CALE考试）:')
      console.log(`  活跃学习计划: ${studyPlans}`)
      console.log(`  已完成考试: ${completedExams}`)
      console.log(`  所有考试: ${allExams}`)
      console.log(`  错题数量: ${wrongQuestions}`)

      if (completedExamDetails.length > 0) {
        console.log('\n📝 已完成考试详情:')
        completedExamDetails.forEach((exam, index) => {
          console.log(`  ${index + 1}. ${exam.title}`)
          console.log(`     分数: ${exam.score}`)
          console.log(`     完成时间: ${exam.completedAt}`)
        })
      }

      console.log('\n')
    }

    console.log('='.repeat(60))
    console.log('🔍 请检查上面的统计数据')
    console.log('='.repeat(60))
    console.log('\n如果您在 dashboard 上看到的数据与上面某个用户的数据匹配，')
    console.log('说明您当前登录的是那个用户的账号。\n')
    console.log('建议操作:')
    console.log('1. 打开浏览器开发者工具 (F12)')
    console.log('2. 进入 Application -> Local Storage')
    console.log('3. 查看存储的 user 信息，确认当前登录的用户ID')
    console.log('4. 或者清除 localStorage 并重新登录\n')

  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyCurrentUser()
