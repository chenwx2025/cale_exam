import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixBaGanMindMap() {
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

    // 修正八纲辨证思维导图数据格式
    const mindMapData = {
      title: '八纲辨证',
      subtitle: '中医辨证论治的总纲',
      branches: [
        {
          icon: '☯️',
          title: '阴阳（总纲）',
          items: [
            { title: '阳证 = 表 + 热 + 实' },
            { title: '阴证 = 里 + 寒 + 虚' },
            { title: '阳证：面红、声高、口渴、便秘、脉数有力' },
            { title: '阴证：面白、声低、畏寒、便溏、脉沉迟无力' }
          ]
        },
        {
          icon: '📍',
          title: '表里（病位）',
          items: [
            { title: '表证：恶寒、发热、脉浮（病位浅）' },
            { title: '里证：无恶寒发热、症状复杂（病位深）' },
            { title: '表寒证：无汗、脉浮紧 → 麻黄汤' },
            { title: '表热证：有汗、咽痛 → 银翘散' },
            { title: '表虚证：自汗、脉浮缓 → 桂枝汤' }
          ]
        },
        {
          icon: '🌡️',
          title: '寒热（病性）',
          items: [
            { title: '实寒证：阴寒内盛、拒按、脉沉紧' },
            { title: '虚寒证：阳虚则寒、喜按、脉沉迟' },
            { title: '实热证：阳盛则热、高热口渴、脉数有力' },
            { title: '虚热证：阴虚则热、潮热盗汗、脉细数' },
            { title: '真寒假热：内寒外热、欲盖衣被' },
            { title: '真热假寒：内热外寒、四肢厥冷但烦躁' }
          ]
        },
        {
          icon: '⚖️',
          title: '虚实（邪正）',
          items: [
            { title: '虚证：正气虚（喜按、脉虚）' },
            { title: '实证：邪气盛（拒按、脉实）' },
            { title: '气虚：神疲、气短、自汗' },
            { title: '血虚：面白、失眠、脉细' },
            { title: '阴虚：五心烦热、盗汗、舌红少苔' },
            { title: '阳虚：畏寒肢冷、便溏、舌淡苔白' },
            { title: '虚实夹杂：补泻兼施' }
          ]
        },
        {
          icon: '🔄',
          title: '八纲关系',
          items: [
            { title: '阴阳统领：阴（里寒虚）、阳（表热实）' },
            { title: '表里辨病位：外感内伤、传变趋向' },
            { title: '寒热辨病性：治疗大法（温清补泻）' },
            { title: '虚实辨邪正：正虚邪实、补泻原则' },
            { title: '相兼为病：表寒、里热、虚实夹杂' },
            { title: '真假辨别：真寒假热、真热假寒' }
          ]
        },
        {
          icon: '💊',
          title: '治疗原则',
          items: [
            { title: '表证：解表法（辛温或辛凉）' },
            { title: '里证：治里法（温清补泻）' },
            { title: '寒证：温法（温中散寒、温阳）' },
            { title: '热证：清法（清热泻火、滋阴）' },
            { title: '虚证：补法（补气血阴阳）' },
            { title: '实证：泻法（泻实祛邪）' },
            { title: '虚实夹杂：补泻兼施' },
            { title: '真假证候：治病求本（透邪扶正）' }
          ]
        },
        {
          icon: '📋',
          title: '经典方药',
          items: [
            { title: '麻黄汤：表寒实证（发汗解表）' },
            { title: '桂枝汤：表寒虚证（调和营卫）' },
            { title: '银翘散：表热证（辛凉解表）' },
            { title: '大承气汤：里实热证（泻热通便）' },
            { title: '附子理中丸：里虚寒证（温中健脾）' },
            { title: '白虎汤：实热证（清热生津）' },
            { title: '六味地黄丸：阴虚证（滋阴补肾）' },
            { title: '四逆汤：真寒假热（回阳救逆）' }
          ]
        }
      ],
      connections: [
        '阴阳统领表里寒热虚实',
        '表里定病位深浅',
        '寒热定病性属性',
        '虚实定邪正盛衰'
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

    console.log('✅ 八纲辨证思维导图数据格式已修正！')
    console.log('\n📊 修正内容：')
    console.log('  • items: 字符串数组 → 对象数组 { title: string }')
    console.log('  • connections: 对象数组 → 字符串数组')
    console.log('\n🔍 验证数据：')
    console.log('  1️⃣  阴阳（总纲）- 4个要点')
    console.log('  2️⃣  表里（病位）- 5个要点')
    console.log('  3️⃣  寒热（病性）- 6个要点')
    console.log('  4️⃣  虚实（邪正）- 7个要点')
    console.log('  5️⃣  八纲关系 - 6个要点')
    console.log('  6️⃣  治疗原则 - 8个要点')
    console.log('  7️⃣  经典方药 - 8个要点')
    console.log('  🔗 关联关系 - 4个连接')

  } catch (error) {
    console.error('修正失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixBaGanMindMap()
