import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function diagnose() {
  console.log('🔍 开始诊断知识点显示问题...\n')

  try {
    // 1. 检查数据库中的分类
    const categories = await prisma.category.findMany({
      where: {
        examType: 'cale',
        type: 'content'
      },
      select: {
        id: true,
        code: true,
        name: true,
        keyPoints: true
      },
      orderBy: [
        { order: 'asc' },
        { code: 'asc' }
      ]
    })

    console.log(`1️⃣ 数据库检查`)
    console.log(`   ✓ 找到 ${categories.length} 个内容分类`)

    if (categories.length === 0) {
      console.log(`   ❌ 问题：没有找到任何分类！`)
      return
    }

    // 2. 检查每个分类的 keyPoints
    let totalKeyPoints = 0
    let categoriesWithKeyPoints = 0
    let categoriesWithoutKeyPoints = 0

    categories.forEach((cat, index) => {
      if (cat.keyPoints) {
        try {
          const parsed = JSON.parse(cat.keyPoints)
          const count = Array.isArray(parsed) ? parsed.length : 0
          totalKeyPoints += count
          categoriesWithKeyPoints++

          console.log(`   ✓ ${cat.name}: ${count} 个知识点`)
        } catch (e) {
          console.log(`   ❌ ${cat.name}: JSON解析失败`)
          categoriesWithoutKeyPoints++
        }
      } else {
        console.log(`   ⚠️  ${cat.name}: keyPoints字段为空`)
        categoriesWithoutKeyPoints++
      }
    })

    console.log(`\n2️⃣ 知识点统计`)
    console.log(`   • 总分类数: ${categories.length}`)
    console.log(`   • 有知识点的分类: ${categoriesWithKeyPoints}`)
    console.log(`   • 无知识点的分类: ${categoriesWithoutKeyPoints}`)
    console.log(`   • 总知识点数: ${totalKeyPoints}`)

    // 3. 检查第一个分类的详细信息
    if (categories.length > 0) {
      const firstCat = categories[0]
      console.log(`\n3️⃣ 第一个分类详情 (${firstCat.name})`)
      console.log(`   • ID: ${firstCat.id}`)
      console.log(`   • Code: ${firstCat.code}`)
      console.log(`   • keyPoints字段长度: ${firstCat.keyPoints?.length || 0}`)

      if (firstCat.keyPoints) {
        try {
          const parsed = JSON.parse(firstCat.keyPoints)
          console.log(`   • 知识点数量: ${parsed.length}`)
          if (parsed.length > 0) {
            console.log(`   • 第一个知识点标题: ${parsed[0].title}`)
            console.log(`   • 第一个知识点有描述: ${!!parsed[0].description}`)
          }
        } catch (e) {
          console.log(`   ❌ JSON解析失败: ${e}`)
        }
      }
    }

    // 4. 模拟API响应
    console.log(`\n4️⃣ 模拟API响应`)
    const apiResponse = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      code: cat.code,
      hasKeyPoints: !!cat.keyPoints,
      keyPointsLength: cat.keyPoints?.length || 0
    }))
    console.log(`   API会返回的数据:`)
    apiResponse.forEach(item => {
      console.log(`   • ${item.name}: keyPoints=${item.hasKeyPoints}, 长度=${item.keyPointsLength}`)
    })

    // 5. 检查可能的问题
    console.log(`\n5️⃣ 潜在问题检查`)

    if (categoriesWithoutKeyPoints > 0) {
      console.log(`   ⚠️  有 ${categoriesWithoutKeyPoints} 个分类没有知识点`)
    }

    if (totalKeyPoints === 0) {
      console.log(`   ❌ 严重问题：所有分类都没有知识点！`)
    } else {
      console.log(`   ✓ 数据库中有 ${totalKeyPoints} 个知识点`)
    }

    // 6. 前端可能的问题
    console.log(`\n6️⃣ 前端可能的问题`)
    console.log(`   可能原因：`)
    console.log(`   1. 用户未登录 - 检查是否有登录token`)
    console.log(`   2. examType不匹配 - 检查是否为'cale'`)
    console.log(`   3. API请求失败 - 检查浏览器Network标签`)
    console.log(`   4. keyPoints解析失败 - 检查浏览器Console`)
    console.log(`   5. 页面未正确加载 - 检查是否有JavaScript错误`)

    console.log(`\n✅ 诊断完成！`)
    console.log(`\n💡 建议：`)
    console.log(`   1. 打开浏览器开发者工具 (F12)`)
    console.log(`   2. 切换到 Network 标签，刷新页面`)
    console.log(`   3. 查看是否有 /api/knowledge-points/list 请求`)
    console.log(`   4. 切换到 Console 标签，查看调试信息`)
    console.log(`   5. 确认是否已登录 (检查localStorage中的token)`)

  } catch (error) {
    console.error('❌ 诊断过程出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

diagnose()
