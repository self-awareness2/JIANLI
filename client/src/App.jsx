import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AIChatWidget from './components/AIChatWidget.jsx'

// 路由懒加载 - 减少首屏加载时间
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Editor = lazy(() => import('./pages/Editor.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const Agent = lazy(() => import('./pages/Agent.jsx'))
const Gallery = lazy(() => import('./pages/Gallery.jsx'))

// 页面加载占位组件
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full" />
    </div>
  )
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function GlobalAIChatWidget() {
  const location = useLocation()
  const token = localStorage.getItem('token')
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  if (!token || isAuthPage) return null
  return <AIChatWidget />
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard/resumes" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/dashboard/editor/:id" element={<PrivateRoute><Editor /></PrivateRoute>} />
        <Route path="/dashboard/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/dashboard/agent" element={<PrivateRoute><Agent /></PrivateRoute>} />
        <Route path="/dashboard/gallery" element={<PrivateRoute><Gallery /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard/resumes" />} />
      </Routes>
      <GlobalAIChatWidget />
    </Suspense>
  )
}
