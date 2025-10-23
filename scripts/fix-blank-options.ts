import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 有问题的题目ID列表
const problematicIds = [
  'cmgz85z1h00nlpj0a28x1c8lo', 'cmgz85z1j00nppj0afi6iiq1z', 'cmgz85z1l00nvpj0a9qscb7br',
  'cmgz85z1m00nxpj0aqe69f487', 'cmgz85z1n00nzpj0ae6slxd68', 'cmgz85z1t00ofpj0ajhxnhqsx',
  'cmgz85z1y00orpj0a04v1cfwg', 'cmgz85z2200p3pj0a6cfb1l1a', 'cmgz85z2300p9pj0aesm6nwey',
  'cmgz85z2600phpj0axbcrik6k', 'cmgz85z2700pnpj0acqaeztpt', 'cmgz85z2800pppj0atauanimx',
  'cmgz85z2c00q3pj0a9era20gj', 'cmgz85z2e00qbpj0a8d85xyn4', 'cmgz85z2f00qdpj0a52r0z10p',
  'cmgz85z2j00qvpj0ab64omunx', 'cmgz85z2k00qzpj0afkpjasus', 'cmgz85z2m00r5pj0a3qwj1ol2',
  'cmgz85z2n00r9pj0ar6t92q2v', 'cmgz85z2o00rdpj0aksd42wmc', 'cmgz85z2q00rjpj0a7usu42wk',
  'cmgz85z2r00rnpj0asso4keio', 'cmgz85z2s00rppj0anv63lvgh', 'cmgz85z2s00rrpj0avms3371k',
  'cmgz85z2t00rtpj0a4yxv1r4o'
]

async function fixBlankOptions() {
  console.log(`开始修复 ${problematicIds.length} 道有问题的题目...\n`)

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
      continue
    }

    console.log(`\n处理题目 ${id}`)
    console.log(`题目: ${question.question}`)
    console.log(`当前选项: ${question.options}`)

    // 这些题目都只有空白选项，我们需要删除它们
    // 因为它们没有有效的选项数据，无法修复
    console.log(`⚠️  删除无效题目...`)

    await prisma.question.delete({
      where: { id }
    })

    console.log(`✅ 已删除`)
  }

  console.log(`\n\n=== 修复完成 ===`)
  console.log(`共删除 ${problematicIds.length} 道无效题目`)

  // 验证修复结果
  const remaining = await prisma.question.findMany({
    where: {
      id: {
        in: problematicIds
      }
    }
  })

  console.log(`\n验证: 剩余问题题目数 = ${remaining.length}`)

  if (remaining.length === 0) {
    console.log('✅ 所有问题题目已成功删除！')
  } else {
    console.log('❌ 还有题目未删除:')
    remaining.forEach(q => console.log(`  - ${q.id}`))
  }
}

fixBlankOptions()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
