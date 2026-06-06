import { useState, useCallback } from 'react'

/**
 * 异步加载状态管理 Hook
 * @returns {Object} { loading, error, execute, setLoading, setError }
 */
export function useAsyncLoading() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (asyncFn, options = {}) => {
    const { onSuccess, onError, silent = false } = options

    setLoading(true)
    setError(null)

    try {
      const result = await asyncFn()
      onSuccess?.(result)
      return result
    } catch (err) {
      setError(err)
      onError?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    execute,
    setLoading,
    setError,
  }
}

/**
 * 带缓存的数据获取 Hook
 * @param {Function} fetchFn - 获取数据的函数
 * @param {Array} deps - 依赖数组
 * @param {Object} options - 配置选项
 */
export function useFetchWithCache(fetchFn, deps = [], options = {}) {
  const { ttl = 60000, enabled = true } = options // 默认缓存60秒
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const cacheRef = useRef({ timestamp: 0, data: null })

  useEffect(() => {
    if (!enabled) return

    const now = Date.now()
    if (cacheRef.current.data && (now - cacheRef.current.timestamp) < ttl) {
      setData(cacheRef.current.data)
      return
    }

    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchFn()
        cacheRef.current = { timestamp: now, data: result }
        setData(result)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, deps)

  const refresh = useCallback(() => {
    cacheRef.current = { timestamp: 0, data: null }
    // 重新触发 useEffect
  }, [])

  return { data, loading, error, refresh }
}
