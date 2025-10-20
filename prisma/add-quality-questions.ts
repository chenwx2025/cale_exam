// 添加高质量、多样化的题目
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function isDuplicate(question: string, categoryId: string): Promise<boolean> {
  const existingQuestions = await prisma.question.findMany({
    where: { categoryId },
    select: { question: true }
  })

  const normalizedNew = question.replace(/[^\w\u4e00-\u9fa5]/g, '').toLowerCase()

  for (const existing of existingQuestions) {
    const normalizedExisting = existing.question.replace(/[^\w\u4e00-\u9fa5]/g, '').toLowerCase()
    if (normalizedNew === normalizedExisting) return true

    const similarity = calculateSimilarity(normalizedNew, normalizedExisting)
    if (similarity > 0.85) return true
  }

  return false
}

function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  if (len1 === 0) return len2 === 0 ? 1 : 0
  if (len2 === 0) return 0

  const matrix: number[][] = []
  for (let i = 0; i <= len1; i++) matrix[i] = [i]
  for (let j = 0; j <= len2; j++) matrix[0][j] = j

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

  return 1 - (matrix[len1][len2] / Math.max(len1, len2))
}

async function addBulkQuestions() {
  console.log('🚀 Adding quality questions in bulk...\n')

  const allQuestions = [
    // Domain 1: 评估病人（补充到60题，需要11题）
    { cat: 'DOMAIN_1_ASSESSMENT', q: { question: '望诊中，观察患者面色苍白无华，最可能提示什么证型？', options: ['A. 血虚证', 'B. 阴虚证', 'C. 阳虚证', 'D. 气虚证'], correctAnswer: 'A', explanation: '面色苍白无华是血虚的典型表现，血虚则面部失去濡养。', difficulty: 'easy' }},
    { cat: 'DOMAIN_1_ASSESSMENT', q: { question: '闻诊时，患者声音低弱、气短懒言，提示什么问题？', options: ['A. 气虚', 'B. 阴虚', 'C. 血瘀', 'D. 痰湿'], correctAnswer: 'A', explanation: '声音低弱、气短懒言是气虚的表现，气虚则声音无力。', difficulty: 'easy' }},
    { cat: 'DOMAIN_1_ASSESSMENT', q: { question: '问诊时，患者诉口干但不欲饮，可能是什么情况？', options: ['A. 湿热内蕴', 'B. 阴虚火旺', 'C. 津液大伤', 'D. 气机不畅'], correctAnswer: 'A', explanation: '口干但不欲饮，常见于湿热证，湿邪阻滞、津液不能上承。', difficulty: 'medium' }},
    { cat: 'DOMAIN_1_ASSESSMENT', q: { question: '切诊时，脉象浮而有力，主要见于什么病证？', options: ['A. 表实证', 'B. 里虚证', 'C. 气血两虚', 'D. 阴虚内热'], correctAnswer: 'A', explanation: '脉浮提示病在表，有力提示邪气盛，是表实证的脉象。', difficulty: 'medium' }},
    { cat: 'DOMAIN_1_ASSESSMENT', q: { question: '患者舌体瘦小、舌质红绛，提示什么证型？', options: ['A. 阴虚火旺', 'B. 气血两虚', 'C. 痰湿内盛', 'D. 脾胃虚弱'], correctAnswer: 'A', explanation: '舌体瘦小、舌质红绛是阴液亏虚、虚火内盛的表现。', difficulty: 'medium' }},
    { cat: 'DOMAIN_1_ASSESSMENT', q: { question: '观察患者眼睛，白睛发黄，可能提示什么问题？', options: ['A. 湿热黄疸', 'B. 肝血不足', 'C. 心火亢盛', 'D. 肾阴虚'], correctAnswer: 'A', explanation: '白睛发黄是黄疸的表现，多因湿热蕴结肝胆所致。', difficulty: 'easy' }},
    { cat: 'DOMAIN_1_ASSESSMENT', q: { question: '患者主诉夜间盗汗，最可能是什么证型？', options: ['A. 阴虚内热', 'B. 阳虚外寒', 'C. 气虚不固', 'D. 湿热内蕴'], correctAnswer: 'A', explanation: '夜间盗汗是阴虚内热的典型症状，阴虚则虚热迫津外泄。', difficulty: 'easy' }},
    { cat: 'DOMAIN_1_ASSESSMENT', q: { question: '切脉时发现脉象细如线、按之欲绝，属于什么脉？', options: ['A. 微脉', 'B. 弱脉', 'C. 濡脉', 'D. 细脉'], correctAnswer: 'A', explanation: '微脉是极细极弱、按之欲绝的脉象，提示阳气衰微或气血大虚。', difficulty: 'hard' }},
    { cat: 'DOMAIN_1_ASSESSMENT', q: { question: '问诊时，患者诉大便先硬后溏，可能提示什么？', options: ['A. 脾虚湿盛', 'B. 肝郁脾虚', 'C. 肾阳不足', 'D. 胃肠湿热'], correctAnswer: 'A', explanation: '大便先硬后溏是脾虚湿盛的表现，脾虚则运化失常。', difficulty: 'medium' }},
    { cat: 'DOMAIN_1_ASSESSMENT', q: { question: '观察舌苔，发现苔黄厚腻，提示什么病理变化？', options: ['A. 湿热内蕴', 'B. 寒湿困脾', 'C. 气血两虚', 'D. 阴虚火旺'], correctAnswer: 'A', explanation: '苔黄厚腻是湿热内蕴的典型舌象，黄苔主热，腻苔主湿。', difficulty: 'easy' }},
    { cat: 'DOMAIN_1_ASSESSMENT', q: { question: '闻诊时，患者呼吸气粗、声高，提示什么？', options: ['A. 实热证', 'B. 虚寒证', 'C. 气虚证', 'D. 血瘀证'], correctAnswer: 'A', explanation: '呼吸气粗、声高是实热证的表现，实邪壅盛则气机不畅。', difficulty: 'medium' }},

    // Domain 3A: 针刺选穴（补充到60题，需要22题）
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '治疗头痛时，常用的远端取穴是？', options: ['A. 合谷、太冲', 'B. 肩井、风池', 'C. 天柱、风府', 'D. 百会、四神聪'], correctAnswer: 'A', explanation: '合谷和太冲是治疗头痛的常用远端穴位，即"面口合谷收"和"肝经太冲穴"。', difficulty: 'medium' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '治疗胃痛，首选哪个穴位？', options: ['A. 足三里', 'B. 内关', 'C. 中脘', 'D. 以上都是'], correctAnswer: 'D', explanation: '足三里、内关、中脘都是治疗胃痛的常用穴位，可根据具体证型选用。', difficulty: 'easy' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '\"四总穴歌\"中，治疗腰背痛取哪个穴位？', options: ['A. 委中', 'B. 足三里', 'C. 合谷', 'D. 列缺'], correctAnswer: 'A', explanation: '\"腰背委中求\"，委中穴是治疗腰背痛的要穴。', difficulty: 'easy' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '治疗失眠，常用的主穴是？', options: ['A. 神门、三阴交', 'B. 合谷、太冲', 'C. 足三里、中脘', 'D. 关元、气海'], correctAnswer: 'A', explanation: '神门是心经原穴，三阴交调理肝脾肾，两穴配伍治疗失眠效果好。', difficulty: 'medium' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '按照\"经脉所过，主治所及\"的原则，治疗偏头痛应选用哪条经的穴位？', options: ['A. 足少阳胆经', 'B. 足阳明胃经', 'C. 足太阳膀胱经', 'D. 手少阳三焦经'], correctAnswer: 'A', explanation: '偏头痛多循行于足少阳胆经的分布区域，故选用胆经穴位。', difficulty: 'medium' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '治疗急性腰扭伤，可选用的特效穴是？', options: ['A. 腰痛点', 'B. 委中', 'C. 肾俞', 'D. 大肠俞'], correctAnswer: 'A', explanation: '腰痛点是治疗急性腰扭伤的经验穴、特效穴。', difficulty: 'hard' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '根据\"同名经取穴\"原则，手阳明经病变可取足阳明经的哪个穴位？', options: ['A. 足三里', 'B. 三阴交', 'C. 太冲', 'D. 涌泉'], correctAnswer: 'A', explanation: '手阳明大肠经与足阳明胃经同为阳明经，可互为补充治疗。', difficulty: 'hard' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '治疗牙痛，根据\"面口合谷收\"，应取哪个穴位？', options: ['A. 合谷', 'B. 内庭', 'C. 颊车', 'D. 下关'], correctAnswer: 'A', explanation: '\"面口合谷收\"是针灸歌诀，合谷穴治疗面部、口腔疾病效果显著。', difficulty: 'easy' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '治疗痛经，三阴交配合哪个穴位效果最好？', options: ['A. 关元', 'B. 足三里', 'C. 中脘', 'D. 神门'], correctAnswer: 'A', explanation: '三阴交调理肝脾肾，关元温补下焦，两穴配伍治疗痛经效果显著。', difficulty: 'medium' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '按照\"表里经配穴\"原则，肺经病变可配合哪条经的穴位？', options: ['A. 大肠经', 'B. 胃经', 'C. 脾经', 'D. 心经'], correctAnswer: 'A', explanation: '肺经与大肠经互为表里，可配合使用以增强疗效。', difficulty: 'medium' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '治疗高血压，常用的降压穴位是？', options: ['A. 曲池、太冲', 'B. 合谷、内关', 'C. 足三里、三阴交', 'D. 神门、心俞'], correctAnswer: 'A', explanation: '曲池清热降压，太冲平肝潜阳，两穴配伍治疗高血压效果好。', difficulty: 'medium' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '\"肚腹三里留\"指的是哪个穴位？', options: ['A. 足三里', 'B. 三阴交', 'C. 中脘', 'D. 天枢'], correctAnswer: 'A', explanation: '\"肚腹三里留\"意思是腹部疾病可以取足三里穴治疗。', difficulty: 'easy' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '治疗呃逆（打嗝），首选哪个穴位？', options: ['A. 内关', 'B. 足三里', 'C. 中脘', 'D. 膈俞'], correctAnswer: 'A', explanation: '内关是治疗呃逆的首选穴位，能和胃降逆、理气止呃。', difficulty: 'medium' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '根据\"五输穴主治\"，治疗经气郁滞应选用哪类穴位？', options: ['A. 经穴', 'B. 合穴', 'C. 俞穴', 'D. 井穴'], correctAnswer: 'A', explanation: '经穴主治经气郁滞，如\"经主喘咳寒热\"。', difficulty: 'hard' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '治疗落枕，常用的局部取穴是？', options: ['A. 悬钟、后溪', 'B. 风池、肩井', 'C. 天柱、大椎', 'D. 合谷、曲池'], correctAnswer: 'B', explanation: '落枕多取风池、肩井等局部穴位，配合阿是穴治疗。', difficulty: 'medium' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '治疗耳鸣耳聋，除了局部穴位，常配合哪个远端穴位？', options: ['A. 听宫、翳风配中渚', 'B. 耳门配合谷', 'C. 听会配足三里', 'D. 完骨配内关'], correctAnswer: 'A', explanation: '听宫、翳风是治疗耳疾的局部穴位，中渚是手少阳三焦经穴，三焦经入耳。', difficulty: 'hard' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '按照\"原络配穴\"法，肺经原穴太渊应配合哪条经的络穴？', options: ['A. 大肠经的偏历', 'B. 胃经的丰隆', 'C. 脾经的公孙', 'D. 心经的通里'], correctAnswer: 'A', explanation: '原络配穴是表里经配穴法，肺经太渊配大肠经偏历。', difficulty: 'hard' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '治疗中风偏瘫上肢不遂，主要选用哪些穴位？', options: ['A. 肩髃、曲池、合谷', 'B. 环跳、阳陵泉、足三里', 'C. 风池、百会、水沟', 'D. 中脘、天枢、气海'], correctAnswer: 'A', explanation: '肩髃、曲池、合谷是治疗上肢不遂的常用穴位组合。', difficulty: 'medium' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '\"八脉交会穴\"中，治疗胸腔病变常用哪个穴位？', options: ['A. 内关通阴维', 'B. 公孙通冲脉', 'C. 临泣通带脉', 'D. 后溪通督脉'], correctAnswer: 'A', explanation: '内关通阴维，主治心、胸、胃疾病。', difficulty: 'hard' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '治疗小儿疳积，常用的特效穴是？', options: ['A. 四缝', 'B. 合谷', 'C. 足三里', 'D. 中脘'], correctAnswer: 'A', explanation: '四缝穴是治疗小儿疳积的经验穴、特效穴。', difficulty: 'medium' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '根据\"俞募配穴\"，胃的背俞穴和募穴分别是？', options: ['A. 胃俞和中脘', 'B. 脾俞和章门', 'C. 肝俞和期门', 'D. 肾俞和京门'], correctAnswer: 'A', explanation: '胃俞是胃的背俞穴，中脘是胃的募穴，俞募配穴治疗胃病。', difficulty: 'medium' }},
    { cat: 'DOMAIN_3A_ACU_SELECTION', q: { question: '治疗眩晕，常用的主穴组合是？', options: ['A. 百会、风池、太冲', 'B. 合谷、内关、足三里', 'C. 神门、三阴交、心俞', 'D. 中脘、天枢、气海'], correctAnswer: 'A', explanation: '百会醒脑开窍，风池疏风通络，太冲平肝潜阳，三穴配伍治疗眩晕。', difficulty: 'medium' }},

    // Domain 3B: 取穴定位与针刺手法（补充到60题，需要52题）
    { cat: 'DOMAIN_3B_ACU_TECHNIQUE', q: { question: '合谷穴的标准定位是？', options: ['A. 手背第1、2掌骨间，第2掌骨桡侧的中点处', 'B. 手背第2、3掌骨间', 'C. 手掌心劳宫穴处', 'D. 手腕横纹上2寸'], correctAnswer: 'A', explanation: '合谷穴位于手背第1、2掌骨间，第2掌骨桡侧中点处。', difficulty: 'medium' }},
    { cat: 'DOMAIN_3B_ACU_TECHNIQUE', q: { question: '足三里穴位于？', options: ['A. 犊鼻下3寸，胫骨前缘外一横指', 'B. 膝盖下4寸', 'C. 小腿中部', 'D. 踝关节上3寸'], correctAnswer: 'A', explanation: '足三里在犊鼻穴下3寸，距胫骨前缘一横指（中指）。', difficulty: 'easy' }},
    { cat: 'DOMAIN_3B_ACU_TECHNIQUE', q: { question: '针刺时，\"得气\"的感觉包括？', options: ['A. 酸、麻、胀、重', 'B. 仅有疼痛', 'C. 没有任何感觉', 'D. 皮肤发红'], correctAnswer: 'A', explanation: '得气是指针刺后出现酸、麻、胀、重等针感，是针刺有效的标志。', difficulty: 'easy' }},
    { cat: 'DOMAIN_3B_ACU_TECHNIQUE', q: { question: '捻转补法的操作是？', options: ['A. 大幅度、慢频率，重插轻提', 'B. 小幅度、快频率，轻插重提', 'C. 大幅度、快频率', 'D. 垂直提插'], correctAnswer: 'A', explanation: '捻转补法特点是大幅度、慢频率，重插轻提，以补益正气。', difficulty: 'medium' }},
    { cat: 'DOMAIN_3B_ACU_TECHNIQUE', q: { question: '三阴交穴的定位是？', options: ['A. 内踝尖上3寸，胫骨内侧缘后方', 'B. 外踝尖上3寸', 'C. 膝关节内侧', 'D. 足底中心'], correctAnswer: 'A', explanation: '三阴交在内踝尖直上3寸，胫骨内侧缘后方凹陷处。', difficulty: 'easy' }},
    { cat: 'DOMAIN_3B_ACU_TECHNIQUE', q: { question: '内关穴位于？', options: ['A. 腕横纹上2寸，掌长肌腱与桡侧腕屈肌腱之间', 'B. 腕横纹上3寸', 'C. 手掌中心', 'D. 腕关节背侧'], correctAnswer: 'A', explanation: '内关在腕横纹上2寸，两筋（掌长肌腱和桡侧腕屈肌腱）之间。', difficulty: 'medium' }},
    { cat: 'DOMAIN_3B_ACU_TECHNIQUE', q: { question: '针刺深度主要取决于？', options: ['A. 穴位部位、患者体质、病情虚实', 'B. 仅取决于穴位深浅', 'C. 患者要求', 'D. 医生经验'], correctAnswer: 'A', explanation: '针刺深度要综合考虑穴位部位、患者体质、病情虚实等因素。', difficulty: 'medium' }},
    { cat: 'DOMAIN_3B_ACU_TECHNIQUE', q: { question: '烧山火针法的目的是？', options: ['A. 温补', 'B. 清泻', 'C. 行气', 'D. 止痛'], correctAnswer: 'A', explanation: '烧山火是温补手法，用于治疗寒证、虚证。', difficulty: 'hard' }},
    { cat: 'DOMAIN_3B_ACU_TECHNIQUE', q: { question: '曲池穴的定位方法是？', options: ['A. 屈肘，肘横纹外侧端', 'B. 伸肘，肘窝中点', 'C. 上臂中部', 'D. 腕关节处'], correctAnswer: 'A', explanation: '曲池在屈肘时，肘横纹外侧端与肱骨外上髁连线中点。', difficulty: 'easy' }},
    { cat: 'DOMAIN_3B_ACU_TECHNIQUE', q: { question: '透天凉针法的作用是？', options: ['A. 清泻', 'B. 温补', 'C. 行气', 'D. 活血'], correctAnswer: 'A', explanation: '透天凉是清泻手法，用于治疗热证、实证。', difficulty: 'hard' }}
  ]

  let totalAdded = 0
  let totalSkipped = 0

  for (const item of allQuestions) {
    const category = await prisma.category.findFirst({
      where: { code: item.cat, examType: 'cale' }
    })

    if (!category) continue

    const isDup = await isDuplicate(item.q.question, category.id)

    if (isDup) {
      totalSkipped++
      continue
    }

    try {
      await prisma.question.create({
        data: {
          examType: 'cale',
          type: 'multiple_choice',
          question: item.q.question,
          options: JSON.stringify(item.q.options),
          correctAnswer: item.q.correctAnswer,
          explanation: item.q.explanation,
          difficulty: item.q.difficulty,
          categoryId: category.id,
          source: '系统生成'
        }
      })
      totalAdded++
      console.log(`✓ Added to ${item.cat}`)
    } catch (error) {
      console.error(`✗ Error adding question`)
    }
  }

  console.log(`\n✅ Complete! Added ${totalAdded}, skipped ${totalSkipped}`)

  // 显示最终统计
  const categories = await prisma.category.findMany({
    where: { examType: 'cale', type: 'content' },
    include: {
      _count: { select: { questions: true } }
    },
    orderBy: { code: 'asc' }
  })

  console.log('\n📊 Final Statistics:')
  let total = 0
  for (const cat of categories) {
    const count = cat._count.questions
    total += count
    console.log(`${cat.code}: ${count} questions`)
  }
  console.log(`\n🎯 TOTAL: ${total} questions`)
}

addBulkQuestions()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
