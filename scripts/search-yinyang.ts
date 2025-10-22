import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function searchYinYang() {
  console.log('搜索包含"阴阳"的知识点...\n')

  // 查询所有内容分类
  const categories = await prisma.category.findMany({
    where: {
      examType: 'cale',
      type: 'content'
    },
    orderBy: [
      { order: 'asc' },
      { code: 'asc' }
    ]
  })

  console.log(`总共找到 ${categories.length} 个内容分类\n`)

  for (const category of categories) {
    // 检查分类名称
    if (category.name.includes('阴阳') || category.nameEn?.includes('yin') || category.nameEn?.includes('yang')) {
      console.log(`📚 分类名称包含"阴阳": ${category.name} (${category.code})`)
      console.log(`   英文名: ${category.nameEn || '无'}`)
      console.log()
    }

    // 检查描述
    if (category.description?.includes('阴阳')) {
      console.log(`📝 描述包含"阴阳": ${category.name} (${category.code})`)
      console.log(`   描述: ${category.description}`)
      console.log()
    }

    // 检查详细信息
    if (category.detailedInfo?.includes('阴阳')) {
      console.log(`📖 详细信息包含"阴阳": ${category.name} (${category.code})`)
      console.log(`   详细信息: ${category.detailedInfo.substring(0, 200)}...`)
      console.log()
    }

    // 检查学习建议
    if (category.studyTips?.includes('阴阳')) {
      console.log(`💡 学习建议包含"阴阳": ${category.name} (${category.code})`)
      console.log(`   学习建议: ${category.studyTips.substring(0, 200)}...`)
      console.log()
    }

    // 检查知识点
    if (category.keyPoints) {
      try {
        const keyPoints = JSON.parse(category.keyPoints)
        if (Array.isArray(keyPoints)) {
          for (const point of keyPoints) {
            if (point.title?.includes('阴阳') ||
                point.description?.includes('阴阳') ||
                point.detailedExplanation?.includes('阴阳') ||
                point.examples?.some((ex: string) => ex.includes('阴阳'))) {
              console.log(`⭐ 知识点包含"阴阳": ${category.name} > ${point.title}`)
              console.log(`   分类代码: ${category.code}`)
              if (point.title?.includes('阴阳')) {
                console.log(`   ✓ 标题包含"阴阳"`)
              }
              if (point.description?.includes('阴阳')) {
                console.log(`   ✓ 描述包含"阴阳"`)
              }
              if (point.detailedExplanation?.includes('阴阳')) {
                console.log(`   ✓ 详细解释包含"阴阳"`)
              }
              console.log()
            }
          }
        }
      } catch (e) {
        // JSON解析失败，跳过
      }
    }
  }

  // 搜索题目中包含阴阳的
  console.log('\n搜索题目中包含"阴阳"的内容...\n')

  const questions = await prisma.question.findMany({
    where: {
      examType: 'cale',
      OR: [
        { question: { contains: '阴阳' } },
        { explanation: { contains: '阴阳' } }
      ]
    },
    take: 5,
    include: {
      category: true
    }
  })

  console.log(`找到 ${questions.length} 道包含"阴阳"的题目（仅显示前5条）\n`)

  for (const q of questions) {
    console.log(`📝 题目 ${q.code}: ${q.question.substring(0, 100)}...`)
    console.log(`   所属分类: ${q.category?.name || '未知'}`)
    if (q.explanation?.includes('阴阳')) {
      console.log(`   解释中提到"阴阳"`)
    }
    console.log()
  }
}

searchYinYang()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
