import { PrismaClient } from '@prisma/client'
import { caleOfficialOutline } from './exam-data'

const prisma = new PrismaClient()

// 示例题目模板 - 基于官方大纲的真实任务
const questionTemplates = {
  // Domain 1: Patient Assessment (27%)
  domain1: [
    {
      question: '一位45岁女性患者主诉头痛伴眩晕3个月。舌红少苔，脉弦细数。根据四诊合参，最可能的诊断是：',
      options: JSON.stringify([
        'A. 肝阳上亢',
        'B. 气血两虚',
        'C. 肝肾阴虚',
        'D. 痰浊中阻'
      ]),
      correctAnswer: 'C. 肝肾阴虚',
      explanation: '舌红少苔提示阴虚，脉弦细数符合肝肾阴虚证候。头痛眩晕是肝肾阴虚导致虚阳上扰的表现。',
      difficulty: 'medium',
      taskIds: ['T1', 'T2', 'T4'] // Gather health history, Conduct exam, Integrate findings
    },
    {
      question: '患者舌淡胖，边有齿痕，苔白滑。此舌象最能反映的病机是：',
      options: JSON.stringify([
        'A. 气虚湿盛',
        'B. 血虚风动',
        'C. 阴虚火旺',
        'D. 气滞血瘀'
      ]),
      correctAnswer: 'A. 气虚湿盛',
      explanation: '舌淡胖有齿痕为脾气虚的表现，苔白滑为湿邪内盛。二者合参为气虚湿盛。',
      difficulty: 'easy',
      taskIds: ['T3', 'T4'] // Perform tongue and pulse diagnosis
    },
    {
      question: '根据八纲辨证，以下哪项组合属于表寒实证？',
      options: JSON.stringify([
        'A. 发热恶寒，无汗，脉浮紧',
        'B. 恶寒发热，自汗，脉浮缓',
        'C. 但寒不热，四肢厥冷，脉沉迟',
        'D. 但热不寒，口渴，脉洪数'
      ]),
      correctAnswer: 'A. 发热恶寒，无汗，脉浮紧',
      explanation: '表证见恶寒发热，寒证无汗，实证脉浮紧，符合表寒实证特点。',
      difficulty: 'medium',
      taskIds: ['T5', 'T6'] // Apply diagnostic theories
    },
    {
      question: '患者咳嗽气喘，痰多色白，畏寒肢冷，舌淡苔白，脉沉细。治疗应首选：',
      options: JSON.stringify([
        'A. 清肺化痰',
        'B. 温肺化饮',
        'C. 养阴润肺',
        'D. 泻肺平喘'
      ]),
      correctAnswer: 'B. 温肺化饮',
      explanation: '寒饮咳喘证，症见痰白、畏寒、舌淡脉沉，治疗当温肺化饮。',
      difficulty: 'medium',
      taskIds: ['T7', 'T18'] // Differentiate patterns
    }
  ],

  // Domain 2: Diagnosis and Treatment Planning (17%)
  domain2: [
    {
      question: '根据中医诊断原则，确定主证时最重要的依据是：',
      options: JSON.stringify([
        'A. 病人的主诉',
        'B. 症状的轻重缓急',
        'C. 四诊所获得的主要矛盾',
        'D. 疾病的发展趋势'
      ]),
      correctAnswer: 'C. 四诊所获得的主要矛盾',
      explanation: '中医诊断强调四诊合参，通过望闻问切获得的主要矛盾来确定主证。',
      difficulty: 'medium',
      taskIds: ['T24', 'T25']
    },
    {
      question: '制定治疗计划时，需要考虑的患者相关因素不包括：',
      options: JSON.stringify([
        'A. 年龄和体质',
        'B. 疾病的急缓',
        'C. 医生的治疗偏好',
        'D. 患者的经济状况'
      ]),
      correctAnswer: 'C. 医生的治疗偏好',
      explanation: '治疗计划应基于患者的具体情况，包括年龄、体质、病情急缓和经济条件，而非医生个人偏好。',
      difficulty: 'easy',
      taskIds: ['T30', 'T34']
    },
    {
      question: '患者胸闷心悸，气短乏力，舌淡紫，脉结代。从脏腑辨证角度，最可能涉及的脏是：',
      options: JSON.stringify([
        'A. 心',
        'B. 肺',
        'C. 肝',
        'D. 肾'
      ]),
      correctAnswer: 'A. 心',
      explanation: '心悸、脉结代是心脏病变的典型表现，舌淡紫提示心血瘀阻。',
      difficulty: 'easy',
      taskIds: ['T26', 'T27']
    },
    {
      question: '在制定长期治疗计划时，以下哪项最重要？',
      options: JSON.stringify([
        'A. 确定治疗频率和疗程',
        'B. 评估患者的依从性',
        'C. 设定可测量的治疗目标',
        'D. 以上都重要'
      ]),
      correctAnswer: 'D. 以上都重要',
      explanation: '长期治疗计划需要综合考虑治疗频率、患者依从性和可测量的目标，三者缺一不可。',
      difficulty: 'medium',
      taskIds: ['T35', 'T36', 'T37']
    }
  ],

  // Domain 3: Acupuncture Treatment (32%)
  domain3: [
    // Subarea 3A: Acupuncture Point Selection (16%)
    {
      question: '治疗胃痛，根据"腑会中脘"的原则，应首选的腧穴是：',
      options: JSON.stringify([
        'A. 中脘',
        'B. 足三里',
        'C. 内关',
        'D. 公孙'
      ]),
      correctAnswer: 'A. 中脘',
      explanation: '中脘为腑会，是治疗六腑病证的要穴，对胃痛有特殊疗效。',
      difficulty: 'easy',
      taskIds: ['T69', 'T70']
    },
    {
      question: '患者失眠多梦，心烦易怒，口苦咽干，舌红苔黄，脉弦数。治疗应选择的主要经脉是：',
      options: JSON.stringify([
        'A. 心经、肝经',
        'B. 脾经、肾经',
        'C. 肺经、大肠经',
        'D. 胃经、胆经'
      ]),
      correctAnswer: 'A. 心经、肝经',
      explanation: '失眠多梦属心，心烦易怒、口苦属肝胆，应取心经和肝经穴位。',
      difficulty: 'medium',
      taskIds: ['T71', 'T72', 'T73']
    },
    {
      question: '头痛前额部，选用以下哪条经的穴位最合适？',
      options: JSON.stringify([
        'A. 足阳明胃经',
        'B. 足太阳膀胱经',
        'C. 足少阳胆经',
        'D. 足厥阴肝经'
      ]),
      correctAnswer: 'A. 足阳明胃经',
      explanation: '根据"头为诸阳之会"，前额属阳明，应取足阳明胃经穴位。',
      difficulty: 'medium',
      taskIds: ['T75', 'T76']
    },

    // Subarea 3B: Point Location and Needling (8%)
    {
      question: '内关穴的标准定位是：',
      options: JSON.stringify([
        'A. 腕横纹上2寸，掌长肌腱与桡侧腕屈肌腱之间',
        'B. 腕横纹上3寸，掌长肌腱与桡侧腕屈肌腱之间',
        'C. 腕横纹上2寸，桡侧腕屈肌腱桡侧缘',
        'D. 腕横纹上3寸，尺侧腕屈肌腱尺侧缘'
      ]),
      correctAnswer: 'A. 腕横纹上2寸，掌长肌腱与桡侧腕屈肌腱之间',
      explanation: '内关穴位于前臂掌侧，腕横纹上2寸，掌长肌腱与桡侧腕屈肌腱之间。',
      difficulty: 'easy',
      taskIds: ['T99', 'T100']
    },
    {
      question: '针刺足三里时，标准的进针深度应为：',
      options: JSON.stringify([
        'A. 0.5-0.8寸',
        'B. 1-1.5寸',
        'C. 1.5-2寸',
        'D. 2-3寸'
      ]),
      correctAnswer: 'B. 1-1.5寸',
      explanation: '足三里穴直刺1-1.5寸，不宜过深以免损伤腓总神经。',
      difficulty: 'medium',
      taskIds: ['T101', 'T102']
    },
    {
      question: '针刺哑门穴时，患者应采取的体位是：',
      options: JSON.stringify([
        'A. 仰卧位',
        'B. 俯卧位',
        'C. 正坐低头位',
        'D. 侧卧位'
      ]),
      correctAnswer: 'C. 正坐低头位',
      explanation: '哑门穴位于颈后部，正坐低头位便于准确定位和进针，且较为安全。',
      difficulty: 'medium',
      taskIds: ['T103', 'T104']
    },

    // Subarea 3C: Adjunctive Modalities (5%)
    {
      question: '艾灸的禁忌症包括：',
      options: JSON.stringify([
        'A. 实热证、阴虚发热',
        'B. 虚寒证、阳虚证',
        'C. 气虚证、血虚证',
        'D. 痰湿证、气滞证'
      ]),
      correctAnswer: 'A. 实热证、阴虚发热',
      explanation: '艾灸性温，适用于虚寒证，禁用于实热证和阴虚发热。',
      difficulty: 'easy',
      taskIds: ['T109', 'T112']
    },
    {
      question: '拔罐时出现烫伤水泡，应采取的处理措施是：',
      options: JSON.stringify([
        'A. 立即挑破水泡放水',
        'B. 消毒后用无菌注射器抽出水泡液',
        'C. 不处理，让其自行吸收',
        'D. 涂抹抗生素软膏'
      ]),
      correctAnswer: 'B. 消毒后用无菌注射器抽出水泡液',
      explanation: '烫伤水泡应在严格消毒后用无菌注射器抽出液体，保持水泡皮完整以防感染。',
      difficulty: 'medium',
      taskIds: ['T113', 'T115']
    },
    {
      question: '电针治疗时，连续波（密波）主要适用于：',
      options: JSON.stringify([
        'A. 镇痛',
        'B. 兴奋肌肉',
        'C. 镇静安神',
        'D. 疏通经络'
      ]),
      correctAnswer: 'C. 镇静安神',
      explanation: '连续波频率较高，具有镇静安神作用；疏密波则主要用于镇痛。',
      difficulty: 'medium',
      taskIds: ['T116', 'T117']
    }
  ],

  // Domain 4: Herbal Therapy (15%)
  domain4: [
    {
      question: '麻黄汤的组成药物是：',
      options: JSON.stringify([
        'A. 麻黄、桂枝、杏仁、甘草',
        'B. 麻黄、白芍、生姜、大枣',
        'C. 麻黄、石膏、杏仁、甘草',
        'D. 麻黄、附子、细辛、甘草'
      ]),
      correctAnswer: 'A. 麻黄、桂枝、杏仁、甘草',
      explanation: '麻黄汤由麻黄、桂枝、杏仁、甘草组成，为辛温解表的代表方。',
      difficulty: 'easy',
      taskIds: ['T123', 'T124']
    },
    {
      question: '六味地黄丸的功效是：',
      options: JSON.stringify([
        'A. 滋补肝肾',
        'B. 温补肾阳',
        'C. 养血柔肝',
        'D. 健脾益气'
      ]),
      correctAnswer: 'A. 滋补肝肾',
      explanation: '六味地黄丸以熟地黄为君药，具有滋补肝肾之阴的功效。',
      difficulty: 'easy',
      taskIds: ['T125', 'T126']
    },
    {
      question: '附子的主要配伍禁忌药物是：',
      options: JSON.stringify([
        'A. 半夏、瓜蒌、贝母',
        'B. 人参、黄芪、白术',
        'C. 当归、川芎、白芍',
        'D. 陈皮、茯苓、甘草'
      ]),
      correctAnswer: 'A. 半夏、瓜蒌、贝母',
      explanation: '附子为乌头类药物，与半夏、瓜蒌、贝母等相反，不宜同用。',
      difficulty: 'medium',
      taskIds: ['T127', 'T128']
    },
    {
      question: '孕妇禁用的中药包括：',
      options: JSON.stringify([
        'A. 当归、川芎、益母草',
        'B. 党参、黄芪、白术',
        'C. 枸杞、菊花、决明子',
        'D. 山药、茯苓、甘草'
      ]),
      correctAnswer: 'A. 当归、川芎、益母草',
      explanation: '活血化瘀药如当归、川芎、益母草可能导致流产，孕妇应禁用。',
      difficulty: 'medium',
      taskIds: ['T129', 'T130']
    },
    {
      question: '煎药时，以下哪种药物应该后下？',
      options: JSON.stringify([
        'A. 薄荷、钩藤',
        'B. 龙骨、牡蛎',
        'C. 附子、川乌',
        'D. 人参、鹿茸'
      ]),
      correctAnswer: 'A. 薄荷、钩藤',
      explanation: '芳香类药物如薄荷，以及有效成分易挥发或久煎易破坏的药物如钩藤应后下。',
      difficulty: 'medium',
      taskIds: ['T133', 'T134']
    }
  ],

  // Domain 5: California Regulations and Professional Responsibilities (11%)
  domain5: [
    {
      question: '根据加州法律，针灸师的执业范围不包括：',
      options: JSON.stringify([
        'A. 针刺治疗',
        'B. 中药配方',
        'C. 开具西药处方',
        'D. 推拿按摩'
      ]),
      correctAnswer: 'C. 开具西药处方',
      explanation: '加州针灸师可以进行针灸治疗、配制中药和推拿，但不能开具西药处方。',
      difficulty: 'easy',
      taskIds: ['T140', 'T141']
    },
    {
      question: '针灸诊所必须保存患者病历的最短时间是：',
      options: JSON.stringify([
        'A. 3年',
        'B. 5年',
        'C. 7年',
        'D. 10年'
      ]),
      correctAnswer: 'C. 7年',
      explanation: '根据加州法律，医疗机构必须保存患者病历至少7年。',
      difficulty: 'medium',
      taskIds: ['T142', 'T143']
    },
    {
      question: '发现患者可能患有传染病时，针灸师应该：',
      options: JSON.stringify([
        'A. 继续治疗，无需特殊措施',
        'B. 拒绝治疗该患者',
        'C. 建议患者就医并采取必要的防护措施',
        'D. 立即向卫生部门报告'
      ]),
      correctAnswer: 'C. 建议患者就医并采取必要的防护措施',
      explanation: '发现传染病征兆时，应建议患者就医确诊，同时采取适当防护措施继续治疗。',
      difficulty: 'medium',
      taskIds: ['T144', 'T145']
    },
    {
      question: '针灸师在治疗过程中必须遵守的清洁针法（Clean Needle Technique）要求包括：',
      options: JSON.stringify([
        'A. 使用一次性针灸针',
        'B. 针刺前对皮肤进行消毒',
        'C. 保持双手清洁',
        'D. 以上都是'
      ]),
      correctAnswer: 'D. 以上都是',
      explanation: 'Clean Needle Technique要求使用一次性针具、皮肤消毒和手部清洁，以防止交叉感染。',
      difficulty: 'easy',
      taskIds: ['T146', 'T147']
    },
    {
      question: '加州针灸师继续教育（CEU）的要求是：',
      options: JSON.stringify([
        'A. 每年15个学分',
        'B. 每两年30个学分',
        'C. 每年30个学分',
        'D. 每两年50个学分'
      ]),
      correctAnswer: 'D. 每两年50个学分',
      explanation: '加州针灸师需要每两年完成50个继续教育学分以维持执照。',
      difficulty: 'medium',
      taskIds: ['T150', 'T151']
    },
    {
      question: '患者有权查看和获取自己的医疗记录，诊所应在收到请求后多长时间内提供？',
      options: JSON.stringify([
        'A. 5个工作日',
        'B. 10个工作日',
        'C. 15个工作日',
        'D. 30个工作日'
      ]),
      correctAnswer: 'C. 15个工作日',
      explanation: '根据HIPAA法规，医疗机构应在收到请求后15个工作日内提供患者医疗记录。',
      difficulty: 'medium',
      taskIds: ['T152', 'T153']
    }
  ]
}

