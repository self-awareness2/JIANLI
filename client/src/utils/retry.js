/**
 * 带重试的异步函数包装器
 * @param {Function} fn - 要执行的异步函数
 * @param {Object} options - 配置选项
 * @param {number} options.maxRetries - 最大重试次数 (默认 3)
 * @param {number} options.retryDelay - 重试延迟基数 ms (默认 1000)
 * @param {Function} options.shouldRetry - 判断是否重试的函数 (error) => boolean
 */
export async function withRetry(fn, options = {}) {
  const { maxRetries = 3, retryDelay = 1000, shouldRetry = () => true } = options

  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // 最后一次尝试失败，抛出错误
      if (attempt === maxRetries) {
        throw lastError
      }

      // 判断是否应该重试
      if (!shouldRetry(error)) {
        throw error
      }

      // 指数退避延迟
      const delay = retryDelay * Math.pow(2, attempt)
      await sleep(delay)
    }
  }

  throw lastError
}

/**
 * 延迟函数
 * @param {number} ms - 延迟毫秒数
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 防抖函数 (适用于普通函数)
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟时间 ms
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

/**
 * 节流函数
 * @param {Function} fn - 要节流的函数
 * @param {number} limit - 限制时间 ms
 */
export function throttle(fn, limit = 300) {
  let inThrottle = false
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 请求合并器 - 将短时间内的相同请求合并
 */
export class RequestDeduplicator {
  constructor() {
    this.pending = new Map()
  }

  async execute(key, requestFn) {
    // 如果已有相同请求在进行中，复用其 Promise
    if (this.pending.has(key)) {
      return this.pending.get(key)
    }

    // 创建新请求
    const promise = requestFn().finally(() => {
      this.pending.delete(key)
    })

    this.pending.set(key, promise)
    return promise
  }
}
