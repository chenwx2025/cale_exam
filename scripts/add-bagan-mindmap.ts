import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addBaGanMindMap() {
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

    // 查找八纲辨证知识点
    const baganIndex = keyPoints.findIndex((p: any) => p.title === '八纲辨证')

    if (baganIndex === -1) {
      console.log('❌ 未找到八纲辨证知识点')
      return
    }

    // 创建八纲辨证思维导图
    const mindMapData = {
      title: '八纲辨证',
      subtitle: '中医辨证论治的总纲',
      branches: [
        {
          icon: '☯️',
          title: '阴阳（总纲）',
          items: [
            '阳证 = 表 + 热 + 实',
            '阴证 = 里 + 寒 + 虚',
            '阳证：面红、声高、口渴、便秘、脉数有力',
            '阴证：面白、声低、畏寒、便溏、脉沉迟无力'
          ]
        },
        {
          icon: '📍',
          title: '表里（病位）',
          items: [
            '表证：恶寒、发热、脉浮（病位浅）',
            '里证：无恶寒发热、症状复杂（病位深）',
            '表寒证：无汗、脉浮紧 → 麻黄汤',
            '表热证：有汗、咽痛 → 银翘散',
            '表虚证：自汗、脉浮缓 → 桂枝汤'
          ]
        },
        {
          icon: '🌡️',
          title: '寒热（病性）',
          items: [
            '实寒证：阴寒内盛、拒按、脉沉紧',
            '虚寒证：阳虚则寒、喜按、脉沉迟',
            '实热证：阳盛则热、高热口渴、脉数有力',
            '虚热证：阴虚则热、潮热盗汗、脉细数',
            '真寒假热：内寒外热、欲盖衣被',
            '真热假寒：内热外寒、四肢厥冷但烦躁'
          ]
        },
        {
          icon: '⚖️',
          title: '虚实（邪正）',
          items: [
            '虚证：正气虚（喜按、脉虚）',
            '实证：邪气盛（拒按、脉实）',
            '气虚：神疲、气短、自汗',
            '血虚：面白、失眠、脉细',
            '阴虚：五心烦热、盗汗、舌红少苔',
            '阳虚：畏寒肢冷、便溏、舌淡苔白',
            '虚实夹杂：补泻兼施'
          ]
        },
        {
          icon: '🔄',
          title: '八纲关系',
          items: [
            '阴阳统领：阴（里寒虚）、阳（表热实）',
            '表里辨病位：外感内伤、传变趋向',
            '寒热辨病性：治疗大法（温清补泻）',
            '虚实辨邪正：正虚邪实、补泻原则',
            '相兼为病：表寒、里热、虚实夹杂',
            '真假辨别：真寒假热、真热假寒'
          ]
        },
        {
          icon: '💊',
          title: '治疗原则',
          items: [
            '表证：解表法（辛温或辛凉）',
            '里证：治里法（温清补泻）',
            '寒证：温法（温中散寒、温阳）',
            '热证：清法（清热泻火、滋阴）',
            '虚证：补法（补气血阴阳）',
            '实证：泻法（泻实祛邪）',
            '虚实夹杂：补泻兼施',
            '真假证候：治病求本（透邪扶正）'
          ]
        },
        {
          icon: '📋',
          title: '经典方药',
          items: [
            '麻黄汤：表寒实证（发汗解表）',
            '桂枝汤：表寒虚证（调和营卫）',
            '银翘散：表热证（辛凉解表）',
            '大承气汤：里实热证（泻热通便）',
            '附子理中丸：里虚寒证（温中健脾）',
            '白虎汤：实热证（清热生津）',
            '六味地黄丸：阴虚证（滋阴补肾）',
            '四逆汤：真寒假热（回阳救逆）'
          ]
        }
      ],
      connections: [
        {
          from: '阴阳',
          to: '表里寒热虚实',
          label: '统领',
          color: 'purple'
        },
        {
          from: '表里',
          to: '病位深浅',
          label: '定位',
          color: 'blue'
        },
        {
          from: '寒热',
          to: '病性属性',
          label: '定性',
          color: 'red'
        },
        {
          from: '虚实',
          to: '邪正盛衰',
          label: '定量',
          color: 'green'
        }
      ]
    }

    // 更新八纲辨证知识点
    keyPoints[baganIndex].mindMapData = mindMapData

    // 更新数据库
    await prisma.category.update({
      where: { id: category.id },
      data: {
        keyPoints: JSON.stringify(keyPoints)
      }
    })

    console.log('✅ 八纲辨证思维导图已成功添加！')
    console.log('\n📊 思维导图包含：')
    console.log('  1️⃣  阴阳（总纲）- 4个要点')
    console.log('  2️⃣  表里（病位）- 5个要点')
    console.log('  3️⃣  寒热（病性）- 6个要点')
    console.log('  4️⃣  虚实（邪正）- 7个要点')
    console.log('  5️⃣  八纲关系 - 6个要点')
    console.log('  6️⃣  治疗原则 - 8个要点')
    console.log('  7️⃣  经典方药 - 8个要点')
    console.log('\n💡 特色：')
    console.log('  • 清晰的层次结构')
    console.log('  • 完整的辨证体系')
    console.log('  • 治法与方药对应')
    console.log('  • 真假证候鉴别')

  } catch (error) {
    console.error('添加失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addBaGanMindMap()
