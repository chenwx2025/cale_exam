/**
 * 考试成绩分享 API
 * 创建一个可分享的考试成绩卡片
 */

import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const user = await requireAuth(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    // 获取请求数据
    const body = await readBody(event)
    const {
      examId,
      isPublic = true,
      hideUserName = false
    } = body

    // 验证必需字段
    if (!examId) {
      throw createError({
        statusCode: 400,
        message: 'Missing required field: examId'
      })
    }

    // 获取考试记录
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      }
    })

    // 验证考试存在
    if (!exam) {
      throw createError({
        statusCode: 404,
        message: 'Exam not found'
      })
    }

    // 验证考试所有权
    if (exam.userId !== user.id) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden: You can only share your own exams'
      })
    }

    // 验证考试已完成
    if (exam.status !== 'completed') {
      throw createError({
        statusCode: 400,
        message: 'Cannot share incomplete exam'
      })
    }

    // 计算考试统计数据
    const totalQuestions = exam.answers.length
    const correctCount = exam.answers.filter(a => a.isCorrect).length
    const accuracy = totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0

    // 格式化时间
    const timeSpent = exam.timeSpent || 0
    const timeSpentMinutes = Math.floor(timeSpent / 60)
    const timeSpentSeconds = timeSpent % 60

    // 构建分享标题
    const title = exam.passed
      ? `🎉 通过了${exam.title}！`
      : `完成了${exam.title}`

    const description = exam.passed
      ? `以 ${exam.percentage}% 的成绩通过考试！`
      : `获得了 ${exam.percentage}% 的成绩`

    // 创建分享内容
    const content = JSON.stringify({
      examId: exam.id,
      examType: exam.examType,
      examTitle: exam.title,
      examMode: getModeText(exam.mode),
      score: Math.round(exam.percentage || 0),
      passed: exam.passed,
      correctCount,
      totalQuestions,
      accuracy,
      timeSpent,
      timeSpentFormatted: timeSpentMinutes > 0
        ? `${timeSpentMinutes}分${timeSpentSeconds}秒`
        : `${timeSpentSeconds}秒`,
      userName: hideUserName ? '匿名用户' : user.name,
      completedAt: exam.completedAt,
      difficulty: exam.difficulty
    })

    // 保存分享记录到数据库
    const share = await prisma.share.create({
      data: {
        userId: user.id,
        shareType: 'exam',
        title,
        description,
        content,
        isPublic
      }
    })

    console.log(`[ShareExam] Created share ${share.id} for exam ${examId} by user ${user.id}`)

    return {
      success: true,
      shareId: share.id,
      shareUrl: `/share/${share.id}`,
      share: {
        id: share.id,
        type: share.shareType,
        title: share.title,
        description: share.description,
        content: JSON.parse(share.content),
        isPublic: share.isPublic,
        createdAt: share.createdAt
      }
    }
  } catch (error: any) {
    console.error('[ShareExam] Error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to create exam share'
    })
  }
})

/**
 * 获取考试模式文本
 */
function getModeText(mode: string): string {
  const modeTexts: Record<string, string> = {
    exam: '模拟考试',
    practice: '练习模式',
    ai_generated: 'AI生成题库'
  }
  return modeTexts[mode] || mode
}
