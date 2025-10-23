import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMissingAnswers() {
  console.log('=== 检查缺失正确答案的题目 ===\n')

  const questions = await prisma.question.findMany({
    select: {
      id: true,
      question: true,
      options: true,
      correctAnswer: true,
      difficulty: true,
      category: {
        select: {
          name: true,
          code: true
        }
      }
    }
  })

  console.log(`总共检查 ${questions.length} 道题目\n`)

  const issues = {
    noAnswer: [] as any[],
    emptyAnswer: [] as any[],
    invalidAnswer: [] as any[],
    noOptions: [] as any[]
  }

  for (const q of questions) {
    let hasIssue = false

    // 检查1: correctAnswer字段为null或undefined
    if (!q.correctAnswer) {
      issues.noAnswer.push(q)
      hasIssue = true
      console.log(`❌ 题目 ${q.id} - 无答案`)
      console.log(`   分类: ${q.category.name} (${q.category.code})`)
      console.log(`   题目: ${q.question.substring(0, 60)}...`)
      console.log(`   答案: ${q.correctAnswer}`)
      console.log('---\n')
      continue
    }

    // 检查2: correctAnswer是空字符串或空白
    if (q.correctAnswer.trim() === '') {
      issues.emptyAnswer.push(q)
      hasIssue = true
      console.log(`❌ 题目 ${q.id} - 答案为空字符串`)
      console.log(`   分类: ${q.category.name} (${q.category.code})`)
      console.log(`   题目: ${q.question.substring(0, 60)}...`)
      console.log(`   答案: "${q.correctAnswer}"`)
      console.log('---\n')
      continue
    }

    // 检查3: options为空
    if (!q.options) {
      issues.noOptions.push(q)
      hasIssue = true
      console.log(`❌ 题目 ${q.id} - 无选项`)
      console.log(`   分类: ${q.category.name} (${q.category.code})`)
      console.log(`   题目: ${q.question.substring(0, 60)}...`)
      console.log('---\n')
      continue
    }

    // 检查4: correctAnswer不在options中
    try {
      const parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options

      if (Array.isArray(parsedOptions)) {
        const optionsText = parsedOptions.map((opt: any) =>
          typeof opt === 'string' ? opt : opt.text || ''
        )

        // 检查correctAnswer是否在选项中
        const answerInOptions = optionsText.some((opt: string) =>
          opt === q.correctAnswer ||
          opt.includes(q.correctAnswer) ||
          q.correctAnswer.includes(opt)
        )

        if (!answerInOptions) {
          issues.invalidAnswer.push(q)
          console.log(`⚠️  题目 ${q.id} - 答案不在选项中`)
          console.log(`   分类: ${q.category.name} (${q.category.code})`)
          console.log(`   题目: ${q.question.substring(0, 60)}...`)
          console.log(`   答案: ${q.correctAnswer}`)
          console.log(`   选项: ${JSON.stringify(parsedOptions, null, 2)}`)
          console.log('---\n')
        }
      }
    } catch (e) {
      console.error(`   解析选项失败: ${q.id}`)
    }
  }

  console.log('\n=== 检查结果汇总 ===')
  console.log(`总题目数: ${questions.length}`)
  console.log(`\n问题分类:`)
  console.log(`  - 无答案字段 (null/undefined): ${issues.noAnswer.length}`)
  console.log(`  - 答案为空字符串: ${issues.emptyAnswer.length}`)
  console.log(`  - 答案不在选项中: ${issues.invalidAnswer.length}`)
  console.log(`  - 无选项: ${issues.noOptions.length}`)

  const totalIssues = issues.noAnswer.length + issues.emptyAnswer.length +
                      issues.invalidAnswer.length + issues.noOptions.length

  if (totalIssues === 0) {
    console.log('\n✅ 所有题目都有正确答案！')
  } else {
    console.log(`\n⚠️  共发现 ${totalIssues} 道有问题的题目`)

    console.log('\n需要删除的题目ID列表（无答案或空答案）:')
    const deleteIds = [
      ...issues.noAnswer.map(q => q.id),
      ...issues.emptyAnswer.map(q => q.id),
      ...issues.noOptions.map(q => q.id)
    ]
    if (deleteIds.length > 0) {
      console.log(deleteIds.join(', '))
    } else {
      console.log('无')
    }

    console.log('\n需要手动检查的题目ID列表（答案可能不匹配）:')
    if (issues.invalidAnswer.length > 0) {
      console.log(issues.invalidAnswer.map(q => q.id).join(', '))
    } else {
      console.log('无')
    }

    // 按分类统计问题
    console.log('\n=== 按分类统计 ===')
    const categoryStats = new Map<string, number>()
    const allIssues = [...issues.noAnswer, ...issues.emptyAnswer, ...issues.noOptions, ...issues.invalidAnswer]

    for (const q of allIssues) {
      const key = `${q.category.name} (${q.category.code})`
      categoryStats.set(key, (categoryStats.get(key) || 0) + 1)
    }

    Array.from(categoryStats.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} 道题目有问题`)
      })
  }
}

checkMissingAnswers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
