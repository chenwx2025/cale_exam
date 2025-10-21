import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUserIdIssue() {
  try {
    console.log('=== 检查 userId 字段问题 ===\n')

    // 1. 查找demo用户
    const user = await prisma.user.findUnique({
      where: { email: 'demo@cale.com' }
    })

    if (!user) {
      console.log('未找到demo用户')
      return
    }

    console.log('Demo用户信息:')
    console.log('  ID:', user.id)
    console.log('  Email:', user.email)
    console.log('  Name:', user.name)

    console.log('\n=== 检查 Exam 表的 userId 字段 ===\n')

    // 2. 查看Exam表的所有记录
    const allExams = await prisma.exam.findMany({
      select: {
        id: true,
        title: true,
        userId: true,
        examType: true,
        status: true,
        mode: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('Exam 表中的所有记录数:', allExams.length)

    if (allExams.length > 0) {
      console.log('\n所有考试记录:')
      allExams.forEach((exam, index) => {
        console.log(`\n${index + 1}. ${exam.title}`)
        console.log('   ID:', exam.id)
        console.log('   userId:', exam.userId)
        console.log('   userId匹配Demo用户?', exam.userId === user.id ? '✓ 是' : '✗ 否')
        console.log('   examType:', exam.examType)
        console.log('   status:', exam.status)
        console.log('   mode:', exam.mode || 'null')
        console.log('   创建时间:', exam.createdAt)
      })

      // 统计
      const matchingExams = allExams.filter(e => e.userId === user.id)
      const completedExams = allExams.filter(e => e.status === 'completed')
      const completedMatchingExams = allExams.filter(e => e.userId === user.id && e.status === 'completed')

      console.log('\n=== 统计 ===')
      console.log('总考试数:', allExams.length)
      console.log('属于Demo用户的考试数:', matchingExams.length)
      console.log('状态为completed的考试数:', completedExams.length)
      console.log('属于Demo用户且已完成的考试数:', completedMatchingExams.length)
    } else {
      console.log('\n✓ Exam表中没有任何记录')
    }

    console.log('\n=== 检查 StudyPlan 表的 userId 字段 ===\n')

    // 3. 查看StudyPlan表的所有记录
    const allPlans = await prisma.studyPlan.findMany({
      select: {
        id: true,
        name: true,
        userId: true,
        examType: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('StudyPlan 表中的所有记录数:', allPlans.length)

    if (allPlans.length > 0) {
      console.log('\n所有学习计划记录:')
      allPlans.forEach((plan, index) => {
        console.log(`\n${index + 1}. ${plan.name}`)
        console.log('   ID:', plan.id)
        console.log('   userId:', plan.userId)
        console.log('   userId匹配Demo用户?', plan.userId === user.id ? '✓ 是' : '✗ 否')
        console.log('   examType:', plan.examType)
        console.log('   isActive:', plan.isActive)
        console.log('   创建时间:', plan.createdAt)
      })

      // 统计
      const matchingPlans = allPlans.filter(p => p.userId === user.id)
      const activePlans = allPlans.filter(p => p.isActive)
      const activeMatchingPlans = allPlans.filter(p => p.userId === user.id && p.isActive)

      console.log('\n=== 统计 ===')
      console.log('总学习计划数:', allPlans.length)
      console.log('属于Demo用户的计划数:', matchingPlans.length)
      console.log('状态为active的计划数:', activePlans.length)
      console.log('属于Demo用户且活跃的计划数:', activeMatchingPlans.length)
    } else {
      console.log('\n✓ StudyPlan表中没有任何记录')
    }

    console.log('\n=== 检查所有用户 ===\n')

    // 4. 列出所有用户
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('系统中的所有用户数:', allUsers.length)
    allUsers.forEach((u, index) => {
      console.log(`\n${index + 1}. ${u.email}`)
      console.log('   ID:', u.id)
      console.log('   Name:', u.name || '(无)')
      console.log('   创建时间:', u.createdAt)
    })

    // 5. 检查是否有考试属于其他用户
    if (allExams.length > 0 && allUsers.length > 1) {
      console.log('\n=== 考试归属分析 ===\n')
      for (const u of allUsers) {
        const userExams = allExams.filter(e => e.userId === u.id)
        if (userExams.length > 0) {
          console.log(`用户 ${u.email} 的考试数: ${userExams.length}`)
          userExams.forEach(exam => {
            console.log(`  - ${exam.title} (状态: ${exam.status})`)
          })
        }
      }
    }

  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserIdIssue()
