import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, FileText, Upload, Sparkles, Copy, Trash2, Edit3, Clock,
  Search, LayoutGrid, LayoutList, SortAsc, SortDesc, Check, X, Type, CheckSquare, Square
} from 'lucide-react'
import Sidebar from '../components/Sidebar.jsx'
import ImportResumeModal from '../components/ImportResumeModal.jsx'
import { resumeAPI } from '../services/api.js'
import { getTemplateName, getTemplateColor } from '../components/TemplateSelector.jsx'
import toast from 'react-hot-toast'

const SORT_OPTIONS = [
  { id: 'updatedAt_desc', label: '最近更新', field: 'updatedAt', dir: 'desc' },
  { id: 'updatedAt_asc', label: '最早更新', field: 'updatedAt', dir: 'asc' },
  { id: 'title_asc', label: '名称 A-Z', field: 'title', dir: 'asc' },
  { id: 'title_desc', label: '名称 Z-A', field: 'title', dir: 'desc' },
  { id: 'createdAt_desc', label: '最近创建', field: 'createdAt', dir: 'desc' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)

  // New features state
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('updatedAt_desc')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef(null)

  useEffect(() => {
    loadResumes()
  }, [])

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingId])

  const loadResumes = async () => {
    try {
      const { data } = await resumeAPI.list()
      setResumes(data.resumes)
    } catch (err) {
      toast.error('加载简历列表失败')
    } finally {
      setLoading(false)
    }
  }

  // Filtered & sorted
  const filteredResumes = useMemo(() => {
    let list = [...resumes]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(r => {
        const titleMatch = r.title?.toLowerCase().includes(q)
        const templateMatch = getTemplateName(r.template).toLowerCase().includes(q)
        // Search in personal data
        let personalMatch = false
        try {
          const personal = r.sections?.find(s => s.type === 'personal')
          if (personal) {
            const d = JSON.parse(personal.data)
            personalMatch = [d.name, d.title, d.email].some(v => v?.toLowerCase().includes(q))
          }
        } catch {}
        return titleMatch || templateMatch || personalMatch
      })
    }

    // Sort
    const sortOpt = SORT_OPTIONS.find(o => o.id === sortBy) || SORT_OPTIONS[0]
    list.sort((a, b) => {
      let va = a[sortOpt.field]
      let vb = b[sortOpt.field]
      if (sortOpt.field === 'title') {
        va = (va || '').toLowerCase()
        vb = (vb || '').toLowerCase()
        return sortOpt.dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      }
      // date fields
      va = new Date(va).getTime()
      vb = new Date(vb).getTime()
      return sortOpt.dir === 'desc' ? vb - va : va - vb
    })

    return list
  }, [resumes, searchQuery, sortBy])

  const createResume = async () => {
    try {
      const { data } = await resumeAPI.create({ title: '未命名简历' })
      toast.success('创建成功')
      navigate(`/dashboard/editor/${data.resume.id}`)
    } catch (err) {
      toast.error('创建失败')
    }
  }

  const deleteResume = async (id) => {
    if (!confirm('确定要删除这份简历吗？')) return
    try {
      await resumeAPI.delete(id)
      setResumes(prev => prev.filter(r => r.id !== id))
      setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s })
      toast.success('删除成功')
    } catch (err) {
      toast.error('删除失败')
    }
  }

  const batchDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 份简历吗？`)) return
    const count = selectedIds.size
    const toDelete = new Set(selectedIds)
    try {
      await Promise.all([...toDelete].map(id => resumeAPI.delete(id)))
      setResumes(prev => prev.filter(r => !toDelete.has(r.id)))
      setSelectedIds(new Set())
      toast.success(`已删除 ${count} 份简历`)
    } catch (err) {
      toast.error('批量删除失败')
    }
  }

  const duplicateResume = async (id) => {
    try {
      const { data } = await resumeAPI.duplicate(id)
      setResumes(prev => [data.resume, ...prev])
      toast.success('复制成功')
    } catch (err) {
      toast.error('复制失败')
    }
  }

  const startRename = (resume) => {
    setRenamingId(resume.id)
    setRenameValue(resume.title)
  }

  const commitRename = async () => {
    if (!renamingId || !renameValue.trim()) {
      setRenamingId(null)
      return
    }
    try {
      await resumeAPI.update(renamingId, { title: renameValue.trim() })
      setResumes(prev => prev.map(r => r.id === renamingId ? { ...r, title: renameValue.trim() } : r))
    } catch (err) {
      toast.error('重命名失败')
    }
    setRenamingId(null)
  }

  const toggleSelect = (id, e) => {
    e?.stopPropagation()
    setSelectedIds(prev => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return s
    })
  }

  const selectAll = () => {
    if (selectedIds.size === filteredResumes.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredResumes.map(r => r.id)))
    }
  }

  const isSelectMode = selectedIds.size > 0

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
    if (diff < 86400000 * 7) return `${Math.floor(diff / 86400000)} 天前`
    return d.toLocaleDateString('zh-CN')
  }

  const currentSort = SORT_OPTIONS.find(o => o.id === sortBy) || SORT_OPTIONS[0]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 ml-16">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">简历管理</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                共 {resumes.length} 份简历
                {searchQuery && ` · 搜索到 ${filteredResumes.length} 条结果`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowImport(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>导入</span>
              </button>
              <button
                onClick={createResume}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新建</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/agent')}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition shadow-sm text-sm font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI 创建</span>
              </button>
            </div>
          </div>

          {/* Toolbar: Search + Sort + View toggle + Batch actions */}
          <div className="flex items-center gap-3 mb-5">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索简历名称、模板、姓名..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 placeholder:text-gray-300 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                {currentSort.dir === 'desc' ? <SortDesc className="w-3.5 h-3.5" /> : <SortAsc className="w-3.5 h-3.5" />}
                <span>{currentSort.label}</span>
              </button>
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => { setSortBy(opt.id); setShowSortMenu(false) }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition ${
                          sortBy === opt.id ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {sortBy === opt.id && <Check className="w-3.5 h-3.5" />}
                        <span className={sortBy === opt.id ? '' : 'ml-5'}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* View toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                title="网格视图"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                title="列表视图"
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>

            {/* Batch select toggle */}
            <button
              onClick={selectAll}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm transition ${
                isSelectMode ? 'border-blue-300 bg-blue-50 text-blue-600' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
              title={isSelectMode ? '取消全选' : '全选'}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              {isSelectMode && <span>{selectedIds.size} 项</span>}
            </button>

            {/* Batch actions */}
            {isSelectMode && (
              <button
                onClick={batchDelete}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-100 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>删除 ({selectedIds.size})</span>
              </button>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">开始创建你的简历</h3>
              <p className="text-gray-400 mb-6 max-w-sm mx-auto">选择新建空白简历、导入已有简历文件，或使用 AI 智能创建</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={createResume}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm text-gray-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>新建空白简历</span>
                </button>
                <button
                  onClick={() => setShowImport(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm text-gray-700"
                >
                  <Upload className="w-4 h-4" />
                  <span>导入简历</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard/agent')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition shadow-sm text-sm font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI 创建</span>
                </button>
              </div>
            </div>
          ) : filteredResumes.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-700 mb-1">没有找到匹配的简历</h3>
              <p className="text-sm text-gray-400">试试其他搜索关键词</p>
            </div>
          ) : viewMode === 'grid' ? (
            /* ===== Grid View ===== */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredResumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all group cursor-pointer relative ${
                    selectedIds.has(resume.id) ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'
                  }`}
                >
                  {/* Select checkbox */}
                  <button
                    onClick={(e) => toggleSelect(resume.id, e)}
                    className={`absolute top-2 left-2 z-10 p-0.5 rounded transition ${
                      selectedIds.has(resume.id)
                        ? 'text-blue-500'
                        : 'text-transparent group-hover:text-gray-300 hover:!text-gray-500'
                    }`}
                  >
                    {selectedIds.has(resume.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </button>

                  {/* Thumbnail */}
                  <div
                    className="aspect-[3/4] bg-gray-50 p-4 relative"
                    onClick={() => !isSelectMode && navigate(`/dashboard/editor/${resume.id}`)}
                  >
                    <div className="w-full h-full bg-white rounded border border-gray-100 shadow-sm p-3 overflow-hidden">
                      <ResumeThumb resume={resume} />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.03] transition-colors" />
                  </div>

                  {/* Info + Actions */}
                  <div className="p-3.5 border-t border-gray-100">
                    <div className="min-w-0">
                      {renamingId === resume.id ? (
                        <input
                          ref={renameInputRef}
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitRename()
                            if (e.key === 'Escape') setRenamingId(null)
                          }}
                          className="w-full text-sm font-semibold text-gray-900 border border-blue-400 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <h3
                          className="font-semibold text-gray-900 truncate text-sm cursor-text"
                          onDoubleClick={(e) => { e.stopPropagation(); startRename(resume) }}
                          title="双击重命名"
                        >
                          {resume.title}
                        </h3>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(resume.updatedAt)}
                        </p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                          {getTemplateName(resume.template)}
                        </span>
                      </div>
                    </div>

                    {/* Inline action buttons */}
                    <div className="flex items-center gap-1 mt-2.5 pt-2.5 border-t border-gray-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/editor/${resume.id}`) }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition"
                        title="编辑"
                      >
                        <Edit3 className="w-3 h-3" />
                        编辑
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); duplicateResume(resume.id) }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:bg-green-50 hover:text-green-600 transition"
                        title="复制"
                      >
                        <Copy className="w-3 h-3" />
                        复制
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/agent?resumeId=${resume.id}`) }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 transition"
                        title="AI 优化"
                      >
                        <Sparkles className="w-3 h-3" />
                        AI
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteResume(resume.id) }}
                        className="flex items-center justify-center p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                        title="删除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ===== List View ===== */
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* List header */}
              <div className="grid grid-cols-[auto_1fr_120px_120px_100px_auto] gap-4 items-center px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="w-5" />
                <div>名称</div>
                <div>模板</div>
                <div>更新时间</div>
                <div>模块数</div>
                <div className="w-[140px]">操作</div>
              </div>
              {filteredResumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`grid grid-cols-[auto_1fr_120px_120px_100px_auto] gap-4 items-center px-4 py-2.5 border-b border-gray-50 hover:bg-gray-50/70 transition cursor-pointer group ${
                    selectedIds.has(resume.id) ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => !isSelectMode && navigate(`/dashboard/editor/${resume.id}`)}
                >
                  {/* Checkbox */}
                  <button
                    onClick={(e) => toggleSelect(resume.id, e)}
                    className={`p-0.5 rounded transition ${
                      selectedIds.has(resume.id)
                        ? 'text-blue-500'
                        : 'text-gray-300 group-hover:text-gray-400'
                    }`}
                  >
                    {selectedIds.has(resume.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>

                  {/* Title */}
                  <div className="min-w-0">
                    {renamingId === resume.id ? (
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitRename()
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                        className="text-sm font-medium text-gray-900 border border-blue-400 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full max-w-xs"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getTemplateColor(resume.template) }} />
                        <span
                          className="text-sm font-medium text-gray-800 truncate"
                          onDoubleClick={(e) => { e.stopPropagation(); startRename(resume) }}
                          title="双击重命名"
                        >
                          {resume.title}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Template */}
                  <span className="text-xs text-gray-500">{getTemplateName(resume.template)}</span>

                  {/* Updated */}
                  <span className="text-xs text-gray-400">{formatDate(resume.updatedAt)}</span>

                  {/* Sections count */}
                  <span className="text-xs text-gray-400">{resume.sections?.length || 0} 个模块</span>

                  {/* Inline actions */}
                  <div className="flex items-center gap-0.5 w-[140px]">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/editor/${resume.id}`) }}
                      className="p-1.5 rounded-md text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition"
                      title="编辑"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicateResume(resume.id) }}
                      className="p-1.5 rounded-md text-gray-400 hover:bg-green-50 hover:text-green-600 transition"
                      title="复制"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/agent?resumeId=${resume.id}`) }}
                      className="p-1.5 rounded-md text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition"
                      title="AI 优化"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); startRename(resume) }}
                      className="p-1.5 rounded-md text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition"
                      title="重命名"
                    >
                      <Type className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteResume(resume.id) }}
                      className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Click outside to close sort menu */}
      {showSortMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
      )}

      {/* Import modal */}
      {showImport && (
        <ImportResumeModal
          onClose={() => setShowImport(false)}
          onSuccess={(resume) => {
            loadResumes()
            if (resume?.id) navigate(`/dashboard/editor/${resume.id}`)
          }}
        />
      )}
    </div>
  )
}



