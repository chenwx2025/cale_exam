import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-helpers'

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

    // 先检查这些考试是否存在
    const allRequestedExams = await prisma.exam.findMany({
      where: {
        id: { in: examIds }
      },
      select: { id: true, userId: true, title: true }
    })

    console.log('删除请求详情:', {
      currentUserId: currentUser.userId,
      requestedExamIds: examIds,
      foundExams: allRequestedExams.map(e => ({ id: e.id, userId: e.userId, title: e.title }))
    })

    // 验证所有考试都属于当前用户（安全检查）
    const examsToDelete = allRequestedExams.filter(e => e.userId === currentUser.userId)

    if (examsToDelete.length !== examIds.length) {
      const unauthorizedExams = allRequestedExams.filter(e => e.userId !== currentUser.userId)
      const notFoundIds = examIds.filter(id => !allRequestedExams.find(e => e.id === id))

      console.error('删除权限验证失败:', {
        currentUserId: currentUser.userId,
        unauthorizedExams: unauthorizedExams.map(e => ({ id: e.id, userId: e.userId, title: e.title })),
        notFoundIds: notFoundIds
      })

      if (unauthorizedExams.length > 0) {
        throw createError({
          statusCode: 403,
          message: `您无权删除这些考试。请确认您已登录正确的账号。`
        })
      } else {
        throw createError({
          statusCode: 404,
          message: `找不到要删除的考试，可能已被删除。`
        })
      }
    }

    const validExamIds = examsToDelete.map(e => e.id)

    console.log('[DELETE] 开始删除流程:', {
      validExamIds,
      examTitles: examsToDelete.map(e => e.title)
    })

    // 删除相关的 ExamAnswer 记录
    const answersDeleted = await prisma.examAnswer.deleteMany({
      where: {
        examId: {
          in: validExamIds
        }
      }
    })

    console.log('[DELETE] 删除了ExamAnswer记录:', answersDeleted.count, '条')

    // 删除考试记录
    const result = await prisma.exam.deleteMany({
      where: {
        id: {
          in: validExamIds
        },
        userId: currentUser.userId  // 双重保护
      }
    })

    console.log('[DELETE] 删除了Exam记录:', result.count, '条')

    // 验证删除结果
    const remainingExams = await prisma.exam.findMany({
      where: {
        id: {
          in: validExamIds
        }
      },
      select: { id: true, title: true }
    })

    if (remainingExams.length > 0) {
      console.error('[DELETE] 警告：以下考试未被删除:', remainingExams)
    } else {
      console.log('[DELETE] ✅ 所有考试已成功删除')
    }

    return {
      success: true,
      message: `成功删除 ${result.count} 个题目集`,
      deletedCount: result.count
    }
  } catch (error: any) {
    console.error('Delete question sets error:', error)

    // 如果是 HTTP 错误（401, 403, 404 等），重新抛出以便前端正确处理
    if (error.statusCode) {
      throw error
    }

    // 其他错误返回通用错误消息
    throw createError({
      statusCode: 500,
      message: error.message || '删除失败，请稍后重试'
    })
  }
})
