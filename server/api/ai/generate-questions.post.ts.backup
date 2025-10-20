import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// CALE 官方考试比例
const CALE_EXAM_PROPORTIONS = {
  'DOMAIN_1_ASSESSMENT': 0.27,      // 27%
  'DOMAIN_2_DIAGNOSIS': 0.17,       // 17%
  'DOMAIN_3A_ACU_SELECTION': 0.16,  // 16%
  'DOMAIN_3B_ACU_TECHNIQUE': 0.08,  // 8%
  'DOMAIN_3C_ADJUNCTIVE': 0.05,     // 5%
  'DOMAIN_3D_HERBAL': 0.15,         // 15%
  'DOMAIN_4_PROFESSIONAL': 0.11     // 11% (注意：数据库中用 DOMAIN_4 而非 DOMAIN_5)
}

// 题目模板库 - 基于不同知识点的题目生成模板
const questionTemplates = {
  // Domain 1: Patient Assessment
  'DOMAIN_1_ASSESSMENT': [
    {
      patterns: [
        '患者{age}岁{gender}，主诉{symptom1}伴{symptom2}{duration}。{tongue}，{pulse}。根据四诊合参，最可能的诊断是：',
        '{gender}性患者，{age}岁，{symptom1}，{symptom2}，{duration}。舌诊见{tongue}，脉象{pulse}。应诊断为：',
        '某患者{symptom1}，兼见{symptom2}，{duration}。查体：{tongue}，{pulse}。此证候属于：'
      ],
      variables: {
        age: ['25', '35', '45', '55', '65'],
        gender: ['男', '女'],
        symptom1: ['头痛', '眩晕', '失眠', '心悸', '胸闷', '腹痛', '腰痛', '咳嗽'],
        symptom2: ['气短', '乏力', '口苦', '纳差', '便溏', '盗汗', '自汗', '耳鸣'],
        duration: ['3天', '1周', '半月', '1月', '3月', '半年'],
        tongue: ['舌红少苔', '舌淡胖有齿痕', '舌质暗红', '舌红苔黄', '舌淡苔白'],
        pulse: ['脉弦细数', '脉沉细', '脉滑数', '脉弦数', '脉细弱']
      },
      syndromes: [
        { name: '肝阳上亢', symptoms: ['头痛', '眩晕'], tongue: '舌红', pulse: '脉弦' },
        { name: '肝肾阴虚', symptoms: ['头痛', '眩晕', '耳鸣'], tongue: '舌红少苔', pulse: '脉弦细数' },
        { name: '气血两虚', symptoms: ['心悸', '乏力', '失眠'], tongue: '舌淡', pulse: '脉细弱' },
        { name: '脾胃湿热', symptoms: ['腹痛', '便溏', '纳差'], tongue: '舌红苔黄腻', pulse: '脉滑数' },
        { name: '肺气虚', symptoms: ['咳嗽', '气短', '自汗'], tongue: '舌淡', pulse: '脉弱' }
      ]
    }
  ],

  // Domain 2: Diagnosis and Treatment Planning
  'DOMAIN_2_DIAGNOSIS': [
    {
      patterns: [
        '根据{theory}理论，{symptom}属于{organ}病变，治疗原则应为：',
        '患者{syndrome}证，治疗时应首先考虑：',
        '在制定治疗计划时，{condition}患者需要特别注意：'
      ],
      variables: {
        theory: ['脏腑辨证', '八纲辨证', '六经辨证', '卫气营血辨证'],
        symptom: ['胸闷心悸', '头晕目眩', '腰膝酸软', '脘腹胀满'],
        organ: ['心', '肝', '脾', '肺', '肾'],
        syndrome: ['气虚', '血瘀', '痰湿', '阴虚', '阳虚'],
        condition: ['孕妇', '儿童', '老年', '体弱']
      }
    }
  ],

  // Domain 3A: Acupuncture Point Selection
  'DOMAIN_3A_ACU_SELECTION': [
    {
      patterns: [
        '治疗{disease}，根据"{principle}"原则，应首选：',
        '患者{symptom}，选穴时应取{meridian}经的腧穴，最合适的是：',
        '{disease}的治疗，根据{location}循行，应选择：',
        '根据特定穴的作用，治疗{organ}疾病应选{acupoint_type}：'
      ],
      variables: {
        disease: ['胃痛', '头痛', '失眠', '咳嗽', '腰痛', '膝痛', '眩晕'],
        principle: ['腑会中脘', '背俞募穴配伍', '原络配穴', '上病下取', '左病右治'],
        symptom: ['前额痛', '偏头痛', '后头痛', '巅顶痛'],
        meridian: ['足阳明胃', '足太阳膀胱', '足少阳胆', '手阳明大肠'],
        location: ['经络', '部位'],
        organ: ['六腑', '五脏', '奇恒之府'],
        acupoint_type: ['八会穴', '下合穴', '原穴', '络穴']
      },
      acupoints: {
        '胃痛': ['中脘', '足三里', '内关'],
        '头痛前额': ['印堂', '阳白', '头维'],
        '头痛偏侧': ['率谷', '太阳', '风池'],
        '失眠': ['神门', '三阴交', '安眠'],
        '咳嗽': ['肺俞', '列缺', '天突']
      }
    }
  ],

  // Domain 3B: Point Location and Needling
  'DOMAIN_3B_ACU_TECHNIQUE': [
    {
      patterns: [
        '{acupoint}穴的标准定位是：',
        '针刺{acupoint}时，标准的进针深度应为：',
        '针刺{acupoint}穴时，患者应采取的体位是：',
        '{acupoint}的针刺方向是：'
      ],
      acupoints: {
        '内关': { location: '腕横纹上2寸，掌长肌腱与桡侧腕屈肌腱之间', depth: '0.5-1寸', position: '仰掌' },
        '足三里': { location: '犊鼻下3寸，胫骨前嵴外一横指', depth: '1-1.5寸', position: '正坐屈膝' },
        '合谷': { location: '第1、2掌骨之间，约第2掌骨中点桡侧', depth: '0.5-1寸', position: '仰掌' },
        '百会': { location: '头顶正中线与两耳尖连线交点', depth: '0.3-0.5寸平刺', position: '正坐' },
        '风池': { location: '颈后发际，胸锁乳突肌与斜方肌上端之间凹陷处', depth: '0.5-0.8寸', position: '正坐或俯卧' }
      }
    }
  ],

  // Domain 3C: Adjunctive Therapies
  'DOMAIN_3C_ADJUNCTIVE': [
    {
      patterns: [
        '{therapy}的禁忌症包括：',
        '{therapy}时出现{complication}，应采取的处理措施是：',
        '{therapy}治疗时，{wave_type}主要适用于：',
        '施行{therapy}后，局部出现{reaction}，这属于：'
      ],
      variables: {
        therapy: ['艾灸', '拔罐', '电针', '刮痧', '推拿'],
        complication: ['烫伤水泡', '晕针', '滞针', '皮下出血'],
        wave_type: ['连续波（密波）', '断续波（疏波）', '疏密波'],
        reaction: ['潮红', '紫斑', '水泡']
      }
    }
  ],

  // Domain 4: Herbal Therapy
  'DOMAIN_3D_HERBAL': [
    {
      patterns: [
        '{formula}的组成药物是：',
        '{formula}的主要功效是：',
        '{herb}的主要配伍禁忌药物是：',
        '{patient_type}禁用的中药包括：',
        '煎药时，以下哪种药物应该{decoction_method}？'
      ],
      variables: {
        formula: ['麻黄汤', '桂枝汤', '小柴胡汤', '四君子汤', '四物汤', '六味地黄丸', '逍遥散'],
        herb: ['附子', '甘草', '人参', '半夏'],
        patient_type: ['孕妇', '儿童', '老年人', '高血压患者'],
        decoction_method: ['先煎', '后下', '包煎', '另煎', '烊化']
      },
      formulas: {
        '麻黄汤': { composition: '麻黄、桂枝、杏仁、甘草', function: '发汗解表，宣肺平喘' },
        '六味地黄丸': { composition: '熟地黄、山萸肉、山药、泽泻、茯苓、丹皮', function: '滋补肝肾' },
        '小柴胡汤': { composition: '柴胡、黄芩、人参、半夏、甘草、生姜、大枣', function: '和解少阳' }
      }
    }
  ],

  // Domain 5: Professional Responsibilities (注意数据库中是 DOMAIN_4_PROFESSIONAL)
  'DOMAIN_4_PROFESSIONAL': [
    {
      patterns: [
        '根据加州法律，针灸师的执业范围{include_or_not}：',
        '针灸诊所必须保存患者病历的最短时间是：',
        '发现患者可能患有{condition}时，针灸师应该：',
        '针灸师在治疗过程中必须遵守的{regulation}要求包括：',
        '加州针灸师{certification_requirement}的要求是：'
      ],
      variables: {
        include_or_not: ['包括', '不包括'],
        condition: ['传染病', '急症', '肿瘤', '骨折'],
        regulation: ['清洁针法（Clean Needle Technique）', 'HIPAA隐私保护', '知情同意', '标准预防措施'],
        certification_requirement: ['继续教育（CEU）', '执照更新', '首次考试']
      }
    }
  ]
}

