import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 这些是之前seed-questions生成的原始题目（不包括有占位符的）
const qualityQuestions = [
  // Domain 1: 評估病人 (Assessment)
  {
    examType: 'cale',
    type: 'multiple_choice',
    question: '在四诊合参中，下列哪项最能反映疾病的本质？',
    options: ['A. 舌诊和脉诊', 'B. 问诊', 'C. 望诊', 'D. 切诊'],
    correctAnswer: 'A. 舌诊和脉诊',
    explanation: '舌诊和脉诊被认为是最能反映疾病本质的诊法。舌象反映脏腑气血津液的盛衰，脉象反映气血运行和脏腑功能。',
    difficulty: 'medium',
    categoryCode: 'DOMAIN_1_ASSESSMENT'
  },
  {
    examType: 'cale',
    type: 'multiple_choice',
    question: '患者主诉头痛、恶寒发热，应首先考虑的辨证是？',
    options: ['A. 外感表证', 'B. 内伤头痛', 'C. 肝阳上亢', 'D. 痰浊上扰'],
    correctAnswer: 'A. 外感表证',
    explanation: '头痛伴恶寒发热是外感表证的典型表现，需要进一步辨别风寒还是风热。这是诊断与治疗计划的重要环节。',
    difficulty: 'easy',
    categoryCode: 'DOMAIN_1_ASSESSMENT'
  },
  {
    examType: 'cale',
    type: 'multiple_choice',
    question: '望舌质时，发现舌体胖大有齿痕，提示：',
    options: ['A. 气虚或阳虚', 'B. 阴虚火旺', 'C. 血瘀', 'D. 气滞'],
    correctAnswer: 'A. 气虚或阳虚',
    explanation: '舌体胖大有齿痕是脾气虚或脾阳虚的表现，因为水湿停聚，舌体肿胀，与牙齿摩擦形成齿痕。',
    difficulty: 'medium',
    categoryCode: 'DOMAIN_1_ASSESSMENT'
  },

  // Domain 2: 診斷和治療計劃
  {
    examType: 'cale',
    type: 'multiple_choice',
    question: '根据中医辨证论治原则，治疗应遵循的基本原则是：',
    options: ['A. 治病求本', 'B. 扶正祛邪', 'C. 调整阴阳', 'D. 以上都是'],
    correctAnswer: 'D. 以上都是',
    explanation: '中医治疗的基本原则包括治病求本（找到疾病根源）、扶正祛邪（增强正气、祛除邪气）、调整阴阳（恢复人体平衡）。这三个原则是相辅相成的。',
    difficulty: 'easy',
    categoryCode: 'DOMAIN_2_DIAGNOSIS'
  },

  // Domain 3D: 中藥治療
  {
    examType: 'cale',
    type: 'multiple_choice',
    question: '人参的主要功效是什么？',
    options: ['A. 滋阴降火', 'B. 大补元气', 'C. 活血化瘀', 'D. 清热解毒'],
    correctAnswer: 'B. 大补元气',
    explanation: '人参味甘、微苦，性微温，归脾、肺、心经，具有大补元气、补脾益肺、生津止渴、安神益智的功效。属于中药治疗范畴。',
    difficulty: 'easy',
    categoryCode: 'DOMAIN_3D_HERBAL'
  }
]

async function restoreQuestions() {
  console.log('开始恢复题目...\n')

  const categories = await prisma.category.findMany({
    where: { examType: 'cale', type: 'content' }
  })

  const categoryMap: Record<string, string> = {}
  categories.forEach(cat => {
    categoryMap[cat.code] = cat.id
  })

  let count = 0

  for (const q of qualityQuestions) {
    const categoryId = categoryMap[q.categoryCode]
    if (!categoryId) {
      console.log(`⚠ 找不到分类: ${q.categoryCode}`)
      continue
    }

    try {
      await prisma.question.create({
        data: {
          examType: q.examType,
          type: q.type,
          question: q.question,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          categoryId: categoryId
        }
      })
      count++
      console.log(`✓ 添加题目: ${q.question.substring(0, 40)}...`)
    } catch (error) {
      console.error(`✗ 添加失败: ${q.question.substring(0, 40)}...`)
    }
  }

  console.log(`\n完成！共恢复 ${count} 道题目`)

  const total = await prisma.question.count({ where: { examType: 'cale' } })
  console.log(`当前题库总数: ${total} 道题目`)
}

restoreQuestions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
