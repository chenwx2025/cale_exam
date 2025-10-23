import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkBlankOptions() {
  const questions = await prisma.question.findMany({
    select: {
      id: true,
      question: true,
      options: true,
      correctAnswer: true,
      category: {
        select: {
          name: true
        }
      }
    }
  })

  console.log(`总共检查 ${questions.length} 道题目\n`)

  let issuesFound = 0
  const issueTypes = {
    emptyOptions: [] as any[],
    blankOptionText: [] as any[],
    invalidJSON: [] as any[]
  }

  for (const q of questions) {
    let hasIssue = false
    let issueDetails: string[] = []

    // 检查 options 是否为空
    if (!q.options) {
      issuesFound++
      hasIssue = true
      issueDetails.push('options字段为null')
      issueTypes.emptyOptions.push(q)
      continue
    }

    // 解析 options
    let parsedOptions: any
    try {
      parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    } catch (e) {
      issuesFound++
      hasIssue = true
      issueDetails.push('options不是有效的JSON')
      issueTypes.invalidJSON.push(q)
      continue
    }

    // 检查每个选项是否有空白文本
    if (Array.isArray(parsedOptions)) {
      for (let i = 0; i < parsedOptions.length; i++) {
        const opt = parsedOptions[i]
        const text = opt.text || opt
        if (!text || text.trim() === '') {
          issuesFound++
          hasIssue = true
          issueDetails.push(`选项${i + 1}(索引${i})文本为空`)
          issueTypes.blankOptionText.push({...q, blankOptionIndex: i})
        }
      }
    }

    if (hasIssue) {
      console.log(`❌ 问题题目 ID: ${q.id}`)
      console.log(`   分类: ${q.category.name}`)
      console.log(`   题目: ${q.question.substring(0, 60)}...`)
      console.log(`   问题: ${issueDetails.join(', ')}`)
      console.log(`   选项: ${JSON.stringify(parsedOptions, null, 2)}`)
      console.log('---\n')
    }
  }

  console.log('\n=== 检查结果汇总 ===')
  console.log(`总题目数: ${questions.length}`)
  console.log(`有问题的题目数: ${issuesFound}`)
  console.log(`\n问题分类:`)
  console.log(`  - options字段为null: ${issueTypes.emptyOptions.length}`)
  console.log(`  - 无效的JSON格式: ${issueTypes.invalidJSON.length}`)
  console.log(`  - 包含空白选项文本: ${issueTypes.blankOptionText.length}`)

  if (issuesFound === 0) {
    console.log('\n✅ 所有题目选项检查通过，没有发现空白选项！')
  } else {
    console.log('\n需要修复的题目ID列表:')
    const allIssueIds = [
      ...issueTypes.emptyOptions.map(q => q.id),
      ...issueTypes.invalidJSON.map(q => q.id),
      ...issueTypes.blankOptionText.map(q => q.id)
    ]
    console.log(allIssueIds.join(', '))
  }
}

checkBlankOptions()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
