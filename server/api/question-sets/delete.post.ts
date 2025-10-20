import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { examIds } = body

    if (!examIds || !Array.isArray(examIds) || examIds.length === 0) {
      return {
        success: false,
        message: '请选择要删除的题目集'
      }
    }

    // 删除相关的 ExamAnswer 记录
    await prisma.examAnswer.deleteMany({
      where: {
        examId: {
          in: examIds
        }
      }
    })

    // 删除考试记录
    const result = await prisma.exam.deleteMany({
      where: {
        id: {
          in: examIds
        }
      }
    })

    return {
      success: true,
      message: `成功删除 ${result.count} 个题目集`,
      deletedCount: result.count
    }
  } catch (error: any) {
    console.error('Delete question sets error:', error)
    return {
      success: false,
      message: error.message || '删除失败，请稍后重试'
    }
  }
})
