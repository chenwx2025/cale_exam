import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 基于八纲辨证表格生成的题目
const baganQuestions = [
  {
    question: '患者出现恶寒发热、无汗、头痛、脉浮紧，根据八纲辨证应诊断为：',
    options: [
      'A. 表寒实证',
      'B. 表热实证',
      'C. 里寒虚证',
      'D. 里热实证'
    ],
    correctAnswer: 'A. 表寒实证',
    explanation: '恶寒发热、无汗、头痛、脉浮紧是表寒实证的典型表现，口诀提示为"外感风寒"。表寒实证常见于外感风寒初期。',
    difficulty: 'medium',
    categoryCode: 'DOMAIN_1_ASSESSMENT'
  },
  {
    question: '患者表现为发热重、微恶风、汗出、口渴、脉浮数，其证型应为：',
    options: [
      'A. 表寒实证',
      'B. 表热实证',
      'C. 里热实证',
      'D. 阴虚内热'
    ],
    correctAnswer: 'B. 表热实证',
    explanation: '发热重、微恶风、汗出、口渴、脉浮数是表热实证的特点，口诀为"外感风热"。与表寒实证相比，表热实证发热较重且有汗出、口渴等热象。',
    difficulty: 'medium',
    categoryCode: 'DOMAIN_1_ASSESSMENT'
  },
  {
    question: '患者畏寒肢冷、面白、舌淡苔白、脉迟弱，口诀提示为"脾肾阳虚"，其证型为：',
    options: [
      'A. 表寒实证',
      'B. 里寒虚证',
      'C. 气虚下陷',
      'D. 阴虚寒盛'
    ],
    correctAnswer: 'B. 里寒虚证',
    explanation: '畏寒肢冷、面白、舌淡苔白、脉迟弱是里寒虚证的典型表现，多由脾肾阳虚所致。与表寒实证不同，里寒虚证无表证特点，而是以虚寒内盛为主。',
    difficulty: 'easy',
    categoryCode: 'DOMAIN_1_ASSESSMENT'
  },
  {
    question: '根据八纲辨证，"口渴欲冷、便秘尿黄、舌红苔黄、脉数"应诊断为：',
    options: [
      'A. 表热实证',
      'B. 里热实证',
      'C. 阴虚内热',
      'D. 气虚下陷'
    ],
    correctAnswer: 'B. 里热实证',
    explanation: '口渴欲冷、便秘尿黄、舌红苔黄、脉数是里热实证的典型表现，口诀为"实火内盛"。此证型以实热内结为特点，常见于阳明腑实证。',
    difficulty: 'easy',
    categoryCode: 'DOMAIN_1_ASSESSMENT'
  },
  {
    question: '患者午后潮热、盗汗、舌红少苔、脉细数，口诀为"阴虚火旺"，其证型是：',
    options: [
      'A. 里热实证',
      'B. 表热实证',
      'C. 阴虚内热',
      'D. 阴阳两虚'
    ],
    correctAnswer: 'C. 阴虚内热',
    explanation: '午后潮热、盗汗、舌红少苔、脉细数是阴虚内热的特征性表现。与里热实证不同，阴虚内热是虚热证，以阴液亏虚、虚火内扰为主要病机。',
    difficulty: 'medium',
    categoryCode: 'DOMAIN_1_ASSESSMENT'
  },
  {
    question: '患者畏寒肢冷、面色苍白、喜温饮、脉沉迟，根据口诀"阳气不足"，应诊断为：',
    options: [
      'A. 里寒虚证（阴虚寒盛）',
      'B. 气虚下陷',
      'C. 表寒实证',
      'D. 阴阳两虚'
    ],
    correctAnswer: 'A. 里寒虚证（阴虚寒盛）',
    explanation: '畏寒肢冷、面色苍白、喜温饮、脉沉迟是阴虚寒盛的表现，本质上属于阳气不足导致的里寒虚证。此证型以阳虚生寒为主要特点。',
    difficulty: 'medium',
    categoryCode: 'DOMAIN_1_ASSESSMENT'
  },
  {
    question: '患者气短乏力、下坠感、脉虚，口诀为"中气下陷"，其八纲辨证属于：',
    options: [
      'A. 气虚下陷',
      'B. 里寒虚证',
      'C. 阴阳两虚',
      'D. 阴虚内热'
    ],
    correctAnswer: 'A. 气虚下陷',
    explanation: '气短乏力、下坠感、脉虚是气虚下陷的典型表现，多由中气不足、升举无力所致。常见于脱肛、子宫脱垂等病症。',
    difficulty: 'easy',
    categoryCode: 'DOMAIN_1_ASSESSMENT'
  },
  {
    question: '患者畏寒潮热、舌淡红少津、脉微欲绝，口诀为"久病体衰"，应辨证为：',
    options: [
      'A. 阴虚内热',
      'B. 阴阳两虚',
      'C. 里寒虚证',
      'D. 气虚下陷'
    ],
    correctAnswer: 'B. 阴阳两虚',
    explanation: '畏寒潮热、舌淡红少津、脉微欲绝是阴阳两虚的表现，既有阳虚的畏寒，又有阴虚的潮热，多见于久病重症患者。',
    difficulty: 'hard',
    categoryCode: 'DOMAIN_1_ASSESSMENT'
  },
  {
    question: '下列哪组症状最符合"外感风寒"的表寒实证？',
    options: [
      'A. 恶寒发热、有汗、口渴、脉浮数',
      'B. 恶寒发热、无汗、头痛、脉浮紧',
      'C. 畏寒肢冷、面白、便溏、脉迟',
      'D. 发热重、微恶风、汗出、脉浮数'
    ],
    correctAnswer: 'B. 恶寒发热、无汗、头痛、脉浮紧',
    explanation: '表寒实证的特点是恶寒发热、无汗、头痛、脉浮紧，符合外感风寒的表现。A选项为表热证，C选项为里寒虚证，D选项为表热实证。',
    difficulty: 'medium',
    categoryCode: 'DOMAIN_1_ASSESSMENT'
  },
  {
    question: '患者午后低热、盗汗、五心烦热、舌红少苔、脉细数，与里热实证相比，此证的主要区别在于：',
    options: [
      'A. 发热的时间和性质不同',
      'B. 是否口渴',
      'C. 舌苔的厚薄',
      'D. 脉象的快慢'
    ],
    correctAnswer: 'A. 发热的时间和性质不同',
    explanation: '阴虚内热表现为午后潮热（虚热），而里热实证为持续高热（实热）。阴虚内热是虚热证，午后或夜间明显；里热实证是实热证，发热持续且较重。',
    difficulty: 'hard',
    categoryCode: 'DOMAIN_1_ASSESSMENT'
  },
  {
    question: '根据八纲辨证表，"脾肾阳虚"对应的常见症状组合是：',
    options: [
      'A. 畏寒肢冷、面白、舌淡苔白、脉迟弱',
      'B. 气短乏力、下坠感、脉虚',
      'C. 口渴欲冷、便秘尿黄、舌红苔黄、脉数',
      'D. 午后潮热、盗汗、舌红少苔、脉细数'
    ],
    correctAnswer: 'A. 畏寒肢冷、面白、舌淡苔白、脉迟弱',
    explanation: '脾肾阳虚属于里寒虚证，主要表现为畏寒肢冷、面色苍白、舌淡苔白、脉迟弱等阳虚寒凝的症状。',
    difficulty: 'easy',
    categoryCode: 'DOMAIN_1_ASSESSMENT'
  },
  {
    question: '患者既有表证，又见便秘、腹胀、口渴等里热证，此属于：',
    options: [
      'A. 表里同病',
      'B. 半表半里证',
      'C. 表证未解',
      'D. 里证单独存在'
    ],
    correctAnswer: 'A. 表里同病',
    explanation: '当患者同时出现表证和里证时，称为表里同病。此时既有表证的恶寒发热，又有里热实证的便秘、腹胀、口渴等症状，需要表里同治。',
    difficulty: 'hard',
    categoryCode: 'DOMAIN_1_ASSESSMENT'
  },
  {
    question: '辨别表寒实证与表热实证，最关键的鉴别点是：',
    options: [
      'A. 是否有恶寒',
      'B. 是否有发热',
      'C. 有汗无汗及口渴与否',
      'D. 脉浮与否'
    ],
    correctAnswer: 'C. 有汗无汗及口渴与否',
    explanation: '表寒实证：无汗、不口渴、脉浮紧；表热实证：有汗、口渴、脉浮数。有汗无汗及是否口渴是两者最关键的鉴别点。',
    difficulty: 'medium',
    categoryCode: 'DOMAIN_1_ASSESSMENT'
  },
  {
    question: '下列哪项不是阴虚内热的典型表现？',
    options: [
      'A. 午后潮热',
      'B. 盗汗',
      'C. 便秘尿黄',
      'D. 舌红少苔'
    ],
    correctAnswer: 'C. 便秘尿黄',
    explanation: '便秘尿黄是里热实证（实火内盛）的表现，而非阴虚内热的典型症状。阴虚内热的特点是午后潮热、盗汗、舌红少苔、脉细数等虚热表现。',
    difficulty: 'medium',
    categoryCode: 'DOMAIN_1_ASSESSMENT'
  },
  {
    question: '患者面色苍白、喜温饮、脉沉迟，此为阳虚证候。若同时出现舌淡红少津、脉微欲绝，提示：',
    options: [
      'A. 单纯阳虚',
      'B. 阴阳两虚',
      'C. 气虚下陷',
      'D. 单纯阴虚'
    ],
    correctAnswer: 'B. 阴阳两虚',
    explanation: '既有阳虚的表现（面色苍白、喜温饮、脉沉迟），又有阴虚的表现（舌淡红少津），脉微欲绝提示阴阳俱虚，气血衰竭，为阴阳两虚证。',
    difficulty: 'hard',
    categoryCode: 'DOMAIN_1_ASSESSMENT'
  }
]

