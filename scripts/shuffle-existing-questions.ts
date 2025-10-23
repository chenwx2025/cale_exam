/**
 * 批量更新现有题目的选项顺序
 *
 * 此脚本会：
 * 1. 读取所有现有题目
 * 2. 随机打乱每道题目的选项顺序
 * 3. 更新正确答案为新的字母位置
 * 4. 保存到数据库
 *
 * 运行方法：
 * npx tsx scripts/shuffle-existing-questions.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 随机打乱选项数组，并返回新的正确答案
function shuffleOptions(options: string[], correctAnswer: string): { shuffledOptions: string[], newCorrectAnswer: string } {
  // 找到原始正确答案的索引
  const correctIndex = options.findIndex(opt => {
    // 尝试多种匹配方式
    if (opt === correctAnswer) return true
    if (opt.includes(correctAnswer.replace(/^[A-D]\.\s*/, ''))) return true
    // 提取字母进行匹配
    const optLetter = opt.match(/^([A-D])\./)?.[1]
    const answerLetter = correctAnswer.match(/^([A-D])\./)?.[1]
    return optLetter === answerLetter
  })

  if (correctIndex === -1) {
    console.warn(`⚠️  无法找到正确答案: ${correctAnswer}`)
    console.warn(`   选项: ${JSON.stringify(options)}`)
    return { shuffledOptions: options, newCorrectAnswer: correctAnswer }
  }

  // 提取选项内容（去除 A. B. C. D. 前缀）
  const cleanOptions = options.map(opt => opt.replace(/^[A-D]\.\s*/, ''))

  // Fisher-Yates 洗牌算法
  const shuffled = [...cleanOptions]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  // 找到正确答案在打乱后的位置
  const correctContent = cleanOptions[correctIndex]
  const newCorrectIndex = shuffled.findIndex(opt => opt === correctContent)

  // 重新添加字母前缀
  const shuffledWithPrefix = shuffled.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`)
  const newCorrectAnswer = shuffledWithPrefix[newCorrectIndex]

  return { shuffledOptions: shuffledWithPrefix, newCorrectAnswer }
}

async function main() {
  console.log('🔄 开始批量更新题目选项顺序...\n')

  // 获取所有题目
  const questions = await prisma.question.findMany({
    where: {
      type: 'multiple_choice' // 只处理选择题
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  console.log(`📊 找到 ${questions.length} 道选择题\n`)

  let updated = 0
  let skipped = 0
  let errors = 0

  const stats: Record<string, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    other: 0
  }

  for (const question of questions) {
    try {
      // 解析选项
      let options: string[] = []
      try {
        options = JSON.parse(question.options || '[]')
      } catch (e) {
        console.warn(`⚠️  题目 ${question.id} 选项解析失败，跳过`)
        skipped++
        continue
      }

      if (options.length !== 4) {
        console.warn(`⚠️  题目 ${question.id} 选项数量不是4个 (${options.length})，跳过`)
        skipped++
        continue
      }

      // 打乱选项
      const { shuffledOptions, newCorrectAnswer } = shuffleOptions(options, question.correctAnswer)

      // 检查是否真的改变了
      const oldLetter = question.correctAnswer.match(/^([A-D])\./)?.[1] || question.correctAnswer.charAt(0)
      const newLetter = newCorrectAnswer.match(/^([A-D])\./)?.[1] || newCorrectAnswer.charAt(0)

      // 更新数据库
      await prisma.question.update({
        where: { id: question.id },
        data: {
          options: JSON.stringify(shuffledOptions),
          correctAnswer: newCorrectAnswer
        }
      })

      // 统计新的答案分布
      if (newLetter && ['A', 'B', 'C', 'D'].includes(newLetter)) {
        stats[newLetter]++
      } else {
        stats.other++
      }

      updated++

      // 每100道题显示一次进度
      if (updated % 100 === 0) {
        console.log(`✅ 已更新 ${updated} 道题目...`)
      }

      // 显示部分改变的例子
      if (updated <= 5) {
        console.log(`   题目 ${question.id}: ${oldLetter} → ${newLetter}`)
      }

    } catch (error: any) {
      console.error(`❌ 更新题目 ${question.id} 失败:`, error.message)
      errors++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📈 更新完成统计')
  console.log('='.repeat(60))
  console.log(`✅ 成功更新: ${updated} 道题目`)
  console.log(`⏭️  跳过: ${skipped} 道题目`)
  console.log(`❌ 错误: ${errors} 道题目`)
  console.log()
  console.log('📊 新的答案分布:')
  console.log(`   答案 A: ${stats.A} 道 (${(stats.A / updated * 100).toFixed(1)}%)`)
  console.log(`   答案 B: ${stats.B} 道 (${(stats.B / updated * 100).toFixed(1)}%)`)
  console.log(`   答案 C: ${stats.C} 道 (${(stats.C / updated * 100).toFixed(1)}%)`)
  console.log(`   答案 D: ${stats.D} 道 (${(stats.D / updated * 100).toFixed(1)}%)`)
  if (stats.other > 0) {
    console.log(`   其他格式: ${stats.other} 道 (${(stats.other / updated * 100).toFixed(1)}%)`)
  }
  console.log('='.repeat(60))
  console.log()

  // 验证：重新查询数据库确认更新
  console.log('🔍 验证数据库中的答案分布...\n')

  const verification = await prisma.$queryRaw<Array<{total: number, answer: string, count: number, percent: number}>>`
    SELECT
      COUNT(*) as total,
      CASE
        WHEN correctAnswer LIKE 'A.%' THEN 'A'
        WHEN correctAnswer LIKE 'B.%' THEN 'B'
        WHEN correctAnswer LIKE 'C.%' THEN 'C'
        WHEN correctAnswer LIKE 'D.%' THEN 'D'
        ELSE 'Other'
      END as answer,
      COUNT(*) as count
    FROM Question
    WHERE type = 'multiple_choice'
    GROUP BY answer
  `

  const total = questions.length
  console.log('📊 数据库验证结果:')
  for (const row of verification) {
    const percent = (Number(row.count) / total * 100).toFixed(1)
    console.log(`   答案 ${row.answer}: ${row.count} 道 (${percent}%)`)
  }

  console.log('\n✨ 脚本执行完成！')
}

main()
  .catch((e) => {
    console.error('❌ 脚本执行失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
