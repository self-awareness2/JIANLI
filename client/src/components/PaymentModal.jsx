import { useState } from 'react'
import { X, CreditCard, Check, Sparkles } from 'lucide-react'
import { paymentAPI } from '../services/api.js'
import toast from 'react-hot-toast'

export default function PaymentModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [paymentId, setPaymentId] = useState(null)
  const [step, setStep] = useState('plan') // plan | paying | success

  const handleCreateOrder = async () => {
    setLoading(true)
    try {
      const { data } = await paymentAPI.createOrder(29.9)
      setPaymentId(data.payment.id)
      setStep('paying')
    } catch (err) {
      toast.error('创建订单失败')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    setLoading(true)
    try {
      await paymentAPI.confirmPayment(paymentId)
      setStep('success')
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      user.isPaid = true
      localStorage.setItem('user', JSON.stringify(user))
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1500)
    } catch (err) {
      toast.error('确认支付失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <Sparkles className="w-8 h-8 mb-2" />
          <h2 className="text-xl font-bold">升级 匠芯简历 Pro</h2>
          <p className="text-white/80 mt-1 text-sm">解锁PDF导出及更多高级功能</p>
        </div>

        <div className="p-6">
          {step === 'plan' && (
            <>
              {/* Features */}
              <div className="space-y-3 mb-6">
                {[
                  '无限次PDF高质量导出',
                  '所有简历模板解锁',
                  '去除水印',
                  '优先客服支持',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
                <div className="text-3xl font-bold text-gray-900">
                  ¥29.9
                  <span className="text-sm font-normal text-gray-500 ml-1">/永久</span>
                </div>
                <div className="text-xs text-gray-400 mt-1 line-through">原价 ¥99</div>
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition shadow-md disabled:opacity-50"
              >
                {loading ? '处理中...' : '立即购买'}
              </button>
            </>
          )}

          {step === 'paying' && (
            <div className="text-center py-4">
              <CreditCard className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">模拟支付</h3>
              <p className="text-gray-500 text-sm mb-6">在生产环境中，这里将显示微信/支付宝二维码</p>
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition shadow-md disabled:opacity-50"
              >
                {loading ? '确认中...' : '模拟支付完成'}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">支付成功！</h3>
              <p className="text-gray-500 text-sm">您已解锁所有高级功能</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
