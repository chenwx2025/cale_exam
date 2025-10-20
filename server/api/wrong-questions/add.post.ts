// API：添加错题到错题本
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, questionId } = body

    if (!userId || !questionId) {
      return {
        success: false,
        error: '缺少必要参数'
      }
    }

    // 检查是否已存在
    const existing = await prisma.wrongQuestion.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId
        }
      }
    })

    if (existing) {
      // 如果已存在，增加错误次数
      const updated = await prisma.wrongQuestion.update({
        where: {
          userId_questionId: {
            userId,
            questionId
          }
        },
        data: {
          wrongCount: existing.wrongCount + 1,
          lastWrong: new Date(),
          mastered: false, // 重新答错，重置掌握状态
          masteryLevel: Math.max(0, existing.masteryLevel - 20) // 降低掌握度
        }
      })

      return {
        success: true,
        data: updated,
        message: '错题次数已更新'
      }
    } else {
      // 新增错题
      const wrongQuestion = await prisma.wrongQuestion.create({
        data: {
          userId,
          questionId,
          wrongCount: 1,
          lastWrong: new Date()
        },
        include: {
          question: {
            include: {
              category: true
            }
          }
        }
      })

      return {
        success: true,
        data: wrongQuestion,
        message: '已添加到错题本'
      }
    }
  } catch (error: any) {
    console.error('添加错题失败:', error)
    return {
      success: false,
      error: error.message || '添加错题失败'
    }
  }
})
