/**
 * Database Performance Utilities
 * Phase 6 Sprint 3 - Performance Optimization
 *
 * Provides utilities for optimizing database queries and monitoring performance
 */

import type { PrismaClient } from '@prisma/client'

/**
 * Query performance logger
 * Logs slow queries for optimization
 */
export const logSlowQuery = (queryName: string, duration: number, threshold: number = 100) => {
  if (duration > threshold) {
    console.warn(`⚠️ Slow Query: ${queryName} took ${duration}ms (threshold: ${threshold}ms)`)
  }
}

/**
 * Measure query execution time
 */
export const measureQuery = async <T>(
  queryName: string,
  queryFn: () => Promise<T>,
  logSlow: boolean = true
): Promise<T> => {
  const start = Date.now()

  try {
    const result = await queryFn()
    const duration = Date.now() - start

    if (logSlow) {
      logSlowQuery(queryName, duration)
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Query: ${queryName} - ${duration}ms`)
    }

    return result
  } catch (error) {
    const duration = Date.now() - start
    console.error(`❌ Query Error: ${queryName} failed after ${duration}ms`, error)
    throw error
  }
}

/**
 * Batch query helper
 * Executes multiple queries in parallel for better performance
 */
export const batchQueries = async <T extends Record<string, Promise<any>>>(
  queries: T
): Promise<{ [K in keyof T]: Awaited<T[K]> }> => {
  const start = Date.now()
  const queryNames = Object.keys(queries)

  try {
    const results = await Promise.all(Object.values(queries))
    const duration = Date.now() - start

    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Batch Query (${queryNames.length} queries) - ${duration}ms`)
    }

    return Object.fromEntries(
      queryNames.map((key, index) => [key, results[index]])
    ) as any
  } catch (error) {
    const duration = Date.now() - start
    console.error(`❌ Batch Query failed after ${duration}ms`, error)
    throw error
  }
}

/**
 * Pagination helper
 * Standardized pagination with performance optimization
 */
export interface PaginationOptions {
  page?: number
  limit?: number
  maxLimit?: number
}

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const paginate = async <T>(
  queryFn: (skip: number, take: number) => Promise<T[]>,
  countFn: () => Promise<number>,
  options: PaginationOptions = {}
): Promise<PaginationResult<T>> => {
  const {
    page = 1,
    limit = 20,
    maxLimit = 100
  } = options

  // Validate and sanitize inputs
  const validPage = Math.max(1, page)
  const validLimit = Math.min(Math.max(1, limit), maxLimit)
  const skip = (validPage - 1) * validLimit

  // Execute queries in parallel
  const [data, total] = await Promise.all([
    queryFn(skip, validLimit),
    countFn()
  ])

  const totalPages = Math.ceil(total / validLimit)

  return {
    data,
    pagination: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages,
      hasNext: validPage < totalPages,
      hasPrev: validPage > 1
    }
  }
}

/**
 * Select optimization helper
 * Returns minimal field selection for better performance
 */
export const minimalUserSelect = {
  id: true,
  email: true,
  name: true,
  avatar: true,
  role: true,
  createdAt: true
}

export const minimalQuestionSelect = {
  id: true,
  examType: true,
  type: true,
  question: true,
  difficulty: true,
  categoryId: true,
  createdAt: true
}

export const minimalExamSelect = {
  id: true,
  examType: true,
  title: true,
  status: true,
  questionCount: true,
  duration: true,
  score: true,
  percentage: true,
  passed: true,
  createdAt: true,
  completedAt: true
}

/**
 * Cache helper for frequently accessed data
 * Simple in-memory cache with TTL
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private defaultTTL: number = 60000 // 1 minute

  async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cached = this.cache.get(key)
    const now = Date.now()

    if (cached && (now - cached.timestamp) < ttl) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`💾 Cache HIT: ${key}`)
      }
      return cached.data
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`💾 Cache MISS: ${key}`)
    }

    const data = await fetchFn()
    this.cache.set(key, { data, timestamp: now })

    return data
  }

  invalidate(key: string) {
    this.cache.delete(key)
  }

  invalidatePattern(pattern: string) {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  clear() {
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }
}

export const queryCache = new SimpleCache()

/**
 * Common query optimizations
 */

