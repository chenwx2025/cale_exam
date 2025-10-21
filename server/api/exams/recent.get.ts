import { requireAuth } from '~/server/utils/auth-helpers'
import prisma from '~/server/utils/prisma'

/**
 * 获取用户最近的考试记录
 */
export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const query = getQuery(event)
  const examType = String(query.examType || 'cale')
  const limit = Math.min(10, Math.max(1, parseInt(String(query.limit || '5'))))

  try {
    // 获取最近的考试记录
    const recentExams = await prisma.exam.findMany({
      where: {
        userId: user.id,
        examType
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        title: true,
        mode: true,
        status: true,
        questionCount: true,
        duration: true,
        score: true,
        totalScore: true,
        percentage: true,
        passed: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
        timeSpent: true
      }
    })

    // 格式化数据
    const formattedExams = recentExams.map(exam => ({
      ...exam,
      statusText: getStatusText(exam.status),
      modeText: getModeText(exam.mode),
      isCompleted: exam.status === 'completed',
      canContinue: exam.status === 'in_progress'
    }))

    return {
      success: true,
      data: formattedExams
    }
  } catch (error: any) {
    console.error('Error fetching recent exams:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch recent exams',
      message: error.message
    })
  }
})

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'not_started': '未开始',
    'in_progress': '进行中',
    'completed': '已完成',
    'abandoned': '已放弃'
  }
  return statusMap[status] || status
}

function getModeText(mode: string): string {
  const modeMap: Record<string, string> = {
    'exam': '模拟考试',
    'practice': '练习模式',
    'ai_generated': 'AI生成'
  }
  return modeMap[mode] || mode
}
