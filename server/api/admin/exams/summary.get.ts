import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  requireAdmin(event)

  try {
    // 1. 总考试数
    const totalExams = await prisma.exam.count()

    // 2. 按考试类型统计
    const examTypeStats = await prisma.exam.groupBy({
      by: ['examType'],
      _count: {
        id: true
      }
    })

    // 3. 按状态统计
    const statusStats = await prisma.exam.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    // 4. 通过率统计
    const passedExams = await prisma.exam.count({
      where: {
        status: 'completed',
        isPassed: true
      }
    })

    const completedExams = await prisma.exam.count({
      where: { status: 'completed' }
    })

    const passRate = completedExams > 0
      ? Math.round((passedExams / completedExams) * 100)
      : 0

    // 5. 平均分数
    const completedExamsWithScore = await prisma.exam.findMany({
      where: {
        status: 'completed',
        score: { not: null }
      },
      select: { score: true }
    })

    const avgScore = completedExamsWithScore.length > 0
      ? Math.round(
          completedExamsWithScore.reduce((sum, exam) => sum + (exam.score || 0), 0) /
          completedExamsWithScore.length
        )
      : 0

    // 6. 最近考试（7天内）
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentExams = await prisma.exam.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // 7. 今日考试
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayExams = await prisma.exam.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    })

    // 8. 平均答题数
    const examsWithAnswers = await prisma.exam.findMany({
      select: {
        _count: {
          select: {
            userAnswers: true
          }
        }
      }
    })

    const avgAnswers = examsWithAnswers.length > 0
      ? Math.round(
          examsWithAnswers.reduce((sum, exam) => sum + exam._count.userAnswers, 0) /
          examsWithAnswers.length
        )
      : 0

    // 9. 平均完成时间（分钟）
    const completedExamsWithTime = await prisma.exam.findMany({
      where: {
        status: 'completed',
        startedAt: { not: null },
        completedAt: { not: null }
      },
      select: {
        startedAt: true,
        completedAt: true
      }
    })

    const avgDuration = completedExamsWithTime.length > 0
      ? Math.round(
          completedExamsWithTime.reduce((sum, exam) => {
            const duration = exam.completedAt!.getTime() - exam.startedAt!.getTime()
            return sum + duration
          }, 0) / completedExamsWithTime.length / 1000 / 60 // 转换为分钟
        )
      : 0

    return {
      success: true,
      data: {
        totalExams,
        recentExams,
        todayExams,
        completedExams,
        passedExams,
        passRate,
        avgScore,
        avgAnswers,
        avgDuration,
        examTypeStats: examTypeStats.map(stat => ({
          examType: stat.examType,
          count: Number(stat._count.id)
        })),
        statusStats: statusStats.map(stat => ({
          status: stat.status,
          count: Number(stat._count.id)
        }))
      }
    }
  } catch (error: any) {
    console.error('Get exams summary error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get exams summary: ' + error.message
    })
  }
})