// 生成随机题目
function generateQuestion(categoryCode: string, difficulty: string, existingQuestions: Set<string>) {
  const templates = questionTemplates[categoryCode] || []
  if (templates.length === 0) return null

  const template = templates[Math.floor(Math.random() * templates.length)]

  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    attempts++

    // 随机选择一个模式
    const pattern = template.patterns[Math.floor(Math.random() * template.patterns.length)]

    // 生成变量值
    let questionText = pattern
    const usedValues: any = {}

    // 替换所有变量
    const variableMatches = pattern.match(/\{([^}]+)\}/g) || []
    for (const match of variableMatches) {
      const varName = match.slice(1, -1)
      if (template.variables && template.variables[varName]) {
        const values = template.variables[varName]
        const value = values[Math.floor(Math.random() * values.length)]
        usedValues[varName] = value
        questionText = questionText.replace(match, value)
      }
    }

    // 检查是否与现有题目重复
    if (existingQuestions.has(questionText)) {
      continue
    }

    // 生成选项和答案
    const { options, correctAnswer, explanation } = generateOptionsAndAnswer(
      categoryCode,
      questionText,
      usedValues,
      template
    )

    return {
      question: questionText,
      options: JSON.stringify(options),
      correctAnswer,
      explanation,
      difficulty,
      type: 'multiple_choice'
    }
  }

  return null
}

