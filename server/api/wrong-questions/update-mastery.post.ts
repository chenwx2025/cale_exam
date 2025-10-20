// API：更新错题掌握状态
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, questionId, mastered, masteryLevel, isCorrect } = body

    if (!userId || !questionId) {
      return {
        success: false,
        error: '缺少必要参数'
      }
    }

    // 查找错题记录
    const wrongQuestion = await prisma.wrongQuestion.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId
        }
      }
    })

    if (!wrongQuestion) {
      return {
        success: false,
        error: '错题记录不存在'
      }
    }

    // 更新数据
    const updateData: any = {}

    if (isCorrect !== undefined) {
      if (isCorrect) {
        // 答对了
        updateData.correctCount = wrongQuestion.correctCount + 1
        updateData.lastCorrect = new Date()

        // 提高掌握度
        const newMasteryLevel = Math.min(100, wrongQuestion.masteryLevel + 25)
        updateData.masteryLevel = newMasteryLevel

        // 如果掌握度达到80%以上，标记为已掌握
        if (newMasteryLevel >= 80) {
          updateData.mastered = true
        }
      } else {
        // 又答错了
        updateData.wrongCount = wrongQuestion.wrongCount + 1
        updateData.lastWrong = new Date()
        updateData.mastered = false
        updateData.masteryLevel = Math.max(0, wrongQuestion.masteryLevel - 20)
      }
    }

    if (mastered !== undefined) {
      updateData.mastered = mastered
    }

    if (masteryLevel !== undefined) {
      updateData.masteryLevel = masteryLevel
    }

    const updated = await prisma.wrongQuestion.update({
      where: {
        userId_questionId: {
          userId,
          questionId
        }
      },
      data: updateData
    })

    return {
      success: true,
      data: updated
    }
  } catch (error: any) {
    console.error('更新错题状态失败:', error)
    return {
      success: false,
      error: error.message || '更新错题状态失败'
    }
  }
})
