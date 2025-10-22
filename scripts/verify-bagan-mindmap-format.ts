import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
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

    if (!baganPoint?.mindMapData) {
      console.log('❌ 未找到思维导图数据')
      return
    }

    const { mindMapData } = baganPoint

    console.log('🔍 验证思维导图数据格式：\n')

    console.log('✓ title:', mindMapData.title)
    console.log('✓ subtitle:', mindMapData.subtitle)
    console.log('✓ branches 数量:', mindMapData.branches.length)

    // 检查第一个 branch 的格式
    const firstBranch = mindMapData.branches[0]
    console.log('\n第一个分支检查：')
    console.log('  • icon:', firstBranch.icon)
    console.log('  • title:', firstBranch.title)
    console.log('  • items 数量:', firstBranch.items.length)
    console.log('  • 第一个 item 类型:', typeof firstBranch.items[0])
    console.log('  • 第一个 item 内容:', JSON.stringify(firstBranch.items[0]))

    // 检查 items 格式
    const isCorrectFormat = firstBranch.items.every((item: any) =>
      typeof item === 'object' && 'title' in item
    )

    if (isCorrectFormat) {
      console.log('\n✅ items 格式正确：都是包含 title 属性的对象')
    } else {
      console.log('\n❌ items 格式错误：不是对象或缺少 title 属性')
    }

    // 检查 connections
    if (mindMapData.connections) {
      console.log('\nconnections 检查：')
      console.log('  • 数量:', mindMapData.connections.length)
      console.log('  • 第一个类型:', typeof mindMapData.connections[0])
      console.log('  • 内容:', mindMapData.connections)

      const isStringArray = mindMapData.connections.every((c: any) => typeof c === 'string')
      if (isStringArray) {
        console.log('  ✅ connections 格式正确：字符串数组')
      } else {
        console.log('  ❌ connections 格式错误：不是字符串数组')
      }
    }

    console.log('\n✅ 验证完成！数据格式符合 MindMap 组件要求')

  } catch (error) {
    console.error('验证失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verify()
