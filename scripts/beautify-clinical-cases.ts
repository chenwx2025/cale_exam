import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function beautifyClinicalCases() {
  try {
    // 查找Domain 1分类
    const category = await prisma.category.findFirst({
      where: { code: 'DOMAIN_1_ASSESSMENT' }
    })

    if (!category) {
      console.log('❌ 未找到Domain 1分类')
      return
    }

    // 解析现有知识点
    let keyPoints = []
    if (category.keyPoints) {
      try {
        keyPoints = JSON.parse(category.keyPoints)
      } catch (e) {
        console.log('❌ 解析现有知识点失败')
        return
      }
    }

    let totalReformatted = 0

    // 重新格式化每个知识点的案例
    keyPoints.forEach((point: any) => {
      if (point.clinicalCases && point.clinicalCases.length > 0) {
        point.clinicalCases = point.clinicalCases.map((caseText: string) => {
          totalReformatted++

          // 提取案例标题
          const titleMatch = caseText.match(/^案例\d+[：:].+?(?=\n|【)/)
          const title = titleMatch ? titleMatch[0].replace('：', ': ') : '临床案例'

          // 提取各部分内容
          const symptomMatch = caseText.match(/【症状】(.+?)(?=\n【|$)/s)
          const mechanismMatch = caseText.match(/【病机】(.+?)(?=\n【|$)/s)
          const principleMatch = caseText.match(/【治则】(.+?)(?=\n【|$)/s)
          const formulaMatch = caseText.match(/【方药】(.+?)(?=\n【|$)/s)
          const analysisMatch = caseText.match(/【分析】(.+?)(?=\n【|$)/s)

          // 构建美化后的案例格式
          let formatted = ''

          // 标题部分
          formatted += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
          formatted += `  ${title}\n`
          formatted += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

          // 症状表现
          if (symptomMatch) {
            formatted += `📋 【症状表现】\n`
            const symptoms = symptomMatch[1].trim()
            formatted += `   ${symptoms}\n\n`
          }

          // 病机分析
          if (mechanismMatch) {
            formatted += `🔍 【病机分析】\n`
            const mechanism = mechanismMatch[1].trim()
            formatted += `   ${mechanism}\n\n`
          }

          // 治疗原则
          if (principleMatch) {
            formatted += `💊 【治疗原则】\n`
            const principle = principleMatch[1].trim()
            formatted += `   ${principle}\n\n`
          }

          // 方药处方
          if (formulaMatch) {
            formatted += `📝 【方药处方】\n`
            const formula = formulaMatch[1].trim()
            formatted += `   ${formula}\n\n`
          }

          // 临床要点
          if (analysisMatch) {
            formatted += `💡 【临床要点】\n`
            const analysis = analysisMatch[1].trim()
            formatted += `   ${analysis}\n\n`
          }

          formatted += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

          return formatted
        })
      }
    })

    // 更新数据库
    await prisma.category.update({
      where: { id: category.id },
      data: {
        keyPoints: JSON.stringify(keyPoints)
      }
    })

    console.log('✅ 临床案例格式优化完成！')
    console.log(`\n📊 统计信息：`)
    console.log(`   • 共优化 ${totalReformatted} 个案例`)
    console.log(`   • 涉及 ${keyPoints.length} 个知识点`)
    console.log(`\n✨ 新格式特点：`)
    console.log(`   ✓ 清晰的分隔线`)
    console.log(`   ✓ 醒目的图标标识`)
    console.log(`   ✓ 结构化的内容展示`)
    console.log(`   ✓ 适当的空行间距`)
    console.log(`   ✓ 统一的缩进格式`)

  } catch (error) {
    console.error('更新失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

beautifyClinicalCases()
