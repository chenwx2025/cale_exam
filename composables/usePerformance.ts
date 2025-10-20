/**
 * Performance Monitoring Composable
 * Phase 6 Sprint 3 - Performance Optimization
 *
 * Tracks Web Vitals and provides performance utilities
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  FCP?: number  // First Contentful Paint
  LCP?: number  // Largest Contentful Paint
  FID?: number  // First Input Delay
  CLS?: number  // Cumulative Layout Shift
  TTFB?: number // Time to First Byte

  // Custom metrics
  pageLoadTime?: number
  domReadyTime?: number
  resourceLoadTime?: number
}

export interface PerformanceThresholds {
  FCP: { good: number; needsImprovement: number }
  LCP: { good: number; needsImprovement: number }
  FID: { good: number; needsImprovement: number }
  CLS: { good: number; needsImprovement: number }
  TTFB: { good: number; needsImprovement: number }
}

// Web Vitals thresholds (Google recommended)
export const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  FCP: { good: 1800, needsImprovement: 3000 },      // ms
  LCP: { good: 2500, needsImprovement: 4000 },      // ms
  FID: { good: 100, needsImprovement: 300 },        // ms
  CLS: { good: 0.1, needsImprovement: 0.25 },       // score
  TTFB: { good: 800, needsImprovement: 1800 }       // ms
}

export const usePerformance = () => {
  const metrics = ref<PerformanceMetrics>({})
  const isSupported = ref(false)

  // Check if Performance API is available
  const checkSupport = () => {
    if (process.client) {
      isSupported.value = 'performance' in window && 'PerformanceObserver' in window
    }
    return isSupported.value
  }

  // Get metric rating (good, needs-improvement, poor)
  const getMetricRating = (
    metricName: keyof PerformanceThresholds,
    value: number
  ): 'good' | 'needs-improvement' | 'poor' => {
    const threshold = PERFORMANCE_THRESHOLDS[metricName]
    if (value <= threshold.good) return 'good'
    if (value <= threshold.needsImprovement) return 'needs-improvement'
    return 'poor'
  }

  // Measure First Contentful Paint
  const measureFCP = () => {
    if (!process.client || !checkSupport()) return

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            metrics.value.FCP = entry.startTime
            observer.disconnect()
          }
        }
      })
      observer.observe({ entryTypes: ['paint'] })
    } catch (error) {
      console.error('FCP measurement error:', error)
    }
  }

  // Measure Largest Contentful Paint
  const measureLCP = () => {
    if (!process.client || !checkSupport()) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        metrics.value.LCP = lastEntry.renderTime || lastEntry.loadTime
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      console.error('LCP measurement error:', error)
    }
  }

  // Measure First Input Delay
  const measureFID = () => {
    if (!process.client || !checkSupport()) return

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any
          metrics.value.FID = fidEntry.processingStart - fidEntry.startTime
          observer.disconnect()
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
    } catch (error) {
      console.error('FID measurement error:', error)
    }
  }

  // Measure Cumulative Layout Shift
  const measureCLS = () => {
    if (!process.client || !checkSupport()) return

    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as any
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value
            metrics.value.CLS = clsValue
          }
        }
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.error('CLS measurement error:', error)
    }
  }

  // Measure Time to First Byte
  const measureTTFB = () => {
    if (!process.client || !checkSupport()) return

    try {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as any
      if (navigationTiming) {
        metrics.value.TTFB = navigationTiming.responseStart - navigationTiming.requestStart
      }
    } catch (error) {
      console.error('TTFB measurement error:', error)
    }
  }

  // Measure page load times
  const measurePageLoad = () => {
    if (!process.client || !checkSupport()) return

    try {
      window.addEventListener('load', () => {
        const perfData = performance.timing
        metrics.value.pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
        metrics.value.domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart
        metrics.value.resourceLoadTime = perfData.loadEventEnd - perfData.domContentLoadedEventEnd
      })
    } catch (error) {
      console.error('Page load measurement error:', error)
    }
  }

  // Start all measurements
  const startMonitoring = () => {
    if (!process.client) return

    measureFCP()
    measureLCP()
    measureFID()
    measureCLS()
    measureTTFB()
    measurePageLoad()
  }

  // Get performance summary
  const getPerformanceSummary = computed(() => {
    const summary: Record<string, any> = {}

    if (metrics.value.FCP !== undefined) {
      summary.FCP = {
        value: Math.round(metrics.value.FCP),
        rating: getMetricRating('FCP', metrics.value.FCP),
        unit: 'ms'
      }
    }

    if (metrics.value.LCP !== undefined) {
      summary.LCP = {
        value: Math.round(metrics.value.LCP),
        rating: getMetricRating('LCP', metrics.value.LCP),
        unit: 'ms'
      }
    }

    if (metrics.value.FID !== undefined) {
      summary.FID = {
        value: Math.round(metrics.value.FID),
        rating: getMetricRating('FID', metrics.value.FID),
        unit: 'ms'
      }
    }

    if (metrics.value.CLS !== undefined) {
      summary.CLS = {
        value: metrics.value.CLS.toFixed(3),
        rating: getMetricRating('CLS', metrics.value.CLS),
        unit: 'score'
      }
    }

    if (metrics.value.TTFB !== undefined) {
      summary.TTFB = {
        value: Math.round(metrics.value.TTFB),
        rating: getMetricRating('TTFB', metrics.value.TTFB),
        unit: 'ms'
      }
    }

    return summary
  })

  // Log performance metrics to console (dev mode)
  const logPerformanceMetrics = () => {
    if (!process.client || process.env.NODE_ENV !== 'development') return

    console.group('🚀 Performance Metrics')
    const summary = getPerformanceSummary.value

    Object.entries(summary).forEach(([key, data]: [string, any]) => {
      const emoji = data.rating === 'good' ? '✅' : data.rating === 'needs-improvement' ? '⚠️' : '❌'
      console.log(`${emoji} ${key}: ${data.value}${data.unit} (${data.rating})`)
    })

    console.groupEnd()
  }

  // Send metrics to analytics (placeholder)
  const sendToAnalytics = (metricName: string, value: number) => {
    // TODO: Integrate with analytics service (Google Analytics, Plausible, etc.)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Analytics: ${metricName} = ${value}`)
    }
  }

  // Mark custom timing
  const markTiming = (name: string) => {
    if (!process.client || !checkSupport()) return
    performance.mark(name)
  }

  // Measure between two marks
  const measureBetween = (name: string, startMark: string, endMark: string) => {
    if (!process.client || !checkSupport()) return

    try {
      performance.measure(name, startMark, endMark)
      const measure = performance.getEntriesByName(name)[0]
      return measure.duration
    } catch (error) {
      console.error('Measure error:', error)
      return null
    }
  }

  // Clear all marks and measures
  const clearMetrics = () => {
    if (!process.client || !checkSupport()) return
    performance.clearMarks()
    performance.clearMeasures()
  }

  // Debounce helper for performance
  const debounce = <T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn(...args), delay)
    }
  }

  // Throttle helper for performance
  const throttle = <T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let lastCall = 0

    return (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCall >= delay) {
        lastCall = now
        fn(...args)
      }
    }
  }

  // Auto-start monitoring on client
  if (process.client) {
    onMounted(() => {
      startMonitoring()

      // Log metrics after 5 seconds (gives time for all metrics to collect)
      setTimeout(() => {
        logPerformanceMetrics()
      }, 5000)
    })
  }

  return {
    // State
    metrics: readonly(metrics),
    isSupported: readonly(isSupported),

    // Methods
    startMonitoring,
    getPerformanceSummary,
    logPerformanceMetrics,
    sendToAnalytics,
    markTiming,
    measureBetween,
    clearMetrics,

    // Helpers
    debounce,
    throttle,

    // Utils
    checkSupport,
    getMetricRating
  }
}
