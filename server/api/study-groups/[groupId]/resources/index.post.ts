import { PrismaClient } from '@prisma/client'
import { verifyAccessToken } from '~/server/utils/jwt'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// 文件类型映射
const FILE_TYPE_MAP: Record<string, string> = {
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.ms-excel': 'document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
  'application/vnd.ms-powerpoint': 'document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'document',
  'text/plain': 'document',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/quicktime': 'video',
  'application/zip': 'archive',
  'application/x-rar-compressed': 'archive',
  'application/x-7z-compressed': 'archive'
}

// 允许的文件类型
const ALLOWED_MIME_TYPES = Object.keys(FILE_TYPE_MAP)

// 文件大小限制 (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: '未授权访问'
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)
    if (!decoded || !decoded.userId) {
      throw createError({
        statusCode: 401,
        message: '无效的访问令牌'
      })
    }

    const userId = decoded.userId
    const groupId = event.context.params?.groupId

    if (!groupId) {
      throw createError({
        statusCode: 400,
        message: '缺少小组ID'
      })
    }

    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId,
        status: 'active'
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '您不是该小组成员，无法上传资料'
      })
    }

    // 解析表单数据 (multipart/form-data)
    const contentType = getHeader(event, 'content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      // 处理文件上传
      return await handleFileUpload(event, userId, groupId)
    } else {
      // 处理外部链接上传
      return await handleLinkUpload(event, userId, groupId)
    }
  } catch (error: any) {
    console.error('上传资料失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: '上传资料失败'
    })
  }
})

/**
 * 处理文件上传
 */
async function handleFileUpload(event: any, userId: string, groupId: string) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resources')

  // 确保上传目录存在
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: MAX_FILE_SIZE,
    filename: (name, ext, part) => {
      // 生成唯一文件名
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 8)
      return `${timestamp}-${randomStr}${ext}`
    }
  })

  const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) reject(err)
      else resolve([fields, files])
    })
  })

  // 获取上传的文件
  const file = Array.isArray(files.file) ? files.file[0] : files.file

  if (!file) {
    throw createError({
      statusCode: 400,
      message: '未找到上传文件'
    })
  }

  // 验证文件类型
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype || '')) {
    // 删除已上传的文件
    fs.unlinkSync(file.filepath)
    throw createError({
      statusCode: 400,
      message: '不支持的文件类型'
    })
  }

  // 获取文件信息
  const fileName = file.originalFilename || 'unnamed'
  const fileSize = file.size
  const mimeType = file.mimetype || ''
  const fileType = FILE_TYPE_MAP[mimeType]
  const fileUrl = `/uploads/resources/${path.basename(file.filepath)}`

  // 生成缩略图 (如果是图片)
  let thumbnailUrl = null
  if (fileType === 'image') {
    thumbnailUrl = fileUrl // 简化处理，实际应生成缩略图
  }

  // 获取表单字段
  const getField = (name: string) => {
    const field = fields[name]
    return Array.isArray(field) ? field[0] : field
  }

  const title = getField('title') || fileName
  const description = getField('description')
  const category = getField('category') || 'other'
  const tagsStr = getField('tags')
  const tags = tagsStr ? JSON.parse(tagsStr) : []
  const visibility = getField('visibility') || 'members'

  // 创建资料记录
  const resource = await prisma.studyResource.create({
    data: {
      groupId,
      uploaderId: userId,
      title,
      description,
      category,
      tags: tags.length > 0 ? JSON.stringify(tags) : null,
      type: fileType,
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      thumbnailUrl,
      visibility,
      status: 'approved' // 自动审核通过，可根据需求修改
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

  return {
    success: true,
    data: resource,
    message: '资料上传成功'
  }
}

/**
 * 处理外部链接上传
 */
async function handleLinkUpload(event: any, userId: string, groupId: string) {
  const body = await readBody(event)
  const {
    title,
    description,
    category = 'other',
    tags = [],
    externalUrl,
    thumbnailUrl,
    visibility = 'members'
  } = body

  // 验证必填字段
  if (!title || !externalUrl) {
    throw createError({
      statusCode: 400,
      message: '标题和链接不能为空'
    })
  }

  // 验证URL格式
  try {
    new URL(externalUrl)
  } catch {
    throw createError({
      statusCode: 400,
      message: '无效的URL格式'
    })
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

  return {
    success: true,
    data: resource,
    message: '链接添加成功'
  }
}
