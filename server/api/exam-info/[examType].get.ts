import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const examType = getRouterParam(event, 'examType')

  if (!examType || (examType !== 'cale' && examType !== 'nccaom')) {
    throw createError({
      statusCode: 400,
      message: '无效的考试类型'
    })
  }

  const examInfo = await prisma.examInfo.findUnique({
    where: { examType }
  })

  if (!examInfo) {
    throw createError({
      statusCode: 404,
      message: '未找到考试信息'
    })
  }

  // Convert to plain object to avoid Pinia serialization issues
  return JSON.parse(JSON.stringify(examInfo))
})
