import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 需要修复的题目ID列表
const problematicIds = [
  'cmgz85z1i00nnpj0afdynbgc5', 'cmgz85z1o00o1pj0aasinhpe4', 'cmgz85z1q00o5pj0a1u8tfao2',
  'cmgz85z1r00o9pj0awyo69jjz', 'cmgz85z1s00obpj0aswo3llp7', 'cmgz85z1u00ohpj0ae7xzfpq0',
  'cmgz85z2000oxpj0as43q07u6', 'cmgz85z2000ozpj0ad0ayv4yh', 'cmgz85z2200p5pj0axbscpt9l',
  'cmgz85z2900prpj0andjqwyfk', 'cmgz85z2900ptpj0at9sax4ko', 'cmgz85z2b00pzpj0axqadz0pt',
  'cmgz85z2d00q5pj0aylyeznhn', 'cmgz85z2f00qfpj0a1lew3yre', 'cmgz85z2i00qppj0amh5c5nju',
  'cmgz85z2j00qtpj0atwo0l3kd', 'cmgz85z2k00qxpj0aw8uxksr6', 'cmgz85z2l00r1pj0ao988chez',
  'cmgz85z2l00r3pj0a0a88i7o2', 'cmgz85z2p00rfpj0a63yih5oc', 'cmgz85z2u00rxpj0awkmt9nl8',
  'cmgz85z2v00s1pj0a664vwybl', 'cmgz85z2v00s3pj0ana18rw79', 'cmh1mwuis002hrtnwji387z03'
]

async function fixAnswers() {
  console.log(`开始修复 ${problematicIds.length} 道题目的答案...\n`)

  let fixed = 0
  let failed = 0

  for (const id of problematicIds) {
    const question = await prisma.question.findUnique({
      where: { id },
      select: {
        id: true,
        question: true,
        options: true,
        correctAnswer: true
      }
    })

    if (!question) {
      console.log(`❌ 找不到题目 ${id}`)
      failed++
      continue
    }

    console.log(`\n处理题目 ${id}`)
    console.log(`题目: ${question.question}`)
    console.log(`当前答案: ${question.correctAnswer}`)

    try {
      const parsedOptions = JSON.parse(question.options as string)
      console.log(`选项: ${JSON.stringify(parsedOptions)}`)

      // 查找匹配的选项
      let newAnswer = question.correctAnswer

      // 提取答案中的关键部分
      const answerText = question.correctAnswer.split('. ')[1] || question.correctAnswer

      // 在选项中查找最匹配的
      for (const opt of parsedOptions) {
        const optText = opt.split('. ')[1] || opt

        // 检查是否包含关键词
        if (answerText.includes(optText) || optText.includes(answerText.split('或')[0])) {
          newAnswer = opt
          break
        }
      }

      // 如果找不到，使用第一个匹配字母的选项
      if (newAnswer === question.correctAnswer) {
        const answerLetter = question.correctAnswer.charAt(0)
        const matchingOption = parsedOptions.find((opt: string) => opt.startsWith(answerLetter))
        if (matchingOption) {
          newAnswer = matchingOption
        }
      }

      if (newAnswer !== question.correctAnswer) {
        await prisma.question.update({
          where: { id },
          data: { correctAnswer: newAnswer }
        })

        console.log(`✅ 已修复`)
        console.log(`新答案: ${newAnswer}`)
        fixed++
      } else {
        console.log(`⚠️  无法自动匹配，建议手动检查`)
        failed++
      }
    } catch (error) {
      console.error(`❌ 处理失败: ${error}`)
      failed++
    }
  }

  console.log(`\n\n=== 修复完成 ===`)
  console.log(`成功修复: ${fixed} 道`)
  console.log(`失败/需手动检查: ${failed} 道`)
}

fixAnswers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
