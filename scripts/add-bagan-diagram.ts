import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addBaGanDiagram() {
  try {
    const category = await prisma.category.findFirst({
      where: { code: 'DOMAIN_1_ASSESSMENT' }
    })

    if (!category?.keyPoints) {
      console.log('❌ 未找到分类')
      return
    }

    let keyPoints = JSON.parse(category.keyPoints)
    const baganIndex = keyPoints.findIndex((p: any) => p.title === '八纲辨证')

    if (baganIndex === -1) {
      console.log('❌ 未找到八纲辨证知识点')
      return
    }

    // 添加 hasBaGanDiagram 标记
    keyPoints[baganIndex].hasBaGanDiagram = true

    // 更新数据库
    await prisma.category.update({
      where: { id: category.id },
      data: {
        keyPoints: JSON.stringify(keyPoints)
      }
    })

    console.log('✅ 八纲辨证图表标记已添加！')
    console.log('\n📊 图表将在八纲辨证知识点中显示')
    console.log('💡 包含四大辨证体系：')
    console.log('   1️⃣  表里辨证 - 辨病位深浅')
    console.log('   2️⃣  寒热辨证 - 辨病性')
    console.log('   3️⃣  虚实辨证 - 辨邪正盛衰')
    console.log('   4️⃣  阴阳辨证 - 总纲统领')

  } catch (error) {
    console.error('添加失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addBaGanDiagram()