// Get user with minimal data
export const getUserMinimal = async (prisma: PrismaClient, userId: string) => {
  return measureQuery(
    'getUserMinimal',
    () => prisma.user.findUnique({
      where: { id: userId },
      select: minimalUserSelect
    })
  )
}

// Get questions with pagination and filtering
export const getQuestionsPaginated = async (
  prisma: PrismaClient,
  filters: {
    examType?: string
    categoryId?: string
    difficulty?: string
    page?: number
    limit?: number
  }
) => {
  const { examType, categoryId, difficulty, page = 1, limit = 20 } = filters

  const where: any = {}
  if (examType) where.examType = examType
  if (categoryId) where.categoryId = categoryId
  if (difficulty) where.difficulty = difficulty

  return measureQuery(
    'getQuestionsPaginated',
    () => paginate(
      (skip, take) => prisma.question.findMany({
        where,
        skip,
        take,
        select: {
          ...minimalQuestionSelect,
          category: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      () => prisma.question.count({ where })
    )
  )
}

// Get user exam history with pagination
export const getUserExamHistory = async (
  prisma: PrismaClient,
  userId: string,
  page: number = 1,
  limit: number = 10
) => {
  return measureQuery(
    'getUserExamHistory',
    () => paginate(
      (skip, take) => prisma.exam.findMany({
        where: { userId },
        skip,
        take,
        select: minimalExamSelect,
        orderBy: { createdAt: 'desc' }
      }),
      () => prisma.exam.count({ where: { userId } }),
      { page, limit }
    )
  )
}

// Get user statistics (optimized with parallel queries)
export const getUserStatistics = async (prisma: PrismaClient, userId: string) => {
  return measureQuery(
    'getUserStatistics',
    () => batchQueries({
      totalExams: prisma.exam.count({ where: { userId } }),
      completedExams: prisma.exam.count({ where: { userId, status: 'completed' } }),
      totalQuestions: prisma.userAnswer.count({ where: { userId } }),
      correctAnswers: prisma.userAnswer.count({ where: { userId, isCorrect: true } }),
      wrongQuestions: prisma.wrongQuestion.count({ where: { userId, mastered: false } }),
      studySessions: prisma.studySession.count({ where: { userId } }),
      totalStudyTime: prisma.studySession.aggregate({
        where: { userId },
        _sum: { duration: true }
      })
    })
  )
}

/**
 * Database connection pool monitoring
 */
export const logConnectionStats = (prisma: PrismaClient) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Database Connection Stats:')
    console.log('  - Connection pool size: Available in production')
    console.log('  - Active connections: Available in production')
    console.log('  - Idle connections: Available in production')
  }
}

/**
 * Query optimization recommendations
 */
export const analyzeQuery = (queryName: string, duration: number, rowCount: number) => {
  const rowsPerMs = rowCount / duration

  if (duration > 1000) {
    console.warn(`⚠️ Very Slow Query: ${queryName}`)
    console.warn(`   Duration: ${duration}ms, Rows: ${rowCount}, Rate: ${rowsPerMs.toFixed(2)} rows/ms`)
    console.warn('   Recommendations:')
    console.warn('   1. Add indexes to frequently queried fields')
    console.warn('   2. Use select to fetch only needed fields')
    console.warn('   3. Consider pagination for large result sets')
    console.warn('   4. Check for N+1 query problems')
  }
}

/**
 * Export all utilities
 */
export default {
  measureQuery,
  batchQueries,
  paginate,
  queryCache,
  getUserMinimal,
  getQuestionsPaginated,
  getUserExamHistory,
  getUserStatistics,
  logConnectionStats,
  analyzeQuery,
  logSlowQuery,
  minimalUserSelect,
  minimalQuestionSelect,
  minimalExamSelect
}