const SECTION_NAMES = {
  education: '教育经历',
  work: '工作经历',
  project: '项目经历',
  skill: '专业技能',
  summary: '个人总结',
}

function ResumeThumb({ resume }) {
  const personal = resume.sections?.find((s) => s.type === 'personal')
  const personalData = personal ? JSON.parse(personal.data) : {}
  const name = personalData.name || '未命名'
  const accent = getTemplateColor(resume.template)
  const others = resume.sections?.filter(s => s.type !== 'personal') || []

  return (
    <div className="text-[6px] leading-[1.4] text-gray-600 select-none">
      <div className="text-[10px] font-bold mb-0.5 truncate" style={{ color: accent }}>{name}</div>
      {personalData.title && <div className="text-[6px] text-gray-400 mb-0.5 truncate">{personalData.title}</div>}
      <div className="flex gap-1 text-[5px] text-gray-400 mb-1.5 flex-wrap">
        {personalData.phone && <span>{personalData.phone}</span>}
        {personalData.email && <span>{personalData.email}</span>}
      </div>
      <div className="my-1 h-[1px]" style={{ backgroundColor: accent, opacity: 0.25 }} />
      {others.map((s, i) => {
        let detail = ''
        try {
          const d = JSON.parse(s.data)
          if (s.type === 'work' && d.items?.[0]?.company) detail = d.items[0].company
          else if (s.type === 'education' && d.items?.[0]?.school) detail = d.items[0].school
          else if (s.type === 'project' && d.items?.[0]?.name) detail = d.items[0].name
          else if (s.type === 'skill' && d.items?.length) detail = `${d.items.filter(x => x.name).length} 项`
        } catch {}
        return (
          <div key={i} className="mb-1">
            <div className="text-[6px] font-semibold" style={{ color: accent, opacity: 0.65 }}>
              {SECTION_NAMES[s.type] || s.type}
            </div>
            {detail ? (
              <div className="text-[5px] text-gray-400 truncate">{detail}</div>
            ) : (
              <div className="h-[2px] bg-gray-100 rounded my-0.5 w-3/4" />
            )}
          </div>
        )
      })}
    </div>
  )
}
