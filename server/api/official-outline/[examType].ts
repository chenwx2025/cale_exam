import { caleOfficialOutline } from '~/prisma/exam-data'

export default defineEventHandler((event) => {
  const examType = getRouterParam(event, 'examType')

  if (examType === 'cale') {
    return caleOfficialOutline
  }

  // 其他考试类型暂时返回null
  return null
})
