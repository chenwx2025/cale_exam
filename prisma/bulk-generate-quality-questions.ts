import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 为每个Domain生成100道高质量题目
async function generateQualityQuestions() {
  console.log('🚀 开始生成高质量题目...\n')

  const domains = [
    { code: 'DOMAIN_1_ASSESSMENT', name: 'Domain 1: Patient Assessment', count: 100 },
    { code: 'DOMAIN_2_DIAGNOSIS', name: 'Domain 2: Diagnosis & Treatment', count: 100 },
    { code: 'DOMAIN_3A_ACU_SELECTION', name: 'Domain 3A: Acupuncture Point Selection', count: 100 },
    { code: 'DOMAIN_3B_ACU_TECHNIQUE', name: 'Domain 3B: Point Location & Needling', count: 100 },
    { code: 'DOMAIN_3C_ADJUNCTIVE', name: 'Domain 3C: Adjunctive Therapies', count: 100 },
    { code: 'DOMAIN_3D_HERBAL', name: 'Domain 3D: Herbal Therapy', count: 100 },
    { code: 'DOMAIN_4_PROFESSIONAL', name: 'Domain 4: Professional Responsibilities', count: 100 }
  ]

  let totalGenerated = 0
  let totalSaved = 0

  for (const domain of domains) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📚 正在生成: ${domain.name}`)
    console.log(`${'='.repeat(60)}`)

    // 获取对应的分类
    const category = await prisma.category.findFirst({
      where: { code: domain.code, examType: 'cale' }
    })

    if (!category) {
      console.log(`❌ 未找到分类: ${domain.code}`)
      continue
    }

    // 删除该分类下所有AI生成的题目
    const deleted = await prisma.question.deleteMany({
      where: {
        categoryId: category.id,
        source: { contains: 'AI' }
      }
    })
    console.log(`🗑️  清理旧题目: ${deleted.count} 道`)

    // 难度分配：30% Easy, 50% Medium, 20% Hard
    const easyCount = Math.round(domain.count * 0.3)
    const mediumCount = Math.round(domain.count * 0.5)
    const hardCount = domain.count - easyCount - mediumCount

    console.log(`📊 难度分配: Easy ${easyCount} | Medium ${mediumCount} | Hard ${hardCount}`)

    try {
      // 调用AI生成API
      const response = await fetch('http://localhost:3000/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'domain',
          categoryId: category.id,
          count: domain.count,
          difficultyDistribution: {
            easy: 30,
            medium: 50,
            hard: 20
          },
          avoidDuplicates: true
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      console.log(`✅ 生成成功: ${result.saved} 道题目`)
      console.log(`   - 重复过滤: ${result.duplicates} 道`)
      console.log(`   - 题目集ID: ${result.questionSetId}`)

      totalGenerated += result.generated
      totalSaved += result.saved

    } catch (error: any) {
      console.error(`❌ 生成失败: ${error.message}`)
    }

    // 等待1秒，避免过快请求
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`🎉 批量生成完成！`)
  console.log(`${'='.repeat(60)}`)
  console.log(`📊 总生成: ${totalGenerated} 道题目`)
  console.log(`💾 总保存: ${totalSaved} 道题目`)
  console.log(`🔄 去重过滤: ${totalGenerated - totalSaved} 道题目`)

  // 统计各Domain题目数量
  console.log(`\n📈 最终题库统计:`)
  for (const domain of domains) {
    const category = await prisma.category.findFirst({
      where: { code: domain.code, examType: 'cale' }
    })

    if (category) {
      const count = await prisma.question.count({
        where: { categoryId: category.id }
      })
      console.log(`   - ${domain.name}: ${count} 道题目`)
    }
  }

  const totalQuestions = await prisma.question.count({
    where: { examType: 'cale' }
  })
  console.log(`\n🎯 题库总题目数: ${totalQuestions} 道`)
}

generateQualityQuestions()
  .then(() => {
    console.log('\n✨ 所有任务完成！')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 发生错误:', error)
    process.exit(1)
  })
