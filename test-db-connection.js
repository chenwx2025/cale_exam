// 数据库连接测试脚本
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// 显式加载 .env 文件
dotenv.config()

console.log('📌 DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')
console.log('')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function testConnection() {
  console.log('🔍 正在测试数据库连接...\n')

  try {
    // 测试 1: 基本连接
    console.log('测试 1: 基本连接测试')
    await prisma.$connect()
    console.log('✅ 数据库连接成功!\n')

    // 测试 2: 简单查询
    console.log('测试 2: 执行简单查询')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ 查询成功:', result)
    console.log('')

    // 测试 3: 检查表
    console.log('测试 3: 检查数据库表')
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
      LIMIT 10
    `
    console.log(`✅ 找到 ${tables.length} 个表:`)
    tables.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.table_name}`)
    })
    console.log('')

    // 测试 4: 检查用户表
    console.log('测试 4: 检查用户数量')
    const userCount = await prisma.user.count()
    console.log(`✅ 用户表中有 ${userCount} 个用户\n`)

    // 测试 5: 检查题目数量
    console.log('测试 5: 检查题目数量')
    const questionCount = await prisma.question.count()
    console.log(`✅ 题目表中有 ${questionCount} 道题目\n`)

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 所有测试通过!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n数据库信息:')
    console.log(`  数据库: cale_exam`)
    console.log(`  主机: database-2.cctouc4g4uv3.us-east-1.rds.amazonaws.com`)
    console.log(`  用户数: ${userCount}`)
    console.log(`  题目数: ${questionCount}`)
    console.log(`  表数量: ${tables.length}+`)

  } catch (error) {
    console.error('❌ 数据库连接失败!\n')
    console.error('错误信息:', error.message)
    console.error('\n可能的原因:')
    console.error('  1. AWS RDS 安全组未允许当前 IP 访问')
    console.error('  2. 数据库凭证不正确')
    console.error('  3. RDS 实例未运行')
    console.error('  4. 网络连接问题')
    console.error('\n详细错误:')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
