// API: 用户注册
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, email, password } = body

    if (!name || !email || !password) {
      return {
        success: false,
        error: '请填写所有必填字段'
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return {
        success: false,
        error: '该邮箱已被注册'
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })

    return {
      success: true,
      message: '注册成功',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }
  } catch (error: any) {
    console.error('注册失败:', error)
    return {
      success: false,
      error: error.message || '注册失败'
    }
  }
})
