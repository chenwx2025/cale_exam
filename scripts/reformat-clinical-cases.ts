import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function reformatClinicalCases() {
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

    // 重新格式化每个知识点的案例
    keyPoints.forEach((point: any) => {
      if (point.clinicalCases && point.clinicalCases.length > 0) {
        point.clinicalCases = point.clinicalCases.map((caseText: string) => {
          // 如果已经是良好格式，跳过
          if (caseText.includes('┌─') || caseText.includes('━━━')) {
            return caseText
          }

          // 提取案例信息
          const lines = caseText.split('\n').filter(line => line.trim())

          // 尝试提取标题
          const titleMatch = caseText.match(/^(案例\d+[：:].+?)[\n【]/)
          const title = titleMatch ? titleMatch[1] : lines[0]

          // 提取各部分内容
          const symptomMatch = caseText.match(/【症状】(.+?)(?=【|$)/s)
          const mechanismMatch = caseText.match(/【病机】(.+?)(?=【|$)/s)
          const principleMatch = caseText.match(/【治则】(.+?)(?=【|$)/s)
          const formulaMatch = caseText.match(/【方药】(.+?)(?=【|$)/s)
          const analysisMatch = caseText.match(/【分析】(.+?)(?=【|$)/s)

          // 构建格式化的案例
          let formatted = `┌─────────────────────────────────────────────┐\n`
          formatted += `│  ${title.padEnd(42, ' ')}│\n`
          formatted += `├─────────────────────────────────────────────┤\n`

          if (symptomMatch) {
            formatted += `│ 📋 症状表现                                 │\n`
            const symptoms = symptomMatch[1].trim().replace(/\n/g, ' ')
            const symptomLines = wrapText(symptoms, 40)
            symptomLines.forEach(line => {
              formatted += `│   ${line.padEnd(42, ' ')}│\n`
            })
            formatted += `├─────────────────────────────────────────────┤\n`
          }

          if (mechanismMatch) {
            formatted += `│ 🔍 病机分析                                 │\n`
            const mechanism = mechanismMatch[1].trim().replace(/\n/g, ' ')
            const mechanismLines = wrapText(mechanism, 40)
            mechanismLines.forEach(line => {
              formatted += `│   ${line.padEnd(42, ' ')}│\n`
            })
            formatted += `├─────────────────────────────────────────────┤\n`
          }

          if (principleMatch) {
            formatted += `│ 💊 治疗原则                                 │\n`
            const principle = principleMatch[1].trim().replace(/\n/g, ' ')
            const principleLines = wrapText(principle, 40)
            principleLines.forEach(line => {
              formatted += `│   ${line.padEnd(42, ' ')}│\n`
            })
            formatted += `├─────────────────────────────────────────────┤\n`
          }

          if (formulaMatch) {
            formatted += `│ 📝 方药处方                                 │\n`
            const formula = formulaMatch[1].trim().replace(/\n/g, ' ')
            const formulaLines = wrapText(formula, 40)
            formulaLines.forEach(line => {
              formatted += `│   ${line.padEnd(42, ' ')}│\n`
            })
            if (analysisMatch) {
              formatted += `├─────────────────────────────────────────────┤\n`
            }
          }

          if (analysisMatch) {
            formatted += `│ 💡 临床要点                                 │\n`
            const analysis = analysisMatch[1].trim().replace(/\n/g, ' ')
            const analysisLines = wrapText(analysis, 40)
            analysisLines.forEach(line => {
              formatted += `│   ${line.padEnd(42, ' ')}│\n`
            })
          }

          formatted += `└─────────────────────────────────────────────┘`

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

    console.log('✅ 所有临床案例已重新格式化！')
    console.log('格式特点：')
    console.log('  ✓ 使用边框框住案例内容')
    console.log('  ✓ 使用图标标识各个部分')
    console.log('  ✓ 症状、病机、治则、方药、分析清晰分隔')
    console.log('  ✓ 文本自动换行，提高可读性')

  } catch (error) {
    console.error('更新失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 文本换行辅助函数
function wrapText(text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let currentLine = ''
  let currentWidth = 0

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    // 中文字符占2个宽度，英文占1个
    const charWidth = /[\u4e00-\u9fa5]/.test(char) ? 2 : 1

    if (currentWidth + charWidth > maxWidth) {
      lines.push(currentLine)
      currentLine = char
      currentWidth = charWidth
    } else {
      currentLine += char
      currentWidth += charWidth
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

reformatClinicalCases()
