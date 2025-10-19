import { PrismaClient } from '@prisma/client'
import { examInfoData, caleCategories, nccaomCategories } from './exam-data'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 创建默认用户
  const user = await prisma.user.upsert({
    where: { email: 'demo@cale.com' },
    update: {},
    create: {
      name: '演示用户',
      email: 'demo@cale.com'
    }
  })

  console.log('创建用户:', user.name)

  // 创建考试信息元数据
  console.log('\n创建考试信息元数据...')

  for (const examData of Object.values(examInfoData)) {
    const examInfo = await prisma.examInfo.upsert({
      where: { examType: examData.examType },
      update: examData,
      create: examData
    })
    console.log(`  创建考试信息: ${examInfo.name} - ${examInfo.fullName}`)
  }

  // 创建考试大纲分类 - Cale 和 NCCAOM
  // 注意：分类数据已从 exam-data.ts 导入，不再需要 categoryTemplates
  const examCategories = {
    cale: caleCategories,
    nccaom: nccaomCategories
  }

  // 为两种考试类型创建详细分类
  const examTypes = ['cale', 'nccaom'] as const

  for (const examType of examTypes) {
    console.log(`\n创建 ${examType.toUpperCase()} 考试分类...`)

    const categories = examCategories[examType]
    for (const categoryData of categories) {
      const category = await prisma.category.upsert({
        where: {
          code_examType: {
            code: categoryData.code,
            examType: examType
          }
        },
        update: categoryData,
        create: {
          ...categoryData,
          examType: examType
        }
      })
      console.log(`  ✓ ${category.name} ${category.weight ? `(${category.weight}%)` : ''}`)
    }
  }

  // 创建示例题目（更新为新的领域分类代码）
  const sampleQuestions = [
    {
      type: 'multiple_choice',
      question: '中医理论中，"阴阳"的基本概念是什么？',
      options: JSON.stringify([
        'A. 阴阳是对立统一的两个方面',
        'B. 阴阳是完全独立的概念',
        'C. 阴阳只存在于自然界',
        'D. 阴阳是西医概念'
      ]),
      correctAnswer: 'A. 阴阳是对立统一的两个方面',
      explanation: '阴阳学说认为，阴阳是自然界一切事物中对立统一的两个方面，相互依存、相互制约、相互转化。属于中医基础理论，是评估和诊断的重要理论基础。',
      difficulty: 'easy',
      categoryCode: 'DOMAIN_1_ASSESSMENT'  // 评估病人 - 中医理论基础
    },
    {
      type: 'multiple_choice',
      question: '五脏中，主藏血的是哪一脏？',
      options: JSON.stringify([
        'A. 心',
        'B. 肝',
        'C. 脾',
        'D. 肺'
      ]),
      correctAnswer: 'B. 肝',
      explanation: '中医理论认为"肝主藏血"，肝具有贮藏血液和调节血量的功能。这是病人评估时需要掌握的脏腑基础理论。',
      difficulty: 'medium',
      categoryCode: 'DOMAIN_1_ASSESSMENT'  // 评估病人 - 脏腑功能
    },
    {
      type: 'multiple_choice',
      question: '四诊中的"望诊"主要包括哪些内容？',
      options: JSON.stringify([
        'A. 望神、望色、望形、望态',
        'B. 听声音、闻气味',
        'C. 询问病史',
        'D. 切脉搏'
      ]),
      correctAnswer: 'A. 望神、望色、望形、望态',
      explanation: '望诊是通过观察病人的神、色、形、态等外在表现来诊察疾病的方法，是患者评估的重要组成部分。',
      difficulty: 'medium',
      categoryCode: 'DOMAIN_1_ASSESSMENT'  // 评估病人 - 四诊方法
    },
    {
      type: 'multiple_choice',
      question: '人参的主要功效是什么？',
      options: JSON.stringify([
        'A. 清热解毒',
        'B. 大补元气',
        'C. 活血化瘀',
        'D. 理气止痛'
      ]),
      correctAnswer: 'B. 大补元气',
      explanation: '人参味甘、微苦，性微温，归脾、肺、心经，具有大补元气、补脾益肺、生津止渴、安神益智的功效。属于中药治疗范畴。',
      difficulty: 'easy',
      categoryCode: 'DOMAIN_3D_HERBAL'  // 治疗 - 中药治疗
    },
    {
      type: 'multiple_choice',
      question: '四君子汤的组成药物是？',
      options: JSON.stringify([
        'A. 人参、白术、茯苓、甘草',
        'B. 当归、川芎、白芍、熟地',
        'C. 麻黄、桂枝、杏仁、甘草',
        'D. 柴胡、黄芩、半夏、生姜'
      ]),
      correctAnswer: 'A. 人参、白术、茯苓、甘草',
      explanation: '四君子汤是补气的基础方，由人参、白术、茯苓、甘草四味药组成，主治脾胃气虚证。属于中药方剂治疗。',
      difficulty: 'medium',
      categoryCode: 'DOMAIN_3D_HERBAL'  // 治疗 - 中药治疗
    },
    {
      type: 'multiple_choice',
      question: '足三里穴位于？',
      options: JSON.stringify([
        'A. 外膝眼下3寸，胫骨前嵴外一横指',
        'B. 内踝尖上3寸',
        'C. 腕横纹上2寸',
        'D. 肘横纹外端'
      ]),
      correctAnswer: 'A. 外膝眼下3寸，胫骨前嵴外一横指',
      explanation: '足三里是胃经的合穴，位于外膝眼（犊鼻）下3寸，距胫骨前嵴一横指（中指）。属于穴位定位与针刺技术。',
      difficulty: 'medium',
      categoryCode: 'DOMAIN_3B_ACU_TECHNIQUE'  // 治疗 - 取穴定位与针刺手法
    },
    {
      type: 'multiple_choice',
      question: '针刺的基本手法有哪些？',
      options: JSON.stringify([
        'A. 提插法、捻转法',
        'B. 推拿法、按摩法',
        'C. 刮痧法、拔罐法',
        'D. 艾灸法、熏蒸法'
      ]),
      correctAnswer: 'A. 提插法、捻转法',
      explanation: '针刺的基本手法主要有提插法和捻转法，通过这两种手法可以调整针刺的强度和方向。属于针刺操作技术。',
      difficulty: 'easy',
      categoryCode: 'DOMAIN_3B_ACU_TECHNIQUE'  // 治疗 - 取穴定位与针刺手法
    },
    {
      type: 'multiple_choice',
      question: '感冒风寒证的针灸治疗选穴应包括？',
      options: JSON.stringify([
        'A. 风池、列缺、合谷',
        'B. 曲池、大椎、足三里',
        'C. 内关、公孙、三阴交',
        'D. 太冲、行间、侠溪'
      ]),
      correctAnswer: 'A. 风池、列缺、合谷',
      explanation: '风寒感冒的针灸治疗以疏风散寒为主，常选风池、列缺、合谷等穴位。属于根据辨证选择穴位的能力。',
      difficulty: 'medium',
      categoryCode: 'DOMAIN_3A_ACU_SELECTION'  // 治疗 - 针刺选穴
    },
    {
      type: 'multiple_choice',
      question: '患者主诉头痛、恶寒发热，应首先考虑的辨证是？',
      options: JSON.stringify([
        'A. 外感表证',
        'B. 内伤气虚',
        'C. 肝阳上亢',
        'D. 痰浊阻窍'
      ]),
      correctAnswer: 'A. 外感表证',
      explanation: '头痛伴恶寒发热是外感表证的典型表现，需要进一步辨别风寒还是风热。这是诊断与治疗计划的重要环节。',
      difficulty: 'easy',
      categoryCode: 'DOMAIN_2_DIAGNOSIS'  // 诊断和治疗计划
    }
  ]

  // 为两种考试类型创建题目
  for (const examType of examTypes) {
    console.log(`\n创建 ${examType.toUpperCase()} 考试题目...`)

    for (const questionData of sampleQuestions) {
      const category = await prisma.category.findFirst({
        where: {
          code: questionData.categoryCode,
          examType: examType
        }
      })

      if (category) {
        const { categoryCode, ...data } = questionData
        const question = await prisma.question.create({
          data: {
            ...data,
            examType: examType,
            categoryId: category.id
          }
        })
        console.log(`  创建题目 [${examType}]:`, question.question.substring(0, 30) + '...')
      }
    }
  }

  console.log('\n数据库初始化完成！')
  console.log('✅ 已为 Cale 和 NCCAOM 两种考试创建完整数据')
}

main()
  .catch((e) => {
    console.error('初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
