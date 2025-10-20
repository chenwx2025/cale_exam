import cron from 'node-cron'
import { sendBatchStudyReminders, sendExamReminders } from './notification-service'

/**
 * 初始化定时任务
 */
export function initScheduler() {
  console.log('[Scheduler] Initializing notification scheduler...')

  // 每分钟检查一次学习提醒（用于精确匹配设定的提醒时间）
  cron.schedule('* * * * *', async () => {
    try {
      await sendBatchStudyReminders()
    } catch (error) {
      console.error('[Scheduler] Study reminder task failed:', error)
    }
  })

  // 每天早上9点检查考试提醒
  cron.schedule('0 9 * * *', async () => {
    try {
      await sendExamReminders()
    } catch (error) {
      console.error('[Scheduler] Exam reminder task failed:', error)
    }
  })

  console.log('[Scheduler] ✅ Notification scheduler started successfully')
  console.log('[Scheduler] - Study reminders: Every minute')
  console.log('[Scheduler] - Exam reminders: Daily at 9:00 AM')
}
