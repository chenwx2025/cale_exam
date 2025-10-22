import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkBaganContent() {
  try {
    const category = await prisma.category.findFirst({
      where: { code: 'DOMAIN_1_ASSESSMENT' }
    })

    if (!category?.keyPoints) {
      console.log('❌ 未找到数据')
      return
    }

    const keyPoints = JSON.parse(category.keyPoints)
    const baganPoint = keyPoints.find((p: any) => p.title === '八纲辨证')

    if (!baganPoint) {
      console.log('❌ 未找到八纲辨证知识点')
      return
    }

    console.log('📊 八纲辨证当前内容：\n')
    console.log('标题:', baganPoint.title)
    console.log('描述:', baganPoint.description?.substring(0, 100) + '...')
    console.log('\n📋 关键方药数量:', baganPoint.keyFormulas?.length || 0)

    if (baganPoint.keyFormulas && baganPoint.keyFormulas.length > 0) {
      console.log('\n当前方药列表：')
      baganPoint.keyFormulas.forEach((formula: string, index: number) => {
        console.log(`  ${index + 1}. ${formula.split('\n')[0]}`)
      })
    }

    console.log('\n💡 详细解释长度:', baganPoint.detailedExplanation?.length || 0, '字符')
    console.log('📚 临床案例数量:', baganPoint.clinicalCases?.length || 0)
    console.log('⚠️  常见错误数量:', baganPoint.commonMistakes?.length || 0)

  } catch (error) {
    console.error('检查失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBaganContent()
