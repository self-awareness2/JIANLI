// 统一日志管理 - 生产环境自动禁用
const isDev = import.meta.env.DEV

export const logger = {
  log: (...args) => isDev && console.log(...args),
  warn: (...args) => isDev && console.warn(...args),
  error: (...args) => isDev && console.error(...args),
  info: (...args) => isDev && console.info(...args),
}

// 用于捕获并上报生产环境错误（可接入 Sentry 等服务）
export function reportError(error, context = {}) {
  if (isDev) {
    console.error('[Error Report]', error, context)
    return
  }
  // 生产环境可接入错误上报服务
  // Sentry.captureException(error, { extra: context })
}
