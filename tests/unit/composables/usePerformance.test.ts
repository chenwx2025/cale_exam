import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { usePerformance, PERFORMANCE_THRESHOLDS } from '~/composables/usePerformance'

// Mock process.client
Object.defineProperty(process, 'client', {
  value: true,
  writable: true,
  configurable: true
})

// Mock performance API
const mockPerformance = {
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => [{ duration: 100 }]),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  timing: {
    navigationStart: 0,
    loadEventEnd: 2000,
    domContentLoadedEventEnd: 1500,
  },
  getEntriesByType: vi.fn(() => [{
    responseStart: 100,
    requestStart: 50
  }])
}

// Mock PerformanceObserver
class MockPerformanceObserver {
  callback: any

  constructor(callback: any) {
    this.callback = callback
  }

  observe() {}
  disconnect() {}
}

describe('usePerformance', () => {
  beforeEach(() => {
    vi.stubGlobal('performance', mockPerformance)
    vi.stubGlobal('PerformanceObserver', MockPerformanceObserver)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('工具函数 - debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该延迟执行函数', () => {
      const { debounce } = usePerformance()
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(99)
      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('应该在多次调用时重置计时器', () => {
      const { debounce } = usePerformance()
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      vi.advanceTimersByTime(50)

      debouncedFn() // 重置计时器
      vi.advanceTimersByTime(50)
      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('应该传递正确的参数', () => {
      const { debounce } = usePerformance()
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1', 'arg2', 123)
      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123)
    })

    it('应该只执行最后一次调用', () => {
      const { debounce } = usePerformance()
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('call1')
      vi.advanceTimersByTime(50)

      debouncedFn('call2')
      vi.advanceTimersByTime(50)

      debouncedFn('call3')
      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('call3')
    })

    it('应该支持不同的延迟时间', () => {
      const { debounce } = usePerformance()
      const mockFn = vi.fn()

      const debounce50 = debounce(mockFn, 50)
      const debounce200 = debounce(mockFn, 200)

      debounce50()
      debounce200()

      vi.advanceTimersByTime(50)
      expect(mockFn).toHaveBeenCalledTimes(1) // debounce50 触发

      vi.advanceTimersByTime(150)
      expect(mockFn).toHaveBeenCalledTimes(2) // debounce200 触发
    })
  })

  describe('工具函数 - throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该立即执行第一次调用', () => {
      const { throttle } = usePerformance()
      const mockFn = vi.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('应该在延迟期间忽略调用', () => {
      const { throttle } = usePerformance()
      const mockFn = vi.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn() // 第1次 - 立即执行
      expect(mockFn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(50)
      throttledFn() // 忽略
      expect(mockFn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(50) // 总共100ms
      throttledFn() // 第2次 - 执行
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('应该传递正确的参数', () => {
      const { throttle } = usePerformance()
      const mockFn = vi.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn('arg1', 'arg2', 123)
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123)
    })

    it('应该支持连续执行', () => {
      const { throttle } = usePerformance()
      const mockFn = vi.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn('call1') // t=0ms - 执行
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenLastCalledWith('call1')

      vi.advanceTimersByTime(100)
      throttledFn('call2') // t=100ms - 执行
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('call2')

      vi.advanceTimersByTime(100)
      throttledFn('call3') // t=200ms - 执行
      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(mockFn).toHaveBeenLastCalledWith('call3')
    })

    it('应该在边界时间正确执行', () => {
      const { throttle } = usePerformance()
      const mockFn = vi.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn() // t=0
      expect(mockFn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(99)
      throttledFn() // t=99 - 忽略
      expect(mockFn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(1)
      throttledFn() // t=100 - 执行
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('应该支持不同的延迟时间', () => {
      const { throttle } = usePerformance()
      const mockFn1 = vi.fn()
      const mockFn2 = vi.fn()

      const throttle50 = throttle(mockFn1, 50)
      const throttle200 = throttle(mockFn2, 200)

      throttle50()
      throttle200()
      expect(mockFn1).toHaveBeenCalledTimes(1)
      expect(mockFn2).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(50)
      throttle50()
      throttle200() // 忽略
      expect(mockFn1).toHaveBeenCalledTimes(2)
      expect(mockFn2).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(150) // 总共200ms
      throttle200()
      expect(mockFn2).toHaveBeenCalledTimes(2)
    })
  })

  describe('工具函数 - getMetricRating', () => {
    it('应该返回 "good" 当值小于等于 good 阈值', () => {
      const { getMetricRating } = usePerformance()

      // FCP: good <= 1800
      expect(getMetricRating('FCP', 1000)).toBe('good')
      expect(getMetricRating('FCP', 1800)).toBe('good')

      // LCP: good <= 2500
      expect(getMetricRating('LCP', 2000)).toBe('good')
      expect(getMetricRating('LCP', 2500)).toBe('good')

      // FID: good <= 100
      expect(getMetricRating('FID', 50)).toBe('good')
      expect(getMetricRating('FID', 100)).toBe('good')
    })

    it('应该返回 "needs-improvement" 当值在 good 和 needsImprovement 之间', () => {
      const { getMetricRating } = usePerformance()

      // FCP: 1800 < value <= 3000
      expect(getMetricRating('FCP', 1801)).toBe('needs-improvement')
      expect(getMetricRating('FCP', 2500)).toBe('needs-improvement')
      expect(getMetricRating('FCP', 3000)).toBe('needs-improvement')

      // LCP: 2500 < value <= 4000
      expect(getMetricRating('LCP', 2501)).toBe('needs-improvement')
      expect(getMetricRating('LCP', 3500)).toBe('needs-improvement')
      expect(getMetricRating('LCP', 4000)).toBe('needs-improvement')
    })

    it('应该返回 "poor" 当值大于 needsImprovement 阈值', () => {
      const { getMetricRating } = usePerformance()

      // FCP: value > 3000
      expect(getMetricRating('FCP', 3001)).toBe('poor')
      expect(getMetricRating('FCP', 5000)).toBe('poor')

      // LCP: value > 4000
      expect(getMetricRating('LCP', 4001)).toBe('poor')
      expect(getMetricRating('LCP', 6000)).toBe('poor')

      // FID: value > 300
      expect(getMetricRating('FID', 301)).toBe('poor')
      expect(getMetricRating('FID', 500)).toBe('poor')
    })

    it('应该正确处理 CLS（分数类型）', () => {
      const { getMetricRating } = usePerformance()

      // CLS: good <= 0.1
      expect(getMetricRating('CLS', 0.05)).toBe('good')
      expect(getMetricRating('CLS', 0.1)).toBe('good')

      // CLS: 0.1 < value <= 0.25
      expect(getMetricRating('CLS', 0.15)).toBe('needs-improvement')
      expect(getMetricRating('CLS', 0.25)).toBe('needs-improvement')

      // CLS: value > 0.25
      expect(getMetricRating('CLS', 0.26)).toBe('poor')
      expect(getMetricRating('CLS', 0.5)).toBe('poor')
    })

    it('应该正确处理 TTFB', () => {
      const { getMetricRating } = usePerformance()

      // TTFB: good <= 800
      expect(getMetricRating('TTFB', 500)).toBe('good')
      expect(getMetricRating('TTFB', 800)).toBe('good')

      // TTFB: 800 < value <= 1800
      expect(getMetricRating('TTFB', 1000)).toBe('needs-improvement')
      expect(getMetricRating('TTFB', 1800)).toBe('needs-improvement')

      // TTFB: value > 1800
      expect(getMetricRating('TTFB', 2000)).toBe('poor')
    })

    it('应该处理边界值', () => {
      const { getMetricRating } = usePerformance()

      // 边界测试：0
      expect(getMetricRating('FCP', 0)).toBe('good')

      // 边界测试：非常大的值
      expect(getMetricRating('FCP', 999999)).toBe('poor')
    })
  })

  describe('支持检测', () => {
    it('应该在客户端检测 Performance API 支持', () => {
      Object.defineProperty(process, 'client', { value: true, writable: true })

      const { checkSupport, isSupported } = usePerformance()

      const result = checkSupport()
      expect(result).toBe(true)
      expect(isSupported.value).toBe(true)
    })

    it('应该在服务端返回 false', () => {
      Object.defineProperty(process, 'client', { value: false, writable: true })

      const { checkSupport, isSupported } = usePerformance()

      const result = checkSupport()
      expect(result).toBe(false)
      expect(isSupported.value).toBe(false)

      // 恢复
      Object.defineProperty(process, 'client', { value: true, writable: true })
    })
  })

  describe('性能标记和测量', () => {
    it('应该调用 performance.mark', () => {
      const { markTiming } = usePerformance()

      markTiming('test-mark')

      expect(mockPerformance.mark).toHaveBeenCalledWith('test-mark')
    })

    it('应该在服务端不调用 mark', () => {
      Object.defineProperty(process, 'client', { value: false, writable: true })

      const { markTiming } = usePerformance()
      markTiming('test-mark')

      expect(mockPerformance.mark).not.toHaveBeenCalled()

      // 恢复
      Object.defineProperty(process, 'client', { value: true, writable: true })
    })

    it('应该测量两个标记之间的时间', () => {
      const { measureBetween } = usePerformance()

      const duration = measureBetween('test-measure', 'start', 'end')

      expect(mockPerformance.measure).toHaveBeenCalledWith('test-measure', 'start', 'end')
      expect(mockPerformance.getEntriesByName).toHaveBeenCalledWith('test-measure')
      expect(duration).toBe(100)
    })

    it('应该在测量失败时返回 null', () => {
      mockPerformance.measure.mockImplementationOnce(() => {
        throw new Error('Measurement failed')
      })

      const { measureBetween } = usePerformance()
      const duration = measureBetween('test-measure', 'start', 'end')

      expect(duration).toBeNull()
    })

    it('应该清除所有标记和测量', () => {
      const { clearMetrics } = usePerformance()

      clearMetrics()

      expect(mockPerformance.clearMarks).toHaveBeenCalled()
      expect(mockPerformance.clearMeasures).toHaveBeenCalled()
    })

    it('应该在服务端不执行清除操作', () => {
      Object.defineProperty(process, 'client', { value: false, writable: true })

      const { clearMetrics } = usePerformance()
      clearMetrics()

      expect(mockPerformance.clearMarks).not.toHaveBeenCalled()
      expect(mockPerformance.clearMeasures).not.toHaveBeenCalled()

      // 恢复
      Object.defineProperty(process, 'client', { value: true, writable: true })
    })
  })

  describe('PERFORMANCE_THRESHOLDS 常量', () => {
    it('应该包含所有 Web Vitals 指标', () => {
      expect(PERFORMANCE_THRESHOLDS).toHaveProperty('FCP')
      expect(PERFORMANCE_THRESHOLDS).toHaveProperty('LCP')
      expect(PERFORMANCE_THRESHOLDS).toHaveProperty('FID')
      expect(PERFORMANCE_THRESHOLDS).toHaveProperty('CLS')
      expect(PERFORMANCE_THRESHOLDS).toHaveProperty('TTFB')
    })

    it('应该有正确的 FCP 阈值', () => {
      expect(PERFORMANCE_THRESHOLDS.FCP).toEqual({
        good: 1800,
        needsImprovement: 3000
      })
    })

    it('应该有正确的 LCP 阈值', () => {
      expect(PERFORMANCE_THRESHOLDS.LCP).toEqual({
        good: 2500,
        needsImprovement: 4000
      })
    })

    it('应该有正确的 FID 阈值', () => {
      expect(PERFORMANCE_THRESHOLDS.FID).toEqual({
        good: 100,
        needsImprovement: 300
      })
    })

    it('应该有正确的 CLS 阈值', () => {
      expect(PERFORMANCE_THRESHOLDS.CLS).toEqual({
        good: 0.1,
        needsImprovement: 0.25
      })
    })

    it('应该有正确的 TTFB 阈值', () => {
      expect(PERFORMANCE_THRESHOLDS.TTFB).toEqual({
        good: 800,
        needsImprovement: 1800
      })
    })
  })

  describe('返回值结构', () => {
    it('应该返回所有必需的属性', () => {
      const perf = usePerformance()

      expect(perf).toHaveProperty('metrics')
      expect(perf).toHaveProperty('isSupported')
      expect(perf).toHaveProperty('startMonitoring')
      expect(perf).toHaveProperty('getPerformanceSummary')
      expect(perf).toHaveProperty('logPerformanceMetrics')
      expect(perf).toHaveProperty('sendToAnalytics')
      expect(perf).toHaveProperty('markTiming')
      expect(perf).toHaveProperty('measureBetween')
      expect(perf).toHaveProperty('clearMetrics')
      expect(perf).toHaveProperty('debounce')
      expect(perf).toHaveProperty('throttle')
      expect(perf).toHaveProperty('checkSupport')
      expect(perf).toHaveProperty('getMetricRating')
    })

    it('应该返回函数类型的方法', () => {
      const perf = usePerformance()

      expect(typeof perf.startMonitoring).toBe('function')
      expect(typeof perf.markTiming).toBe('function')
      expect(typeof perf.measureBetween).toBe('function')
      expect(typeof perf.clearMetrics).toBe('function')
      expect(typeof perf.debounce).toBe('function')
      expect(typeof perf.throttle).toBe('function')
      expect(typeof perf.checkSupport).toBe('function')
      expect(typeof perf.getMetricRating).toBe('function')
    })
  })
})
