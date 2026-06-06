/**
 * 性能监控工具
 */

// 测量组件渲染时间
export function measureRender(componentName) {
  if (import.meta.env.PROD) return { end: () => {} }

  const start = performance.now()
  return {
    end: () => {
      const duration = performance.now() - start
      console.log(`[Render] ${componentName}: ${duration.toFixed(2)}ms`)
    }
  }
}

// 测量函数执行时间
export function measurePerformance(fn, name = 'Function') {
  return function (...args) {
    const start = performance.now()
    const result = fn.apply(this, args)

    // 处理异步函数
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
      })
    }

    const duration = performance.now() - start
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    return result
  }
}

// Web Vitals 监控
export function observeWebVitals() {
  if (!('web-vitals' in window)) return

  // Largest Contentful Paint
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1]
    console.log('[Web Vitals] LCP:', lastEntry.startTime)
  }).observe({ entryTypes: ['largest-contentful-paint'] })

  // First Input Delay
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach((entry) => {
      console.log('[Web Vitals] FID:', entry.processingStart - entry.startTime)
    })
  }).observe({ entryTypes: ['first-input'] })

  // Cumulative Layout Shift
  let clsValue = 0
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach((entry) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value
      }
    })
    console.log('[Web Vitals] CLS:', clsValue)
  }).observe({ entryTypes: ['layout-shift'] })
}

// 长任务监控
export function observeLongTasks() {
  if (!('PerformanceObserver' in window)) return

  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach((entry) => {
      if (entry.duration > 50) {
        console.warn('[Long Task] 检测到长任务:', entry.duration.toFixed(2) + 'ms')
      }
    })
  }).observe({ entryTypes: ['longtask'] })
}

// 内存监控 (开发环境)
export function logMemoryUsage() {
  if (!performance.memory) return

  const used = performance.memory.usedJSHeapSize / 1048576
  const total = performance.memory.totalJSHeapSize / 1048576
  const limit = performance.memory.jsHeapSizeLimit / 1048576

  console.log(`[Memory] Used: ${used.toFixed(2)}MB / Total: ${total.toFixed(2)}MB / Limit: ${limit.toFixed(2)}MB`)
}
