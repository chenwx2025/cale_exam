import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function showCurrentCases() {
  try {
    const category = await prisma.category.findFirst({
      where: { code: 'DOMAIN_1_ASSESSMENT' }
    })

    if (!category || !category.keyPoints) {
      console.log('❌ 未找到数据')
      return
    }

    const keyPoints = JSON.parse(category.keyPoints)
    const wuxing = keyPoints.find((p: any) => p.title === '五行学说')

    if (wuxing && wuxing.clinicalCases) {
      console.log('当前案例格式示例：\n')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      console.log(wuxing.clinicalCases[0])
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      console.log(`总共有 ${wuxing.clinicalCases.length} 个案例`)
    }

  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

showCurrentCases()
