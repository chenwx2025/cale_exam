import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 从认证中间件获取当前用户
    const currentUser = requireAuth(event)

    const body = await readBody(event)
    const { examIds } = body

    if (!examIds || !Array.isArray(examIds) || examIds.length === 0) {
      return {
        success: false,
        message: '请选择要删除的题目集'
      }
    }

    // 验证所有考试都属于当前用户（安全检查）
    const examsToDelete = await prisma.exam.findMany({
      where: {
        id: { in: examIds },
        userId: currentUser.userId  // 确保只能删除自己的考试
      },
      select: { id: true }
    })

    if (examsToDelete.length !== examIds.length) {
      throw createError({
        statusCode: 403,
        message: '您无权删除这些题目集'
      })
    }

    const validExamIds = examsToDelete.map(e => e.id)

    // 删除相关的 ExamAnswer 记录
    await prisma.examAnswer.deleteMany({
      where: {
        examId: {
          in: validExamIds
        }
      }
    })

    // 删除考试记录
    const result = await prisma.exam.deleteMany({
      where: {
        id: {
          in: validExamIds
        },
        userId: currentUser.userId  // 双重保护
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
