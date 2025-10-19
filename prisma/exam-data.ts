// 考试详细信息数据
// ========================================
// 数据验证状态 (Data Verification Status)
// ========================================
//
// ✅ 已官方确认 (Officially Confirmed):
//    - CALE Domain 1 (Patient Assessment): 31%
//    - 来源: CA Acupuncture Board NCCAOM Audit Document
//    - https://www.acupuncture.ca.gov/pubs_forms/nccaom_audit.pdf
//
// ⚠️  未官方确认 (Not Officially Confirmed):
//    - Domain 2-5 的占比为估算值，基于历史数据和行业经验
//    - 强烈建议参考官方2021年职业分析报告进行核实
//    - 官方报告: https://www.acupuncture.ca.gov/about_us/materials/2021_occanalysis.pdf
//
// 📅 最后验证日期: 2025-10-19
// 🔄 验证方式: 通过官方网站文档和多渠道搜索验证
// ========================================
export const examInfoData = {
  cale: {
    examType: 'cale',
    name: 'CALE',
    nameEn: 'California Acupuncture Licensing Examination',
    fullName: '加州针灸执照考试',
    description: '加州针灸执照考试（CALE）是获得加州针灸执照的必要步骤，由PSI公司管理，考核申请者在针灸和东方医学方面的知识和技能。',
    duration: 300, // 5小时（官方规定）
    totalQuestions: 200, // 175道计分题 + 25道预测试题
    passingScore: 75, // 百分比
    examFee: '$450',
    examFormat: '计算机化考试（CBT - Computer-Based Testing）',
    retakePolicy: '如未通过，须联系针灸局重新申请考试',
    validityPeriod: '通过考试后可申请加州针灸执照（需定期更新）',
    officialWebsite: 'https://www.acupuncture.ca.gov',
    contentOverview: `加州针灸执照考试由PSI公司管理，基于官方2021年职业分析报告 (2021 Occupational Analysis)，包含5个主要内容领域：

**领域1：评估病人 (Patient Assessment) - 31%** ✓官方确认
• 应用中医方法评估病人（望闻问切、舌脉诊）
• 应用西医方法评估病人（生命体征、体格检查）
• 识别需要转介和急诊处理的情况
• 参考官方脉诊术语表（Appendix C）

**领域2：诊断印象和治疗计划 (Diagnostic Impression & Treatment Planning)**
• 运用中医理论进行辨证诊断
• 制定个性化治疗计划
• 与病人和其他医疗服务提供者有效沟通

**领域3：针灸治疗 (Acupuncture Treatment)**
• 针刺选穴 - 参考Appendix D
• 取穴定位与针刺手法 - 参考Appendix D
• 辅助治疗方式：拔罐、刮痧、艾灸、推拿等

**领域4：中药治疗 (Herbal Therapy) - 11%**
• 中药性味归经、功效主治
• 方剂应用 - 参考Appendix E（中药）和F（方剂）

**领域5：加州法规、公共卫生与安全 (CA Regulations, Public Health & Safety) - 9%**
• 病历记录、保密制度、强制报告、知情同意
• 感染控制、环境安全、无菌操作
• 专业行为准则和医德规范
• 加州针灸法规（Business & Professions Code）

**注**: 除Domain 1 (31%)已官方确认外，其他领域占比基于历史数据估算

**考试特点：**
• 200道多选题（175道计分题 + 25道预测试题）
• 5小时考试时间
• 提供中文版本考试
• 考场提供参考附录（脉诊术语、穴位定位、中药、方剂）`,
    preparationTips: `**官方备考建议：**

**1. 考试准备**
• 仔细阅读PSI考生手册，了解所有考试规则
• 熟悉考试大纲（Appendix A）中的4个内容领域
• 查看试题样本（Appendix B）了解题型
• 学习附录中的参考表（脉诊、穴位、中药、方剂）

**2. 考试预约**
• 在收到考试资格通知后，及时通过PSI网站或电话预约
• 选择方便的考试地点和时间
• 至少提前30分钟到达考场

**3. 考试当天**
• 携带有效身份证件（带照片）
• 不得携带任何学习材料、电子设备、食品饮料
• 考场会提供草稿纸和参考资料
• 严格遵守考场纪律和安全规定

**4. 学习策略**
• 系统学习四大内容领域的知识
• 重点掌握中医诊断和针灸治疗
• 了解加州针灸法规和职业道德要求
• 多做模拟题，熟悉计算机答题界面
• 合理分配时间，确保完成所有题目

**5. 安全与法规**
• 熟悉加州Business & Professions Code第123条
• 了解针灸执业范围和限制
• 掌握感染控制和安全操作规程
• 理解patient privacy和HIPAA要求`
  },
  nccaom: {
    examType: 'nccaom',
    name: 'NCCAOM',
    nameEn: 'National Certification Commission for Acupuncture and Oriental Medicine',
    fullName: '美国国家中医针灸认证委员会考试',
    description: 'NCCAOM认证是美国中医针灸领域最权威的专业认证，获得认证是在大多数州执业的前提条件。',
    duration: 180, // 3小时
    totalQuestions: 140,
    passingScore: 70,
    examFee: '$550',
    examFormat: '计算机化考试（机考）',
    retakePolicy: '未通过者可在60天后重考，每年最多重考4次',
    validityPeriod: '4年（需通过继续教育维持认证）',
    officialWebsite: 'https://www.nccaom.org',
    contentOverview: `NCCAOM认证考试涵盖以下模块：
• 针灸基础（Foundations of Oriental Medicine）
• 针灸穴位定位（Acupuncture Point Location）
• 生物医学（Biomedicine）
• 中医临床诊断（OM Pattern Diagnosis）
• 针刺技术（Acupuncture Techniques）
• 中药学（Chinese Herbology）
• 安全与职业道德`,
    preparationTips: `备考建议：
1. 分模块学习，每个模块单独准备
2. 重点掌握穴位定位，这是独立考试模块
3. 熟悉西医基础知识，生物医学占比较大
4. 学习标准化的诊断流程和辨证方法
5. 了解NCCAOM的考试风格和题型特点
6. 参加官方推荐的培训课程和模拟考试`
  }
}

