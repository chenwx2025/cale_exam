import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyBaGanMindMap() {
  try {
    const category = await prisma.category.findFirst({
      where: { code: 'DOMAIN_1_ASSESSMENT' }
    })

    if (!category || !category.keyPoints) {
      console.log('❌ 未找到数据')
      return
    }

    const keyPoints = JSON.parse(category.keyPoints)
    const bagan = keyPoints.find((p: any) => p.title === '八纲辨证')

    if (bagan && bagan.mindMapData) {
      console.log('✅ 八纲辨证思维导图验证成功！\n')
      console.log(`标题: ${bagan.mindMapData.title}`)
      console.log(`副标题: ${bagan.mindMapData.subtitle}`)
      console.log(`\n分支数量: ${bagan.mindMapData.branches.length}`)

      bagan.mindMapData.branches.forEach((branch: any, index: number) => {
        console.log(`\n${index + 1}. ${branch.icon} ${branch.title}`)
        console.log(`   包含 ${branch.items.length} 个要点`)
        console.log(`   示例: ${branch.items[0]}`)
      })
    } else {
      console.log('❌ 未找到思维导图数据')
    }

  } catch (error) {
    console.error('验证失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyBaGanMindMap()
