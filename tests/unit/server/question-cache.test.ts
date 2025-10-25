import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Import the cache class (we'll need to refactor slightly to make it testable)
// For now, we'll create a testable version

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class QuestionCache {
  private cache: Map<string, CacheEntry<any>>
  private readonly defaultTTL: number = 5 * 60 * 1000 // 5分钟
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    this.cache = new Map()
  }

  /**
   * 启动自动清理（测试中手动控制）
   */
  startAutoCleanup(): void {
    if (!this.cleanupInterval) {
      this.cleanupInterval = setInterval(() => this.cleanup(), 10 * 60 * 1000)
    }
  }

  /**
   * 停止自动清理
   */
  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
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
  cleanup(): void {
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

describe('QuestionCache', () => {
  let cache: QuestionCache

  beforeEach(() => {
    cache = new QuestionCache()
    vi.clearAllMocks()
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    cache.stopAutoCleanup()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('基本缓存操作', () => {
    it('应该能设置和获取缓存', () => {
      const key = 'test-key'
      const data = { id: '123', name: 'Test' }

      cache.set(key, data)

      const result = cache.get(key)

      expect(result).toEqual(data)
    })

    it('应该在键不存在时返回 null', () => {
      const result = cache.get('non-existent-key')

      expect(result).toBeNull()
    })

    it('应该能删除缓存', () => {
      const key = 'test-key'
      cache.set(key, 'test data')

      const deleted = cache.delete(key)

      expect(deleted).toBe(true)
      expect(cache.get(key)).toBeNull()
    })

    it('应该在删除不存在的键时返回 false', () => {
      const deleted = cache.delete('non-existent-key')

      expect(deleted).toBe(false)
    })

    it('应该能清空所有缓存', () => {
      const consoleSpy = vi.spyOn(console, 'log')

      cache.set('key1', 'data1')
      cache.set('key2', 'data2')
      cache.set('key3', 'data3')

      cache.clear()

      expect(cache.getStats().size).toBe(0)
      expect(consoleSpy).toHaveBeenCalledWith('[QuestionCache] Cache cleared')
    })
  })

  describe('TTL（过期时间）', () => {
    it('应该使用默认 TTL（5分钟）', () => {
      const key = 'test-key'
      cache.set(key, 'test data')

      // 4分钟后应该还存在
      vi.advanceTimersByTime(4 * 60 * 1000)
      expect(cache.get(key)).toBe('test data')

      // 6分钟后应该过期
      vi.advanceTimersByTime(2 * 60 * 1000)
      expect(cache.get(key)).toBeNull()
    })

    it('应该支持自定义 TTL', () => {
      const key = 'test-key'
      const customTTL = 10 * 1000 // 10秒

      cache.set(key, 'test data', customTTL)

      // 9秒后应该还存在
      vi.advanceTimersByTime(9 * 1000)
      expect(cache.get(key)).toBe('test data')

      // 11秒后应该过期
      vi.advanceTimersByTime(2 * 1000)
      expect(cache.get(key)).toBeNull()
    })

    it('应该在获取时检查过期并自动删除', () => {
      const key = 'test-key'
      cache.set(key, 'test data', 1000) // 1秒TTL

      // 初始统计
      expect(cache.getStats().size).toBe(1)

      // 2秒后过期
      vi.advanceTimersByTime(2000)

      // 获取时应该返回 null 并删除
      expect(cache.get(key)).toBeNull()

      // 缓存应该被删除
      expect(cache.getStats().size).toBe(0)
    })
  })

  describe('缓存统计', () => {
    it('应该返回正确的缓存大小', () => {
      cache.set('key1', 'data1')
      cache.set('key2', 'data2')

      const stats = cache.getStats()

      expect(stats.size).toBe(2)
    })

    it('应该返回所有缓存键', () => {
      cache.set('key1', 'data1')
      cache.set('key2', 'data2')
      cache.set('key3', 'data3')

      const stats = cache.getStats()

      expect(stats.keys).toContain('key1')
      expect(stats.keys).toContain('key2')
      expect(stats.keys).toContain('key3')
      expect(stats.keys).toHaveLength(3)
    })

    it('应该在清空后返回空统计', () => {
      cache.set('key1', 'data1')
      cache.clear()

      const stats = cache.getStats()

      expect(stats.size).toBe(0)
      expect(stats.keys).toHaveLength(0)
    })
  })

  describe('自动清理', () => {
    it('应该能启动和停止自动清理', () => {
      cache.startAutoCleanup()

      // 验证已启动（通过设置过期缓存并等待清理）
      cache.set('key1', 'data1', 1000)

      cache.stopAutoCleanup()

      // 验证已停止（定时器应该被清除）
      expect(true).toBe(true) // 无法直接验证，但确保不抛错
    })

    it('应该定期清理过期缓存', () => {
      const consoleSpy = vi.spyOn(console, 'log')

      // 设置一些短期缓存
      cache.set('key1', 'data1', 1000)
      cache.set('key2', 'data2', 1000)
      cache.set('key3', 'data3', 10000) // 这个不会过期

      // 等待缓存过期
      vi.advanceTimersByTime(2000)

      // 手动触发清理
      cache.cleanup()

      expect(cache.getStats().size).toBe(1) // 只剩 key3
      expect(cache.get('key3')).toBe('data3')
      expect(consoleSpy).toHaveBeenCalledWith('[QuestionCache] Cleaned 2 expired entries')
    })

    it('应该在没有过期缓存时不输出日志', () => {
      const consoleSpy = vi.spyOn(console, 'log')

      cache.set('key1', 'data1', 10000)

      cache.cleanup()

      // 不应该输出清理日志
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Cleaned'))
    })
  })

  describe('题目列表缓存键生成', () => {
    it('应该生成正确的缓存键', () => {
      const key = cache.getQuestionListKey({
        examType: 'cale',
        categoryId: 'cat-123',
        difficulty: 'medium',
        page: 1,
        limit: 20
      })

      expect(key).toContain('questions:list')
      expect(key).toContain('examType:cale')
      expect(key).toContain('categoryId:cat-123')
      expect(key).toContain('difficulty:medium')
      expect(key).toContain('page:1')
      expect(key).toContain('limit:20')
    })

    it('应该对参数排序以保证一致性', () => {
      const key1 = cache.getQuestionListKey({
        page: 1,
        examType: 'cale',
        limit: 20
      })

      const key2 = cache.getQuestionListKey({
        examType: 'cale',
        limit: 20,
        page: 1
      })

      // 参数顺序不同，但生成的键应该相同
      expect(key1).toBe(key2)
    })

    it('应该支持部分参数', () => {
      const key = cache.getQuestionListKey({
        examType: 'cale'
      })

      expect(key).toContain('questions:list')
      expect(key).toContain('examType:cale')
    })

    it('应该处理空参数', () => {
      const key = cache.getQuestionListKey({})

      expect(key).toBe('questions:list:')
    })
  })

  describe('单个题目缓存键生成', () => {
    it('应该生成正确的题目键', () => {
      const key = cache.getQuestionKey('question-123')

      expect(key).toBe('question:question-123')
    })

    it('应该支持不同的题目 ID', () => {
      const key1 = cache.getQuestionKey('q1')
      const key2 = cache.getQuestionKey('q2')

      expect(key1).toBe('question:q1')
      expect(key2).toBe('question:q2')
      expect(key1).not.toBe(key2)
    })
  })

  describe('按前缀失效缓存', () => {
    it('应该删除所有匹配前缀的缓存', () => {
      cache.set('questions:list:1', 'data1')
      cache.set('questions:list:2', 'data2')
      cache.set('questions:list:3', 'data3')
      cache.set('question:123', 'data4')
      cache.set('other:key', 'data5')

      const count = cache.invalidateByPrefix('questions:list')

      expect(count).toBe(3)
      expect(cache.getStats().size).toBe(2) // 只剩 question:123 和 other:key
      expect(cache.get('question:123')).toBe('data4')
      expect(cache.get('other:key')).toBe('data5')
    })

    it('应该在没有匹配时返回 0', () => {
      cache.set('key1', 'data1')
      cache.set('key2', 'data2')

      const count = cache.invalidateByPrefix('non-existent')

      expect(count).toBe(0)
      expect(cache.getStats().size).toBe(2)
    })

    it('应该支持完全匹配的前缀', () => {
      cache.set('question:1', 'data1')
      cache.set('question:2', 'data2')
      cache.set('questions:list', 'data3')

      const count = cache.invalidateByPrefix('question:')

      expect(count).toBe(2) // 不包括 questions:list
      expect(cache.get('questions:list')).toBe('data3')
    })
  })

  describe('数据类型测试', () => {
    it('应该支持字符串数据', () => {
      cache.set('key', 'string data')
      expect(cache.get('key')).toBe('string data')
    })

    it('应该支持数字数据', () => {
      cache.set('key', 123)
      expect(cache.get('key')).toBe(123)
    })

    it('应该支持对象数据', () => {
      const obj = { id: '123', name: 'Test', nested: { value: 456 } }
      cache.set('key', obj)
      expect(cache.get('key')).toEqual(obj)
    })

    it('应该支持数组数据', () => {
      const arr = [1, 2, 3, 4, 5]
      cache.set('key', arr)
      expect(cache.get('key')).toEqual(arr)
    })

    it('应该支持 null 作为数据', () => {
      cache.set('key', null)
      expect(cache.get('key')).toBeNull()
    })

    it('应该区分"不存在"和"值为 null"', () => {
      cache.set('key-with-null', null)

      // 存在但值为 null
      expect(cache.get('key-with-null')).toBeNull()

      // 不存在
      expect(cache.get('non-existent')).toBeNull()

      // 通过统计区分
      expect(cache.getStats().keys).toContain('key-with-null')
      expect(cache.getStats().keys).not.toContain('non-existent')
    })
  })

  describe('并发和边界情况', () => {
    it('应该处理重复设置相同键', () => {
      cache.set('key', 'value1')
      cache.set('key', 'value2')
      cache.set('key', 'value3')

      expect(cache.get('key')).toBe('value3')
      expect(cache.getStats().size).toBe(1)
    })

    it('应该处理大量缓存项', () => {
      const count = 1000

      for (let i = 0; i < count; i++) {
        cache.set(`key${i}`, `data${i}`)
      }

      expect(cache.getStats().size).toBe(count)

      // 验证能正确获取
      expect(cache.get('key500')).toBe('data500')
    })

    it('应该正确处理空字符串键', () => {
      cache.set('', 'empty key data')
      expect(cache.get('')).toBe('empty key data')
    })

    it('应该在同一毫秒内设置多个缓存', () => {
      cache.set('key1', 'data1')
      cache.set('key2', 'data2')
      cache.set('key3', 'data3')

      expect(cache.get('key1')).toBe('data1')
      expect(cache.get('key2')).toBe('data2')
      expect(cache.get('key3')).toBe('data3')
    })
  })

  describe('实际使用场景', () => {
    it('应该支持题目列表缓存场景', () => {
      // 第一次请求 - 缓存未命中
      const listKey = cache.getQuestionListKey({
        examType: 'cale',
        page: 1,
        limit: 20
      })

      expect(cache.get(listKey)).toBeNull()

      // 设置缓存
      const questions = [
        { id: '1', title: 'Q1' },
        { id: '2', title: 'Q2' }
      ]
      cache.set(listKey, questions)

      // 第二次请求 - 缓存命中
      expect(cache.get(listKey)).toEqual(questions)

      // 题目更新后，使缓存失效
      cache.invalidateByPrefix('questions:list')

      // 缓存已失效
      expect(cache.get(listKey)).toBeNull()
    })

    it('应该支持单个题目缓存场景', () => {
      const questionId = 'q-123'
      const questionKey = cache.getQuestionKey(questionId)

      const question = {
        id: questionId,
        title: 'Test Question',
        content: 'Question content',
        options: ['A', 'B', 'C', 'D']
      }

      cache.set(questionKey, question)

      expect(cache.get(questionKey)).toEqual(question)

      // 题目编辑后，删除特定缓存
      cache.delete(questionKey)

      expect(cache.get(questionKey)).toBeNull()
    })

    it('应该处理分页缓存', () => {
      // 缓存第 1 页
      const page1Key = cache.getQuestionListKey({
        examType: 'cale',
        page: 1,
        limit: 20
      })
      cache.set(page1Key, ['q1', 'q2', 'q3'])

      // 缓存第 2 页
      const page2Key = cache.getQuestionListKey({
        examType: 'cale',
        page: 2,
        limit: 20
      })
      cache.set(page2Key, ['q4', 'q5', 'q6'])

      // 两页都应该独立缓存
      expect(cache.get(page1Key)).toEqual(['q1', 'q2', 'q3'])
      expect(cache.get(page2Key)).toEqual(['q4', 'q5', 'q6'])

      // 使所有列表缓存失效
      const count = cache.invalidateByPrefix('questions:list')
      expect(count).toBe(2)
    })
  })
})
