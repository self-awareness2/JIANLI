import { useLocation, useNavigate } from 'react-router-dom'
import { FileText, Home, Settings, LogOut, User, LayoutGrid } from 'lucide-react'

const navItems = [
  { icon: Home, path: '/dashboard/resumes', label: '首页' },
  { icon: LayoutGrid, path: '/dashboard/gallery', label: '广场' },
  { icon: User, path: '/dashboard/settings', label: '设置' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 fixed left-0 top-0 h-full z-40">
      {/* Logo */}
      <div
        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center cursor-pointer mb-6"
        onClick={() => navigate('/dashboard/resumes')}
      >
        <span className="text-white font-bold text-xs">匠芯</span>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col items-center space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.label}
              onClick={() => item.path !== '#' && navigate(item.path)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all mb-2"
        title="退出登录"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </aside>
  )
}
