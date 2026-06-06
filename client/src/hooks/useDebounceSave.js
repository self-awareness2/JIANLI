import { useState, useRef, useCallback } from 'react'
import { logger } from '../utils/logger.js'

/**
 * 防抖保存 Hook
 * @param {Function} saveFn - 保存函数 (data) => Promise
 * @param {number} delay - 防抖延迟(ms)
 * @returns {Object} { saveStatus, setUnsaved, triggerSave }
 */
export function useDebounceSave(saveFn, delay = 800) {
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved' | 'unsaved' | 'saving'
  const timerRef = useRef(null)
  const pendingDataRef = useRef(null)

  const setUnsaved = useCallback(() => {
    setSaveStatus('unsaved')
  }, [])

  const triggerSave = useCallback(async (data) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    pendingDataRef.current = data
    setSaveStatus('unsaved')

    timerRef.current = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        await saveFn(pendingDataRef.current)
        setSaveStatus('saved')
      } catch (err) {
        logger.error('Debounce save failed:', err)
        setSaveStatus('unsaved')
      }
    }, delay)
  }, [saveFn, delay])

  const cancelSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return {
    saveStatus,
    setUnsaved,
    triggerSave,
    cancelSave,
  }
}
