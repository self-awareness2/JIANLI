import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FileText, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { authAPI } from '../services/api.js'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('请填写邮箱和密码')
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success('登录成功')
      navigate('/dashboard/resumes')
    } catch (err) {
      toast.error(err.response?.data?.error || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
          <p className="text-gray-500 mt-1">登录 匠芯简历 继续创建您的简历</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入邮箱"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入密码"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition shadow-md disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>

          <p className="text-center text-sm text-gray-500">
            还没有账号？
            <Link to="/register" className="text-blue-600 hover:underline ml-1">立即注册</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
