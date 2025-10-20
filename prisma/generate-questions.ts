// 题目生成脚本 - 支持去重检测
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 检查题目是否重复（基于题目内容的相似度）
async function isDuplicate(question: string, categoryId: string): Promise<boolean> {
  const existingQuestions = await prisma.question.findMany({
    where: { categoryId },
    select: { question: true }
  })

  // 简单的重复检测：去除空格和标点后比较
  const normalizedNew = question.replace(/[^\w\u4e00-\u9fa5]/g, '').toLowerCase()

  for (const existing of existingQuestions) {
    const normalizedExisting = existing.question.replace(/[^\w\u4e00-\u9fa5]/g, '').toLowerCase()

    // 如果相似度超过80%，认为是重复
    const similarity = calculateSimilarity(normalizedNew, normalizedExisting)
    if (similarity > 0.8) {
      return true
    }
  }

  return false
}

// 计算两个字符串的相似度（简单的Levenshtein距离）
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length

  if (len1 === 0) return len2 === 0 ? 1 : 0
  if (len2 === 0) return 0

  const matrix: number[][] = []

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }

  const distance = matrix[len1][len2]
  const maxLen = Math.max(len1, len2)
  return 1 - (distance / maxLen)
}

// 批量添加题目（自动去重）
async function addQuestions(questions: any[], categoryCode: string) {
  const category = await prisma.category.findFirst({
    where: { code: categoryCode, examType: 'cale' }
  })

  if (!category) {
    console.error(`Category ${categoryCode} not found`)
    return
  }

  let added = 0
  let duplicates = 0

  for (const q of questions) {
    const duplicate = await isDuplicate(q.question, category.id)

    if (duplicate) {
      console.log(`⚠️  Skipping duplicate: ${q.question.substring(0, 50)}...`)
      duplicates++
      continue
    }

    try {
      await prisma.question.create({
        data: {
          examType: 'cale',
          type: q.type || 'multiple_choice',
          question: q.question,
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty || 'medium',
          categoryId: category.id,
          tags: q.tags ? JSON.stringify(q.tags) : null,
          source: q.source || '系统生成'
        }
      })
      added++
      console.log(`✓ Added: ${q.question.substring(0, 50)}...`)
    } catch (error) {
      console.error(`✗ Failed to add question:`, error)
    }
  }

  console.log(`\n${categoryCode}: Added ${added} questions, skipped ${duplicates} duplicates`)
  return { added, duplicates }
}

