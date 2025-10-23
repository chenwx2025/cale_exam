/**
 * 数据迁移脚本：为 UserPoints 和 Achievement 添加 examType 支持
 *
 * 此脚本将：
 * 1. 为现有的 UserPoints 记录添加 examType 字段（默认为 'all'）
 * 2. 为每个用户创建按考试类型分开的 UserPoints 记录（cale 和 nccaom）
 * 3. 为现有的 Achievement 记录添加 examType 字段（默认为 'all'）
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始数据迁移...')

  try {
    // 1. 迁移 UserPoints 数据
    console.log('\n[1] 迁移 UserPoints 数据...')

    // 获取所有现有的 UserPoints 记录
    const existingUserPoints = await prisma.userPoints.findMany()
    console.log(`找到 ${existingUserPoints.length} 条现有 UserPoints 记录`)

    if (existingUserPoints.length > 0) {
      // 由于我们修改了 unique 约束从 userId 到 [userId, examType]
      // 现有记录会被视为 examType='cale'（默认值）

      // 为每个用户创建其他考试类型的记录
      for (const userPoint of existingUserPoints) {
        // 检查是否已存在 examType='cale' 的记录
        const caleExists = await prisma.userPoints.findUnique({
          where: {
            userId_examType: {
              userId: userPoint.userId,
              examType: 'cale'
            }
          }
        })

        // 如果不存在，说明这是旧数据，我们需要更新它的 examType
        if (!caleExists && userPoint.examType !== 'cale') {
          // 这条记录是旧数据，examType 应该是 'cale'（现有用户默认）
          await prisma.userPoints.update({
            where: { id: userPoint.id },
            data: { examType: 'cale' }
          })
          console.log(`  更新用户 ${userPoint.userId} 的记录为 examType='cale'`)
        }

        // 为 NCCAOM 创建新记录（如果还不存在）
        const nccaomExists = await prisma.userPoints.findUnique({
          where: {
            userId_examType: {
              userId: userPoint.userId,
              examType: 'nccaom'
            }
          }
        })

        if (!nccaomExists) {
          await prisma.userPoints.create({
            data: {
              userId: userPoint.userId,
              examType: 'nccaom',
              totalPoints: 0,
              weeklyPoints: 0,
              monthlyPoints: 0,
              questionsAnswered: 0,
              correctAnswers: 0,
              studyTimeMinutes: 0,
              streakDays: 0,
              lastActivityAt: new Date()
            }
          })
          console.log(`  为用户 ${userPoint.userId} 创建 NCCAOM 积分记录`)
        }

        // 创建全平台统计记录（all）
        const allExists = await prisma.userPoints.findUnique({
          where: {
            userId_examType: {
              userId: userPoint.userId,
              examType: 'all'
            }
          }
        })

        if (!allExists) {
          await prisma.userPoints.create({
            data: {
              userId: userPoint.userId,
              examType: 'all',
              totalPoints: userPoint.totalPoints,
              weeklyPoints: userPoint.weeklyPoints,
              monthlyPoints: userPoint.monthlyPoints,
              questionsAnswered: userPoint.questionsAnswered,
              correctAnswers: userPoint.correctAnswers,
              studyTimeMinutes: userPoint.studyTimeMinutes,
              streakDays: userPoint.streakDays,
              lastActivityAt: userPoint.lastActivityAt
            }
          })
          console.log(`  为用户 ${userPoint.userId} 创建全平台统计记录`)
        }
      }
    }

    // 2. 迁移 Achievement 数据
    console.log('\n[2] 迁移 Achievement 数据...')

    const existingAchievements = await prisma.achievement.findMany()
    console.log(`找到 ${existingAchievements.length} 条现有 Achievement 记录`)

    if (existingAchievements.length > 0) {
      for (const achievement of existingAchievements) {
        // 如果 examType 不是 'all'，更新为 'all'（全平台成就）
        if (achievement.examType !== 'all') {
          await prisma.achievement.update({
            where: { id: achievement.id },
            data: { examType: 'all' }
          })
          console.log(`  更新成就 "${achievement.name}" 的 examType 为 'all'`)
        }
      }
    }

    // 3. 统计迁移结果
    console.log('\n[3] 迁移完成统计...')

    const userPointsCount = await prisma.userPoints.groupBy({
      by: ['examType'],
      _count: true
    })

    console.log('\nUserPoints 按考试类型统计：')
    userPointsCount.forEach(item => {
      console.log(`  ${item.examType}: ${item._count} 条记录`)
    })

    const achievementsCount = await prisma.achievement.groupBy({
      by: ['examType'],
      _count: true
    })

    console.log('\nAchievement 按考试类型统计：')
    achievementsCount.forEach(item => {
      console.log(`  ${item.examType}: ${item._count} 条记录`)
    })

    console.log('\n✅ 数据迁移完成！')
  } catch (error) {
    console.error('❌ 迁移失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
