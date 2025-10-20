import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 各Domain的目标题目数
const domainsConfig = [
  { code: 'DOMAIN_2_DIAGNOSIS', name: 'Domain 2: Diagnosis & Treatment', current: 66, target: 100 },
  { code: 'DOMAIN_3C_ADJUNCTIVE', name: 'Domain 3C: Adjunctive Therapies', current: 1, target: 60 },
  { code: 'DOMAIN_3D_HERBAL', name: 'Domain 3D: Herbal Therapy', current: 15, target: 80 },
  { code: 'DOMAIN_4_PROFESSIONAL', name: 'Domain 4: Professional Responsibilities', current: 5, target: 40 }
]

async function regenerateAllDomains() {
  console.log('开始补充生成题目...\n')
  console.log('='.repeat(70))

  for (const domain of domainsConfig) {
    const neededCount = domain.target - domain.current
    if (neededCount <= 0) {
      console.log(`✓ ${domain.code}: 无需生成（当前${domain.current}道）`)
      continue
    }

    console.log(`\n📚 ${domain.name}`)
    console.log(`   当前: ${domain.current} 道 | 目标: ${domain.target} 道 | 需要生成: ${neededCount} 道`)
    console.log('-'.repeat(70))

    // 获取分类ID
    const category = await prisma.category.findFirst({
      where: { code: domain.code, examType: 'cale' }
    })

    if (!category) {
      console.error(`   ✗ 找不到分类: ${domain.code}\n`)
      continue
    }

    // 调用生成API
    try {
      const response = await fetch('http://localhost:3000/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'domain',
          categoryId: category.id,
          count: neededCount,
          difficultyDistribution: { easy: 30, medium: 50, hard: 20 },
          avoidDuplicates: true
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      const generated = result.generated || 0
      const skipped = result.skipped || 0
      
      console.log(`   ✓ 成功生成: ${generated} 道`)
      if (skipped > 0) {
        console.log(`   ⊘ 跳过重复: ${skipped} 道`)
      }

      // 等待2秒，避免请求过快
      await new Promise(resolve => setTimeout(resolve, 2000))

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`   ✗ 生成失败: ${errorMessage}\n`)
    }
  }

  // 最终统计
  console.log('\n' + '='.repeat(70))
  console.log('📊 最终统计')
  console.log('='.repeat(70) + '\n')

  const totalQuestions = await prisma.question.count({ where: { examType: 'cale' } })
  console.log(`CALE题库总计: ${totalQuestions} 道题目\n`)

  const categories = await prisma.category.findMany({
    where: { examType: 'cale', type: 'content' },
    include: { _count: { select: { questions: true } } },
    orderBy: { code: 'asc' }
  })

  console.log('各Domain题目统计：')
  categories.forEach(cat => {
    const count = cat._count.questions
    const status = count >= 50 ? '✓' : count >= 20 ? '⚠' : '✗'
    console.log(`  ${status} ${cat.code}: ${count} 道题目`)
  })

  // 质量检查
  const placeholders = await prisma.question.count({
    where: {
      examType: 'cale',
      OR: [
        { correctAnswer: { contains: '正确答案' } },
        { correctAnswer: { contains: '选项B' } },
        { options: { contains: '正确答案' } }
      ]
    }
  })

  console.log('\n质量检查：')
  if (placeholders > 0) {
    console.log(`  ⚠ 警告: 发现 ${placeholders} 道题目包含占位符`)
  } else {
    console.log(`  ✓ 所有题目质量检查通过！`)
  }
}

regenerateAllDomains()
  .then(() => {
    console.log('\n' + '='.repeat(70))
    console.log('✅ 补充生成完成！')
    console.log('='.repeat(70))
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 生成过程出错:', error)
    process.exit(1)
  })
