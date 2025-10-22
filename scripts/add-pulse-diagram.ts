import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addPulseDiagram() {
  try {
    const category = await prisma.category.findFirst({
      where: { code: 'DOMAIN_1_ASSESSMENT' }
    })

    if (!category?.keyPoints) {
      console.log('❌ 未找到分类')
      return
    }

    let keyPoints = JSON.parse(category.keyPoints)
    const pulseIndex = keyPoints.findIndex((p: any) => p.title === '脉诊要点')

    if (pulseIndex === -1) {
      console.log('❌ 未找到脉诊知识点')
      return
    }

    // 添加 hasPulseDiagram 标记
    keyPoints[pulseIndex].hasPulseDiagram = true

    // 更新数据库
    await prisma.category.update({
      where: { id: category.id },
      data: {
        keyPoints: JSON.stringify(keyPoints)
      }
    })

    console.log('✅ 脉诊图表标记已添加！')
    console.log('\n📊 图表将在脉诊知识点中显示')
    console.log('💡 包含17种常见脉象的分类展示')

  } catch (error) {
    console.error('添加失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addPulseDiagram()