// 生成选项和答案
function generateOptionsAndAnswer(categoryCode: string, question: string, usedValues: any, template: any) {
  let correctAnswer = ''
  let explanation = ''
  let options: string[] = []

  // 根据不同Domain生成不同的选项
  if (categoryCode.includes('ASSESSMENT')) {
    // 诊断类题目
    const syndromes = template.syndromes || []
    const correctSyndrome = syndromes.find((s: any) =>
      s.symptoms.some((sym: string) => question.includes(sym))
    ) || syndromes[0]

    correctAnswer = 'A. ' + correctSyndrome.name

    // 生成干扰项
    const distractors = syndromes
      .filter((s: any) => s.name !== correctSyndrome.name)
      .slice(0, 3)
      .map((s: any) => s.name)

    options = [
      'A. ' + correctSyndrome.name,
      'B. ' + (distractors[0] || '气血两虚'),
      'C. ' + (distractors[1] || '阴虚火旺'),
      'D. ' + (distractors[2] || '痰湿内阻')
    ]

    explanation = `根据症状${correctSyndrome.symptoms.join('、')}，舌脉特点，可诊断为${correctSyndrome.name}。`

  } else if (categoryCode.includes('ACU_SELECTION')) {
    // 选穴类题目
    const acupoints = template.acupoints || {}
    const keys = Object.keys(acupoints)
    const key = keys.find(k => question.includes(k)) || keys[0]
    const correctAcupoints = acupoints[key] || []

    correctAnswer = 'A. ' + (correctAcupoints[0] || '中脘')

    const allAcupoints = ['足三里', '内关', '合谷', '百会', '风池', '三阴交', '太冲', '曲池']
    const distractors = allAcupoints
      .filter(ap => !correctAcupoints.includes(ap))
      .slice(0, 3)

    options = [
      correctAnswer,
      'B. ' + distractors[0],
      'C. ' + distractors[1],
      'D. ' + distractors[2]
    ]

    explanation = `根据${usedValues.principle || '经络理论'}，应选择${correctAnswer.substring(3)}穴。`

  } else if (categoryCode.includes('ACU_TECHNIQUE')) {
    // 针刺技术类
    const acupointData = template.acupoints?.[usedValues.acupoint || '内关']

    if (question.includes('定位')) {
      correctAnswer = 'A. ' + (acupointData?.location || '腕横纹上2寸')
    } else if (question.includes('深度')) {
      correctAnswer = 'B. ' + (acupointData?.depth || '1-1.5寸')
    } else if (question.includes('体位')) {
      correctAnswer = 'C. ' + (acupointData?.position || '正坐位')
    }

    options = generateTechnicalOptions(question, correctAnswer)
    explanation = `${usedValues.acupoint || '该穴'}的标准操作应遵循规范要求。`

  } else if (categoryCode.includes('HERBAL')) {
    // 中药类
    const formulaData = template.formulas?.[usedValues.formula]

    if (question.includes('组成')) {
      correctAnswer = 'A. ' + (formulaData?.composition || '麻黄、桂枝、杏仁、甘草')
    } else if (question.includes('功效')) {
      correctAnswer = 'A. ' + (formulaData?.function || '滋补肝肾')
    }

    options = generateHerbalOptions(question, correctAnswer)
    explanation = `${usedValues.formula || '该方'}具有${formulaData?.function || '特定功效'}。`

  } else {
    // 默认选项
    correctAnswer = 'A. 正确答案'
    options = ['A. 正确答案', 'B. 选项B', 'C. 选项C', 'D. 选项D']
    explanation = '详细解析。'
  }

  return { options, correctAnswer, explanation }
}

