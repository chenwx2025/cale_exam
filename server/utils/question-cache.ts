/**
 * 题目缓存服务
 * 使用内存缓存提高题目查询性能
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class QuestionCache {
  private cache: Map<string, CacheEntry<any>>
  private readonly defaultTTL: number = 5 * 60 * 1000 // 5分钟

  constructor() {
    this.cache = new Map()
    // 每10分钟清理一次过期缓存
    setInterval(() => this.cleanup(), 10 * 60 * 1000)
  }

  /**
   * 生成缓存键
   */
  private generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|')
    return `${prefix}:${sortedParams}`
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const expiresAt = now + (ttl || this.defaultTTL)

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    })
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`[QuestionCache] Cleaned ${cleaned} expired entries`)
    }
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
    console.log('[QuestionCache] Cache cleared')
  }

  /**
   * 获取缓存统计
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  /**
   * 生成题目列表缓存键
   */
  getQuestionListKey(params: {
    examType?: string
    categoryId?: string
    difficulty?: string
    page?: number
    limit?: number
  }): string {
    return this.generateKey('questions:list', params)
  }

  /**
   * 生成单个题目缓存键
   */
  getQuestionKey(questionId: string): string {
    return `question:${questionId}`
  }

  /**
   * 使缓存失效（按前缀）
   */
  invalidateByPrefix(prefix: string): number {
    let count = 0
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
        count++
      }
    }
    return count
  }
}

// 导出单例实例
export const questionCache = new QuestionCache()
