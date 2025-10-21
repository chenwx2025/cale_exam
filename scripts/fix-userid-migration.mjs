import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixUserIdMigration() {
  try {
    console.log('=== 修复 userId 迁移问题 ===\n')

    // 目标：将所有使用字符串 "demo-user" 的记录迁移到正确的demo用户ID

    // 1. 找到正确的demo用户
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@cale.com' }
    })

    if (!demoUser) {
      console.log('错误：未找到 demo@cale.com 用户')
      return
    }

    console.log('目标用户:')
    console.log('  Email: demo@cale.com')
    console.log('  正确的ID:', demoUser.id)

    const oldUserId = 'demo-user'
    const newUserId = demoUser.id

    console.log('\n将要迁移的数据:')
    console.log('  从 userId:', oldUserId)
    console.log('  到 userId:', newUserId)

    // 2. 更新 Exam 表
    const examsToUpdate = await prisma.exam.count({
      where: { userId: oldUserId }
    })
    console.log(`\n找到 ${examsToUpdate} 个考试记录需要更新...`)

    if (examsToUpdate > 0) {
      const examResult = await prisma.exam.updateMany({
        where: { userId: oldUserId },
        data: { userId: newUserId }
      })
      console.log(`✓ 已更新 ${examResult.count} 个考试记录`)
    }

    // 3. 更新 StudyPlan 表
    const plansToUpdate = await prisma.studyPlan.count({
      where: { userId: oldUserId }
    })
    console.log(`\n找到 ${plansToUpdate} 个学习计划需要更新...`)

    if (plansToUpdate > 0) {
      const planResult = await prisma.studyPlan.updateMany({
        where: { userId: oldUserId },
        data: { userId: newUserId }
      })
      console.log(`✓ 已更新 ${planResult.count} 个学习计划记录`)
    }

    // 4. 更新 WrongQuestion 表
    const wrongQuestionsToUpdate = await prisma.wrongQuestion.count({
      where: { userId: oldUserId }
    })
    console.log(`\n找到 ${wrongQuestionsToUpdate} 个错题记录需要更新...`)

    if (wrongQuestionsToUpdate > 0) {
      const wrongQuestionResult = await prisma.wrongQuestion.updateMany({
        where: { userId: oldUserId },
        data: { userId: newUserId }
      })
      console.log(`✓ 已更新 ${wrongQuestionResult.count} 个错题记录`)
    }

    // 5. 更新 ExamAnswer 表
    const answersToUpdate = await prisma.examAnswer.count({
      where: { userId: oldUserId }
    })
    console.log(`\n找到 ${answersToUpdate} 个考试答案记录需要更新...`)

    if (answersToUpdate > 0) {
      const answerResult = await prisma.examAnswer.updateMany({
        where: { userId: oldUserId },
        data: { userId: newUserId }
      })
      console.log(`✓ 已更新 ${answerResult.count} 个考试答案记录`)
    }

    // 6. 更新 StudyPlanItem 表
    const itemsToUpdate = await prisma.studyPlanItem.count({
      where: { userId: oldUserId }
    })
    console.log(`\n找到 ${itemsToUpdate} 个学习计划项目需要更新...`)

    if (itemsToUpdate > 0) {
      const itemResult = await prisma.studyPlanItem.updateMany({
        where: { userId: oldUserId },
        data: { userId: newUserId }
      })
      console.log(`✓ 已更新 ${itemResult.count} 个学习计划项目记录`)
    }

    console.log('\n=== 迁移完成 ===')
    console.log('\n验证迁移结果...\n')

    // 验证
    const finalExamCount = await prisma.exam.count({
      where: { userId: newUserId }
    })
    const finalPlanCount = await prisma.studyPlan.count({
      where: { userId: newUserId }
    })
    const finalWrongCount = await prisma.wrongQuestion.count({
      where: { userId: newUserId }
    })

    console.log(`demo@cale.com 用户现在拥有:`)
    console.log(`  - ${finalExamCount} 个考试记录`)
    console.log(`  - ${finalPlanCount} 个学习计划`)
    console.log(`  - ${finalWrongCount} 个错题记录`)

    // 检查是否还有使用旧ID的记录
    const remainingExams = await prisma.exam.count({
      where: { userId: oldUserId }
    })
    const remainingPlans = await prisma.studyPlan.count({
      where: { userId: oldUserId }
    })

    if (remainingExams === 0 && remainingPlans === 0) {
      console.log('\n✓ 所有记录已成功迁移，没有遗留旧ID的数据')
    } else {
      console.log(`\n⚠ 警告：仍有 ${remainingExams + remainingPlans} 条记录使用旧ID`)
    }

  } catch (error) {
    console.error('迁移失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 询问用户确认
console.log('此脚本将把所有 userId="demo-user" 的记录迁移到 demo@cale.com 用户')
console.log('是否继续？ (直接运行脚本表示同意)\n')

fixUserIdMigration()
