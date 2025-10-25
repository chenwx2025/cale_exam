// 更新用户签名档 API

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const user = await requireAuth(event)

    // 获取签名内容
    const body = await readBody(event)
    const { signature } = body

    // 验证签名长度（限制在200字符以内）
    if (signature && signature.length > 200) {
      throw createError({
        statusCode: 400,
        message: '签名不能超过200个字符'
      })
    }

    // 更新用户签名
    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        signature: signature?.trim() || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        nickname: true,
        signature: true
      }
    })

    return {
      success: true,
      data: updatedUser,
      message: '签名更新成功'
    }

  } catch (error: any) {
    console.error('更新签名失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '更新签名失败'
    })
  }
})
