import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function compare() {
  try {
    const category = await prisma.category.findFirst({
      where: { code: 'DOMAIN_1_ASSESSMENT' }
    })

    if (!category?.keyPoints) {
      console.log('❌ 未找到数据')
      return
    }

    const keyPoints = JSON.parse(category.keyPoints)

    // 查找阴阳学说
    const yinyangPoint = keyPoints.find((p: any) => p.title === '阴阳学说')

    // 查找八纲辨证
    const baganPoint = keyPoints.find((p: any) => p.title === '八纲辨证')

    console.log('🔍 对比思维导图数据结构：\n')

    if (yinyangPoint?.mindMapData) {
      console.log('【阴阳学说 - 可以正常显示】')
      const firstBranch = yinyangPoint.mindMapData.branches[0]
      console.log('  第一个分支:', firstBranch.title)
      console.log('  第一个 item:', JSON.stringify(firstBranch.items[0], null, 2))
      console.log('  items 类型:', typeof firstBranch.items[0])
      console.log('  是对象?', typeof firstBranch.items[0] === 'object')
      console.log('  有 title?', 'title' in firstBranch.items[0])
      console.log()
    }

    if (baganPoint?.mindMapData) {
      console.log('【八纲辨证 - 显示空白】')
      const firstBranch = baganPoint.mindMapData.branches[0]
      console.log('  第一个分支:', firstBranch.title)
      console.log('  第一个 item:', JSON.stringify(firstBranch.items[0], null, 2))
      console.log('  items 类型:', typeof firstBranch.items[0])
      console.log('  是对象?', typeof firstBranch.items[0] === 'object')
      console.log('  有 title?', 'title' in firstBranch.items[0])
      console.log()
    }

    console.log('📝 详细数据对比：\n')

    if (yinyangPoint?.mindMapData) {
      console.log('阴阳学说前3个items:')
      yinyangPoint.mindMapData.branches[0].items.slice(0, 3).forEach((item: any, i: number) => {
        console.log(`  ${i + 1}. ${JSON.stringify(item)}`)
      })
      console.log()
    }

    if (baganPoint?.mindMapData) {
      console.log('八纲辨证前3个items:')
      baganPoint.mindMapData.branches[0].items.slice(0, 3).forEach((item: any, i: number) => {
        console.log(`  ${i + 1}. ${JSON.stringify(item)}`)
      })
    }

  } catch (error) {
    console.error('对比失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

compare()
