import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

/**
 * 获取所有考试类型的统计信息
 * 用于管理后台考试管理页面
 */
export default defineEventHandler(async (event) => {
  // 验证管理员权限
  requireAdmin(event)

  try {
    // 获取所有考试信息
    const examInfos = await prisma.examInfo.findMany({
      orderBy: {
        examType: 'asc'
      }
    })

    // 为每个考试类型收集统计数据
    const examStats = await Promise.all(
      examInfos.map(async (examInfo) => {
        const examType = examInfo.examType

        // 1. 统计用户数（订阅该考试的用户）
        const subscribedUsers = await prisma.userExamSubscription.count({
          where: {
            examType,
            isActive: true
          }
        })

        // 2. 统计题目总数
        const totalQuestions = await prisma.question.count({
          where: { examType }
        })

        // 按难度分组统计题目
        const questionsByDifficulty = await prisma.question.groupBy({
          by: ['difficulty'],
          where: { examType },
          _count: true
        })

        // 3. 统计考试总数（已完成的练习/模拟考）
        const totalExamsCompleted = await prisma.exam.count({
          where: {
            examType,
            status: 'completed'
          }
        })

        // 4. 统计进行中的考试
        const totalExamsInProgress = await prisma.exam.count({
          where: {
            examType,
            status: 'in_progress'
          }
        })

        // 5. 统计分类数量
        const totalCategories = await prisma.category.count({
          where: { examType }
        })

        // 6. 获取最近7天的活动
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const recentActivity = await prisma.exam.count({
          where: {
            examType,
            createdAt: {
              gte: sevenDaysAgo
            }
          }
        })

        // 7. 计算平均分（已完成的考试）
        const completedExams = await prisma.exam.findMany({
          where: {
            examType,
            status: 'completed'
          },
          select: {
            score: true
          }
        })

        const averageScore = completedExams.length > 0
          ? completedExams.reduce((sum, exam) => sum + (exam.score || 0), 0) / completedExams.length
          : 0

        return {
          examType,
          name: examInfo.name,
          fullName: examInfo.fullName,
          description: examInfo.description,
          stats: {
            subscribedUsers,
            totalQuestions,
            questionsByDifficulty: questionsByDifficulty.map(q => ({
              difficulty: q.difficulty,
              count: q._count
            })),
            totalExamsCompleted,
            totalExamsInProgress,
            totalExams: totalExamsCompleted + totalExamsInProgress,
            totalCategories,
            recentActivityLast7Days: recentActivity,
            averageScore: Math.round(averageScore * 10) / 10
          }
        }
      })
    )

    return {
      success: true,
      data: {
        exams: examStats,
        summary: {
          totalExamTypes: examInfos.length,
          totalUsers: await prisma.user.count({ where: { role: 'user' } }),
          totalQuestions: await prisma.question.count(),
          totalExams: await prisma.exam.count()
        }
      }
    }
  } catch (error) {
    console.error('[Admin Exams] Error fetching exam statistics:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch exam statistics'
    })
  }
})
