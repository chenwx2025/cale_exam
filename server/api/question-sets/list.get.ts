import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userId as string || 'demo-user'
    const examType = query.examType as string || 'cale'

    // 获取所有AI生成的题目集和手动配置的考试（未开始的）
    const questionSets = await prisma.exam.findMany({
      where: {
        userId,
        examType,
        OR: [
          { mode: 'ai_generated' }, // AI生成的题库
          {
            mode: 'exam',
            status: 'not_started' // 未开始的手动配置考试
          }
        ]
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                difficulty: true,
                categoryId: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 统计每个题目集的信息
    const setsWithStats = questionSets.map(set => {
      const difficulties = {
        easy: 0,
        medium: 0,
        hard: 0
      }

      set.answers.forEach(answer => {
        const difficulty = answer.question.difficulty
        if (difficulty === 'easy') difficulties.easy++
        else if (difficulty === 'medium') difficulties.medium++
        else if (difficulty === 'hard') difficulties.hard++
      })

      return {
        id: set.id,
        title: set.title,
        questionCount: set.questionCount,
        duration: set.duration,
        mode: set.mode,
        generatedBy: set.generatedBy,
        categoryId: set.categoryId,
        status: set.status,
        createdAt: set.createdAt,
        difficulties
      }
    })

    return {
      success: true,
      questionSets: setsWithStats
    }
  } catch (error: any) {
    console.error('List question sets error:', error)

    throw createError({
      statusCode: 500,
      message: error.message || '获取题目集列表失败'
    })
  }
})
