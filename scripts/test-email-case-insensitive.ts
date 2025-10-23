/**
 * 测试邮箱大小写不敏感功能
 *
 * 测试场景：
 * 1. 使用小写邮箱注册
 * 2. 尝试用大写/混合大小写邮箱登录
 * 3. 验证可以成功登录
 */

console.log('=== 邮箱大小写不敏感测试 ===\n')

const testCases = [
  {
    description: '测试 1: 管理员邮箱（小写）',
    email: 'chenwx2012@yahoo.com',
    password: 'admin123',
    shouldWork: true
  },
  {
    description: '测试 2: 管理员邮箱（全大写）',
    email: 'CHENWX2012@YAHOO.COM',
    password: 'admin123',
    shouldWork: true
  },
  {
    description: '测试 3: 管理员邮箱（混合大小写）',
    email: 'ChenWX2012@Yahoo.Com',
    password: 'admin123',
    shouldWork: true
  },
  {
    description: '测试 4: 带前后空格的邮箱',
    email: '  chenwx2012@yahoo.com  ',
    password: 'admin123',
    shouldWork: true
  },
  {
    description: '测试 5: admin@cale.com（小写）',
    email: 'admin@cale.com',
    password: 'admin123',
    shouldWork: true
  },
  {
    description: '测试 6: admin@cale.com（大写）',
    email: 'ADMIN@CALE.COM',
    password: 'admin123',
    shouldWork: true
  },
  {
    description: '测试 7: admin@cale.com（混合大小写）',
    email: 'Admin@Cale.Com',
    password: 'admin123',
    shouldWork: true
  }
]

async function testLogin(email: string, password: string = 'demo123') {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()
    return {
      success: response.ok && data.success,
      status: response.status,
      message: data.message || data.error,
      data
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function runTests() {
  console.log('开始测试...\n')
  console.log('注意：确保开发服务器正在运行 (npm run dev)\n')

  let passCount = 0
  let failCount = 0

  for (const testCase of testCases) {
    console.log(`\n${testCase.description}`)
    console.log(`邮箱: "${testCase.email}"`)

    const result = await testLogin(testCase.email, testCase.password)

    if (result.success === testCase.shouldWork) {
      console.log(`✅ 通过 - ${result.message}`)
      passCount++
    } else {
      console.log(`❌ 失败 - 预期: ${testCase.shouldWork ? '成功' : '失败'}, 实际: ${result.success ? '成功' : '失败'}`)
      console.log(`   错误信息: ${result.message || result.error}`)
      failCount++
    }
  }

  console.log('\n\n=== 测试结果汇总 ===')
  console.log(`总测试数: ${testCases.length}`)
  console.log(`通过: ${passCount}`)
  console.log(`失败: ${failCount}`)
  console.log(`成功率: ${((passCount / testCases.length) * 100).toFixed(1)}%`)

  if (failCount === 0) {
    console.log('\n🎉 所有测试通过！邮箱大小写不敏感功能正常工作。')
  } else {
    console.log('\n⚠️  部分测试失败，请检查代码。')
  }
}

// 运行测试
runTests().catch(error => {
  console.error('\n❌ 测试执行出错:', error)
  process.exit(1)
})
