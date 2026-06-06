import { useState } from 'react'
import { Plus, Trash2, ChevronDown, Folder } from 'lucide-react'
import RichTextEditor from '../RichTextEditor.jsx'

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 hover:border-gray-300 placeholder:text-gray-300'

export default function ProjectPanel({ data, onChange }) {
  const items = data.items || []
  const [openIndex, setOpenIndex] = useState(0)

  const updateItem = (index, field, value) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    onChange({ ...data, items: newItems })
  }

  const addItem = () => {
    const newItems = [...items, { name: '', role: '', startDate: '', endDate: '', description: '' }]
    onChange({ ...data, items: newItems })
    setOpenIndex(newItems.length - 1)
  }

  const removeItem = (index) => {
    onChange({ ...data, items: items.filter((_, i) => i !== index) })
    if (openIndex === index) setOpenIndex(null)
    else if (openIndex > index) setOpenIndex(openIndex - 1)
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const title = item.name || `项目 ${index + 1}`
        const subtitle = [item.role, item.startDate && item.endDate ? `${item.startDate} - ${item.endDate}` : ''].filter(Boolean).join(' · ')

        return (
          <div key={index} className={`rounded-xl border transition-all ${isOpen ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'}`}>
            <button onClick={() => setOpenIndex(isOpen ? null : index)} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left">
              <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Folder className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
                {subtitle && !isOpen && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span onClick={(e) => { e.stopPropagation(); removeItem(index) }} className="p-1 text-gray-300 hover:text-red-400 rounded-md hover:bg-red-50 transition cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {isOpen && (
              <div className="px-3.5 pb-3.5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">项目名称</label>
                    <input value={item.name || ''} onChange={(e) => updateItem(index, 'name', e.target.value)} className={inputClass} placeholder="项目名称" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">担任角色</label>
                    <input value={item.role || ''} onChange={(e) => updateItem(index, 'role', e.target.value)} className={inputClass} placeholder="如：后端开发" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">开始</label>
                    <input value={item.startDate || ''} onChange={(e) => updateItem(index, 'startDate', e.target.value)} className={inputClass} placeholder="2025.03" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">结束</label>
                    <input value={item.endDate || ''} onChange={(e) => updateItem(index, 'endDate', e.target.value)} className={inputClass} placeholder="至今" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">项目描述</label>
                  <RichTextEditor content={item.description || ''} onChange={(html) => updateItem(index, 'description', html)} />
                </div>
              </div>
            )}
          </div>
        )
      })}

      <button onClick={addItem} className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-orange-500 hover:border-orange-300 hover:bg-orange-50/30 transition text-sm">
        <Plus className="w-4 h-4" />
        <span>添加项目经历</span>
      </button>
    </div>
  )
}
