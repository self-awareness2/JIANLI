import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FileText, Save, CheckCircle, User, GraduationCap, ArrowLeft,
  Briefcase, Folder, Wrench, PlusCircle, ChevronDown,
  Trash2, ZoomIn, ZoomOut, Maximize2, Eye
} from 'lucide-react'
import EditorToolbar from '../components/EditorToolbar.jsx'
import ResumePreview from '../components/ResumePreview.jsx'
import PersonalPanel from '../components/panels/PersonalPanel.jsx'
import EducationPanel from '../components/panels/EducationPanel.jsx'
import WorkPanel from '../components/panels/WorkPanel.jsx'
import ProjectPanel from '../components/panels/ProjectPanel.jsx'
import SkillPanel from '../components/panels/SkillPanel.jsx'
import SummaryPanel from '../components/panels/SummaryPanel.jsx'
import PaymentModal from '../components/PaymentModal.jsx'
import ExportPaymentModal from '../components/ExportPaymentModal.jsx'
import TemplateSelector from '../components/TemplateSelector.jsx'
import ModuleOrderPanel from '../components/ModuleOrderPanel.jsx'
import { resumeAPI, sectionAPI, exportAPI } from '../services/api.js'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { logger } from '../utils/logger.js'
import { useDebounceSave } from '../hooks/useDebounceSave.js'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut.js'

