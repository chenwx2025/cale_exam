// API: 用户登录
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'cale-exam-secret-key-change-in-production'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    if (!email || !password) {
      return {
        success: false,
        error: '请输入邮箱和密码'
      }
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || !user.password) {
      return {
        success: false,
        error: '邮箱或密码错误'
      }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return {
        success: false,
        error: '邮箱或密码错误'
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return {
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    }
  } catch (error: any) {
    console.error('登录失败:', error)
    return {
      success: false,
      error: error.message || '登录失败'
    }
  }
})
