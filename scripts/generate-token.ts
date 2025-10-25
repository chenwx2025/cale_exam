/**
 * 生成新的 JWT Token
 * 使用方法: npx tsx scripts/generate-token.ts <email>
 */

import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// JWT 密钥（与 server/utils/jwt.ts 中一致）
const JWT_SECRET = process.env.JWT_SECRET || 'cale-exam-secret-key-change-in-production'
const JWT_EXPIRES_IN = '30d' // 30天有效期

async function generateToken(email: string) {
  try {
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscribedExams: {
          select: {
            examType: true
          }
        }
      }
    })

    if (!user) {
      console.error(`❌ 用户不存在: ${email}`)
      process.exit(1)
    }

    // 获取订阅的考试类型
    const subscribedExams = user.subscribedExams.map((sub: any) => sub.examType)

    // 生成 JWT token（与服务器端格式一致）
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role || 'user',
        subscribedExams
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    console.log('\n✅ Token 生成成功！\n')
    console.log('用户信息:')
    console.log(`  - ID: ${user.id}`)
    console.log(`  - Email: ${user.email}`)
    console.log(`  - Name: ${user.name || '(未设置)'}`)
    console.log(`  - 有效期: ${JWT_EXPIRES_IN}\n`)
    console.log('Access Token:')
    console.log(token)
    console.log('\n使用方法:')
    console.log('1. 打开浏览器开发者工具 (F12)')
    console.log('2. 切换到 Console 标签页')
    console.log('3. 粘贴以下代码并回车:\n')
    console.log(`localStorage.setItem('accessToken', '${token}')`)
    console.log('window.location.reload()\n')
    console.log('4. 页面刷新后即可使用新 token\n')

  } catch (error) {
    console.error('❌ 生成 token 失败:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 获取命令行参数
const email = process.argv[2]

if (!email) {
  console.error('❌ 请提供用户邮箱')
  console.log('使用方法: npx tsx scripts/generate-token.ts <email>')
  console.log('例如: npx tsx scripts/generate-token.ts 2@1.com')
  process.exit(1)
}

generateToken(email)
