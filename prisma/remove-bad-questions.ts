import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function removeBadQuestions() {
  console.log('开始扫描并删除有问题的题目...\n')

  // 查找所有有问题的题目
  const badQuestions = await prisma.question.findMany({
    where: {
      examType: 'cale',
      OR: [
        { correctAnswer: { contains: '正确答案' } },
        { correctAnswer: { contains: '选项B' } },
        { correctAnswer: { contains: '选项C' } },
        { correctAnswer: { contains: '选项D' } },
        { options: { contains: '正确答案' } },
        { options: { contains: '选项B' } },
        { options: { contains: '选项C' } },
        { options: { contains: '选项D' } },
        { explanation: null },
        { explanation: '' }
      ]
    },
    select: {
      id: true,
      question: true,
      correctAnswer: true,
      explanation: true
    }
  })

  console.log(`找到 ${badQuestions.length} 道有问题的题目\n`)

  // 显示前10道有问题的题目
  console.log('示例问题题目：')
  badQuestions.slice(0, 10).forEach((q, index) => {
    console.log(`${index + 1}. ${q.question.substring(0, 50)}...`)
    console.log(`   正确答案: ${q.correctAnswer}`)
    console.log(`   解析: ${q.explanation || '(无解析)'}`)
    console.log()
  })

  // 询问确认
  console.log(`\n准备删除这 ${badQuestions.length} 道有问题的题目...\n`)

  // 删除这些题目
  const result = await prisma.question.deleteMany({
    where: {
      examType: 'cale',
      OR: [
        { correctAnswer: { contains: '正确答案' } },
        { correctAnswer: { contains: '选项B' } },
        { correctAnswer: { contains: '选项C' } },
        { correctAnswer: { contains: '选项D' } },
        { options: { contains: '正确答案' } },
        { options: { contains: '选项B' } },
        { options: { contains: '选项C' } },
        { options: { contains: '选项D' } },
        { explanation: null },
        { explanation: '' }
      ]
    }
  })

  console.log(`✓ 成功删除 ${result.count} 道有问题的题目\n`)

  // 统计剩余题目
  const remainingCount = await prisma.question.count({
    where: { examType: 'cale' }
  })

  console.log(`CALE题库剩余: ${remainingCount} 道题目`)

  // 按分类统计
  const categoryStats = await prisma.$queryRaw`
    SELECT
      c.name as categoryName,
      c.code as categoryCode,
      COUNT(q.id) as questionCount
    FROM Category c
    LEFT JOIN Question q ON c.id = q.categoryId AND q.examType = 'cale'
    WHERE c.examType = 'cale' AND c.type = 'content'
    GROUP BY c.id
    ORDER BY c.code
  ` as any[]

  console.log('\n各分类题目统计：')
  categoryStats.forEach(stat => {
    console.log(`  ${stat.categoryCode} (${stat.categoryName}): ${stat.questionCount} 道题目`)
  })
}

removeBadQuestions()
  .then(() => {
    console.log('\n清理完成！')
    process.exit(0)
  })
  .catch((error) => {
    console.error('清理过程出错:', error)
    process.exit(1)
  })
