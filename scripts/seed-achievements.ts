/**
 * Seed Achievements Script
 * Phase 6 Sprint 4 - Learning Community
 *
 * Populates the database with predefined achievements
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const achievements = [
  // Streak Achievements
  {
    code: 'streak_7_days',
    name: '一周学霸',
    nameEn: 'Week Warrior',
    description: '连续学习7天',
    descriptionEn: 'Study for 7 consecutive days',
    category: 'streak',
    icon: '🔥',
    rarity: 'common',
    points: 50,
    criteria: JSON.stringify({ type: 'streak_days', value: 7 }),
    order: 1
  },
  {
    code: 'streak_30_days',
    name: '月度冠军',
    nameEn: 'Monthly Champion',
    description: '连续学习30天',
    descriptionEn: 'Study for 30 consecutive days',
    category: 'streak',
    icon: '🔥',
    rarity: 'rare',
    points: 200,
    criteria: JSON.stringify({ type: 'streak_days', value: 30 }),
    order: 2
  },
  {
    code: 'streak_100_days',
    name: '百日坚持',
    nameEn: 'Century Scholar',
    description: '连续学习100天',
    descriptionEn: 'Study for 100 consecutive days',
    category: 'streak',
    icon: '💯',
    rarity: 'epic',
    points: 1000,
    criteria: JSON.stringify({ type: 'streak_days', value: 100 }),
    order: 3
  },

  // Questions Achievements
  {
    code: 'questions_100',
    name: '百题挑战',
    nameEn: 'Hundred Questions',
    description: '答对100道题目',
    descriptionEn: 'Answer 100 questions correctly',
    category: 'questions',
    icon: '📝',
    rarity: 'common',
    points: 100,
    criteria: JSON.stringify({ type: 'correct_answers', value: 100 }),
    order: 4
  },
  {
    code: 'questions_500',
    name: '刷题达人',
    nameEn: 'Question Master',
    description: '答对500道题目',
    descriptionEn: 'Answer 500 questions correctly',
    category: 'questions',
    icon: '📚',
    rarity: 'rare',
    points: 500,
    criteria: JSON.stringify({ type: 'correct_answers', value: 500 }),
    order: 5
  },
  {
    code: 'questions_1000',
    name: '千题王者',
    nameEn: 'Thousand King',
    description: '答对1000道题目',
    descriptionEn: 'Answer 1000 questions correctly',
    category: 'questions',
    icon: '👑',
    rarity: 'epic',
    points: 2000,
    criteria: JSON.stringify({ type: 'correct_answers', value: 1000 }),
    order: 6
  },
  {
    code: 'questions_5000',
    name: '题海无边',
    nameEn: 'Endless Ocean',
    description: '答对5000道题目',
    descriptionEn: 'Answer 5000 questions correctly',
    category: 'questions',
    icon: '🌊',
    rarity: 'legendary',
    points: 10000,
    criteria: JSON.stringify({ type: 'correct_answers', value: 5000 }),
    order: 7
  },

  // Exam Achievements
  {
    code: 'exam_pass_first',
    name: '初露锋芒',
    nameEn: 'First Victory',
    description: '通过第一次模拟考试',
    descriptionEn: 'Pass your first mock exam',
    category: 'exams',
    icon: '🎯',
    rarity: 'common',
    points: 100,
    criteria: JSON.stringify({ type: 'exams_passed', value: 1 }),
    order: 8
  },
  {
    code: 'exam_pass_5',
    name: '考试能手',
    nameEn: 'Exam Expert',
    description: '通过5次模拟考试',
    descriptionEn: 'Pass 5 mock exams',
    category: 'exams',
    icon: '🎓',
    rarity: 'rare',
    points: 300,
    criteria: JSON.stringify({ type: 'exams_passed', value: 5 }),
    order: 9
  },
  {
    code: 'exam_pass_25',
    name: '考试大师',
    nameEn: 'Exam Master',
    description: '通过25次模拟考试',
    descriptionEn: 'Pass 25 mock exams',
    category: 'exams',
    icon: '🏆',
    rarity: 'epic',
    points: 1500,
    criteria: JSON.stringify({ type: 'exams_passed', value: 25 }),
    order: 10
  },

  // Accuracy Achievements
  {
    code: 'accuracy_90',
    name: '精准射手',
    nameEn: 'Sharp Shooter',
    description: '单次考试正确率达到90%',
    descriptionEn: 'Achieve 90% accuracy in a single exam',
    category: 'accuracy',
    icon: '🎯',
    rarity: 'rare',
    points: 200,
    criteria: JSON.stringify({ type: 'exam_accuracy', value: 90 }),
    order: 11
  },
  {
    code: 'accuracy_95',
    name: '百发百中',
    nameEn: 'Bullseye',
    description: '单次考试正确率达到95%',
    descriptionEn: 'Achieve 95% accuracy in a single exam',
    category: 'accuracy',
    icon: '🎯',
    rarity: 'epic',
    points: 500,
    criteria: JSON.stringify({ type: 'exam_accuracy', value: 95 }),
    order: 12
  },
  {
    code: 'accuracy_perfect',
    name: '完美无瑕',
    nameEn: 'Flawless',
    description: '单次考试100%正确',
    descriptionEn: 'Achieve 100% accuracy in a single exam',
    category: 'accuracy',
    icon: '💎',
    rarity: 'legendary',
    points: 1000,
    criteria: JSON.stringify({ type: 'exam_accuracy', value: 100 }),
    order: 13
  },

  // Social Achievements
  {
    code: 'social_followers_10',
    name: '人气新星',
    nameEn: 'Rising Star',
    description: '获得10位关注者',
    descriptionEn: 'Gain 10 followers',
    category: 'social',
    icon: '⭐',
    rarity: 'common',
    points: 50,
    criteria: JSON.stringify({ type: 'followers_count', value: 10 }),
    order: 14
  },
  {
    code: 'social_followers_50',
    name: '人气达人',
    nameEn: 'Popular',
    description: '获得50位关注者',
    descriptionEn: 'Gain 50 followers',
    category: 'social',
    icon: '🌟',
    rarity: 'rare',
    points: 250,
    criteria: JSON.stringify({ type: 'followers_count', value: 50 }),
    order: 15
  },
  {
    code: 'social_followers_100',
    name: '社区领袖',
    nameEn: 'Community Leader',
    description: '获得100位关注者',
    descriptionEn: 'Gain 100 followers',
    category: 'social',
    icon: '👑',
    rarity: 'epic',
    points: 1000,
    criteria: JSON.stringify({ type: 'followers_count', value: 100 }),
    order: 16
  },

  // Group Achievements
  {
    code: 'group_create_first',
    name: '组织者',
    nameEn: 'Organizer',
    description: '创建第一个学习小组',
    descriptionEn: 'Create your first study group',
    category: 'groups',
    icon: '👥',
    rarity: 'common',
    points: 100,
    criteria: JSON.stringify({ type: 'groups_created', value: 1 }),
    order: 17
  },
  {
    code: 'group_join_5',
    name: '社交达人',
    nameEn: 'Social Butterfly',
    description: '加入5个学习小组',
    descriptionEn: 'Join 5 study groups',
    category: 'groups',
    icon: '🦋',
    rarity: 'common',
    points: 50,
    criteria: JSON.stringify({ type: 'groups_joined', value: 5 }),
    order: 18
  },
  {
    code: 'group_active',
    name: '活跃贡献者',
    nameEn: 'Active Contributor',
    description: '在小组中发布10条帖子',
    descriptionEn: 'Post 10 times in study groups',
    category: 'groups',
    icon: '💬',
    rarity: 'rare',
    points: 150,
    criteria: JSON.stringify({ type: 'group_posts', value: 10 }),
    order: 19
  },

  // Study Time Achievements
  {
    code: 'study_time_10h',
    name: '入门学者',
    nameEn: 'Beginner Scholar',
    description: '累计学习10小时',
    descriptionEn: 'Study for 10 hours total',
    category: 'study_time',
    icon: '⏰',
    rarity: 'common',
    points: 50,
    criteria: JSON.stringify({ type: 'study_time_minutes', value: 600 }),
    order: 20
  },
  {
    code: 'study_time_50h',
    name: '勤奋学者',
    nameEn: 'Diligent Scholar',
    description: '累计学习50小时',
    descriptionEn: 'Study for 50 hours total',
    category: 'study_time',
    icon: '📖',
    rarity: 'rare',
    points: 250,
    criteria: JSON.stringify({ type: 'study_time_minutes', value: 3000 }),
    order: 21
  },
  {
    code: 'study_time_100h',
    name: '学习狂人',
    nameEn: 'Study Maniac',
    description: '累计学习100小时',
    descriptionEn: 'Study for 100 hours total',
    category: 'study_time',
    icon: '🔥',
    rarity: 'epic',
    points: 1000,
    criteria: JSON.stringify({ type: 'study_time_minutes', value: 6000 }),
    order: 22
  }
]

async function main() {
  console.log('🌱 Seeding achievements...')

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement
    })
    console.log(`✅ Created/updated achievement: ${achievement.name} (${achievement.nameEn})`)
  }

  console.log(`\n✅ Successfully seeded ${achievements.length} achievements!`)
  console.log('\nAchievement Categories:')
  console.log('  - Streak: 3 achievements')
  console.log('  - Questions: 4 achievements')
  console.log('  - Exams: 3 achievements')
  console.log('  - Accuracy: 3 achievements')
  console.log('  - Social: 3 achievements')
  console.log('  - Groups: 3 achievements')
  console.log('  - Study Time: 3 achievements')
  console.log('\nRarity Distribution:')
  console.log('  - Common: 8 achievements')
  console.log('  - Rare: 8 achievements')
  console.log('  - Epic: 5 achievements')
  console.log('  - Legendary: 1 achievement')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding achievements:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