// Domain 2: 诊断和治疗计划 (需要补充30题)
const domain2Questions = [
  {
    question: '根据中医诊断，下列哪项是\"心火亢盛\"的典型症状？',
    options: [
      'A. 失眠多梦、心烦易怒、口舌生疮',
      'B. 腰膝酸软、头晕耳鸣、五心烦热',
      'C. 胸闷气短、自汗、脉弱',
      'D. 腹胀便溏、食欲不振、倦怠乏力'
    ],
    correctAnswer: 'A',
    explanation: '心火亢盛的典型症状包括失眠多梦、心烦易怒、口舌生疮、小便短赤等。B选项是肾阴虚的症状，C选项是心气虚的症状，D选项是脾虚的症状。',
    difficulty: 'easy'
  },
  {
    question: '患者主诉头痛、发热恶寒、无汗、脉浮紧。根据六经辨证，该患者属于哪一经病？',
    options: [
      'A. 太阳病',
      'B. 阳明病',
      'C. 少阳病',
      'D. 太阴病'
    ],
    correctAnswer: 'A',
    explanation: '太阳病的主要症状是头痛、发热恶寒、无汗、脉浮紧，这是外感风寒的典型表现。阳明病多有高热、大汗、脉洪大；少阳病有往来寒热、胸胁苦满；太阴病属于里虚证。',
    difficulty: 'medium'
  },
  {
    question: '在八纲辨证中，\"但热不寒\"属于哪一证？',
    options: [
      'A. 实热证',
      'B. 虚热证',
      'C. 寒证',
      'D. 表证'
    ],
    correctAnswer: 'A',
    explanation: '\"但热不寒\"是实热证的特点，表现为高热、口渴喜冷饮、便秘、尿黄等。虚热证通常有五心烦热、潮热盗汗等症状；寒证则是怕冷；表证有恶寒发热并见。',
    difficulty: 'easy'
  },
  {
    question: '患者舌质淡白、舌体胖大有齿痕，最可能提示哪种证型？',
    options: [
      'A. 脾气虚',
      'B. 心火亢盛',
      'C. 肝阳上亢',
      'D. 肺热炽盛'
    ],
    correctAnswer: 'A',
    explanation: '舌质淡白、舌体胖大有齿痕是脾气虚的典型舌象。脾主运化水湿，脾虚则水湿停聚，舌体胖大；脾气虚则舌质淡白无力。',
    difficulty: 'medium'
  },
  {
    question: '根据脏腑辨证，\"喘促日久、动则加剧、腰膝酸软\"属于哪种证型？',
    options: [
      'A. 肾不纳气',
      'B. 肺气虚',
      'C. 心阳虚',
      'D. 脾气虚'
    ],
    correctAnswer: 'A',
    explanation: '肾不纳气的典型表现是喘促日久、动则加剧、腰膝酸软。肾主纳气，肾虚则不能摄纳肺气，导致喘促。腰膝酸软是肾虚的常见症状。',
    difficulty: 'medium'
  },
  {
    question: '患者主诉胸胁胀痛、情志抑郁、嗳气频繁。最适合的治疗原则是？',
    options: [
      'A. 疏肝理气',
      'B. 补益肝肾',
      'C. 清肝泻火',
      'D. 养血柔肝'
    ],
    correctAnswer: 'A',
    explanation: '胸胁胀痛、情志抑郁、嗳气频繁是肝气郁结的表现。治疗原则应该疏肝理气，常用柴胡疏肝散等方剂。',
    difficulty: 'easy'
  },
  {
    question: '下列哪项是\"湿热内蕴\"证的典型舌象？',
    options: [
      'A. 舌红苔黄腻',
      'B. 舌淡苔白',
      'C. 舌红少苔',
      'D. 舌紫暗有瘀斑'
    ],
    correctAnswer: 'A',
    explanation: '湿热内蕴的典型舌象是舌红苔黄腻。舌红表示有热，苔黄腻表示湿热。B是气血虚或寒证，C是阴虚，D是血瘀。',
    difficulty: 'easy'
  },
  {
    question: '患者主诉心悸、失眠多梦、健忘、面色无华、舌淡脉细。最可能的诊断是？',
    options: [
      'A. 心脾两虚',
      'B. 心火亢盛',
      'C. 心肾不交',
      'D. 痰火扰心'
    ],
    correctAnswer: 'A',
    explanation: '心悸、失眠多梦、健忘、面色无华、舌淡脉细是心脾两虚的典型表现。心血虚则心神失养，脾气虚则气血生化不足。',
    difficulty: 'medium'
  },
  {
    question: '在气血津液辨证中，\"口渴但饮水不多\"提示哪种情况？',
    options: [
      'A. 津液不足但有湿邪',
      'B. 实热证',
      'C. 寒证',
      'D. 气虚证'
    ],
    correctAnswer: 'A',
    explanation: '\"口渴但饮水不多\"通常提示津液不足，但同时体内有湿邪阻滞。如果是单纯津液不足（实热证），会口渴喜冷饮、饮水量多。',
    difficulty: 'hard'
  },
  {
    question: '患者脉象沉迟无力，最可能的证型是？',
    options: [
      'A. 阳虚寒盛',
      'B. 阴虚火旺',
      'C. 气滞血瘀',
      'D. 痰湿内盛'
    ],
    correctAnswer: 'A',
    explanation: '脉沉提示病在里，脉迟提示寒证，无力提示虚证。综合起来是阳虚寒盛的表现。阴虚火旺脉象应该是细数；气滞血瘀脉象是涩；痰湿脉象是滑。',
    difficulty: 'medium'
  },
  {
    question: '根据卫气营血辨证，\"身热夜甚、心烦失眠、斑疹隐隐\"属于哪一层病变？',
    options: [
      'A. 营分证',
      'B. 卫分证',
      'C. 气分证',
      'D. 血分证'
    ],
    correctAnswer: 'A',
    explanation: '营分证的典型表现是身热夜甚、心烦失眠、斑疹隐隐、舌红绛。卫分证主要是表证；气分证有高热、口渴、汗出；血分证有出血、神昏等重症。',
    difficulty: 'hard'
  },
  {
    question: '患者主诉眩晕、头重如裹、胸闷、恶心、苔白腻。最适合的治法是？',
    options: [
      'A. 健脾化痰',
      'B. 平肝潜阳',
      'C. 补益气血',
      'D. 滋阴降火'
    ],
    correctAnswer: 'A',
    explanation: '眩晕、头重如裹、胸闷、恶心、苔白腻是痰湿中阻导致的眩晕。治法应该健脾化痰，常用半夏白术天麻汤。',
    difficulty: 'medium'
  },
  {
    question: '下列哪项不是\"血瘀证\"的常见表现？',
    options: [
      'A. 疼痛固定不移',
      'B. 舌紫暗或有瘀斑',
      'C. 脉滑数',
      'D. 肌肤甲错'
    ],
    correctAnswer: 'C',
    explanation: '血瘀证的典型表现包括疼痛固定不移、舌紫暗或有瘀斑、肌肤甲错、脉涩。脉滑数是痰热或湿热的表现，不是血瘀证。',
    difficulty: 'medium'
  },
  {
    question: '患者出现\"五心烦热、潮热盗汗、腰膝酸软、舌红少苔\"，应诊断为？',
    options: [
      'A. 肾阴虚',
      'B. 肾阳虚',
      'C. 心火亢盛',
      'D. 肝阳上亢'
    ],
    correctAnswer: 'A',
    explanation: '五心烦热、潮热盗汗、腰膝酸软、舌红少苔是肾阴虚的典型表现。肾阳虚会有畏寒肢冷；心火亢盛主要是心烦失眠、口舌生疮；肝阳上亢主要是眩晕、头痛。',
    difficulty: 'easy'
  },
  {
    question: '在三焦辨证中，上焦病变主要影响哪些脏腑？',
    options: [
      'A. 肺和心',
      'B. 脾和胃',
      'C. 肝和胆',
      'D. 肾和膀胱'
    ],
    correctAnswer: 'A',
    explanation: '三焦辨证中，上焦包括心和肺；中焦包括脾和胃；下焦包括肝、肾和大小肠。',
    difficulty: 'easy'
  },
  {
    question: '患者主诉腹痛喜按、得温痛减、大便溏薄。最可能的证型是？',
    options: [
      'A. 脾胃虚寒',
      'B. 湿热蕴脾',
      'C. 肝气犯胃',
      'D. 食积胃肠'
    ],
    correctAnswer: 'A',
    explanation: '腹痛喜按、得温痛减、大便溏薄是脾胃虚寒的表现。虚证腹痛喜按，寒证得温痛减。湿热、肝气犯胃、食积都是实证，腹痛拒按。',
    difficulty: 'medium'
  },
  {
    question: '根据经络辨证，\"偏头痛、口苦、胸胁胀痛\"主要与哪条经络相关？',
    options: [
      'A. 足少阳胆经',
      'B. 足阳明胃经',
      'C. 足太阳膀胱经',
      'D. 足厥阴肝经'
    ],
    correctAnswer: 'A',
    explanation: '偏头痛、口苦、胸胁胀痛是足少阳胆经循行部位的症状。胆经循行于头侧、胸胁部。',
    difficulty: 'medium'
  },
  {
    question: '患者舌苔厚腻、脘腹痞闷、恶心呕吐。治疗应首选哪种方法？',
    options: [
      'A. 化湿和中',
      'B. 清热泻火',
      'C. 滋阴润燥',
      'D. 温阳散寒'
    ],
    correctAnswer: 'A',
    explanation: '舌苔厚腻、脘腹痞闷、恶心呕吐是湿浊中阻的表现。治疗应该化湿和中，常用藿香正气散等方剂。',
    difficulty: 'easy'
  },
  {
    question: '下列哪项是\"阴虚证\"和\"阳虚证\"的主要鉴别点？',
    options: [
      'A. 有无怕冷症状',
      'B. 脉象的强弱',
      'C. 舌苔的厚薄',
      'D. 食欲的好坏'
    ],
    correctAnswer: 'A',
    explanation: '阴虚证主要表现为五心烦热、潮热盗汗，无明显怕冷；阳虚证主要表现为畏寒肢冷、喜温。怕冷与否是鉴别阴阳虚的关键。',
    difficulty: 'medium'
  },
  {
    question: '患者出现\"咳嗽、痰多色黄、发热、口渴、舌红苔黄\"，应诊断为？',
    options: [
      'A. 痰热壅肺',
      'B. 风寒袭肺',
      'C. 肺阴虚',
      'D. 肺气虚'
    ],
    correctAnswer: 'A',
    explanation: '咳嗽、痰多色黄、发热、口渴、舌红苔黄是痰热壅肺的典型表现。风寒袭肺痰色白；肺阴虚干咳少痰；肺气虚咳声低弱。',
    difficulty: 'easy'
  },
  {
    question: '在四诊合参中，下列哪项最能反映疾病的本质？',
    options: [
      'A. 舌诊和脉诊',
      'B. 望诊和问诊',
      'C. 闻诊和切诊',
      'D. 问诊和切诊'
    ],
    correctAnswer: 'A',
    explanation: '舌诊和脉诊被认为是最能反映疾病本质的诊法。舌象反映脏腑气血津液的盛衰，脉象反映气血运行和脏腑功能。',
    difficulty: 'medium'
  },
  {
    question: '患者主诉腰痛、小便频数清长、畏寒肢冷、舌淡苔白。治疗原则是？',
    options: [
      'A. 温补肾阳',
      'B. 滋补肾阴',
      'C. 清利湿热',
      'D. 活血化瘀'
    ],
    correctAnswer: 'A',
    explanation: '腰痛、小便频数清长、畏寒肢冷、舌淡苔白是肾阳虚的表现。治疗原则应该温补肾阳，常用右归丸等方剂。',
    difficulty: 'easy'
  },
  {
    question: '根据气机辨证，\"胸闷不舒、善太息、情绪抑郁\"属于哪种气机失调？',
    options: [
      'A. 气滞',
      'B. 气逆',
      'C. 气陷',
      'D. 气脱'
    ],
    correctAnswer: 'A',
    explanation: '胸闷不舒、善太息、情绪抑郁是气滞的典型表现，多见于肝气郁结。气逆是气上冲；气陷是中气下陷；气脱是元气耗散。',
    difficulty: 'medium'
  },
  {
    question: '患者脉象弦细数，最可能提示哪种病理状态？',
    options: [
      'A. 肝阴虚或肝火旺',
      'B. 脾气虚',
      'C. 肾阳虚',
      'D. 心气虚'
    ],
    correctAnswer: 'A',
    explanation: '脉弦提示肝病或疼痛，脉细提示血虚或阴虚，脉数提示有热。综合起来是肝阴虚或肝火旺的表现。',
    difficulty: 'hard'
  },
  {
    question: '下列哪项是\"实证\"的特点？',
    options: [
      'A. 腹痛拒按、脉实有力',
      'B. 腹痛喜按、脉虚无力',
      'C. 低热、盗汗、脉细数',
      'D. 畏寒肢冷、脉沉迟无力'
    ],
    correctAnswer: 'A',
    explanation: '实证的特点是正气尚强、邪气盛，表现为腹痛拒按、脉实有力、声高气粗等。虚证则是腹痛喜按、脉虚无力。',
    difficulty: 'easy'
  },
  {
    question: '患者主诉眼干、视物模糊、手足心热、舌红少津。最可能的诊断是？',
    options: [
      'A. 肝血虚',
      'B. 肝火上炎',
      'C. 肝气郁结',
      'D. 肝阳上亢'
    ],
    correctAnswer: 'A',
    explanation: '眼干、视物模糊是肝血不足、目失所养的表现；手足心热、舌红少津提示有阴虚。综合判断是肝血虚兼阴虚。',
    difficulty: 'medium'
  },
  {
    question: '在脏腑辨证中，\"嗳气吞酸、胃脘灼痛、口干口苦\"属于哪种证型？',
    options: [
      'A. 胃热炽盛',
      'B. 胃寒证',
      'C. 脾胃气虚',
      'D. 食积胃肠'
    ],
    correctAnswer: 'A',
    explanation: '嗳气吞酸、胃脘灼痛、口干口苦是胃热炽盛的典型表现。胃寒证会有胃脘冷痛、得温痛减；脾胃气虚表现为食少、倦怠；食积有脘腹胀满、不思饮食。',
    difficulty: 'medium'
  },
  {
    question: '患者出现\"头晕目眩、耳鸣、急躁易怒、面红目赤、脉弦有力\"，应诊断为？',
    options: [
      'A. 肝阳上亢',
      'B. 肝血虚',
      'C. 肝气郁结',
      'D. 肝火上炎'
    ],
    correctAnswer: 'A',
    explanation: '头晕目眩、耳鸣、急躁易怒、面红目赤、脉弦有力是肝阳上亢的典型表现。与肝火上炎相比，肝阳上亢更强调眩晕、耳鸣等上实下虚的症状。',
    difficulty: 'medium'
  },
  {
    question: '根据病因辨证，\"恶寒重、发热轻、无汗、脉浮紧\"属于哪种外感？',
    options: [
      'A. 风寒表证',
      'B. 风热表证',
      'C. 暑湿表证',
      'D. 燥邪犯肺'
    ],
    correctAnswer: 'A',
    explanation: '恶寒重、发热轻、无汗、脉浮紧是风寒表证的典型表现。风热表证是发热重、恶寒轻、有汗；暑湿有身热不扬、汗出不畅；燥邪有干咳少痰。',
    difficulty: 'easy'
  },
  {
    question: '患者主诉耳鸣如蝉、腰膝酸软、遗精、舌红少苔。最适合的治疗原则是？',
    options: [
      'A. 滋补肾阴',
      'B. 温补肾阳',
      'C. 补益肝肾',
      'D. 清肝泻火'
    ],
    correctAnswer: 'A',
    explanation: '耳鸣如蝉、腰膝酸软、遗精、舌红少苔是肾阴虚的表现。肾主藏精，肾阴虚则精关不固导致遗精，虚火上扰导致耳鸣。治疗应滋补肾阴。',
    difficulty: 'medium'
  }
]

async function main() {
  console.log('🚀 Starting question generation...\n')

  // 添加Domain 2的题目
  console.log('📝 Adding Domain 2 questions...')
  const result = await addQuestions(domain2Questions, 'DOMAIN_2_DIAGNOSIS')

  console.log('\n✅ Generation complete!')
  console.log(`Total added: ${result?.added || 0}`)
  console.log(`Total duplicates skipped: ${result?.duplicates || 0}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