// Cale 详细分类数据 - 基于官方2021年职业分析报告 (2021 Occupational Analysis)
export const caleCategories = [
  // Domain 1: 評估病人 (Patient Assessment) - 31% (官方确认)
  {
    name: '評估病人',
    nameEn: 'Patient Assessment',
    code: 'DOMAIN_1_ASSESSMENT',
    type: 'content',
    description: '病史采集、問診、舌脈診、體格檢查、辨識西醫檢查結果、輔助診斷',
    detailedInfo: '官方Domain 1：运用中医和西医方法评估患者主诉和健康状况，识别需要转诊的情况',
    weight: 31, // 官方确认：31% (来源: CA Acupuncture Board NCCAOM Audit)
    questionCount: 54, // 175 * 0.31 ≈ 54
    keyPoints: JSON.stringify([
      '【中医评估方法】',
      '• 望诊：观察神、色、形、态、舌象',
      '• 闻诊：听声音、嗅气味',
      '• 问诊：主诉、现病史、既往史、家族史、十问歌',
      '• 切诊：脉诊（浮沉迟数等28种脉象）',
      '',
      '【西医评估方法】',
      '• 生命体征测量（血压、脉搏、呼吸、体温）',
      '• 体格检查基础',
      '• 实验室检查结果解读',
      '• 影像学检查基本认识',
      '',
      '【转诊与急诊】',
      '• 识别需要转诊的情况',
      '• 急诊处理原则',
      '• 与其他医疗服务提供者的沟通'
    ]),
    studyTips: '此领域占比最大(31%)，重点掌握四诊合参、舌脉诊断。熟悉官方提供的脉诊术语参考表(Appendix C)。了解何时需要转诊至西医。',
    order: 1
  },

  // Domain 2: 診斷和治療計劃 (Diagnostic Impression & Treatment Planning) - 约17% (⚠️ 未官方确认)
  {
    name: '診斷和治療計劃',
    nameEn: 'Diagnostic Impression and Treatment Planning',
    code: 'DOMAIN_2_DIAGNOSIS',
    type: 'content',
    description: '辨證論治、確定病因病機、制定治療目標與計劃、轉診與病人教育',
    detailedInfo: '官方Domain 2：根据评估结果进行中医诊断，制定治疗方案，并在必要时修改计划',
    weight: 17, // ⚠️ 估算值，需参考官方2021年职业分析报告核实
    questionCount: 30, // 175 * 0.17 ≈ 30
    keyPoints: JSON.stringify([
      '【中医诊断】',
      '• 八纲辨证（表里、寒热、虚实、阴阳）',
      '• 脏腑辨证',
      '• 六经辨证',
      '• 卫气营血辨证',
      '• 三焦辨证',
      '• 经络辨证',
      '',
      '【治疗计划】',
      '• 确定治疗原则和治法',
      '• 设定治疗目标',
      '• 制定治疗频率和疗程',
      '• 评估治疗效果',
      '• 根据病情变化调整治疗方案',
      '',
      '【沟通与教育】',
      '• 与患者沟通诊断结果',
      '• 患者教育（生活方式、饮食建议等）',
      '• 与其他医疗服务提供者协作'
    ]),
    studyTips: '理解中医辨证思维，能够根据症状体征进行准确辨证。熟悉常见病证的治疗原则。',
    order: 2
  },

  // Domain 3: 針灸治療 (Acupuncture Treatment) - 子域占比 (⚠️ 未官方确认，估算值)
  {
    name: '治療 - 針刺選穴',
    nameEn: 'Acupuncture Treatment - Point Selection',
    code: 'DOMAIN_3A_ACU_SELECTION',
    type: 'content',
    description: '根据辨证结果选择合适的穴位进行针灸治疗',
    detailedInfo: '官方Domain 3 (Acupuncture Treatment) 子领域：针刺选穴的原则和方法',
    weight: 10, // ⚠️ 估算值，需官方核实
    questionCount: 18,
    keyPoints: JSON.stringify([
      '• 循经取穴原则',
      '• 局部取穴与远端取穴',
      '• 对症取穴',
      '• 特定穴的应用（五输穴、原穴、络穴、郄穴、背俞穴、募穴、八会穴等）',
      '• 常见病症的配穴方法',
      '• 针灸处方原则'
    ]),
    studyTips: '理解选穴原理，不是死记硬背。熟悉特定穴的临床应用。',
    order: 3
  },
  {
    name: '治療 - 取穴定位與針刺手法',
    nameEn: 'Acupuncture Treatment - Point Location & Technique',
    code: 'DOMAIN_3B_ACU_TECHNIQUE',
    type: 'content',
    description: '穴位精确定位、针刺深度方向、针刺手法',
    detailedInfo: '官方Domain 3 (Acupuncture Treatment) 子领域：穴位定位和针刺技术',
    weight: 15, // ⚠️ 估算值，需官方核实
    questionCount: 26,
    keyPoints: JSON.stringify([
      '【穴位定位】',
      '• 骨度分寸定位法',
      '• 体表标志定位法',
      '• 手指同身寸定位法',
      '• 十四经穴定位（重点：常用穴位）',
      '• 经外奇穴定位',
      '• 参考官方穴位参考表(Appendix D)',
      '',
      '【针刺手法】',
      '• 提插法、捻转法',
      '• 烧山火、透天凉',
      '• 针刺深度和方向',
      '• 得气的表现和意义',
      '• 滞针、弯针、断针等异常情况处理',
      '',
      '【针刺安全】',
      '• 危险穴位和禁忌',
      '• 特殊部位针刺注意事项',
      '• 晕针的预防和处理'
    ]),
    studyTips: '穴位定位是高频考点！建议在人体模型上反复练习。熟记官方Appendix D的穴位术语。注意针刺安全和禁忌。',
    order: 4
  },
  {
    name: '治療 - 輔助治療方式',
    nameEn: 'Acupuncture Treatment - Adjunctive Therapies',
    code: 'DOMAIN_3C_ADJUNCTIVE',
    type: 'content',
    description: '艾灸、拔罐、刮痧、耳針、頭針、電針等辅助疗法',
    detailedInfo: '官方Domain 3 (Acupuncture Treatment) 子领域：针灸辅助治疗方法',
    weight: 7, // ⚠️ 估算值，需官方核实
    questionCount: 12,
    keyPoints: JSON.stringify([
      '【艾灸】',
      '• 艾条灸、艾柱灸、温针灸',
      '• 隔姜灸、隔蒜灸、隔盐灸',
      '• 艾灸的适应症和禁忌症',
      '',
      '【拔罐】',
      '• 留罐、走罐、闪罐',
      '• 拔罐的适应症和注意事项',
      '',
      '【其他疗法】',
      '• 刮痧疗法',
      '• 耳针疗法',
      '• 头针疗法',
      '• 电针疗法',
      '• 穴位注射（需了解加州法规限制）',
      '• 推拿手法基础'
    ]),
    studyTips: '了解各种辅助疗法的适应症和禁忌症。特别注意加州法规对某些疗法的限制。',
    order: 5
  },
  {
    name: '治療 - 中藥治療',
    nameEn: 'Herbal Therapy',
    code: 'DOMAIN_4_HERBAL',
    type: 'content',
    description: '中药性味归经、功效主治、方剂应用',
    detailedInfo: '官方Domain 4 (Herbal Therapy)：中药治疗',
    weight: 11, // ⚠️ 估算值，需参考官方2021年职业分析报告核实
    questionCount: 19, // 175 * 0.11 ≈ 19
    keyPoints: JSON.stringify([
      '【中药学基础】',
      '• 中药四气五味',
      '• 升降浮沉',
      '• 归经理论',
      '• 配伍禁忌（十八反、十九畏）',
      '• 妊娠禁忌药',
      '• 参考官方中药目录(Appendix E)',
      '',
      '【常用中药】',
      '• 解表药、清热药、泻下药',
      '• 祛风湿药、化湿药、利水渗湿药',
      '• 温里药、理气药、消食药',
      '• 止血药、活血化瘀药',
      '• 化痰止咳平喘药',
      '• 安神药、平肝息风药',
      '• 补益药',
      '',
      '【方剂学】',
      '• 方剂组成原则（君臣佐使）',
      '• 经典方剂的组成、功效、主治',
      '• 参考官方方剂目录(Appendix F)',
      '• 方剂的加减应用',
      '',
      '【用药安全】',
      '• 有毒中药的使用',
      '• 中西药相互作用',
      '• 特殊人群用药（孕妇、儿童、老年人）'
    ]),
    studyTips: '中药部分约占11%，重点掌握官方Appendix E和F中列出的中药和方剂。注意中药安全性和配伍禁忌。',
    order: 6
  },

  // Domain 5: CA法規、公共衛生與安全 (CA Regulations, Public Health & Safety) - 约9% (⚠️ 未官方确认)
  {
    name: '專業職責',
    nameEn: 'CA Regulations, Public Health & Safety',
    code: 'DOMAIN_5_PROFESSIONAL',
    type: 'content',
    description: '感染控制、加州針灸法規、倫理與病歷管理、職業安全與公共衛生',
    detailedInfo: '官方Domain 5 (CA Regulations, Public Health & Safety)：法律、道德、安全标准和专业行为',
    weight: 9, // ⚠️ 估算值，需参考官方2021年职业分析报告核实
    questionCount: 16, // 175 * 0.09 ≈ 16
    keyPoints: JSON.stringify([
      '【感染控制】',
      '• 针具消毒灭菌标准',
      '• 清洁针（Clean Needle Technique - CNT）',
      '• 标准预防措施',
      '• 医疗废弃物处理',
      '• OSHA血源性病原体标准',
      '',
      '【加州针灸法规】',
      '• Business & Professions Code相关条款',
      '• 针灸师执业范围',
      '• 执照更新要求',
      '• 继续教育要求',
      '• 禁止事项',
      '• 违规处罚',
      '',
      '【医疗记录管理】',
      '• 病历记录要求',
      '• HIPAA隐私保护',
      '• 知情同意（Informed Consent）',
      '• 强制报告义务（虐待、传染病等）',
      '• 病历保存期限',
      '',
      '【职业道德】',
      '• 医患关系界限',
      '• 专业行为准则',
      '• 利益冲突',
      '• 保密义务',
      '',
      '【环境安全】',
      '• 诊所安全标准',
      '• 紧急情况处理',
      '• ADA无障碍要求'
    ]),
    studyTips: '熟读California Business & Professions Code第123条（考试安全规定）。了解加州针灸师的执业范围和限制。重点掌握感染控制和Clean Needle Technique。',
    order: 7
  },

  // 考试复习部分（辅助分类，不计入官方5大领域）
  {
    name: '模拟试题',
    code: 'MOCK_EXAM',
    type: 'review',
    description: '历年真题及模拟题',
    detailedInfo: '通过大量练习提高答题速度和准确率',
    weight: 0,
    keyPoints: JSON.stringify([
      '熟悉考试题型和难度',
      '掌握答题技巧',
      '提高时间管理能力（5小时完成200题）',
      '查漏补缺，找出薄弱环节',
      '参考官方Appendix B的试题样本'
    ]),
    studyTips: '每周至少完成2-3套完整的模拟考试，严格按照考试时间进行。重点练习Appendix C-F中的参考表应用。',
    order: 8
  },
  {
    name: '重点知识点',
    code: 'KEY_POINTS',
    type: 'review',
    description: '高频考点梳理',
    detailedInfo: '总结归纳考试中的高频知识点',
    weight: 0,
    keyPoints: JSON.stringify([
      '各领域核心概念',
      '易混淆知识点对比',
      '记忆口诀和技巧',
      '官方参考表速查（脉诊、穴位、中药、方剂）'
    ]),
    studyTips: '制作思维导图和记忆卡片，每天复习核心知识点。重点关注占比最大的Domain 1和Domain 3。',
    order: 9
  },
  {
    name: '易错题解析',
    code: 'COMMON_MISTAKES',
    type: 'review',
    description: '常见易错题目及详解',
    detailedInfo: '避免重复犯错，提高正确率',
    weight: 0,
    keyPoints: JSON.stringify([
      '分析错误原因',
      '掌握正确的思路',
      '建立错题本',
      '定期回顾易错点',
      '注意中英文术语对照'
    ]),
    studyTips: '每次练习后及时整理错题，分析错误原因，定期回顾。特别注意穴位定位和脉诊术语的准确性。',
    order: 10
  }
]

