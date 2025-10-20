import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixPlaceholderQuestions() {
  console.log('开始修复占位符题目...\n')

  // 修复题目的映射
  const fixes = [
    {
      id: 'cmgyh05p3000npjejdadetwi3',
      question: '针刺委中穴时，患者应采取的体位是：',
      correctAnswer: 'C. 俯卧位',
      explanation: '委中穴位于膝窝横纹中点，针刺时患者应采取俯卧位，使膝关节自然弯曲，便于准确定位和进针。'
    },
    {
      id: 'cmgyh05p7000rpjejgihcr2b3',
      question: '针刺合谷穴时，标准的进针深度应为：',
      correctAnswer: 'B. 0.5-1寸',
      explanation: '合谷穴位于手背第一、二掌骨之间，针刺深度一般为0.5-1寸，直刺即可。'
    },
    {
      id: 'cmgyukqwq0003pjh9ipofmkth',
      question: '根据八纲辨证，下列哪项症状组合提示里热证？',
      correctAnswer: 'A. 发热、口渴、便秘、脉数',
      explanation: '里热证的典型表现包括发热、口渴喜冷饮、便秘、小便黄赤、舌红苔黄、脉数有力等。选项A符合里热证的典型症候。'
    },
    {
      id: 'cmgyukqwv0005pjh9oacoway8',
      question: '治疗头痛时，合谷穴的主要作用是什么？',
      correctAnswer: 'B. 清热解毒、消肿止痛',
      explanation: '合谷穴是手阳明大肠经的原穴，具有疏风清热、通络止痛的作用，是治疗头面部疾病的要穴。'
    },
    {
      id: 'cmgyukqx20007pjh9cbripuoi',
      question: '定位足三里穴时，正确的取穴方法是？',
      correctAnswer: 'D. 根据骨度分寸法定位',
      explanation: '足三里位于小腿前外侧，外膝眼下3寸，距胫骨前缘一横指（中指）。应采用骨度分寸法定位，即从外膝眼向下量4横指（3寸）。'
    }
  ]

  for (const fix of fixes) {
    try {
      await prisma.question.update({
        where: { id: fix.id },
        data: {
          question: fix.question,
          correctAnswer: fix.correctAnswer,
          explanation: fix.explanation
        }
      })
      console.log(`✓ 已修复题目: ${fix.question.substring(0, 30)}...`)
    } catch (error) {
      console.error(`✗ 修复题目失败 (${fix.id}):`, error)
    }
  }

  console.log('\n修复完成！')

  // 验证修复结果
  const remainingPlaceholders = await prisma.question.count({
    where: {
      question: {
        contains: '{'
      }
    }
  })

  console.log(`\n剩余含占位符的题目数量: ${remainingPlaceholders}`)
}

fixPlaceholderQuestions()
  .then(() => {
    console.log('\n所有题目已修复！')
    process.exit(0)
  })
  .catch((error) => {
    console.error('修复过程出错:', error)
    process.exit(1)
  })
