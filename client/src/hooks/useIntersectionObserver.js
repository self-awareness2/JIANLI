import { useEffect, useRef, useState } from 'react'

/**
 *  intersectionObserver Hook - 用于懒加载、无限滚动等
 * @param {Object} options - IntersectionObserver 配置
 * @param {boolean} options.triggerOnce - 是否只触发一次 (默认 true)
 */
export function useIntersectionObserver(options = {}) {
  const { threshold = 0, root = null, rootMargin = '0px', triggerOnce = true } = options
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const targetRef = useRef(null)

  useEffect(() => {
    const element = targetRef.current
    if (!element) return

    // 如果已经触发过且只触发一次，不再观察
    if (triggerOnce && hasTriggered) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          if (triggerOnce) {
            setHasTriggered(true)
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false)
        }
      },
      { threshold, root, rootMargin }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [threshold, root, rootMargin, triggerOnce, hasTriggered])

  return { targetRef, isIntersecting, hasTriggered }
}

/**
 * 懒加载图片 Hook
 * @param {string} src - 图片地址
 * @param {string} placeholder - 占位图
 */
export function useLazyImage(src, placeholder = '') {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  const { targetRef, isIntersecting } = useIntersectionObserver({ triggerOnce: true })

  useEffect(() => {
    if (!isIntersecting || !src) return

    const img = new Image()
    img.src = src
    img.onload = () => {
      setImageSrc(src)
      setIsLoaded(true)
    }
    img.onerror = () => {
      setImageSrc(placeholder)
      setIsLoaded(false)
    }
  }, [isIntersecting, src, placeholder])

  return { targetRef, imageSrc, isLoaded }
}
