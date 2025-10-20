import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 创建通知
 */
export async function createNotification(data: {
  userId: string
  type: string
  title: string
  message: string
  link?: string
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link || null
      }
    })

    console.log(`[Notification] Created for user ${data.userId}: ${data.title}`)
    return notification
  } catch (error) {
    console.error('[Notification] Failed to create:', error)
    throw error
  }
}

/**
 * 检查用户今日学习情况
 */
export async function checkUserStudyProgress(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 获取今日学习会话
  const todaySessions = await prisma.studySession.findMany({
    where: {
      userId,
      startTime: {
        gte: today
      }
    }
  })

  // 计算总学习时长（分钟）
  const totalMinutes = todaySessions.reduce((sum, session) => {
    return sum + (session.duration || 0)
  }, 0) / 60

  // 计算总答题数
  const totalQuestions = todaySessions.reduce((sum, session) => {
    return sum + session.questionsCount
  }, 0)

  return {
    studiedMinutes: Math.floor(totalMinutes),
    answeredQuestions: totalQuestions,
    hasStudied: todaySessions.length > 0
  }
}

/**
 * 发送学习提醒
 */
export async function sendStudyReminder(userId: string, settings: any) {
  try {
    // 检查是否已学习
    const progress = await checkUserStudyProgress(userId)

    // 如果已达到目标，发送祝贺通知
    if (progress.studiedMinutes >= settings.dailyGoalMinutes &&
        progress.answeredQuestions >= settings.dailyGoalQuestions) {
      await createNotification({
        userId,
        type: 'achievement',
        title: '🎉 今日目标达成！',
        message: `太棒了！您今天已经学习了 ${progress.studiedMinutes} 分钟，完成了 ${progress.answeredQuestions} 道题目。继续保持！`,
        link: '/stats'
      })
      return
    }

    // 如果还没学习，发送提醒
    if (!progress.hasStudied) {
      await createNotification({
        userId,
        type: 'study_reminder',
        title: '📚 学习提醒',
        message: `该学习啦！今天的目标是学习 ${settings.dailyGoalMinutes} 分钟，完成 ${settings.dailyGoalQuestions} 道题目。`,
        link: '/practice'
      })
    } else {
      // 已经学习但未达目标
      const remainingMinutes = settings.dailyGoalMinutes - progress.studiedMinutes
      const remainingQuestions = settings.dailyGoalQuestions - progress.answeredQuestions

      await createNotification({
        userId,
        type: 'study_reminder',
        title: '💪 继续加油！',
        message: `您今天已经学习了 ${progress.studiedMinutes} 分钟，完成了 ${progress.answeredQuestions} 道题。距离目标还差 ${remainingMinutes} 分钟和 ${remainingQuestions} 道题。`,
        link: '/practice'
      })
    }
  } catch (error) {
    console.error('[StudyReminder] Failed to send:', error)
  }
}

/**
 * 批量发送学习提醒
 */
export async function sendBatchStudyReminders() {
  try {
    const now = new Date()
    const currentHour = now.getHours().toString().padStart(2, '0')
    const currentMinute = now.getMinutes().toString().padStart(2, '0')
    const currentTime = `${currentHour}:${currentMinute}`
    const currentDay = now.getDay() // 0-6

    console.log(`[StudyReminder] Checking for reminders at ${currentTime} (Day ${currentDay})`)

    // 查找需要提醒的用户
    const settings = await prisma.notificationSettings.findMany({
      where: {
        studyReminder: true,
        siteEnabled: true,
        reminderTime: currentTime
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            status: true
          }
        }
      }
    })

    let sentCount = 0

    for (const setting of settings) {
      // 检查用户状态
      if (setting.user.status !== 'active') {
        continue
      }

      // 检查提醒日期
      const reminderDays = JSON.parse(setting.reminderDays)

      if (setting.reminderFrequency === 'custom' && !reminderDays.includes(currentDay)) {
        continue
      }

      if (setting.reminderFrequency === 'weekly' && currentDay !== 1) {
        // 每周提醒（周一）
        continue
      }

      // 发送提醒
      await sendStudyReminder(setting.userId, setting)
      sentCount++
    }

    console.log(`[StudyReminder] Sent ${sentCount} reminders`)
    return sentCount
  } catch (error) {
    console.error('[StudyReminder] Batch send failed:', error)
    throw error
  }
}

/**
 * 发送考试提醒
 */
export async function sendExamReminders() {
  // TODO: 实现考试提醒逻辑
  // 可以基于用户设定的考试日期提前提醒
  console.log('[ExamReminder] Checking for upcoming exams...')
}

/**
 * 检查并发送成就通知
 */
export async function checkAndSendAchievements(userId: string) {
  try {
    // 获取用户统计
    const [totalAnswers, correctAnswers, studySessions] = await Promise.all([
      prisma.userAnswer.count({ where: { userId } }),
      prisma.userAnswer.count({ where: { userId, isCorrect: true } }),
      prisma.studySession.count({ where: { userId } })
    ])

    // 里程碑成就
    const milestones = [
      { count: 100, title: '🎯 百题达成', message: '恭喜！您已经完成了100道题目' },
      { count: 500, title: '🏆 五百题大师', message: '太棒了！您已经完成了500道题目' },
      { count: 1000, title: '🌟 千题王者', message: '难以置信！您已经完成了1000道题目' },
      { count: 50, title: '📚 学习者', message: '您已经学习了50次，持之以恒！', type: 'sessions' }
    ]

    for (const milestone of milestones) {
      const count = milestone.type === 'sessions' ? studySessions : totalAnswers

      if (count === milestone.count) {
        await createNotification({
          userId,
          type: 'achievement',
          title: milestone.title,
          message: milestone.message,
          link: '/stats'
        })
      }
    }

    // 正确率成就
    if (totalAnswers >= 50) {
      const accuracy = (correctAnswers / totalAnswers) * 100

      if (accuracy >= 90 && totalAnswers % 100 === 0) {
        await createNotification({
          userId,
          type: 'achievement',
          title: '🎓 学霸认证',
          message: `您的正确率达到了 ${accuracy.toFixed(1)}%！真是太厉害了！`,
          link: '/stats'
        })
      }
    }
  } catch (error) {
    console.error('[Achievement] Failed to check:', error)
  }
}
