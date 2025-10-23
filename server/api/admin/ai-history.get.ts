import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  await requireAdmin(event)

  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20

    // 获取AI生成的题目集列表
    const [total, sets] = await Promise.all([
      prisma.exam.count({
        where: {
          mode: 'ai_generated'
        }
      }),
      prisma.exam.findMany({
        where: {
          mode: 'ai_generated'
        },
        include: {
          answers: {
            include: {
              question: {
                include: {
                  category: {
                    select: {
                      id: true,
                      name: true,
                      code: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ])

    // 处理数据，添加选项解析
    const processedSets = sets.map(set => {
      const questions = set.answers.map(answer => {
        const question = answer.question

        // 解析选项
        let chineseOptions: string[] = []
        let correctAnswerLetter = ''

        if (question.options) {
          try {
            const rawOptions = JSON.parse(question.options)
            // 去除选项中的 A. B. C. D. 前缀
            chineseOptions = rawOptions.map((opt: string) => {
              return opt.replace(/^[A-Z]\.\s*/, '')
            })
          } catch (e) {
            console.error('Failed to parse options:', e)
          }
        }

        // 提取正确答案字母
        if (question.correctAnswer) {
          const match = question.correctAnswer.match(/^([A-Z])\./)
          if (match) {
            correctAnswerLetter = match[1]
          } else if (question.correctAnswer.match(/^[A-Z]$/)) {
            correctAnswerLetter = question.correctAnswer
          }
        }

        return {
          id: question.id,
          question: question.question,
          chineseOptions,
          correctAnswer: correctAnswerLetter,
          explanation: question.explanation,
          difficulty: question.difficulty,
          category: question.category
        }
      })

      return {
        id: set.id,
        title: set.title,
        examType: set.examType,
        categoryId: set.categoryId,
        questionCount: set.questionCount,
        difficulty: set.difficulty,
        generatedBy: set.generatedBy,
        createdAt: set.createdAt,
        questions
      }
    })

    return {
      success: true,
      total,
      page,
      pageSize,
      sets: processedSets
    }
  } catch (error: any) {
    console.error('Failed to fetch AI generation history:', error)
    throw createError({
      statusCode: 500,
      message: error.message || '获取生成历史失败'
    })
  }
})
