import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

// Domain mapping
const DOMAIN_NAMES: Record<string, string> = {
  'Domain1': '中医基础理论',
  'Domain2': '中药学',
  'Domain3a': '方剂学',
  'Domain3b': '针灸学',
  'Domain4': '中医诊断学',
  'Domain5': '中医内科学',
  'Domain6': '中医外科学',
  'Domain7': '中医妇科学',
  'Domain8': '中医儿科学'
}

export default defineEventHandler(async (event) => {
  try {
    const userId = await requireAuth(event)

    // Get all user answers grouped by domain
    const allQuestions = await prisma.question.findMany({
      select: {
        id: true,
        domain: true
      }
    })

    // Group questions by domain
    const domainQuestionCounts: Record<string, number> = {}
    allQuestions.forEach(q => {
      if (q.domain) {
        domainQuestionCounts[q.domain] = (domainQuestionCounts[q.domain] || 0) + 1
      }
    })

    // Get user's answered questions by domain
    const userAnswers = await prisma.userAnswer.findMany({
      where: { userId },
      include: {
        question: {
          select: {
            domain: true
          }
        }
      }
    })

    // Calculate progress for each domain
    const domainAnswerCounts: Record<string, number> = {}
    userAnswers.forEach(answer => {
      const domain = answer.question?.domain
      if (domain) {
        domainAnswerCounts[domain] = (domainAnswerCounts[domain] || 0) + 1
      }
    })

    // Build domain progress array
    const domains = Object.keys(DOMAIN_NAMES).map(domainKey => {
      const totalQuestions = domainQuestionCounts[domainKey] || 0
      const answeredQuestions = domainAnswerCounts[domainKey] || 0
      const progress = totalQuestions > 0
        ? Math.round((answeredQuestions / totalQuestions) * 100)
        : 0

      return {
        key: domainKey,
        name: DOMAIN_NAMES[domainKey],
        progress,
        totalQuestions,
        answeredQuestions
      }
    }).filter(d => d.totalQuestions > 0) // Only show domains with questions

    // Sort by progress (descending)
    domains.sort((a, b) => b.progress - a.progress)

    return {
      success: true,
      domains
    }
  } catch (error: any) {
    console.error('Error fetching domain progress:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch domain progress',
      domains: []
    }
  }
})
