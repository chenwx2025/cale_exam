import { initScheduler } from '../utils/scheduler'

export default defineNitroPlugin((nitroApp) => {
  // 只在运行时初始化定时任务，不在构建/预渲染时初始化
  // 检查是否在预渲染阶段
  const isPrerendering = import.meta.prerender || process.env.NITRO_PRESET === 'cloudflare-pages'

  if (!isPrerendering && process.env.DATABASE_URL) {
    // 初始化定时任务
    initScheduler()
    console.log('[Plugin] Scheduler plugin loaded and started')
  } else {
    console.log('[Plugin] Scheduler plugin skipped (prerendering or no DATABASE_URL)')
  }
})
