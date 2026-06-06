import { useState } from 'react'
import { Plus, X } from 'lucide-react'

const LEVEL_COLORS = {
  '精通': 'bg-purple-100 text-purple-700 border-purple-200',
  '熟练': 'bg-blue-100 text-blue-700 border-blue-200',
  '熟悉': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '了解': 'bg-gray-100 text-gray-600 border-gray-200',
  '': 'bg-slate-100 text-slate-600 border-slate-200',
}

const LEVELS = ['精通', '熟练', '熟悉', '了解']

export default function SkillPanel({ data, onChange }) {
  const items = data.items || []
  const [newSkill, setNewSkill] = useState('')
  const [newLevel, setNewLevel] = useState('熟练')

  const addItem = () => {
    if (!newSkill.trim()) return
    onChange({ ...data, items: [...items, { name: newSkill.trim(), level: newLevel }] })
    setNewSkill('')
  }

  const removeItem = (index) => {
    onChange({ ...data, items: items.filter((_, i) => i !== index) })
  }

  const updateLevel = (index, level) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], level }
    onChange({ ...data, items: newItems })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addItem() }
  }

  return (
    <div className="space-y-4">
      {/* 技能标签展示 */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => {
            const colorClass = LEVEL_COLORS[item.level] || LEVEL_COLORS['']
            return (
              <div key={index} className={`group inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all hover:shadow-sm ${colorClass}`}>
                <span>{item.name}</span>
                {item.level && (
                  <select
                    value={item.level}
                    onChange={(e) => updateLevel(index, e.target.value)}
                    className="bg-transparent border-none text-[10px] opacity-60 cursor-pointer focus:outline-none p-0 pr-3"
                  >
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                )}
                <button onClick={() => removeItem(index)} className="ml-0.5 p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/10 transition">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* 快速添加 */}
      <div className="flex gap-2">
        <input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 hover:border-gray-300 placeholder:text-gray-300"
          placeholder="输入技能名称，按回车添加"
        />
        <select
          value={newLevel}
          onChange={(e) => setNewLevel(e.target.value)}
          className="px-2 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 hover:border-gray-300"
        >
          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <button onClick={addItem} className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm flex-shrink-0">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-3">输入技能名称并按回车快速添加</p>
      )}
    </div>
  )
}
