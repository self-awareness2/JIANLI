import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Check, Clock, Download, AlertCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { paymentAPI } from '../services/api.js'
import toast from 'react-hot-toast'
import { logger } from '../utils/logger.js'

// 显示支付二维码的弹窗，支付成功后通知父组件执行导出
export default function ExportPaymentModal({ resumeId, onClose, onExportComplete }) {
  const [step, setStep] = useState('loading') // loading | paying | success | error
  const [order, setOrder] = useState(null)
  const [countdown, setCountdown] = useState(300) // 5分钟倒计时
  const [qrData, setQrData] = useState(null)
  const [polling, setPolling] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const pollingRef = useRef(null)
  const countdownRef = useRef(null)
  const handledRef = useRef(false) // 防止重复触发导出

  // 创建支付订单
  const createOrder = useCallback(async () => {
    try {
      setStep('loading')
      setErrorMsg('')
      handledRef.current = false
      const { data } = await paymentAPI.createExportOrder(resumeId)

      setOrder({
        orderId: data.orderId,
        amount: data.amount,
        expiresAt: new Date(data.expiresAt),
      })
      setQrData(data.payData)

      // 计算剩余秒数
      const expiresTime = new Date(data.expiresAt).getTime()
      const now = Date.now()
      const remainingSeconds = Math.max(0, Math.floor((expiresTime - now) / 1000))
      setCountdown(remainingSeconds)

      setStep('paying')
      setPolling(true)
    } catch (err) {
      logger.error('Create order error:', err)
      setErrorMsg(err.response?.data?.error || '创建订单失败，请重试')
      setStep('error')
    }
  }, [resumeId])

  // 启动时创建订单
  useEffect(() => {
    createOrder()

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [createOrder])

  // 倒计时（只在进入 paying 时启动一次）
  useEffect(() => {
    if (step !== 'paying') return
    if (countdownRef.current) clearInterval(countdownRef.current)

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          setStep('error')
          setErrorMsg('订单已过期，请重新创建')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownRef.current)
  }, [step])

  // 轮询支付状态
  const checkPaymentStatus = useCallback(async () => {
    if (!order?.orderId || handledRef.current) return

    try {
      const { data } = await paymentAPI.checkOrderStatus(order.orderId)

      if (data.status === 'paid' && data.exportToken) {
        handledRef.current = true
        setPolling(false)
        if (countdownRef.current) clearInterval(countdownRef.current)
        setStep('success')

        // 提取令牌字符串，通知父组件执行导出
        const tokenStr = typeof data.exportToken === 'string'
          ? data.exportToken
          : data.exportToken?.token

        setTimeout(() => {
          onExportComplete?.(tokenStr)
        }, 1200)
      } else if (data.status === 'expired') {
        setPolling(false)
        if (countdownRef.current) clearInterval(countdownRef.current)
        setStep('error')
        setErrorMsg('订单已过期，请重新创建')
      }
    } catch (err) {
      logger.error('Check status error:', err)
    }
  }, [order?.orderId, onExportComplete])

  // 启动轮询
  useEffect(() => {
    if (!polling || step !== 'paying') return

    pollingRef.current = setInterval(checkPaymentStatus, 3000)

    return () => clearInterval(pollingRef.current)
  }, [polling, step, checkPaymentStatus])

  // 格式化倒计时
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60)
    const seconds = countdown % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // 模拟支付确认（沙箱/测试环境）
  const handleMockConfirm = async () => {
    if (!order?.orderId) return

    try {
      const { data } = await paymentAPI.confirmExportPayment(order.orderId)
      toast.success('支付已确认')

      // 如果确认接口直接返回令牌，直接处理
      if (data.exportToken && !handledRef.current) {
        handledRef.current = true
        setPolling(false)
        if (countdownRef.current) clearInterval(countdownRef.current)
        setStep('success')

        const tokenStr = typeof data.exportToken === 'string'
          ? data.exportToken
          : data.exportToken?.token

        setTimeout(() => {
          onExportComplete?.(tokenStr)
        }, 1200)
      }
    } catch (err) {
      toast.error(err.response?.data?.error || '确认支付失败')
    }
  }

  // 重新创建订单
  const handleRetry = () => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    setPolling(false)
    createOrder()
  }

  // 渲染支付宝二维码
  const renderQRCode = () => {
    if (!qrData) return null

    const qrValue = qrData.qrContent || qrData.qrUrl || ''

    return (
      <div className="relative">
        <div className="w-52 h-52 bg-white rounded-lg flex items-center justify-center border-2 border-blue-100 p-2">
          {qrValue ? (
            <QRCodeSVG
              value={qrValue}
              size={180}
              level="M"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          ) : (
            <div className="text-center text-gray-400">
              <div className="text-3xl mb-2">📱</div>
              <div className="text-xs">二维码加载中...</div>
            </div>
          )}
        </div>
        {qrData.sandbox && (
          <div className="mt-1 text-[10px] text-orange-500 text-center font-medium">
            [沙箱模式] 请点击下方模拟支付
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold">支付 ¥1.00 导出 PDF</h2>
          <p className="text-white/80 mt-1 text-xs">单次导出，无需开通会员</p>
        </div>

        <div className="p-6">
          {/* Loading */}
          {step === 'loading' && (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-sm">正在创建订单...</p>
            </div>
          )}

          {/* Paying */}
          {step === 'paying' && (
            <div className="text-center">
              {/* 倒计时 */}
              <div className="flex items-center justify-center gap-2 text-orange-500 text-sm font-medium mb-4">
                <Clock className="w-4 h-4" />
                <span>订单剩余时间: {formatCountdown()}</span>
              </div>

              {/* 二维码区域 */}
              <div className="flex justify-center mb-4">
                {renderQRCode()}
              </div>

              {/* 支付提示 */}
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-700">
                  请使用 <span className="font-semibold">支付宝</span> 扫码支付 ¥1.00
                </p>
              </div>

              {/* 金额显示 */}
              <div className="text-2xl font-bold text-gray-900 mb-6">
                ¥{order?.amount?.toFixed(2) || '1.00'}
              </div>

              {/* 模拟支付按钮（沙箱/测试用） */}
              {import.meta.env.DEV && (
                <button
                  onClick={handleMockConfirm}
                  className="text-xs text-gray-400 underline hover:text-gray-600"
                >
                  [沙箱] 模拟支付完成
                </button>
              )}
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">支付成功！</h3>
              <p className="text-gray-500 text-sm mb-4">正在为您生成 PDF...</p>

              <div className="flex items-center justify-center gap-2 text-blue-600">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">生成中...</span>
              </div>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">出错了</h3>
              <p className="text-red-500 text-sm mb-6">{errorMsg || '订单处理失败'}</p>

              <button
                onClick={handleRetry}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
              >
                重新创建订单
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
