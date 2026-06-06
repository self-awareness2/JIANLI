import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Flame, ArrowRight, Eye, Download, Briefcase, GraduationCap,
  Palette, TrendingUp, Heart, Wrench, Users, BookOpen, Sparkles, X
} from 'lucide-react'
import Sidebar from '../components/Sidebar.jsx'
import GalleryPreviewModal from '../components/GalleryPreviewModal.jsx'
import { galleryAPI } from '../services/api.js'
import toast from 'react-hot-toast'

const CATEGORY_ICONS = {
  '全部': Sparkles,
  '互联网/IT': Wrench,
  '金融': TrendingUp,
  '设计': Palette,
  '市场/运营': TrendingUp,
  '教育': BookOpen,
  '医疗/健康': Heart,
  '人力资源': Users,
  '制造/工程': Briefcase,
  '应届生/实习': GraduationCap,
}

const CATEGORY_COLORS = {
  '全部': 'from-blue-500 to-indigo-500',
  '互联网/IT': 'from-blue-500 to-cyan-500',
  '金融': 'from-slate-700 to-slate-900',
  '设计': 'from-pink-500 to-rose-500',
  '市场/运营': 'from-amber-500 to-orange-500',
  '教育': 'from-teal-500 to-cyan-500',
  '医疗/健康': 'from-red-500 to-rose-500',
  '人力资源': 'from-emerald-500 to-teal-500',
  '制造/工程': 'from-gray-500 to-slate-600',
  '应届生/实习': 'from-indigo-500 to-purple-500',
}

export default function Gallery() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [previewId, setPreviewId] = useState(null)
  const [usingId, setUsingId] = useState(null)

  useEffect(() => {
    loadTemplates()
  }, [activeCategory])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const { data } = await galleryAPI.list(activeCategory)
      setTemplates(data.templates)
      if (data.categories?.length) setCategories(data.categories)
    } catch (err) {
      toast.error('加载模板失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUseTemplate = async (templateId) => {
    try {
      setUsingId(templateId)
      const { data } = await galleryAPI.use(templateId)
      toast.success('模板已导入到我的简历！')
      navigate(`/dashboard/editor/${data.resume.id}`)
    } catch (err) {
      toast.error('导入模板失败')
    } finally {
      setUsingId(null)
    }
  }

  const filtered = searchQuery
    ? templates.filter(t =>
        t.title.includes(searchQuery) ||
        t.description.includes(searchQuery) ||
        t.tags?.some(tag => tag.includes(searchQuery))
      )
    : templates

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-16">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white">
          <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">简历广场</h1>
            </div>
            <p className="text-blue-100 text-sm max-w-lg">
              精选各行各业优质简历模板，一键导入即可编辑。让你的简历制作更高效，求职更成功。
            </p>

            {/* Search bar */}
            <div className="mt-6 relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索职位、行业、技能..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-white/50 hover:text-white" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center gap-1 py-2 overflow-x-auto no-scrollbar">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat] || Sparkles
                const isActive = activeCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="max-w-6xl mx-auto px-6 py-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3 mb-4" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-100 rounded-full w-12" />
                    <div className="h-6 bg-gray-100 rounded-full w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">没有找到匹配的模板</p>
              <p className="text-gray-400 text-xs mt-1">试试其他关键词或分类</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((tpl) => {
                const gradientClass = CATEGORY_COLORS[tpl.category] || 'from-gray-500 to-gray-600'
                return (
                  <div
                    key={tpl.id}
                    className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    {/* Card top accent */}
                    <div className={`h-1.5 bg-gradient-to-r ${gradientClass}`} />

                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-[15px] font-bold text-gray-800 truncate">{tpl.title}</h3>
                            {tpl.hot && (
                              <span className="flex items-center gap-0.5 text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                <Flame className="w-3 h-3" /> 热门
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{tpl.category}</p>
                        </div>
                        <div
                          className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: tpl.themeColor + '15', color: tpl.themeColor }}
                        >
                          {(CATEGORY_ICONS[tpl.category] || Briefcase) === Briefcase
                            ? <Briefcase className="w-4 h-4" />
                            : (() => { const I = CATEGORY_ICONS[tpl.category]; return <I className="w-4 h-4" /> })()
                          }
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{tpl.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {tpl.tags?.slice(0, 4).map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: tpl.themeColor + '10', color: tpl.themeColor }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Section indicators */}
                      <div className="flex items-center gap-1 mb-4">
                        {tpl.sectionTypes?.map((st, i) => {
                          const labels = { personal: '基', education: '学', work: '工', project: '项', skill: '技', summary: '总' }
                          return (
                            <div
                              key={i}
                              className="w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center"
                              style={{ backgroundColor: tpl.themeColor + '12', color: tpl.themeColor }}
                              title={st}
                            >
                              {labels[st] || '?'}
                            </div>
                          )
                        })}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewId(tpl.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          预览
                        </button>
                        <button
                          onClick={() => handleUseTemplate(tpl.id)}
                          disabled={usingId === tpl.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-white text-xs font-medium transition hover:opacity-90 active:scale-95 disabled:opacity-60"
                          style={{ backgroundColor: tpl.themeColor }}
                        >
                          {usingId === tpl.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          {usingId === tpl.id ? '导入中...' : '使用模板'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewId && (
        <GalleryPreviewModal
          templateId={previewId}
          onClose={() => setPreviewId(null)}
          onUse={() => { handleUseTemplate(previewId); setPreviewId(null) }}
        />
      )}
    </div>
  )
}
