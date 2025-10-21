import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugExamOwnership() {
  try {
    console.log('=== 调试考试所有权问题 ===\n')

    // 获取所有用户
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    console.log(`系统中有 ${users.length} 个用户:\n`)
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (ID: ${user.id})`)
    })

    console.log('\n=== 检查所有考试的userId ===\n')

    const allExams = await prisma.exam.findMany({
      where: {
        examType: 'cale'
      },
      select: {
        id: true,
        title: true,
        userId: true,
        status: true,
        mode: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`共有 ${allExams.length} 个CALE考试\n`)

    // 按userId分组
    const examsByUser = {}
    allExams.forEach(exam => {
      if (!examsByUser[exam.userId]) {
        examsByUser[exam.userId] = []
      }
      examsByUser[exam.userId].push(exam)
    })

    for (const [userId, exams] of Object.entries(examsByUser)) {
      const user = users.find(u => u.id === userId)
      const userInfo = user ? `${user.email} (${user.name})` : '未知用户'

      console.log(`\n用户: ${userInfo}`)
      console.log(`userId: ${userId}`)
      console.log(`考试数: ${exams.length}`)
      console.log('考试列表:')

      exams.forEach((exam, index) => {
        console.log(`  ${index + 1}. ${exam.title}`)
        console.log(`     ID: ${exam.id}`)
        console.log(`     状态: ${exam.status}`)
        console.log(`     模式: ${exam.mode || 'null'}`)
        console.log(`     创建时间: ${exam.createdAt}`)
      })
    }

    console.log('\n=== 验证删除权限 ===\n')
    console.log('如果您使用某个账号登录，只能删除该账号userId对应的考试。')
    console.log('如果删除失败并提示"无权删除"，说明:')
    console.log('1. 您当前登录的userId与考试的userId不匹配')
    console.log('2. 可能是之前的userId迁移没有完全完成\n')

  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugExamOwnership()
