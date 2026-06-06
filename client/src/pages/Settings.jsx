import { useState, useEffect } from 'react'
import { User, Mail, Lock, Save } from 'lucide-react'
import Sidebar from '../components/Sidebar.jsx'
import { authAPI } from '../services/api.js'
import toast from 'react-hot-toast'

export default function Settings() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const { data } = await authAPI.getMe()
      setUser(data.user)
      setName(data.user.name || '')
    } catch (err) {
      toast.error('加载用户信息失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    localStorage.setItem('user', JSON.stringify({ ...user, name }))
    toast.success('已保存（本地）')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1 ml-16 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 ml-16">
        <div className="max-w-2xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">个人设置</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Avatar placeholder */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              {(user?.name || user?.email || 'U')[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{user?.name || '未设置昵称'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <User className="w-4 h-4 inline mr-1.5" />昵称
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="设置您的昵称"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <Mail className="w-4 h-4 inline mr-1.5" />邮箱
          </label>
          <input
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
          />
        </div>

        {/* Account status */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">账户状态</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {user?.isPaid ? '已付费 · 可导出PDF' : '免费版 · 付费后可导出PDF'}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              user?.isPaid
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {user?.isPaid ? 'PRO' : '免费'}
            </span>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition text-sm font-medium"
        >
          <Save className="w-4 h-4" />
          <span>保存</span>
        </button>
      </div>
        </div>
      </main>
    </div>
  )
}
