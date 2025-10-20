import { initScheduler } from '../utils/scheduler'

export default defineNitroPlugin((nitroApp) => {
  // 初始化定时任务
  initScheduler()

  console.log('[Plugin] Scheduler plugin loaded')
})
