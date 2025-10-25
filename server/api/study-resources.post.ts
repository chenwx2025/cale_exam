import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT RESOURCES POST] ========== 请求到达 ==========')

  try {
    const user = await requireAuth(event)
    const contentType = getHeader(event, 'content-type') || ''

    console.log('[FLAT RESOURCES POST] Content-Type:', contentType)

    if (contentType.includes('multipart/form-data')) {
      // 处理文件上传
      return await handleFileUpload(event, user.userId)
    } else {
      // 处理外部链接上传
      return await handleLinkUpload(event, user.userId)
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT RESOURCES POST] 上传资料失败:', error)
    throw createError({
      statusCode: 500,
      message: '上传资料失败'
    })
  }
})

async function handleFileUpload(event: any, userId: string) {
  console.log('[FLAT RESOURCES POST] 开始处理文件上传, userId:', userId)

  try {
    // 使用 Nuxt 3 的 readMultipartFormData
    const formData = await readMultipartFormData(event)

    if (!formData) {
      throw createError({
        statusCode: 400,
        message: '无效的表单数据'
      })
    }

    console.log('[FLAT RESOURCES POST] 表单数据解析成功, 字段数量:', formData.length)

    // 提取字段
    let groupId = ''
    let title = ''
    let description = ''
    let category = 'other'
    let tags: string[] = []
    let visibility = 'members'
    const files: Array<{ data: any; filename: string; mimeType: string }> = []

    for (const part of formData) {
      const name = part.name
      if (name === 'file') {
        // 收集所有文件
        files.push({
          data: part.data,
          filename: part.filename || 'unnamed',
          mimeType: part.type || 'application/octet-stream'
        })
        console.log('[FLAT RESOURCES POST] 收集文件:', part.filename, 'MIME:', part.type, '大小:', part.data.length)
      } else if (name === 'groupId') {
        groupId = part.data.toString()
      } else if (name === 'title') {
        title = part.data.toString()
      } else if (name === 'description') {
        description = part.data.toString()
      } else if (name === 'category') {
        category = part.data.toString()
      } else if (name === 'tags') {
        try {
          tags = JSON.parse(part.data.toString())
        } catch {
          tags = []
        }
      } else if (name === 'visibility') {
        visibility = part.data.toString()
      }
    }

    if (!groupId) {
      throw createError({
        statusCode: 400,
        message: '缺少小组ID'
      })
    }

    if (files.length === 0) {
      throw createError({
        statusCode: 400,
        message: '未找到上传文件'
      })
    }

    console.log('[FLAT RESOURCES POST] 收集到', files.length, '个文件')

    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId,
        isActive: true
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '您不是该小组成员，无法上传资料'
      })
    }

    // 准备保存文件
    const fs = await import('fs')
    const path = await import('path')
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resources')

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // 文件类型映射
    const FILE_TYPE_MAP: Record<string, string> = {
      'application/pdf': 'document',
      'application/msword': 'document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
      'application/vnd.ms-excel': 'document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
      'text/plain': 'document',
      'image/jpeg': 'image',
      'image/png': 'image',
      'image/gif': 'image',
      'image/webp': 'image',
      'video/mp4': 'video',
      'video/webm': 'video',
      'application/zip': 'archive',
      'application/x-rar-compressed': 'archive'
    }

    // 保存所有文件并收集信息
    const savedFiles = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = path.extname(file.filename)
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 8)
      const savedFileName = `${timestamp}-${randomStr}-${i}${ext}`
      const filePath = path.join(uploadDir, savedFileName)

      fs.writeFileSync(filePath, file.data)
      console.log('[FLAT RESOURCES POST] 文件已保存:', filePath)

      const fileUrl = `/uploads/resources/${savedFileName}`
      const fileSize = file.data.length
      const fileType = FILE_TYPE_MAP[file.mimeType] || 'document'

      savedFiles.push({
        fileName: file.filename,
        fileUrl,
        fileSize,
        mimeType: file.mimeType,
        type: fileType,
        displayOrder: i,
        isPrimary: i === 0  // 第一个文件为主文件
      })
    }

    // 确定资源的主类型（使用第一个文件的类型）
    const resourceType = savedFiles[0].type
    const thumbnailUrl = resourceType === 'image' ? savedFiles[0].fileUrl : null

    // 如果没有标题，使用第一个文件名或"多文件资源"
    if (!title) {
      title = files.length === 1 ? files[0].filename : `多文件资源 (${files.length}个文件)`
    }

    // 创建资料记录
    const resource = await prisma.studyResource.create({
      data: {
        groupId,
        uploaderId: userId,
        title,
        description,
        category,
        tags: tags.length > 0 ? JSON.stringify(tags) : null,
        type: resourceType,
        // 保持兼容性：fileUrl, fileName 等字段使用第一个文件的信息
        fileUrl: savedFiles[0].fileUrl,
        fileName: savedFiles[0].fileName,
        fileSize: savedFiles.reduce((sum, f) => sum + f.fileSize, 0),  // 总大小
        mimeType: savedFiles[0].mimeType,
        thumbnailUrl,
        visibility,
        status: 'approved',
        // 创建关联的文件记录
        files: {
          create: savedFiles
        }
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        files: true,
        _count: {
          select: {
            files: true
          }
        }
      }
    })

    console.log('[FLAT RESOURCES POST] 资源创建成功, resourceId:', resource.id, '包含', savedFiles.length, '个文件')
    return {
      success: true,
      data: resource,
      message: `资料上传成功，包含 ${savedFiles.length} 个文件`
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT RESOURCES POST] 文件上传处理失败:', error)
    throw createError({
      statusCode: 500,
      message: '文件上传失败: ' + error.message
    })
  }
}

async function handleLinkUpload(event: any, userId: string) {
  const body = await readBody(event)
  const {
    groupId,
    title,
    description,
    category = 'other',
    tags = [],
    externalUrl,
    thumbnailUrl,
    visibility = 'members'
  } = body

  console.log('[FLAT RESOURCES POST] 链接上传参数:', { groupId, title })

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  if (!title || !externalUrl) {
    throw createError({
      statusCode: 400,
      message: '标题和链接不能为空'
    })
  }

  try {
    new URL(externalUrl)
  } catch {
    throw createError({
      statusCode: 400,
      message: '无效的URL格式'
    })
  }

  // 检查用户是否是小组成员
  const membership = await prisma.studyGroupMember.findFirst({
    where: {
      groupId,
      userId,
      isActive: true
    }
  })

  if (!membership) {
    throw createError({
      statusCode: 403,
      message: '您不是该小组成员，无法上传资料'
    })
  }

  const resource = await prisma.studyResource.create({
    data: {
      groupId,
      uploaderId: userId,
      title,
      description,
      category,
      tags: tags.length > 0 ? JSON.stringify(tags) : null,
      type: 'link',
      externalUrl,
      thumbnailUrl,
      visibility,
      status: 'approved'
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  })

  console.log('[FLAT RESOURCES POST] 链接添加成功')
  return {
    success: true,
    data: resource,
    message: '链接添加成功'
  }
}
