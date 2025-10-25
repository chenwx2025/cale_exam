// 简化测试版本 - 用于诊断问题
export default defineEventHandler(async (event) => {
  console.log('[TEST CHECK-IN] POST 请求到达！')
  console.log('[TEST CHECK-IN] Method:', event.method)
  console.log('[TEST CHECK-IN] Path:', event.path)

  return {
    success: true,
    message: '测试 POST API 工作正常',
    timestamp: new Date().toISOString()
  }
})