function generateTechnicalOptions(question: string, correctAnswer: string): string[] {
  const options = [correctAnswer]

  if (question.includes('深度')) {
    return [
      'A. 0.3-0.5寸',
      'B. 0.5-1寸',
      'C. 1-1.5寸',
      'D. 1.5-2寸'
    ]
  } else if (question.includes('体位')) {
    return [
      'A. 仰卧位',
      'B. 俯卧位',
      'C. 正坐位',
      'D. 侧卧位'
    ]
  }

  return options
}

function generateHerbalOptions(question: string, correctAnswer: string): string[] {
  return [correctAnswer, 'B. 选项B', 'C. 选项C', 'D. 选项D']
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { mode, categoryId, count, difficultyDistribution, avoidDuplicates } = body

    let generated = 0
    let saved = 0
    let duplicates = 0
    const questionIds: string[] = [] // 存储生成的题目ID
    let categoryCode = '' // 存储分类代码

    // 获取现有题目（用于去重）
    const existingQuestionsData = avoidDuplicates
      ? await prisma.question.findMany({
          select: { question: true }
        })
      : []

    const existingQuestions = new Set(existingQuestionsData.map(q => q.question))

    // 计算每个难度的题目数量
    const easyCount = Math.round(count * difficultyDistribution.easy / 100)
    const mediumCount = Math.round(count * difficultyDistribution.medium / 100)
    const hardCount = count - easyCount - mediumCount

    if (mode === 'domain' && categoryId) {
      // 按领域生成
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      })

      if (!category) {
        throw createError({
          statusCode: 404,
          message: '分类不存在'
        })
      }

      categoryCode = category.code // 保存分类代码

      // 生成题目
      for (let i = 0; i < easyCount; i++) {
        const q = generateQuestion(category.code, 'easy', existingQuestions)
        if (q) {
          try {
            const created = await prisma.question.create({
              data: {
                ...q,
                examType: 'cale',
                categoryId: category.id,
                source: 'AI Generated'
              }
            })
            existingQuestions.add(q.question)
            questionIds.push(created.id) // 记录ID
            saved++
          } catch (error) {
            duplicates++
          }
        }
        generated++
      }

      for (let i = 0; i < mediumCount; i++) {
        const q = generateQuestion(category.code, 'medium', existingQuestions)
        if (q) {
          try {
            const created = await prisma.question.create({
              data: {
                ...q,
                examType: 'cale',
                categoryId: category.id,
                source: 'AI Generated'
              }
            })
            existingQuestions.add(q.question)
            questionIds.push(created.id)
            saved++
          } catch (error) {
            duplicates++
          }
        }
        generated++
      }

      for (let i = 0; i < hardCount; i++) {
        const q = generateQuestion(category.code, 'hard', existingQuestions)
        if (q) {
          try {
            const created = await prisma.question.create({
              data: {
                ...q,
                examType: 'cale',
                categoryId: category.id,
                source: 'AI Generated'
              }
            })
            existingQuestions.add(q.question)
            questionIds.push(created.id)
            saved++
          } catch (error) {
            duplicates++
          }
        }
        generated++
      }

    } else if (mode === 'proportion') {
      // 按考试比例生成
      const categories = await prisma.category.findMany({
        where: {
          examType: 'cale',
          type: 'content'
        }
      })

      const categoryMap: any = {}
      categories.forEach(cat => {
        categoryMap[cat.code] = cat
      })

      // 按比例分配题目到各个domain
      for (const [code, proportion] of Object.entries(CALE_EXAM_PROPORTIONS)) {
        const category = categoryMap[code]
        if (!category) continue

        const domainCount = Math.round(count * proportion)
        const domainEasy = Math.round(domainCount * difficultyDistribution.easy / 100)
        const domainMedium = Math.round(domainCount * difficultyDistribution.medium / 100)
        const domainHard = domainCount - domainEasy - domainMedium

        // 生成题目
        const difficulties = [
          ...Array(domainEasy).fill('easy'),
          ...Array(domainMedium).fill('medium'),
          ...Array(domainHard).fill('hard')
        ]

        for (const difficulty of difficulties) {
          const q = generateQuestion(category.code, difficulty, existingQuestions)
          if (q) {
            try {
              const created = await prisma.question.create({
                data: {
                  ...q,
                  examType: 'cale',
                  categoryId: category.id,
                  source: 'AI Generated - Proportional'
                }
              })
              existingQuestions.add(q.question)
              questionIds.push(created.id)
              saved++
            } catch (error) {
              duplicates++
            }
          }
          generated++
        }
      }
    }

    // 创建题目集记录（保存为AI生成的练习集）
    let questionSetId = null
    if (saved > 0 && questionIds.length > 0) {
      const questionSet = await prisma.exam.create({
        data: {
          userId: 'demo-user', // 默认用户
          examType: 'cale',
          title: mode === 'domain'
            ? `AI题库 - ${categoryCode} (${saved}题)`
            : `AI题库 - 按比例 (${saved}题)`,
          categoryId: mode === 'domain' ? categoryId : null,
          questionCount: saved,
          duration: Math.max(saved * 2, 30), // 每题2分钟
          difficulty: 'mixed',
          mode: 'ai_generated', // 标记为AI生成
          generatedBy: mode, // domain 或 proportion
          status: 'not_started',
          totalScore: saved,
          answers: {
            create: questionIds.map((qId: string) => ({
              questionId: qId
            }))
          }
        }
      })
      questionSetId = questionSet.id
    }

    return {
      success: true,
      generated,
      saved,
      duplicates,
      questionIds, // 返回生成的题目ID列表
      questionSetId, // 返回题目集ID
      message: `成功生成 ${saved} 道题目${duplicates > 0 ? `，过滤重复 ${duplicates} 道` : ''}`
    }
  } catch (error: any) {
    console.error('Generate questions error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || '生成题目失败'
    })
  }
})
