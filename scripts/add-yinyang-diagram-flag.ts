import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addYinYangDiagramFlag() {
  try {
    const category = await prisma.category.findFirst({
      where: { code: 'DOMAIN_1_ASSESSMENT' }
    })

    if (!category?.keyPoints) {
      console.log('❌ 未找到分类')
      return
    }

    let keyPoints = JSON.parse(category.keyPoints)
    const yinyangIndex = keyPoints.findIndex((p: any) => p.title === '阴阳学说')

    if (yinyangIndex === -1) {
      console.log('❌ 未找到阴阳学说知识点')
      return
    }

    // 添加 hasYinYangDiagram 标记
    keyPoints[yinyangIndex].hasYinYangDiagram = true

    // 更新数据库
    await prisma.category.update({
      where: { id: category.id },
      data: {
        keyPoints: JSON.stringify(keyPoints)
      }
    })

    console.log('✅ 阴阳学说图表标记已添加！')
    console.log('\n📊 图表将在阴阳学说知识点中显示')
    console.log('💡 包含五大核心内容：')
    console.log('   1️⃣  阴阳对立 - 病理与治则')
    console.log('   2️⃣  阴阳互根 - 相互依存关系')
    console.log('   3️⃣  阴阳消长 - 动态平衡')
    console.log('   4️⃣  阴阳转化 - 转化条件')
    console.log('   5️⃣  治疗原则 - 阴平阳秘')

  } catch (error) {
    console.error('添加失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addYinYangDiagramFlag()
