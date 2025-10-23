import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20
    const examType = query.examType as string
    const categoryId = query.categoryId as string
    const difficulty = query.difficulty as string
    const search = query.search as string

    // 构建查询条件
    const where: any = {}

    if (examType) {
      where.examType = examType
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (search) {
      where.OR = [
        { question: { contains: search } },
        { explanation: { contains: search } }
      ]
    }

    // 获取总数
    const total = await prisma.question.count({ where })

    // 获取分页数据
    const questions = await prisma.question.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            code: true,
            name: true,
            nameEn: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    // 为每个题目添加统计信息并解析选项
    const questionsWithStats = await Promise.all(
      questions.map(async (question) => {
        const answers = await prisma.userAnswer.findMany({
          where: { questionId: question.id },
          select: { isCorrect: true }
        })

        const totalAnswers = answers.length
        const correctAnswers = answers.filter(a => a.isCorrect).length
        const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0

        // 解析选项 JSON
        let parsedOptions: string[] = []
        let correctAnswerLetter = ''

        if (question.options) {
          try {
            const rawOptions = JSON.parse(question.options)
            // 选项格式: ["A. 选项1", "B. 选项2"]
            parsedOptions = rawOptions.map((opt: string) => {
              // 移除 "A. ", "B. " 等前缀
              return opt.replace(/^[A-Z]\.\s*/, '')
            })

            // 从 correctAnswer 中提取字母 (如 "B. 大补元气" -> "B")
            const match = question.correctAnswer.match(/^([A-Z])\./)
            if (match) {
              correctAnswerLetter = match[1]
            }
          } catch (e) {
            console.error('Failed to parse options:', e)
          }
        }

        return {
          ...question,
          chineseQuestion: question.question,
          chineseOptions: parsedOptions,
          correctAnswer: correctAnswerLetter,
          stats: {
            totalAnswers,
            correctAnswers,
            wrongAnswers: totalAnswers - correctAnswers,
            accuracy
          }
        }
      })
    )

    return {
      success: true,
      questions: questionsWithStats,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  } catch (error: any) {
    console.error('List questions error:', error)

    throw createError({
      statusCode: 500,
      message: error.message || '获取题目列表失败'
    })
  }
})
