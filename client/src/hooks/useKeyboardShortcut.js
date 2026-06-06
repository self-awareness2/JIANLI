import { useEffect } from 'react'

/**
 * 键盘快捷键 Hook
 * @param {string} key - 按键 (如 's', 'Enter')
 * @param {Function} callback - 回调函数
 * @param {Object} options - 配置 { ctrl?: boolean, meta?: boolean, shift?: boolean, alt?: boolean, preventDefault?: boolean }
 */
export function useKeyboardShortcut(key, callback, options = {}) {
  const { ctrl = false, meta = false, shift = false, alt = false, preventDefault = true } = options

  useEffect(() => {
    const handler = (e) => {
      const keyMatch = e.key.toLowerCase() === key.toLowerCase()
      const ctrlMatch = !ctrl || e.ctrlKey
      const metaMatch = !meta || e.metaKey
      const shiftMatch = !shift || e.shiftKey
      const altMatch = !alt || e.altKey

      if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
        if (preventDefault) {
          e.preventDefault()
        }
        callback(e)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, callback, ctrl, meta, shift, alt, preventDefault])
}

/**
 * 组合键 Hook - 监听多个快捷键
 * @param {Array} shortcuts - [{ key, callback, options }]
 */
export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handlers = shortcuts.map(({ key, callback, options = {} }) => {
      const { ctrl = false, meta = false, shift = false, alt = false, preventDefault = true } = options

      return (e) => {
        const keyMatch = e.key.toLowerCase() === key.toLowerCase()
        const ctrlMatch = !ctrl || e.ctrlKey
        const metaMatch = !meta || e.metaKey
        const shiftMatch = !shift || e.shiftKey
        const altMatch = !alt || e.altKey

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          if (preventDefault) {
            e.preventDefault()
          }
          callback(e)
        }
      }
    })

    handlers.forEach(h => window.addEventListener('keydown', h))
    return () => handlers.forEach(h => window.removeEventListener('keydown', h))
  }, [shortcuts])
}