async function generateBaganQuestions() {
  console.log('开始生成八纲辨证题目...\n')

  // 获取Domain 1 Assessment分类
  const category = await prisma.category.findFirst({
    where: {
      code: 'DOMAIN_1_ASSESSMENT',
      examType: 'cale'
    }
  })

  if (!category) {
    console.error('找不到DOMAIN_1_ASSESSMENT分类')
    return
  }

  let successCount = 0
  let skipCount = 0

  for (const q of baganQuestions) {
    try {
      // 检查是否已存在相同题目
      const existing = await prisma.question.findFirst({
        where: {
          question: q.question,
          examType: 'cale'
        }
      })

      if (existing) {
        console.log(`⊘ 跳过重复题目: ${q.question.substring(0, 30)}...`)
        skipCount++
        continue
      }

      await prisma.question.create({
        data: {
          examType: 'cale',
          type: 'multiple_choice',
          question: q.question,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          categoryId: category.id,
          source: '八纲辨证考点表'
        }
      })

      console.log(`✓ 已添加题目: ${q.question.substring(0, 40)}...`)
      successCount++
    } catch (error) {
      console.error(`✗ 添加题目失败: ${q.question.substring(0, 30)}...`, error)
    }
  }

  console.log(`\n生成完成！`)
  console.log(`成功添加: ${successCount} 道题目`)
  console.log(`跳过重复: ${skipCount} 道题目`)

  // 统计当前题库
  const totalQuestions = await prisma.question.count({
    where: { examType: 'cale' }
  })
  console.log(`\nCALE题库总计: ${totalQuestions} 道题目`)
}

generateBaganQuestions()
  .then(() => {
    console.log('\n所有题目生成完成！')
    process.exit(0)
  })
  .catch((error) => {
    console.error('生成过程出错:', error)
    process.exit(1)
  })
