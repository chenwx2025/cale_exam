import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addMindMapToYinYang() {
  console.log('为阴阳学说添加思维导图数据...\n')

  const category = await prisma.category.findFirst({
    where: { code: 'DOMAIN_1_ASSESSMENT' }
  })

  if (!category) {
    console.log('❌ 未找到Domain 1分类')
    return
  }

  let keyPoints = []
  if (category.keyPoints) {
    try {
      keyPoints = JSON.parse(category.keyPoints)
    } catch (e) {
      console.log('❌ 解析现有知识点失败')
      return
    }
  }

  const yinYangIndex = keyPoints.findIndex((p: any) => p.title === '阴阳学说')

  if (yinYangIndex === -1) {
    console.log('❌ 未找到阴阳学说知识点')
    return
  }

  // 添加思维导图数据
  keyPoints[yinYangIndex].mindMapData = {
    title: '阴阳学说',
    subtitle: '中医理论的哲学基础',
    branches: [
      {
        icon: '⚡',
        title: '一、对立制约',
        items: [
          {
            title: '阴盛则寒',
            description: '阴邪过盛导致寒证'
          },
          {
            title: '阳盛则热',
            description: '阳邪过盛导致热证'
          },
          {
            title: '热者寒之',
            description: '热证用寒凉药治疗'
          },
          {
            title: '寒者热之',
            description: '寒证用温热药治疗'
          }
        ]
      },
      {
        icon: '🔗',
        title: '二、互根互用',
        items: [
          {
            title: '阴在内，阳之守也',
            description: '阴为阳的物质基础'
          },
          {
            title: '阳在外，阴之使也',
            description: '阳为阴的功能表现'
          },
          {
            title: '阴损及阳',
            description: '阴虚日久可导致阳虚'
          },
          {
            title: '阳损及阴',
            description: '阳虚日久可导致阴虚'
          },
          {
            title: '阴中求阳',
            description: '善补阳者必于阴中求阳'
          },
          {
            title: '阳中求阴',
            description: '善补阴者必于阳中求阴'
          }
        ]
      },
      {
        icon: '⚖️',
        title: '三、消长平衡',
        items: [
          {
            title: '阴平阳秘',
            description: '阴阳平衡则健康'
          },
          {
            title: '阴虚则阳亢',
            description: '阴液不足，阳气相对亢盛（虚热）'
          },
          {
            title: '阴盛则阳虚',
            description: '阴寒内盛，阳气被遏（实寒）'
          },
          {
            title: '阳虚则阴盛',
            description: '阳气不足，阴寒内生（虚寒）'
          },
          {
            title: '阳盛则阴虚',
            description: '阳热亢盛，耗伤阴液（实热）'
          }
        ]
      },
      {
        icon: '🔄',
        title: '四、相互转化',
        items: [
          {
            title: '重阳必阴',
            description: '阳盛到极点转化为阴'
          },
          {
            title: '重阴必阳',
            description: '阴盛到极点转化为阳'
          },
          {
            title: '热极生寒',
            description: '真热假寒（阳盛格阴）'
          },
          {
            title: '寒极生热',
            description: '真寒假热（阴盛格阳）'
          }
        ]
      }
    ],
    connections: [
      '阴阳互根 → 谁也离不开谁',
      '阴阳消长 → 此消彼长',
      '阴阳转化 → 量变到质变',
      '治疗原则 → 调整阴阳、恢复平衡'
    ]
  }

  // 更新数据库
  await prisma.category.update({
    where: { id: category.id },
    data: {
      keyPoints: JSON.stringify(keyPoints)
    }
  })

  console.log('✅ 成功为阴阳学说添加思维导图数据！')
  console.log('\n思维导图包含：')
  console.log('  🧠 中心节点：阴阳学说')
  console.log('  ⚡ 分支1：对立制约（4个要点）')
  console.log('  🔗 分支2：互根互用（6个要点）')
  console.log('  ⚖️  分支3：消长平衡（5个要点）')
  console.log('  🔄 分支4：相互转化（4个要点）')
  console.log('  🔗 关联关系：4条核心联系')
}

addMindMapToYinYang()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
