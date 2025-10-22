import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkFirstCategory() {
  try {
    const category = await prisma.category.findFirst({
      where: {
        examType: 'cale',
        type: 'content',
        code: 'DOMAIN_1_ASSESSMENT'
      }
    })

    if (!category) {
      console.log('❌ 未找到分类')
      return
    }

    console.log(`分类: ${category.name}`)
    console.log(`Code: ${category.code}`)
    console.log(`keyPoints字段长度: ${category.keyPoints?.length || 0}`)
    console.log('\n')

    if (category.keyPoints) {
      try {
        const parsed = JSON.parse(category.keyPoints)
        console.log(`解析成功，包含 ${parsed.length} 个知识点\n`)

        parsed.forEach((point: any, index: number) => {
          console.log(`${index + 1}. ${point.title}`)
          console.log(`   描述长度: ${point.description?.length || 0}`)
          console.log(`   有详细解释: ${!!point.detailedExplanation}`)
          console.log(`   有示例: ${!!point.examples && point.examples.length > 0}`)
          console.log(`   有临床案例: ${!!point.clinicalCases && point.clinicalCases.length > 0}`)
          console.log(`   有思维导图: ${!!point.mindMapData}`)
          console.log('')
        })
      } catch (e) {
        console.error('解析JSON失败:', e)
        console.log('\n原始内容前500字符:')
        console.log(category.keyPoints.substring(0, 500))
      }
    } else {
      console.log('⚠️  keyPoints 字段为空')
    }

  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkFirstCategory()