async function main() {
  console.log('🌱 开始填充题目数据...\n')

  // 获取所有分类
  const categories = await prisma.category.findMany({
    where: { examType: 'cale', type: 'content' }
  })

  const categoryMap: Record<string, any> = {}
  categories.forEach(cat => {
    categoryMap[cat.code] = cat
  })

  let totalCreated = 0

  // Domain 1 题目
  console.log('📝 创建 Domain 1 (Patient Assessment) 题目...')
  const domain1Category = categoryMap['DOMAIN_1_ASSESSMENT']
  if (domain1Category) {
    for (const template of questionTemplates.domain1) {
      await prisma.question.create({
        data: {
          examType: 'cale',
          type: 'multiple_choice',
          question: template.question,
          options: template.options,
          correctAnswer: template.correctAnswer,
          explanation: template.explanation,
          difficulty: template.difficulty,
          categoryId: domain1Category.id,
          tags: JSON.stringify(template.taskIds),
          source: 'Official Outline Tasks'
        }
      })
      totalCreated++
    }
    console.log(`  ✓ 创建了 ${questionTemplates.domain1.length} 道题目`)
  }

  // Domain 2 题目
  console.log('📝 创建 Domain 2 (Diagnosis and Treatment Planning) 题目...')
  const domain2Category = categoryMap['DOMAIN_2_DIAGNOSIS']
  if (domain2Category) {
    for (const template of questionTemplates.domain2) {
      await prisma.question.create({
        data: {
          examType: 'cale',
          type: 'multiple_choice',
          question: template.question,
          options: template.options,
          correctAnswer: template.correctAnswer,
          explanation: template.explanation,
          difficulty: template.difficulty,
          categoryId: domain2Category.id,
          tags: JSON.stringify(template.taskIds),
          source: 'Official Outline Tasks'
        }
      })
      totalCreated++
    }
    console.log(`  ✓ 创建了 ${questionTemplates.domain2.length} 道题目`)
  }

  // Domain 3 题目 - 分散到各个子域
  console.log('📝 创建 Domain 3 (Acupuncture Treatment) 题目...')

  // 3A: Acupuncture Selection
  const domain3ACategory = categoryMap['DOMAIN_3A_ACU_SELECTION']
  if (domain3ACategory) {
    const acuSelectionQuestions = questionTemplates.domain3.filter(q =>
      q.taskIds.some((t: string) => parseInt(t.substring(1)) >= 69 && parseInt(t.substring(1)) <= 98)
    )
    for (const template of acuSelectionQuestions) {
      await prisma.question.create({
        data: {
          examType: 'cale',
          type: 'multiple_choice',
          question: template.question,
          options: template.options,
          correctAnswer: template.correctAnswer,
          explanation: template.explanation,
          difficulty: template.difficulty,
          categoryId: domain3ACategory.id,
          tags: JSON.stringify(template.taskIds),
          source: 'Official Outline Tasks'
        }
      })
      totalCreated++
    }
    console.log(`  ✓ 创建了 ${acuSelectionQuestions.length} 道 Domain 3A 题目`)
  }

  // 3B: Point Location and Needling
  const domain3BCategory = categoryMap['DOMAIN_3B_ACU_TECHNIQUE']
  if (domain3BCategory) {
    const needlingQuestions = questionTemplates.domain3.filter(q =>
      q.taskIds.some((t: string) => parseInt(t.substring(1)) >= 99 && parseInt(t.substring(1)) <= 108)
    )
    for (const template of needlingQuestions) {
      await prisma.question.create({
        data: {
          examType: 'cale',
          type: 'multiple_choice',
          question: template.question,
          options: template.options,
          correctAnswer: template.correctAnswer,
          explanation: template.explanation,
          difficulty: template.difficulty,
          categoryId: domain3BCategory.id,
          tags: JSON.stringify(template.taskIds),
          source: 'Official Outline Tasks'
        }
      })
      totalCreated++
    }
    console.log(`  ✓ 创建了 ${needlingQuestions.length} 道 Domain 3B 题目`)
  }

  // 3C: Adjunctive Modalities
  const domain3CCategory = categoryMap['DOMAIN_3C_ADJUNCTIVE']
  if (domain3CCategory) {
    const adjunctiveQuestions = questionTemplates.domain3.filter(q =>
      q.taskIds.some((t: string) => parseInt(t.substring(1)) >= 109 && parseInt(t.substring(1)) <= 122)
    )
    for (const template of adjunctiveQuestions) {
      await prisma.question.create({
        data: {
          examType: 'cale',
          type: 'multiple_choice',
          question: template.question,
          options: template.options,
          correctAnswer: template.correctAnswer,
          explanation: template.explanation,
          difficulty: template.difficulty,
          categoryId: domain3CCategory.id,
          tags: JSON.stringify(template.taskIds),
          source: 'Official Outline Tasks'
        }
      })
      totalCreated++
    }
    console.log(`  ✓ 创建了 ${adjunctiveQuestions.length} 道 Domain 3C 题目`)
  }

  // Domain 4 题目
  console.log('📝 创建 Domain 4 (Herbal Therapy) 题目...')
  const domain4Category = categoryMap['DOMAIN_3D_HERBAL']
  if (domain4Category) {
    for (const template of questionTemplates.domain4) {
      await prisma.question.create({
        data: {
          examType: 'cale',
          type: 'multiple_choice',
          question: template.question,
          options: template.options,
          correctAnswer: template.correctAnswer,
          explanation: template.explanation,
          difficulty: template.difficulty,
          categoryId: domain4Category.id,
          tags: JSON.stringify(template.taskIds),
          source: 'Official Outline Tasks'
        }
      })
      totalCreated++
    }
    console.log(`  ✓ 创建了 ${questionTemplates.domain4.length} 道题目`)
  }

  // Domain 5 题目
  console.log('📝 创建 Domain 5 (Professional Responsibilities) 题目...')
  const domain5Category = categoryMap['DOMAIN_4_PROFESSIONAL']
  if (domain5Category) {
    for (const template of questionTemplates.domain5) {
      await prisma.question.create({
        data: {
          examType: 'cale',
          type: 'multiple_choice',
          question: template.question,
          options: template.options,
          correctAnswer: template.correctAnswer,
          explanation: template.explanation,
          difficulty: template.difficulty,
          categoryId: domain5Category.id,
          tags: JSON.stringify(template.taskIds),
          source: 'Official Outline Tasks'
        }
      })
      totalCreated++
    }
    console.log(`  ✓ 创建了 ${questionTemplates.domain5.length} 道题目`)
  }

  console.log(`\n✅ 数据填充完成！共创建 ${totalCreated} 道新题目\n`)

  // 显示统计
  const stats = await prisma.category.findMany({
    where: { examType: 'cale', type: 'content' },
    include: {
      _count: {
        select: { questions: true }
      }
    }
  })

  console.log('📊 各领域题目统计：')
  stats.forEach(cat => {
    console.log(`  ${cat.name}: ${cat._count.questions} 道题目`)
  })
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
