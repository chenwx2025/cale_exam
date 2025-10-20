/**
 * AI Learning Assistant Service
 *
 * 智能学习助手 - 基于规则和统计分析的智能推荐系统
 * 不依赖外部 AI API，使用本地算法提供智能建议
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 分析用户学习情况
 */
export async function analyzeUserLearning(userId: string, examType: string = 'cale') {
  // 获取用户所有答题记录
  const userAnswers = await prisma.userAnswer.findMany({
    where: { userId },
    include: {
      question: {
        include: {
          category: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // 获取错题记录
  const wrongQuestions = await prisma.wrongQuestion.findMany({
    where: {
      userId,
      mastered: false
    },
    include: {
      question: {
        include: {
          category: true
        }
      }
    }
  })

  // 获取学习会话
  const studySessions = await prisma.studySession.findMany({
    where: {
      userId,
      examType
    },
    orderBy: {
      startTime: 'desc'
    },
    take: 30
  })

  // 计算基础统计
  const totalQuestions = userAnswers.length
  const correctAnswers = userAnswers.filter(a => a.isCorrect).length
  const overallAccuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

  // 按分类统计
  const categoryStats = new Map<string, {
    categoryId: string
    categoryName: string
    total: number
    correct: number
    wrong: number
    accuracy: number
  }>()

  userAnswers.forEach(answer => {
    const catId = answer.question.categoryId
    const catName = answer.question.category.name

    if (!categoryStats.has(catId)) {
      categoryStats.set(catId, {
        categoryId: catId,
        categoryName: catName,
        total: 0,
        correct: 0,
        wrong: 0,
        accuracy: 0
      })
    }

    const stat = categoryStats.get(catId)!
    stat.total++
    if (answer.isCorrect) {
      stat.correct++
    } else {
      stat.wrong++
    }
    stat.accuracy = (stat.correct / stat.total) * 100
  })

  // 识别薄弱知识点（正确率 < 60%）
  const weakCategories = Array.from(categoryStats.values())
    .filter(cat => cat.total >= 5 && cat.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy)

  // 识别优势知识点（正确率 >= 80%）
  const strongCategories = Array.from(categoryStats.values())
    .filter(cat => cat.total >= 5 && cat.accuracy >= 80)
    .sort((a, b) => b.accuracy - a.accuracy)

  // 学习趋势分析
  const recentAnswers = userAnswers.slice(0, 50)
  const recentAccuracy = recentAnswers.length > 0
    ? (recentAnswers.filter(a => a.isCorrect).length / recentAnswers.length) * 100
    : 0

  const trend = recentAccuracy > overallAccuracy ? 'improving' :
                recentAccuracy < overallAccuracy ? 'declining' : 'stable'

  // 学习活跃度
  const last7Days = new Date()
  last7Days.setDate(last7Days.getDate() - 7)

  const recentSessions = studySessions.filter(s =>
    s.startTime >= last7Days
  )

  const studyDaysLast7 = new Set(
    recentSessions.map(s => s.startTime.toISOString().split('T')[0])
  ).size

  return {
    totalQuestions,
    correctAnswers,
    overallAccuracy: Math.round(overallAccuracy * 10) / 10,
    recentAccuracy: Math.round(recentAccuracy * 10) / 10,
    trend,
    categoryStats: Array.from(categoryStats.values()),
    weakCategories,
    strongCategories,
    wrongQuestionsCount: wrongQuestions.length,
    studyDaysLast7,
    totalStudySessions: studySessions.length
  }
}

/**
 * 生成个性化学习路径
 */
export async function generateLearningPath(userId: string, examType: string = 'cale') {
  const analysis = await analyzeUserLearning(userId, examType)

  const recommendations: Array<{
    type: 'weak_category' | 'review_wrong' | 'practice_more' | 'challenge' | 'rest'
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    action: string
    categoryId?: string
    estimatedTime?: number
  }> = []

  // 1. 薄弱知识点优先
  if (analysis.weakCategories.length > 0) {
    analysis.weakCategories.slice(0, 3).forEach((cat, index) => {
      recommendations.push({
        type: 'weak_category',
        priority: index === 0 ? 'high' : 'medium',
        title: `加强「${cat.categoryName}」学习`,
        description: `您在此知识点的正确率为 ${cat.accuracy.toFixed(1)}%，建议重点突破。已答 ${cat.total} 题，错 ${cat.wrong} 题。`,
        action: `练习 ${cat.categoryName}`,
        categoryId: cat.categoryId,
        estimatedTime: 30
      })
    })
  }

  // 2. 错题复习
  if (analysis.wrongQuestionsCount > 0) {
    const priority = analysis.wrongQuestionsCount > 20 ? 'high' : 'medium'
    recommendations.push({
      type: 'review_wrong',
      priority,
      title: '复习错题本',
      description: `您有 ${analysis.wrongQuestionsCount} 道错题待复习。建议每天复习 10-15 道，巩固知识点。`,
      action: '开始复习错题',
      estimatedTime: 20
    })
  }

  // 3. 学习量建议
  if (analysis.studyDaysLast7 < 4) {
    recommendations.push({
      type: 'practice_more',
      priority: 'medium',
      title: '增加学习频率',
      description: `最近7天您学习了 ${analysis.studyDaysLast7} 天。建议每周至少学习 4-5 天，保持学习连续性。`,
      action: '开始今日学习',
      estimatedTime: 30
    })
  }

  // 4. 挑战优势领域
  if (analysis.strongCategories.length > 0 && analysis.overallAccuracy >= 75) {
    const strongCat = analysis.strongCategories[0]
    recommendations.push({
      type: 'challenge',
      priority: 'low',
      title: `挑战难题：${strongCat.categoryName}`,
      description: `您在此领域表现优秀（正确率 ${strongCat.accuracy.toFixed(1)}%），可以尝试更难的题目。`,
      action: `挑战 ${strongCat.categoryName} 难题`,
      categoryId: strongCat.categoryId,
      estimatedTime: 25
    })
  }

  // 5. 休息建议
  if (analysis.totalStudySessions > 5 && analysis.studyDaysLast7 >= 6) {
    recommendations.push({
      type: 'rest',
      priority: 'low',
      title: '适当休息',
      description: '您最近学习很勤奋！建议适当休息，避免过度疲劳，保持最佳学习状态。',
      action: '了解休息的重要性',
      estimatedTime: 0
    })
  }

  // 按优先级排序
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return {
    recommendations,
    analysis
  }
}

/**
 * 智能题目推荐
 */
export async function recommendQuestions(
  userId: string,
  examType: string = 'cale',
  count: number = 20
) {
  const analysis = await analyzeUserLearning(userId, examType)

  // 获取所有题目
  const allQuestions = await prisma.question.findMany({
    where: {
      examType
    },
    include: {
      category: true
    }
  })

  // 获取用户已答题目ID
  const answeredQuestionIds = new Set(
    await prisma.userAnswer.findMany({
      where: { userId },
      select: { questionId: true }
    }).then(results => results.map(r => r.questionId))
  )

  // 推荐策略：
  // 1. 60% 来自薄弱知识点
  // 2. 20% 来自错题相关类别
  // 3. 20% 随机题目（拓展）

  const recommended: any[] = []

  // 1. 薄弱知识点题目
  const weakCategoryIds = analysis.weakCategories.map(c => c.categoryId)
  const weakQuestions = allQuestions
    .filter(q =>
      weakCategoryIds.includes(q.categoryId) &&
      !answeredQuestionIds.has(q.id)
    )
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.ceil(count * 0.6))

  recommended.push(...weakQuestions)

  // 2. 错题相关类别
  const wrongQuestions = await prisma.wrongQuestion.findMany({
    where: {
      userId,
      mastered: false
    },
    include: {
      question: true
    },
    take: Math.ceil(count * 0.2)
  })

  recommended.push(...wrongQuestions.map(wq => wq.question))

  // 3. 随机题目（未答过的）
  const remainingCount = count - recommended.length
  if (remainingCount > 0) {
    const randomQuestions = allQuestions
      .filter(q => !answeredQuestionIds.has(q.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, remainingCount)

    recommended.push(...randomQuestions)
  }

  return {
    questions: recommended.slice(0, count),
    strategy: {
      weakPoints: weakQuestions.length,
      wrongRelated: wrongQuestions.length,
      random: count - weakQuestions.length - wrongQuestions.length
    }
  }
}

/**
 * 错题模式分析
 */
export async function analyzeWrongQuestionPatterns(userId: string, examType: string = 'cale') {
  const wrongQuestions = await prisma.wrongQuestion.findMany({
    where: {
      userId,
      mastered: false
    },
    include: {
      question: {
        include: {
          category: true
        }
      }
    }
  })

  // 按分类统计错题
  const categoryErrors = new Map<string, {
    categoryName: string
    count: number
    questions: any[]
  }>()

  wrongQuestions.forEach(wq => {
    const catName = wq.question.category.name
    if (!categoryErrors.has(catName)) {
      categoryErrors.set(catName, {
        categoryName: catName,
        count: 0,
        questions: []
      })
    }
    const stat = categoryErrors.get(catName)!
    stat.count++
    stat.questions.push(wq.question)
  })

  // 按难度统计
  const difficultyErrors = new Map<string, number>()
  wrongQuestions.forEach(wq => {
    const difficulty = wq.question.difficulty
    difficultyErrors.set(difficulty, (difficultyErrors.get(difficulty) || 0) + 1)
  })

  // 识别问题模式
  const patterns: Array<{
    type: string
    description: string
    suggestion: string
  }> = []

  // 模式1: 特定分类错误集中
  const topErrorCategory = Array.from(categoryErrors.values())
    .sort((a, b) => b.count - a.count)[0]

  if (topErrorCategory && topErrorCategory.count >= 5) {
    patterns.push({
      type: 'category_weakness',
      description: `「${topErrorCategory.categoryName}」错题较多（${topErrorCategory.count} 道）`,
      suggestion: `建议系统学习该知识点的理论，然后针对性练习`
    })
  }

  // 模式2: 难题失误多
  const hardErrors = difficultyErrors.get('hard') || 0
  const totalErrors = wrongQuestions.length

  if (hardErrors / totalErrors > 0.5) {
    patterns.push({
      type: 'difficulty_challenge',
      description: `难题错误较多（${hardErrors}/${totalErrors} 道）`,
      suggestion: `建议先巩固基础题目，逐步提升到中等难度，再挑战难题`
    })
  }

  // 模式3: 重复犯错
  const repeatErrors = wrongQuestions.filter(wq => wq.wrongCount >= 2)
  if (repeatErrors.length >= 3) {
    patterns.push({
      type: 'repeat_mistakes',
      description: `${repeatErrors.length} 道题目重复答错`,
      suggestion: `这些题目需要深入理解，建议查看详细解析，记录笔记`
    })
  }

  return {
    totalWrongQuestions: wrongQuestions.length,
    categoryDistribution: Array.from(categoryErrors.values())
      .sort((a, b) => b.count - a.count),
    difficultyDistribution: Object.fromEntries(difficultyErrors),
    patterns,
    topErrorCategory: topErrorCategory?.categoryName
  }
}

/**
 * 生成学习报告
 */
export async function generateStudyReport(
  userId: string,
  examType: string = 'cale',
  period: 'week' | 'month' = 'week'
) {
  const daysAgo = period === 'week' ? 7 : 30
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysAgo)

  // 获取时间段内的数据
  const answers = await prisma.userAnswer.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate
      }
    },
    include: {
      question: {
        include: {
          category: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  const sessions = await prisma.studySession.findMany({
    where: {
      userId,
      examType,
      startTime: {
        gte: startDate
      }
    },
    orderBy: {
      startTime: 'asc'
    }
  })

  // 计算统计数据
  const totalQuestions = answers.length
  const correctAnswers = answers.filter(a => a.isCorrect).length
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

  const totalStudyTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
  const avgSessionTime = sessions.length > 0 ? totalStudyTime / sessions.length : 0

  // 学习天数
  const studyDays = new Set(
    sessions.map(s => s.startTime.toISOString().split('T')[0])
  ).size

  // 进步分析
  const firstHalfAnswers = answers.slice(0, Math.floor(answers.length / 2))
  const secondHalfAnswers = answers.slice(Math.floor(answers.length / 2))

  const firstHalfAccuracy = firstHalfAnswers.length > 0
    ? (firstHalfAnswers.filter(a => a.isCorrect).length / firstHalfAnswers.length) * 100
    : 0

  const secondHalfAccuracy = secondHalfAnswers.length > 0
    ? (secondHalfAnswers.filter(a => a.isCorrect).length / secondHalfAnswers.length) * 100
    : 0

  const improvement = secondHalfAccuracy - firstHalfAccuracy

  // 生成建议
  const suggestions: string[] = []

  if (accuracy < 60) {
    suggestions.push('建议加强基础知识学习，降低练习难度')
  } else if (accuracy >= 80) {
    suggestions.push('学习效果很好！可以尝试更难的题目')
  }

  if (studyDays < (daysAgo / 2)) {
    suggestions.push('建议增加学习频率，保持每周至少4-5天的学习')
  }

  if (improvement > 10) {
    suggestions.push('进步明显！继续保持这个学习节奏')
  } else if (improvement < -10) {
    suggestions.push('正确率有所下降，建议复习之前的知识点')
  }

  if (avgSessionTime < 600) { // 10分钟
    suggestions.push('每次学习时间较短，建议延长至20-30分钟以获得更好效果')
  }

  return {
    period: period === 'week' ? '近7天' : '近30天',
    summary: {
      totalQuestions,
      correctAnswers,
      accuracy: Math.round(accuracy * 10) / 10,
      totalStudyTime,
      totalStudyTimeFormatted: formatDuration(totalStudyTime),
      avgSessionTime,
      avgSessionTimeFormatted: formatDuration(avgSessionTime),
      studyDays,
      sessionsCount: sessions.length
    },
    progress: {
      firstHalfAccuracy: Math.round(firstHalfAccuracy * 10) / 10,
      secondHalfAccuracy: Math.round(secondHalfAccuracy * 10) / 10,
      improvement: Math.round(improvement * 10) / 10,
      trend: improvement > 5 ? 'improving' : improvement < -5 ? 'declining' : 'stable'
    },
    suggestions
  }
}

/**
 * 格式化时长
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

/**
 * 智能难度调整
 */
export async function adjustDifficulty(userId: string, examType: string = 'cale') {
  const analysis = await analyzeUserLearning(userId, examType)

  let recommendedDifficulty: 'easy' | 'medium' | 'hard' | 'mixed'

  if (analysis.recentAccuracy >= 85) {
    recommendedDifficulty = 'hard'
  } else if (analysis.recentAccuracy >= 70) {
    recommendedDifficulty = 'mixed'
  } else if (analysis.recentAccuracy >= 50) {
    recommendedDifficulty = 'medium'
  } else {
    recommendedDifficulty = 'easy'
  }

  return {
    currentAccuracy: analysis.recentAccuracy,
    recommendedDifficulty,
    reasoning: getDifficultyReasoning(analysis.recentAccuracy, recommendedDifficulty)
  }
}

function getDifficultyReasoning(accuracy: number, difficulty: string): string {
  if (difficulty === 'hard') {
    return '您的正确率很高，建议尝试更有挑战性的题目以进一步提升'
  } else if (difficulty === 'mixed') {
    return '您的水平稳定，建议混合难度练习以保持平衡'
  } else if (difficulty === 'medium') {
    return '建议以中等难度为主，逐步提升'
  } else {
    return '建议先从简单题目开始，打好基础'
  }
}