// NCCAOM 详细分类数据
export const nccaomCategories = [
  // a. 考试组织部分
  {
    name: '考试基本信息',
    code: 'EXAM_INFO',
    type: 'organization',
    description: 'NCCAOM考试注册、费用、考试形式等基本信息',
    detailedInfo: '了解NCCAOM认证体系和考试安排',
    weight: 0,
    keyPoints: JSON.stringify([
      'NCCAOM认证的重要性和价值',
      '考试模块划分（可单独报考）',
      '考试注册流程',
      '考试费用明细',
      '考试预约和改期政策'
    ]),
    studyTips: '访问NCCAOM官网了解最新信息，规划好考试顺序和时间安排',
    order: 1
  },
  {
    name: '考试规则与要求',
    code: 'EXAM_RULES',
    type: 'organization',
    description: 'NCCAOM考试规则、评分标准、认证维护要求',
    detailedInfo: '遵守考试规则，了解认证维护要求',
    weight: 0,
    keyPoints: JSON.stringify([
      '各模块及格标准',
      '考试时间分配',
      '违规处理规定',
      'PDA学分要求（继续教育）',
      '认证更新周期'
    ]),
    studyTips: '了解PDA学分系统，提前规划继续教育课程',
    order: 2
  },

  // b. 考试内容部分（按NCCAOM模块划分）
  {
    name: '针灸基础理论',
    code: 'TCM_BASIC',
    type: 'content',
    description: 'Foundations of Oriental Medicine - 中医基础理论',
    detailedInfo: '考试占比约20%，涵盖中医基础理论体系',
    questionCount: 28,
    weight: 20,
    keyPoints: JSON.stringify([
      '阴阳五行理论及应用',
      '脏腑生理和病理',
      '气血津液精神',
      '经络系统',
      '病因病机',
      '五运六气'
    ]),
    studyTips: 'NCCAOM更注重理论的系统性，建议使用官方推荐教材学习',
    order: 1
  },
  {
    name: '中医诊断学',
    code: 'TCM_DIAG',
    type: 'content',
    description: 'Pattern Diagnosis - 辨证诊断',
    detailedInfo: '考试占比约18%，重点是辨证论治',
    questionCount: 25,
    weight: 18,
    keyPoints: JSON.stringify([
      '四诊方法',
      '八纲辨证',
      '脏腑辨证',
      '六经辨证',
      '卫气营血辨证',
      '三焦辨证',
      '证候的鉴别'
    ]),
    studyTips: '多做案例分析题，提高综合辨证能力',
    order: 2
  },
  {
    name: '穴位定位',
    code: 'POINT_LOCATION',
    type: 'content',
    description: 'Acupuncture Point Location - 针灸穴位定位（独立模块）',
    detailedInfo: '独立考试模块，占比100%（如单独报考）',
    questionCount: 30,
    weight: 21,
    keyPoints: JSON.stringify([
      '十四经穴的精确定位',
      '常用奇穴定位',
      '骨度分寸法',
      '体表标志定位',
      '简便取穴法',
      '特定穴的归类'
    ]),
    studyTips: '这是独立考试模块，需要非常精确的定位知识。建议使用NCCAOM官方推荐的穴位定位手册',
    order: 3
  },
  {
    name: '中药学',
    code: 'HERB',
    type: 'content',
    description: 'Chinese Herbology - 中药学',
    detailedInfo: '考试占比约17%，需掌握300味以上中药',
    questionCount: 24,
    weight: 17,
    keyPoints: JSON.stringify([
      '中药分类和功效',
      '药性理论（四气五味）',
      '配伍关系',
      '用药禁忌',
      '特殊药物的用法用量',
      '中药安全性',
      '方剂学基础'
    ]),
    studyTips: 'NCCAOM对中药安全性考察较多，注意妊娠禁忌和药物相互作用',
    order: 4
  },
  {
    name: '针灸治疗',
    code: 'ACU',
    type: 'content',
    description: 'Acupuncture Techniques & Treatment - 针灸技术与治疗',
    detailedInfo: '考试占比约15%，侧重临床应用',
    questionCount: 21,
    weight: 15,
    keyPoints: JSON.stringify([
      '针刺手法和得气',
      '特殊针法（头针、耳针等）',
      '灸法应用',
      '针灸处方原则',
      '常见病的针灸治疗',
      '针灸安全和消毒',
      '针灸不良反应处理'
    ]),
    studyTips: '注重临床应用和安全操作，了解针灸在美国的法规要求',
    order: 5
  },
  {
    name: '生物医学',
    code: 'BIOMEDICINE',
    type: 'content',
    description: 'Biomedicine - 生物医学基础',
    detailedInfo: '考试占比约9%，包括解剖、生理、病理等',
    questionCount: 12,
    weight: 9,
    keyPoints: JSON.stringify([
      '人体解剖学基础',
      '生理学要点',
      '病理学概念',
      '常见疾病的西医诊断',
      '实验室检查解读',
      '急救基础知识',
      '转诊指征'
    ]),
    studyTips: 'NCCAOM要求针灸师具备基本的生物医学知识，了解何时需要转诊',
    order: 6
  },

  // c. 考试复习部分
  {
    name: '模拟试题',
    code: 'MOCK_EXAM',
    type: 'review',
    description: 'NCCAOM官方模拟题和练习题',
    detailedInfo: '使用官方Study Guide和Practice Exams',
    keyPoints: JSON.stringify([
      '熟悉NCCAOM题型风格',
      '掌握多选题答题技巧',
      '练习案例分析题',
      '提高英文阅读速度'
    ]),
    studyTips: '强烈建议购买NCCAOM官方Study Guide，题型和难度最接近真题',
    order: 1
  },
  {
    name: '重点知识点',
    code: 'KEY_POINTS',
    type: 'review',
    description: 'NCCAOM考试高频考点',
    detailedInfo: '基于真题分析总结的核心知识点',
    keyPoints: JSON.stringify([
      '各模块核心概念',
      '中英文术语对照',
      '临床案例分析要点',
      'NCCAOM特色考点'
    ]),
    studyTips: '重点掌握NCCAOM与其他考试的不同之处',
    order: 2
  },
  {
    name: '易错题解析',
    code: 'COMMON_MISTAKES',
    type: 'review',
    description: 'NCCAOM考试常见错误分析',
    detailedInfo: '分析常见失分点，提高通过率',
    keyPoints: JSON.stringify([
      '术语理解误区',
      '辨证思路错误',
      '穴位定位偏差',
      '多选题陷阱'
    ]),
    studyTips: '注意中英文表达的差异，避免因语言问题失分',
    order: 3
  }
]
