// 锁定/解锁帖子 API
// 只有管理员（owner/admin/moderator）可以锁定帖子
// 锁定后的帖子不能添加新回复

import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const user = await requireAuth(event)

    // 获取参数
    const body = await readBody(event)
    const { groupId, postId } = body

    if (!groupId || !postId) {
      throw createError({
        statusCode: 400,
        message: '缺少必要参数'
      })
    }

    // 验证小组是否存在
    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId }
    })

    if (!group) {
      throw createError({
        statusCode: 404,
        message: '学习小组不存在'
      })
    }

    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '你不是该小组的成员'
      })
    }

    // 检查权限：只有 owner/admin/moderator 可以锁定帖子
    const canManage = ['owner', 'admin', 'moderator'].includes(membership.role)

    if (!canManage) {
      throw createError({
        statusCode: 403,
        message: '只有管理员才能锁定帖子'
      })
    }

    // 获取帖子
    const post = await prisma.studyGroupPost.findUnique({
      where: { id: postId }
    })

    if (!post) {
      throw createError({
        statusCode: 404,
        message: '帖子不存在'
      })
    }

    // 验证帖子属于该小组
    if (post.groupId !== groupId) {
      throw createError({
        statusCode: 403,
        message: '该帖子不属于此小组'
      })
    }

    // 切换锁定状态
    const newLockStatus = !post.isLocked

    const updatedPost = await prisma.studyGroupPost.update({
      where: { id: postId },
      data: {
        isLocked: newLockStatus,
        lockedAt: newLockStatus ? new Date() : null,
        lockedBy: newLockStatus ? user.userId : null
      }
    })

    return {
      success: true,
      action: newLockStatus ? 'lock' : 'unlock',
      isLocked: updatedPost.isLocked,
      lockedAt: updatedPost.lockedAt,
      message: newLockStatus ? '帖子已锁定' : '已解锁帖子'
    }

  } catch (error: any) {
    console.error('锁定/解锁帖子失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '锁定/解锁帖子失败'
    })
  }
})
