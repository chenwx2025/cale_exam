import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkKeyPoints() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        examType: 'cale'
      },
      select: {
        id: true,
        code: true,
        name: true,
        keyPoints: true
      },
      orderBy: {
        order: 'asc'
      }
    })

    console.log(`找到 ${categories.length} 个分类\n`)

    for (const cat of categories) {
      console.log(`\n分类: ${cat.name} (${cat.code})`)
      console.log(`keyPoints字段是否为空: ${!cat.keyPoints}`)

      if (cat.keyPoints) {
        try {
          const parsed = JSON.parse(cat.keyPoints)
          console.log(`包含 ${parsed.length} 个知识点`)
          if (parsed.length > 0) {
            console.log(`第一个知识点: ${parsed[0].title}`)
          }
        } catch (e) {
          console.log(`解析JSON失败: ${e}`)
        }
      } else {
        console.log(`⚠️  该分类没有知识点数据！`)
      }
    }

  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkKeyPoints()
