/**
 * 初始化成就系统
 *
 * 此脚本会创建预定义的成就定义
 * 运行方法：npx tsx scripts/init-achievements.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const achievements = [
  // 连续学习类成就
  {
    code: 'STREAK_3',
    name: '初出茅庐',
    nameEn: 'Getting Started',
    description: '连续学习3天',
    descriptionEn: 'Study for 3 days in a row',
    category: 'streak',
    icon: '🔥',
    rarity: 'common',
    points: 10,
    criteria: JSON.stringify({ type: 'streak_days', value: 3 }),
    order: 1
  },
  {
    code: 'STREAK_7',
    name: '持之以恒',
    nameEn: 'One Week Warrior',
    description: '连续学习7天',
    descriptionEn: 'Study for 7 days in a row',
    category: 'streak',
    icon: '🔥',
    rarity: 'common',
    points: 25,
    criteria: JSON.stringify({ type: 'streak_days', value: 7 }),
    order: 2
  },
  {
    code: 'STREAK_30',
    name: '坚持不懈',
    nameEn: 'Monthly Master',
    description: '连续学习30天',
    descriptionEn: 'Study for 30 days in a row',
    category: 'streak',
    icon: '🔥',
    rarity: 'rare',
    points: 100,
    criteria: JSON.stringify({ type: 'streak_days', value: 30 }),
    order: 3
  },
  {
    code: 'STREAK_100',
    name: '百日筑基',
    nameEn: '100 Day Legend',
    description: '连续学习100天',
    descriptionEn: 'Study for 100 days in a row',
    category: 'streak',
    icon: '🔥',
    rarity: 'epic',
    points: 500,
    criteria: JSON.stringify({ type: 'streak_days', value: 100 }),
    order: 4
  },

  // 答题数量类成就
  {
    code: 'QUESTIONS_100',
    name: '题海初航',
    nameEn: 'Question Novice',
    description: '累计答题100道',
    descriptionEn: 'Answer 100 questions',
    category: 'questions',
    icon: '📝',
    rarity: 'common',
    points: 15,
    criteria: JSON.stringify({ type: 'questions_answered', value: 100 }),
    order: 1
  },
  {
    code: 'QUESTIONS_500',
    name: '题海遨游',
    nameEn: 'Question Explorer',
    description: '累计答题500道',
    descriptionEn: 'Answer 500 questions',
    category: 'questions',
    icon: '📝',
    rarity: 'common',
    points: 50,
    criteria: JSON.stringify({ type: 'questions_answered', value: 500 }),
    order: 2
  },
  {
    code: 'QUESTIONS_1000',
    name: '题海达人',
    nameEn: 'Question Master',
    description: '累计答题1000道',
    descriptionEn: 'Answer 1000 questions',
    category: 'questions',
    icon: '📝',
    rarity: 'rare',
    points: 120,
    criteria: JSON.stringify({ type: 'questions_answered', value: 1000 }),
    order: 3
  },
  {
    code: 'QUESTIONS_5000',
    name: '题海至尊',
    nameEn: 'Question Legend',
    description: '累计答题5000道',
    descriptionEn: 'Answer 5000 questions',
    category: 'questions',
    icon: '📝',
    rarity: 'legendary',
    points: 1000,
    criteria: JSON.stringify({ type: 'questions_answered', value: 5000 }),
    order: 4
  },

  // 考试类成就
  {
    code: 'EXAM_FIRST',
    name: '初试锋芒',
    nameEn: 'First Timer',
    description: '完成第一次模拟考试',
    descriptionEn: 'Complete your first exam',
    category: 'exams',
    icon: '🎯',
    rarity: 'common',
    points: 20,
    criteria: JSON.stringify({ type: 'exams_completed', value: 1 }),
    order: 1
  },
  {
    code: 'EXAM_PASS_FIRST',
    name: '旗开得胜',
    nameEn: 'First Victory',
    description: '首次通过模拟考试',
    descriptionEn: 'Pass your first exam',
    category: 'exams',
    icon: '🏆',
    rarity: 'common',
    points: 30,
    criteria: JSON.stringify({ type: 'exams_passed', value: 1 }),
    order: 2
  },
  {
    code: 'EXAM_PASS_10',
    name: '考场老将',
    nameEn: 'Veteran',
    description: '通过10次模拟考试',
    descriptionEn: 'Pass 10 exams',
    category: 'exams',
    icon: '🏆',
    rarity: 'rare',
    points: 200,
    criteria: JSON.stringify({ type: 'exams_passed', value: 10 }),
    order: 3
  },
  {
    code: 'EXAM_PERFECT',
    name: '完美答卷',
    nameEn: 'Perfect Score',
    description: '获得100分满分',
    descriptionEn: 'Get a perfect score',
    category: 'exams',
    icon: '💯',
    rarity: 'epic',
    points: 300,
    criteria: JSON.stringify({ type: 'perfect_score', value: 1 }),
    order: 4
  },

  // 准确率类成就
  {
    code: 'ACCURACY_80',
    name: '精益求精',
    nameEn: 'High Achiever',
    description: '正确率达到80%（至少100题）',
    descriptionEn: '80% accuracy (minimum 100 questions)',
    category: 'accuracy',
    icon: '🎖️',
    rarity: 'common',
    points: 50,
    criteria: JSON.stringify({ type: 'accuracy_rate', value: 80, min_questions: 100 }),
    order: 1
  },
  {
    code: 'ACCURACY_90',
    name: '近乎完美',
    nameEn: 'Near Perfect',
    description: '正确率达到90%（至少200题）',
    descriptionEn: '90% accuracy (minimum 200 questions)',
    category: 'accuracy',
    icon: '🎖️',
    rarity: 'rare',
    points: 150,
    criteria: JSON.stringify({ type: 'accuracy_rate', value: 90, min_questions: 200 }),
    order: 2
  },
  {
    code: 'ACCURACY_95',
    name: '神乎其技',
    nameEn: 'Excellence',
    description: '正确率达到95%（至少500题）',
    descriptionEn: '95% accuracy (minimum 500 questions)',
    category: 'accuracy',
    icon: '🎖️',
    rarity: 'epic',
    points: 400,
    criteria: JSON.stringify({ type: 'accuracy_rate', value: 95, min_questions: 500 }),
    order: 3
  }
]

async function main() {
  console.log('🏆 开始初始化成就系统...\n')

  let created = 0
  let skipped = 0

  for (const achievement of achievements) {
    try {
      // 检查是否已存在
      const existing = await prisma.achievement.findUnique({
        where: { code: achievement.code }
      })

      if (existing) {
        console.log(`⏭️  ${achievement.code} 已存在，跳过`)
        skipped++
        continue
      }

      // 创建成就
      await prisma.achievement.create({
        data: achievement
      })

      console.log(`✅ 创建成就: ${achievement.name} (${achievement.code})`)
      created++
    } catch (error: any) {
      console.error(`❌ 创建成就失败 ${achievement.code}:`, error.message)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 初始化统计')
  console.log('='.repeat(60))
  console.log(`✅ 新创建: ${created} 个成就`)
  console.log(`⏭️  跳过: ${skipped} 个成就`)
  console.log(`📝 总计: ${achievements.length} 个成就定义`)
  console.log('='.repeat(60))
  console.log('\n✨ 成就系统初始化完成！')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
