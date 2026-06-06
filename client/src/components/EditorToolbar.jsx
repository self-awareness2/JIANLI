import { useState } from 'react'
import {
  List, Download, ChevronDown, Square
} from 'lucide-react'

const FONT_OPTIONS = [
  { value: 'default', label: '默认' },
  { value: 'songti', label: '宋体' },
  { value: 'heiti', label: '黑体' },
  { value: 'kaiti', label: '楷体' },
  { value: 'fangsong', label: '仿宋' },
]

const FONT_SIZE_OPTIONS = [12, 13, 14, 15, 16]
const LINE_HEIGHT_OPTIONS = [1.2, 1.3, 1.4, 1.5, 1.6, 1.8, 2.0]
const MARGIN_OPTIONS = [
  { value: 10, label: '窄' },
  { value: 15, label: '中' },
  { value: 20, label: '宽' },
  { value: 25, label: '超宽' },
]

const THEME_COLORS = [
  '#2563eb', '#0891b2', '#059669', '#7c3aed',
  '#dc2626', '#ea580c', '#d97706', '#1e293b',
  '#6366f1', '#ec4899', '#14b8a6', '#525252',
]

// 编辑器顶部工具栏，提供模板、排版、主题和导出操作。
export default function EditorToolbar({ resume, onUpdate, onExport, isExporting, onOpenTemplateSelector, onOpenModuleOrder }) {
  const [dropdown, setDropdown] = useState(null)

  // 切换指定下拉菜单的展开状态。
  const toggleDropdown = (name) => {
    setDropdown(dropdown === name ? null : name)
  }

  // 更新简历配置字段并收起下拉菜单。
  const handleUpdate = (field, value) => {
    onUpdate({ [field]: value })
    setDropdown(null)
  }

  const themeColor = resume?.themeColor || '#2563eb'

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-white/80 px-2.5 py-1.5 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
      {/* Left controls */}
      <div className="flex min-w-0 flex-1 items-center gap-0.5">
        {/* Structure group */}
        <div className="flex items-center bg-gray-50 rounded-lg px-0.5 py-0.5 gap-0.5">
          <button
            onClick={onOpenModuleOrder}
            className="flex h-6 items-center gap-1 px-1.5 text-[11px] rounded-md hover:bg-white transition text-gray-600 font-medium"
            title="调整模块顺序"
          >
            <List className="w-3 h-3" />
            <span className="hidden xl:inline">排序</span>
          </button>
          <button
            onClick={onOpenTemplateSelector}
            className="flex h-6 shrink-0 items-center gap-1 px-1.5 text-[11px] rounded-md hover:bg-white transition text-gray-600 font-medium"
            title="更换模板"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256">
              <path d="M122.34,109.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0,0-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40a8,8,0,0,0,0,11.32ZM128,35.31,156.69,64,128,92.69,99.31,64Zm5.66,111a8,8,0,0,0-11.32,0l-40,40a8,8,0,0,0,0,11.32l40,40a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0,0-11.32ZM128,220.69,99.31,192,128,163.31,156.69,192Zm109.66-98.35-40-40a8,8,0,0,0-11.32,0l-40,40a8,8,0,0,0,0,11.32l40,40a8,8,0,0,0,11.32,0l40-40A8,8,0,0,0,237.66,122.34ZM192,156.69,163.31,128,192,99.31,220.69,128Zm-82.34-34.35-40-40a8,8,0,0,0-11.32,0l-40,40a8,8,0,0,0,0,11.32l40,40a8,8,0,0,0,11.32,0l40-40A8,8,0,0,0,109.66,122.34ZM64,156.69,35.31,128,64,99.31,92.69,128Z" />
            </svg>
            <span className="hidden lg:inline">模板</span>
          </button>
        </div>

        <div className="w-px h-4 bg-gray-200/80 mx-1" />

        {/* Typography group */}
        <div className="flex items-center bg-gray-50 rounded-lg px-1 py-0.5 gap-0.5">
          <InlineSelect
            value={FONT_OPTIONS.find(f => f.value === (resume?.fontFamily || 'default'))?.label || '默认'}
            name="font"
            dropdown={dropdown}
            onToggle={toggleDropdown}
            width="w-14 lg:w-16"
          >
            {FONT_OPTIONS.map((f) => (
              <DropdownItem
                key={f.value}
                label={f.label}
                active={(resume?.fontFamily || 'default') === f.value}
                onClick={() => handleUpdate('fontFamily', f.value)}
              />
            ))}
          </InlineSelect>

          <div className="w-px h-3.5 bg-gray-200/80" />

          <InlineSelect
            value={resume?.fontSize || 14}
            name="fontSize"
            dropdown={dropdown}
            onToggle={toggleDropdown}
            width="w-9"
          >
            {FONT_SIZE_OPTIONS.map((s) => (
              <DropdownItem
                key={s}
                label={s}
                active={(resume?.fontSize || 14) === s}
                onClick={() => handleUpdate('fontSize', s)}
              />
            ))}
          </InlineSelect>

          <div className="w-px h-3.5 bg-gray-200/80" />

          <InlineSelect
            value={resume?.lineHeight || 1.5}
            name="lineHeight"
            dropdown={dropdown}
            onToggle={toggleDropdown}
            width="w-9"
            label="行高"
          >
            {LINE_HEIGHT_OPTIONS.map((h) => (
              <DropdownItem
                key={h}
                label={h.toFixed(1)}
                active={(resume?.lineHeight || 1.5) === h}
                onClick={() => handleUpdate('lineHeight', h)}
              />
            ))}
          </InlineSelect>
        </div>

        <div className="w-px h-4 bg-gray-200/80 mx-1" />

        {/* Layout group */}
        <div className="flex items-center bg-gray-50 rounded-lg px-1 py-0.5 gap-0.5">
          <InlineSelect
            value={MARGIN_OPTIONS.find(m => m.value === (resume?.margin || 15))?.label || '中'}
            name="margin"
            dropdown={dropdown}
            onToggle={toggleDropdown}
            width="w-10"
            label="边距"
          >
            {MARGIN_OPTIONS.map((m) => (
              <DropdownItem
                key={m.value}
                label={m.label}
                active={(resume?.margin || 15) === m.value}
                onClick={() => handleUpdate('margin', m.value)}
              />
            ))}
          </InlineSelect>

          <div className="w-px h-4 bg-gray-200/80" />

          {/* Theme color */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('color')}
              className="flex items-center gap-1 h-6 px-1.5 rounded-md hover:bg-white transition"
              title="主题色"
            >
              <div className="w-3.5 h-3.5 rounded-md border border-gray-200 shadow-sm" style={{ backgroundColor: themeColor }} />
              <ChevronDown className="w-2.5 h-2.5 text-gray-400" />
            </button>
            {dropdown === 'color' && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50 w-[200px]">
                <p className="text-xs font-semibold text-gray-500 mb-2.5">主题色</p>
                <div className="grid grid-cols-6 gap-2">
                  {THEME_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleUpdate('themeColor', c)}
                      className={`w-6 h-6 rounded-lg transition-all hover:scale-110 ${
                        themeColor === c ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : 'hover:shadow-md'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Export */}
      <div className="flex shrink-0 items-center gap-1.5 ml-2.5">
        <button
          onClick={onExport}
          disabled={isExporting}
          className="flex h-7 items-center gap-1.5 px-2.5 lg:px-3 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isExporting ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span className="hidden lg:inline">{isExporting ? '生成中...' : '导出 PDF'}</span>
        </button>
      </div>

      {/* Click outside */}
      {dropdown && <div className="fixed inset-0 z-[-1]" onClick={() => setDropdown(null)} />}
    </div>
  )
}

// 渲染工具栏中的紧凑下拉选择器。
function InlineSelect({ value, name, dropdown, onToggle, width, label, children }) {
  const isOpen = dropdown === name
  return (
    <div className="relative">
      <button
        onClick={() => onToggle(name)}
        className={`flex items-center justify-between h-6 ${width} rounded-md bg-transparent px-1.5 text-[11px] hover:bg-white transition-colors text-gray-700 font-medium`}
        title={label || name}
      >
        <span className="truncate">{value}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256" className="w-2 h-2 opacity-40 shrink-0 ml-0.5">
          <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-200 py-1 min-w-[90px] z-50">
          {label && <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-1 pb-1.5">{label}</p>}
          {children}
        </div>
      )}
    </div>
  )
}

// 渲染下拉菜单选项，并高亮当前激活项。
function DropdownItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 text-[11px] transition flex items-center justify-between gap-2 ${
        active ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50 font-medium'
      }`}
    >
      <span>{label}</span>
      {active && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
    </button>
  )
}
