export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { password } = body

  // 从环境变量获取管理员密码，默认为 'admin123'
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

  if (password === ADMIN_PASSWORD) {
    return {
      success: true,
      message: '验证成功'
    }
  }

  throw createError({
    statusCode: 401,
    message: '密码错误'
  })
})