const SECTION_META = {
  personal: { label: '基本信息', icon: User, color: 'text-blue-500', bg: 'bg-blue-50', activeBg: 'bg-blue-100', accent: 'border-blue-200' },
  education: { label: '教育经历', icon: GraduationCap, color: 'text-indigo-500', bg: 'bg-indigo-50', activeBg: 'bg-indigo-100', accent: 'border-indigo-200' },
  work: { label: '工作经历', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-50', activeBg: 'bg-emerald-100', accent: 'border-emerald-200' },
  project: { label: '项目经历', icon: Folder, color: 'text-orange-500', bg: 'bg-orange-50', activeBg: 'bg-orange-100', accent: 'border-orange-200' },
  skill: { label: '专业技能', icon: Wrench, color: 'text-purple-500', bg: 'bg-purple-50', activeBg: 'bg-purple-100', accent: 'border-purple-200' },
  summary: { label: '个人总结', icon: FileText, color: 'text-cyan-500', bg: 'bg-cyan-50', activeBg: 'bg-cyan-100', accent: 'border-cyan-200' },
  custom: { label: '自定义模块', icon: PlusCircle, color: 'text-gray-500', bg: 'bg-gray-50', activeBg: 'bg-gray-100', accent: 'border-gray-200' },
}

function getSectionCompletion(section) {
  try {
    const d = JSON.parse(section.data)
    if (section.type === 'personal') {
      const fields = ['name', 'title', 'phone', 'email', 'location']
      const filled = fields.filter(f => d[f]?.trim()).length
      return Math.round((filled / fields.length) * 100)
    }
    if (section.type === 'summary') return d.summary?.trim() ? 100 : 0
    if (['education', 'work', 'project', 'skill'].includes(section.type)) {
      const items = d.items || []
      if (!items.length) return 0
      const filled = items.filter(i => {
        if (section.type === 'skill') return i.name?.trim()
        const key = section.type === 'education' ? 'school' : section.type === 'work' ? 'company' : 'name'
        return i[key]?.trim()
      }).length
      return items.length > 0 ? Math.round((filled / items.length) * 100) : 0
    }
    return 0
  } catch { return 0 }
}

const NEW_MODULE_OPTIONS = [
  { type: 'education', label: '教育经历' },
  { type: 'work', label: '工作经历' },
  { type: 'project', label: '项目经历' },
  { type: 'skill', label: '专业技能' },
  { type: 'summary', label: '个人总结' },
  { type: 'custom', label: '自定义模块' },
]

const DEFAULT_DATA = {
  education: { items: [{ school: '', major: '', degree: '', startDate: '', endDate: '', description: '' }] },
  work: { items: [{ company: '', position: '', startDate: '', endDate: '', city: '', description: '' }] },
  project: { items: [{ name: '', role: '', startDate: '', endDate: '', description: '' }] },
  skill: { items: [{ name: '', level: '' }] },
  summary: { summary: '' },
  custom: { title: '自定义模块', items: [{ name: '', description: '' }] },
}

function getSectionSummary(section) {
  try {
    const d = JSON.parse(section.data)
    if (section.type === 'personal') return d.name || '未填写'
    if (section.type === 'education') return d.items?.map(i => i.school).filter(Boolean).join('、') || '未填写'
    if (section.type === 'work') return d.items?.map(i => i.company).filter(Boolean).join('、') || '未填写'
    if (section.type === 'project') return d.items?.map(i => i.name).filter(Boolean).join('、') || '未填写'
    if (section.type === 'skill') return d.items?.map(i => i.name).filter(Boolean).join('、') || '未填写'
    if (section.type === 'summary') return d.summary ? d.summary.substring(0, 30) + '...' : '未填写'
    return ''
  } catch { return '' }
}

export default function Editor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resume, setResume] = useState(null)
  const [sections, setSections] = useState([])
  const [isExporting, setIsExporting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState(null)
  const [expandedSections, setExpandedSections] = useState({})
  const [showPayment, setShowPayment] = useState(false)
  const [showExportPayment, setShowExportPayment] = useState(false)
  const [exportToken, setExportToken] = useState(null)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showModuleOrder, setShowModuleOrder] = useState(false)
  const [showAddModule, setShowAddModule] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState('')
  const [previewScale, setPreviewScale] = useState(0.9)
  const leftPanelRef = useRef(null)
  const sectionRefs = useRef({})

  // 使用自定义 Hook 管理防抖保存
  const { saveStatus, triggerSave } = useDebounceSave(
    async (data) => {
      const { sectionId, sectionData } = data
      await sectionAPI.update(sectionId, { data: sectionData })
    },
    800
  )

  // Ctrl+S 快捷键提示
  useKeyboardShortcut('s', () => {
    if (saveStatus === 'unsaved' || saveStatus === 'saving') {
      toast.success('已保存', { duration: 1500, icon: '💾' })
    }
  }, { ctrl: true, meta: true })

  useEffect(() => { loadResume() }, [id])

  const loadResume = async () => {
    try {
      const { data } = await resumeAPI.get(id)
      setResume(data.resume)
      const loaded = data.resume.sections || []
      setSections(loaded)
      // Auto-expand the first section
      if (loaded.length > 0) {
        const sorted = [...loaded].sort((a, b) => a.order - b.order)
        setExpandedSections({ [sorted[0].id]: true })
        setActiveSection(sorted[0].id)
      }
    } catch (err) {
      toast.error('加载简历失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSectionDataChange = (sectionId, newData) => {
    const dataStr = typeof newData === 'string' ? newData : JSON.stringify(newData)
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, data: dataStr } : s))
    )
    triggerSave({ sectionId, sectionData: dataStr })
  }

  const handleReorder = async (orders) => {
    const reordered = [...sections]
    orders.forEach(({ id: sid, order }) => {
      const s = reordered.find((x) => x.id === sid)
      if (s) s.order = order
    })
    reordered.sort((a, b) => a.order - b.order)
    setSections(reordered)
    try { await sectionAPI.reorder(id, orders) }
    catch (err) { toast.error('排序失败') }
  }

  const handleResumeSettingsUpdate = async (updates) => {
    try {
      const { data } = await resumeAPI.update(id, updates)
      setResume(data.resume)
    } catch (err) { toast.error('更新设置失败') }
  }

  // 检查并执行导出（带支付验证）
  const handleExport = async () => {
    if (isExporting) return
    const el = document.getElementById('resume-preview')
    if (!el) return toast.error('找不到简历预览区域')

    // 先检查导出权限（会员或单次支付令牌）
    try {
      const { data } = await exportAPI.checkExport(id)

      if (!data.canExport) {
        // 需要支付，显示支付弹窗
        setShowExportPayment(true)
        return
      }

      // 有权限，继续导出
      await performExport()
    } catch (err) {
      logger.error('Export check error:', err)
      toast.error('检查导出权限失败，请重试')
    }
  }

  // 支付成功后直接生成PDF（令牌已经在后端验证过）
  const handleExportWithToken = async (tokenStr) => {
    setExportToken(tokenStr)
    setShowExportPayment(false)
    await performExport()
  }

  // 实际执行PDF导出
  const performExport = async (token = null) => {
    if (isExporting) return
    const el = document.getElementById('resume-preview')
    if (!el) return toast.error('找不到简历预览区域')

    setIsExporting(true)
    const toastId = toast.loading('正在生成 PDF...')
    try {
      // Temporarily reset transform/scale for accurate capture
      const parent = el.parentElement
      const prevTransform = parent?.style.transform || ''
      if (parent) parent.style.transform = 'none'

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: el.offsetWidth,
        height: el.scrollHeight,
      })

      if (parent) parent.style.transform = prevTransform

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      })

      const pageWidth = 210
      const pageHeight = 297
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const imgData = canvas.toDataURL('image/jpeg', 0.98)

      // Multi-page: slice canvas into A4 pages
      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)
      } else {
        let y = 0
        let pageNum = 0
        while (y < imgHeight) {
          if (pageNum > 0) pdf.addPage()
          pdf.addImage(imgData, 'JPEG', 0, -y, imgWidth, imgHeight)
          y += pageHeight
          pageNum++
        }
      }

      const filename = `${resume?.title || '简历'}.pdf`
      pdf.save(filename)
      toast.success('PDF 导出成功', { id: toastId })
    } catch (err) {
      logger.error('PDF export error:', err)
      toast.error('PDF 导出失败，请重试', { id: toastId })
    } finally {
      setIsExporting(false)
    }
  }

  const toggleSection = (sectionId) => {
    const isCurrentlyExpanded = expandedSections[sectionId]
    setExpandedSections(prev => ({ ...prev, [sectionId]: !isCurrentlyExpanded }))
    setActiveSection(sectionId)
    // Scroll into view when expanding
    if (!isCurrentlyExpanded) {
      setTimeout(() => {
        sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }

  const handleAddModule = async (type) => {
    try {
      const maxOrder = sections.reduce((max, s) => Math.max(max, s.order), -1)
      const { data } = await sectionAPI.create({
        resumeId: id,
        type,
        order: maxOrder + 1,
        data: DEFAULT_DATA[type] || {},
      })
      setSections([...sections, data.section])
      setExpandedSections(prev => ({ ...prev, [data.section.id]: true }))
      setShowAddModule(false)
      toast.success('已添加模块')
    } catch (err) { toast.error('添加模块失败') }
  }

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('确定删除该模块？')) return
    try {
      await sectionAPI.delete(sectionId)
      setSections(sections.filter(s => s.id !== sectionId))
      toast.success('已删除')
    } catch (err) { toast.error('删除失败') }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">简历不存在</p>
        </div>
      </div>
    )
  }

  const sorted = [...sections].sort((a, b) => a.order - b.order)

  // Compute total completion
  const totalCompletion = sorted.length > 0
    ? Math.round(sorted.reduce((sum, s) => sum + getSectionCompletion(s), 0) / sorted.length)
    : 0

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Left: Always-visible sections panel */}
      <div className="no-print w-[440px] bg-white border-r border-gray-200/80 flex-shrink-0 flex flex-col">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              onClick={() => navigate('/dashboard/resumes')}
              className="p-1.5 hover:bg-white rounded-lg transition flex-shrink-0 shadow-sm border border-gray-100"
              title="返回仪表板"
            >
              <ArrowLeft className="w-4 h-4 text-gray-500" />
            </button>
            {editingTitle ? (
              <input
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={() => {
                  if (titleInput.trim()) handleResumeSettingsUpdate({ title: titleInput.trim() })
                  setEditingTitle(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (titleInput.trim()) handleResumeSettingsUpdate({ title: titleInput.trim() })
                    setEditingTitle(false)
                  }
                  if (e.key === 'Escape') setEditingTitle(false)
                }}
                className="text-sm font-semibold text-gray-900 border border-blue-400 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/40 min-w-0 flex-1 bg-white shadow-sm"
              />
            ) : (
              <button
                onClick={() => { setTitleInput(resume.title); setEditingTitle(true) }}
                className="text-sm font-bold text-gray-800 hover:text-blue-600 px-2 py-0.5 rounded-lg transition truncate"
                title="点击修改简历名称"
              >
                {resume.title || '未命名简历'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
              saveStatus === 'saved' ? 'text-emerald-600 bg-emerald-50' :
              saveStatus === 'saving' ? 'text-blue-500 bg-blue-50' :
              'text-orange-500 bg-orange-50'
            }`}>
              {saveStatus === 'saved' && <><CheckCircle className="w-3 h-3" /><span>已保存</span></>}
              {saveStatus === 'saving' && <><Save className="w-3 h-3 animate-pulse" /><span>保存中</span></>}
              {saveStatus === 'unsaved' && <><Save className="w-3 h-3" /><span>未保存</span></>}
            </div>
          </div>
        </div>

        {/* Total progress bar */}
        <div className="px-4 py-2.5 bg-gray-50/50 border-b border-gray-100/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-gray-400">简历完成度</span>
            <span className={`text-[11px] font-bold ${totalCompletion === 100 ? 'text-emerald-500' : totalCompletion >= 60 ? 'text-blue-500' : 'text-gray-400'}`}>
              {totalCompletion}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-200/60 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalCompletion === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                totalCompletion >= 60 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                'bg-gradient-to-r from-gray-300 to-gray-400'
              }`}
              style={{ width: `${totalCompletion}%` }}
            />
          </div>
        </div>

        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto" ref={leftPanelRef}>
          <div className="p-3 space-y-2">
            {sorted.map((section) => {
              const meta = SECTION_META[section.type] || SECTION_META.custom
              const Icon = meta.icon
              const isExpanded = expandedSections[section.id]
              const isActive = activeSection === section.id
              const completion = getSectionCompletion(section)
              let sectionData
              try { sectionData = JSON.parse(section.data) } catch { sectionData = {} }

              const PANELS = {
                personal: PersonalPanel,
                education: EducationPanel,
                work: WorkPanel,
                project: ProjectPanel,
                skill: SkillPanel,
                summary: SummaryPanel,
              }
              const PanelComponent = PANELS[section.type]

              return (
                <div
                  key={section.id}
                  ref={(el) => { sectionRefs.current[section.id] = el }}
                  className={`rounded-xl border transition-all duration-200 ${
                    isExpanded
                      ? `${meta.accent} shadow-sm bg-white`
                      : isActive
                        ? 'border-blue-200 bg-white'
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                  }`}
                >
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center gap-3 px-3.5 py-3 transition group"
                  >
                    <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition ${
                      isExpanded ? meta.activeBg : `bg-gray-50 group-hover:${meta.bg}`
                    }`}>
                      <Icon className={`w-4 h-4 ${isExpanded ? meta.color : 'text-gray-400 group-hover:' + meta.color}`} />
                      {/* Completion dot indicator */}
                      {completion === 100 && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">{meta.label}</span>
                        {!isExpanded && completion > 0 && completion < 100 && (
                          <div className="flex items-center gap-1">
                            <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-400 rounded-full" style={{ width: `${completion}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                      {!isExpanded && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {getSectionSummary(section)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {section.type !== 'personal' && (
                        <span
                          onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id) }}
                          className="p-1 text-gray-300 hover:text-red-400 rounded-md hover:bg-red-50 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && PanelComponent && (
                    <div className="px-3.5 pb-4 border-t border-gray-100/80 panel-content-enter">
                      <div className="pt-3">
                        <PanelComponent
                          data={sectionData}
                          onChange={(d) => handleSectionDataChange(section.id, d)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Add new module */}
            <div className="relative pt-1">
              <button
                onClick={() => setShowAddModule(!showAddModule)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50/30 transition text-sm font-medium"
              >
                <PlusCircle className="w-4 h-4" />
                <span>添加模块</span>
              </button>
              {showAddModule && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowAddModule(false)} />
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-20 animate-in fade-in">
                    {NEW_MODULE_OPTIONS.map((opt) => {
                      const OMeta = SECTION_META[opt.type] || SECTION_META.custom
                      const OIcon = OMeta.icon
                      return (
                        <button
                          key={opt.type}
                          onClick={() => handleAddModule(opt.type)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                        >
                          <div className={`w-7 h-7 rounded-lg ${OMeta.bg} flex items-center justify-center`}>
                            <OIcon className={`w-3.5 h-3.5 ${OMeta.color}`} />
                          </div>
                          <span className="font-medium">{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Keyboard hint */}
            <p className="text-center text-[10px] text-gray-300 pt-2 pb-1">Ctrl+S 保存 · 点击右侧预览定位模块</p>
          </div>
        </div>
      </div>

      {/* Right: Preview area with sticky toolbar */}
      <div className="flex-1 overflow-y-auto bg-gray-100/50 relative">
        {/* Toolbar sticky at top */}
        <div className="no-print">
          <EditorToolbar
            resume={resume}
            onUpdate={handleResumeSettingsUpdate}
            onExport={handleExport}
            isExporting={isExporting}
            onOpenTemplateSelector={() => setShowTemplateSelector(true)}
            onOpenModuleOrder={() => setShowModuleOrder(true)}
          />
        </div>

        {/* Resume preview centered */}
        <div className="flex flex-col items-center px-8 pb-8 pt-2">
          <div
            className="relative overflow-visible rounded shadow-2xl transition-all duration-300"
            style={{ transformOrigin: 'center top', transform: `scale(${previewScale})` }}
          >
            <ResumePreview
              resume={resume}
              sections={sections}
              activeSection={activeSection}
              onClickSection={(sectionId) => {
                setActiveSection(sectionId)
                setExpandedSections(prev => ({ ...prev, [sectionId]: true }))
                // Scroll left panel to this section
                setTimeout(() => {
                  sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                }, 50)
              }}
            />
          </div>
        </div>

        {/* Zoom controls */}
        <div className="no-print fixed bottom-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/60 flex items-center gap-0.5 px-2 py-1.5 z-30">
          <button
            onClick={() => setPreviewScale(s => Math.max(0.4, +(s - 0.05).toFixed(2)))}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition active:scale-90"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => setPreviewScale(0.9)}
            className="text-[11px] text-gray-500 w-11 text-center font-semibold hover:bg-gray-100 rounded-lg py-1 transition"
            title="重置为 90%"
          >
            {Math.round(previewScale * 100)}%
          </button>
          <button
            onClick={() => setPreviewScale(s => Math.min(1.5, +(s + 0.05).toFixed(2)))}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition active:scale-90"
            title="放大"
          >
            <ZoomIn className="w-4 h-4 text-gray-500" />
          </button>
          <div className="w-px h-4 bg-gray-200 mx-0.5" />
          <button
            onClick={() => setPreviewScale(1)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition active:scale-90"
            title="适合宽度 (100%)"
          >
            <Maximize2 className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Payment Modal (Membership) */}
      {showPayment && (
        <PaymentModal
          onClose={() => setShowPayment(false)}
          onSuccess={() => toast.success('已解锁导出功能')}
        />
      )}

      {/* Export Payment Modal (Single export payment) */}
      {showExportPayment && (
        <ExportPaymentModal
          resumeId={id}
          onClose={() => setShowExportPayment(false)}
          onExportComplete={handleExportWithToken}
        />
      )}

      {/* Module Order */}
      {showModuleOrder && (
        <ModuleOrderPanel
          sections={sections}
          onReorder={handleReorder}
          onClose={() => setShowModuleOrder(false)}
        />
      )}

      {/* Template Selector */}
      {showTemplateSelector && (
        <TemplateSelector
          currentTemplate={resume.template}
          isPaid={JSON.parse(localStorage.getItem('user') || '{}').isPaid}
          resumeData={{ sections }}
          onSelect={(templateId) => {
            handleResumeSettingsUpdate({ template: templateId })
            setShowTemplateSelector(false)
          }}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  )
}
