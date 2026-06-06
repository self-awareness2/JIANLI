/**
 * 全局错误处理中间件
 * 统一错误响应格式，自动捕获异步错误
 */

// 自定义错误类
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true // 标识是否为可预期的业务错误
    Error.captureStackTrace(this, this.constructor)
  }
}

// 常用错误快捷创建
export const Errors = {
  badRequest: (msg = '请求参数错误') => new AppError(msg, 400, 'BAD_REQUEST'),
  unauthorized: (msg = '未登录或Token无效') => new AppError(msg, 401, 'UNAUTHORIZED'),
  forbidden: (msg = '无权访问') => new AppError(msg, 403, 'FORBIDDEN'),
  notFound: (msg = '资源不存在') => new AppError(msg, 404, 'NOT_FOUND'),
  conflict: (msg = '资源冲突') => new AppError(msg, 409, 'CONFLICT'),
  tooManyRequests: (msg = '请求过于频繁') => new AppError(msg, 429, 'TOO_MANY_REQUESTS'),
  internal: (msg = '服务器内部错误') => new AppError(msg, 500, 'INTERNAL_ERROR'),
}

// 异步路由包装器 - 自动捕获 async 错误
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// 全局错误处理中间件
export function errorHandler(err, req, res, next) {
  // 默认错误信息
  let statusCode = err.statusCode || 500
  let message = err.message || '服务器内部错误'
  let code = err.code || 'INTERNAL_ERROR'

  // Prisma 错误处理
  if (err.code?.startsWith('P')) {
    switch (err.code) {
      case 'P2002':
        statusCode = 409
        message = '资源已存在'
        code = 'CONFLICT'
        break
      case 'P2025':
        statusCode = 404
        message = '资源不存在'
        code = 'NOT_FOUND'
        break
      case 'P2003':
        statusCode = 400
        message = '外键约束失败'
        code = 'FOREIGN_KEY_ERROR'
        break
      default:
        statusCode = 500
        message = '数据库操作失败'
        code = 'DATABASE_ERROR'
    }
  }

  // JWT 错误处理
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Token无效'
    code = 'INVALID_TOKEN'
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token已过期'
    code = 'TOKEN_EXPIRED'
  }

  // 开发环境打印详细错误
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', {
      code,
      statusCode,
      message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    })
  } else {
    // 生产环境只记录，不暴露内部错误
    console.error(`[Error] ${code}: ${message}`)
  }

  // 500 错误在生产环境隐藏详细信息
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = '服务器内部错误'
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  })
}

// 404 处理
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `无法找到 ${req.method} ${req.path}`,
    },
  })
}
