import { useState, useMemo } from 'react'
import { X, Check, Star, Search, Sparkles, Layout, User, Crown, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import ModernTemplate from '../templates/ModernTemplate.jsx'
import ProfessionalTemplate from '../templates/ProfessionalTemplate.jsx'
import MinimalTemplate from '../templates/MinimalTemplate.jsx'
import ElegantTemplate from '../templates/ElegantTemplate.jsx'
import CreativeTemplate from '../templates/CreativeTemplate.jsx'
import ExecutiveTemplate from '../templates/ExecutiveTemplate.jsx'
import SidebarTemplate from '../templates/SidebarTemplate.jsx'
import CompactTemplate from '../templates/CompactTemplate.jsx'
import TimelineTemplate from '../templates/TimelineTemplate.jsx'

// 模板数据 - 增加了标签、描述、适用场景
const ALL_TEMPLATES = [
  {
    id: 'modern',
    name: '现代简约',
    vip: false,
    color: '#1a1a1a',
    layout: 'left-header',
    style: '简约',
    scene: '通用',
    target: '全部',
    description: '清晰的分区设计，适合大多数岗位',
    tags: ['经典', '易读', '专业'],
  },
  {
    id: 'professional',
    name: '专业商务',
    vip: false,
    color: '#0f766e',
    layout: 'center-header',
    style: '商务',
    scene: '求职',
    target: '资深',
    description: '居中式头部设计，稳重大气',
    tags: ['商务', '稳重', '管理岗'],
  },
  {
    id: 'minimal',
    name: '极简风格',
    vip: false,
    color: '#525252',
    layout: 'left-header',
    style: '简约',
    scene: '通用',
    target: '全部',
    description: '留白充足，突出核心内容',
    tags: ['极简', '清晰', '设计感'],
  },
  {
    id: 'elegant',
    name: '优雅经典',
    vip: false,
    color: '#b45309',
    layout: 'center-header',
    style: '优雅',
    scene: '求职',
    target: '资深',
    description: '暖色调设计，适合传统行业',
    tags: ['经典', '优雅', '金融'],
  },
  {
    id: 'creative',
    name: '创意设计',
    vip: false,
    color: '#7c3aed',
    layout: 'left-header',
    style: '创意',
    scene: '设计',
    target: '年轻',
    description: '个性化配色，适合设计师',
    tags: ['创意', '设计', '个性'],
  },
  {
    id: 'sidebar',
    name: '侧边栏双栏',
    vip: false,
    color: '#2563eb',
    layout: 'sidebar',
    style: '现代',
    scene: '技术',
    target: '全部',
    description: '左右分栏，信息密度高',
    tags: ['技术', '信息多', '现代'],
  },
  {
    id: 'compact',
    name: '紧凑双栏',
    vip: false,
    color: '#0f766e',
    layout: 'sidebar',
    style: '简约',
    scene: '技术',
    target: '全部',
    description: '紧凑型布局，一页呈现丰富内容',
    tags: ['紧凑', '一页', '技术'],
  },
  {
    id: 'executive',
    name: '行政精英',
    vip: false,
    color: '#1e293b',
    layout: 'center-header',
    style: '商务',
    scene: '管理',
    target: '高管',
    description: '高管风格，彰显领导力',
    tags: ['高管', '领导', '管理'],
  },
  {
    id: 'timeline',
    name: '时间线',
    vip: false,
    color: '#6366f1',
    layout: 'timeline',
    style: '现代',
    scene: '通用',
    target: '年轻',
    description: '时间轴设计，展示成长轨迹',
    tags: ['时间线', '成长', '创意'],
  },
  // VIP 模板
  {
    id: 'classic',
    name: '经典标准',
    vip: true,
    color: '#1e293b',
    layout: 'left-header',
    style: '经典',
    scene: '通用',
    target: '全部',
    description: '传统标准格式，HR最熟悉',
    tags: ['标准', '传统', '通用'],
  },
  {
    id: 'clean',
    name: '清新简洁',
    vip: true,
    color: '#2563eb',
    layout: 'left-header',
    style: '简约',
    scene: '校招',
    target: '应届生',
    description: '清爽蓝色调，适合应届生',
    tags: ['清新', '校招', '蓝色'],
  },
  {
    id: 'student',
    name: '校园清新',
    vip: true,
    color: '#3b82f6',
    layout: 'center-header',
    style: '清新',
    scene: '校招',
    target: '应届生',
    description: '活泼但不失专业，适合校招',
    tags: ['校园', '校招', '活力'],
  },
  {
    id: 'graduate',
    name: '应届毕业',
    vip: true,
    color: '#6366f1',
    layout: 'left-header',
    style: '简约',
    scene: '校招',
    target: '应届生',
    description: '为应届生优化的简洁模板',
    tags: ['应届', '校招', '简洁'],
  },
  {
    id: 'campus',
    name: '校招精选',
    vip: true,
    color: '#8b5cf6',
    layout: 'left-header',
    style: '现代',
    scene: '校招',
    target: '应届生',
    description: '大厂校招通关模板',
    tags: ['校招', '精选', '大厂'],
  },
  {
    id: 'intern',
    name: '实习专用',
    vip: true,
    color: '#a855f7',
    layout: 'center-header',
    style: '简约',
    scene: '实习',
    target: '学生',
    description: '突出实习经历和项目经验',
    tags: ['实习', '学生', '项目'],
  },
  {
    id: 'formal',
    name: '正式商务',
    vip: true,
    color: '#92400e',
    layout: 'left-header',
    style: '正式',
    scene: '求职',
    target: '资深',
    description: '正式商务风格，适合传统行业',
    tags: ['正式', '商务', '传统'],
  },
  {
    id: 'tech',
    name: '科技简约',
    vip: true,
    color: '#0891b2',
    layout: 'left-header',
    style: '科技',
    scene: '技术',
    target: '全部',
    description: '科技感配色，适合互联网/技术岗',
    tags: ['科技', '互联网', '现代'],
  },
]

// 筛选选项
const STYLE_FILTERS = ['全部', '简约', '商务', '优雅', '创意', '科技', '经典', '清新']
const SCENE_FILTERS = ['全部', '通用', '求职', '校招', '实习', '技术', '管理', '设计']
const TARGET_FILTERS = ['全部', '应届生', '年轻', '资深', '高管', '学生']

export function getAllTemplateIds() {
  return ALL_TEMPLATES.map(t => t.id)
}

export function getTemplateById(id) {
  return ALL_TEMPLATES.find(t => t.id === id) || ALL_TEMPLATES[0]
}

export function getTemplateName(id) {
  const t = ALL_TEMPLATES.find(t => t.id === id)
  return t?.name || '现代简约'
}

export function getTemplateColor(id) {
  const t = ALL_TEMPLATES.find(t => t.id === id)
  return t?.color || '#1a1a1a'
}

export default function TemplateSelector({ currentTemplate, onSelect, onClose, isPaid, resumeData }) {
  const [hoveredId, setHoveredId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [styleFilter, setStyleFilter] = useState('全部')
  const [sceneFilter, setSceneFilter] = useState('全部')
  const [targetFilter, setTargetFilter] = useState('全部')

  // 筛选模板
  const filteredTemplates = useMemo(() => {
    return ALL_TEMPLATES.filter(t => {
      if (searchQuery && !t.name.includes(searchQuery) && !t.tags.some(tag => tag.includes(searchQuery))) {
        return false
      }
      if (styleFilter !== '全部' && t.style !== styleFilter) return false
      if (sceneFilter !== '全部' && t.scene !== sceneFilter) return false
      if (targetFilter !== '全部' && t.target !== targetFilter && t.target !== '全部') return false
      return true
    })
  }, [searchQuery, styleFilter, sceneFilter, targetFilter])

  // 获取当前预览的模板
  const previewTemplateId = hoveredId || currentTemplate
  const previewTemplate = getTemplateById(previewTemplateId)

  const handleSelect = (template) => {
    if (template.vip && !isPaid) {
      toast('该模板需要 VIP 解锁', { icon: '🔒' })
      return
    }
    onSelect(template.id)
    toast.success(`已切换到「${template.name}」模板`)
  }

  // 筛选按钮组件
  const FilterButton = ({ options, value, onChange, icon: Icon, label }) => (
    <div className="flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-2 py-0.5 text-xs rounded-full transition ${
              value === opt
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex-1 h-full flex items-center justify-center p-4">
        {/* Main Panel */}
        <div className="bg-white rounded-2xl shadow-2xl flex overflow-hidden max-w-6xl w-full max-h-[90vh]">
          
          {/* Left Side - Template Selection */}
          <div className="w-[480px] flex flex-col border-r border-gray-100">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layout className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-bold text-gray-900">选择模板</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索模板名称或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="px-6 py-3 border-b border-gray-100 space-y-2 bg-gray-50/50">
              <FilterButton 
                options={STYLE_FILTERS} 
                value={styleFilter} 
                onChange={setStyleFilter}
                icon={Sparkles}
                label="风格"
              />
              <FilterButton 
                options={SCENE_FILTERS} 
                value={sceneFilter} 
                onChange={setSceneFilter}
                icon={Layout}
                label="场景"
              />
              <FilterButton 
                options={TARGET_FILTERS} 
                value={targetFilter} 
                onChange={setTargetFilter}
                icon={User}
                label="适用"
              />
            </div>

            {/* Template Grid */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-2 gap-3">
                {filteredTemplates.map((template) => {
                  const isActive = currentTemplate === template.id
                  const isHovered = hoveredId === template.id
                  const isLocked = template.vip && !isPaid

                  return (
                    <button
                      key={template.id}
                      onClick={() => handleSelect(template)}
                      onMouseEnter={() => setHoveredId(template.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${
                        isActive
                          ? 'border-blue-500 shadow-md shadow-blue-100'
                          : isHovered
                            ? 'border-gray-300 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                      } ${isLocked ? 'opacity-75' : ''}`}
                    >
                      {/* VIP badge */}
                      {template.vip && (
                        <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                          <Crown className="w-3 h-3" />
                          VIP
                        </div>
                      )}

                      {/* Selected overlay */}
                      {isActive && (
                        <div className="absolute inset-0 bg-blue-500/10 z-10 flex items-center justify-center">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Thumbnail */}
                      <div className="aspect-[4/3] bg-white p-3">
                        <TemplateThumbnail template={template} />
                      </div>

                      {/* Info */}
                      <div className="px-3 py-2.5 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-800">{template.name}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                            {template.style}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1">{template.description}</p>
                        {/* Tags */}
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {template.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] text-gray-400">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
              
              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">没有找到匹配的模板</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setStyleFilter('全部'); setSceneFilter('全部'); setTargetFilter('全部') }}
                    className="text-blue-500 text-sm mt-2 hover:underline"
                  >
                    清除筛选条件
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="flex-1 flex flex-col bg-gray-50">
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">实时预览</h3>
                <span className="text-sm text-gray-500">- {previewTemplate.name}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                使用你的简历数据实时渲染，悬停左侧模板即可预览效果
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-[210mm] mx-auto min-h-[297mm]">
                <TemplatePreview 
                  templateId={previewTemplateId}
                  resumeData={resumeData}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TemplateThumbnail({ template }) {
  const c = template.color
  const layout = template.layout

  // 侧边栏布局
  if (layout === 'sidebar') {
    return (
      <div className="w-full h-full bg-white border border-gray-100 rounded-sm p-2 flex gap-2">
        <div className="w-1/3 bg-gray-50 rounded p-1.5 flex flex-col gap-1">
          <div className="w-6 h-6 rounded-full mx-auto mb-1" style={{ backgroundColor: c, opacity: 0.2 }} />
          <div className="w-full h-1 rounded" style={{ backgroundColor: c, opacity: 0.5 }} />
          <div className="w-3/4 h-0.5 rounded bg-gray-300" />
          <div className="w-1/2 h-0.5 rounded bg-gray-300" />
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="w-8 h-1 rounded mb-0.5" style={{ backgroundColor: c, opacity: 0.5 }} />
              <div className="space-y-[2px]">
                <div className="w-full h-[2px] rounded bg-gray-100" />
                <div className="w-3/4 h-[2px] rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 时间线布局
  if (layout === 'timeline') {
    return (
      <div className="w-full h-full bg-white border border-gray-100 rounded-sm p-2 flex flex-col">
        <div className="flex flex-col items-center mb-2">
          <div className="w-8 h-1.5 rounded-sm mb-0.5" style={{ backgroundColor: c }} />
          <div className="w-full h-[1px] mt-1" style={{ backgroundColor: c, opacity: 0.3 }} />
        </div>
        <div className="flex-1 relative pl-3">
          <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ backgroundColor: c, opacity: 0.3 }} />
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative mb-2">
              <div className="absolute -left-3 top-0.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c }} />
              <div className="w-5 h-1 rounded mb-0.5" style={{ backgroundColor: c, opacity: 0.5 }} />
              <div className="w-full h-[2px] rounded bg-gray-100 mb-0.5" />
              <div className="w-2/3 h-[2px] rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 居中头部布局
  const isCenter = layout === 'center-header'
  return (
    <div className="w-full h-full bg-white border border-gray-100 rounded-sm p-2 flex flex-col">
      {/* Header */}
      {isCenter ? (
        <div className="flex flex-col items-center mb-2">
          <div className="w-8 h-1.5 rounded-sm mb-0.5" style={{ backgroundColor: c }} />
          <div className="w-6 h-1 rounded-sm bg-gray-200" />
          <div className="flex gap-1 mt-1">
            <div className="w-3 h-0.5 rounded bg-gray-200" />
            <div className="w-3 h-0.5 rounded bg-gray-200" />
            <div className="w-3 h-0.5 rounded bg-gray-200" />
          </div>
          <div className="w-full h-[0.5px] mt-1.5" style={{ backgroundColor: c, opacity: 0.3 }} />
        </div>
      ) : (
        <div className="mb-2">
          <div className="w-8 h-1.5 rounded-sm mb-0.5" style={{ backgroundColor: c }} />
          <div className="w-6 h-1 rounded-sm bg-gray-200" />
          <div className="flex gap-1 mt-1">
            <div className="w-3 h-0.5 rounded bg-gray-200" />
            <div className="w-3 h-0.5 rounded bg-gray-200" />
          </div>
          <div className="w-full h-[1px] mt-1.5" style={{ backgroundColor: c }} />
        </div>
      )}

      {/* Sections */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-1.5">
          <div className="w-5 h-1 rounded-sm mb-0.5" style={{ backgroundColor: c, opacity: 0.5 }} />
          <div className="space-y-[2px]">
            <div className="w-full h-[2px] rounded bg-gray-100" />
            <div className="w-4/5 h-[2px] rounded bg-gray-100" />
            <div className="w-3/5 h-[2px] rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

// 模板预览组件 - 实时渲染
function TemplatePreview({ templateId, resumeData }) {
  const { personal = {}, sections = [] } = resumeData || {}
  
  const personalSection = sections.find(s => s.type === 'personal')
  const otherSections = sections.filter(s => s.type !== 'personal')

  // 按 order 排序
  const sortedSections = [...otherSections].sort((a, b) => a.order - b.order)

  const templateProps = {
    personal,
    otherSections: sortedSections,
    personalSectionId: personalSection?.id,
    themeColor: getTemplateColor(templateId),
    onClickSection: () => {},
    activeSection: null,
  }

  // 根据模板ID返回对应组件
  switch (templateId) {
    case 'modern':
    case 'classic':
    case 'clean':
    case 'campus':
      return <ModernTemplate {...templateProps} />
    case 'professional':
    case 'formal':
      return <ProfessionalTemplate {...templateProps} />
    case 'minimal':
    case 'graduate':
      return <MinimalTemplate {...templateProps} />
    case 'elegant':
    case 'student':
      return <ElegantTemplate {...templateProps} />
    case 'creative':
      return <CreativeTemplate {...templateProps} />
    case 'executive':
    case 'tech':
      return <ExecutiveTemplate {...templateProps} />
    case 'sidebar':
      return <SidebarTemplate {...templateProps} />
    case 'compact':
      return <CompactTemplate {...templateProps} />
    case 'timeline':
    case 'intern':
      return <TimelineTemplate {...templateProps} />
    default:
      return <ModernTemplate {...templateProps} />
  }
}
