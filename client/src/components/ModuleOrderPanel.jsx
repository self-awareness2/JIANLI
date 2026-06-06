import { X, ChevronUp, ChevronDown, GripVertical, User, GraduationCap, Briefcase, Folder, Wrench, FileText, PlusCircle } from 'lucide-react'

const SECTION_META = {
  personal: { label: '基本信息', icon: User, color: 'text-blue-500', bg: 'bg-blue-100' },
  education: { label: '教育经历', icon: GraduationCap, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  work: { label: '工作经历', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  project: { label: '项目经历', icon: Folder, color: 'text-orange-500', bg: 'bg-orange-100' },
  skill: { label: '专业技能', icon: Wrench, color: 'text-purple-500', bg: 'bg-purple-100' },
  summary: { label: '个人总结', icon: FileText, color: 'text-cyan-500', bg: 'bg-cyan-100' },
  custom: { label: '自定义模块', icon: PlusCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
}

export default function ModuleOrderPanel({ sections, onReorder, onClose }) {
  const sorted = [...sections].sort((a, b) => a.order - b.order)

  const moveUp = (index) => {
    if (index === 0) return
    const newList = [...sorted]
    ;[newList[index - 1], newList[index]] = [newList[index], newList[index - 1]]
    applyOrder(newList)
  }

  const moveDown = (index) => {
    if (index >= sorted.length - 1) return
    const newList = [...sorted]
    ;[newList[index], newList[index + 1]] = [newList[index + 1], newList[index]]
    applyOrder(newList)
  }

  const applyOrder = (list) => {
    const orders = list.map((s, i) => ({ id: s.id, order: i }))
    onReorder(orders)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[380px] max-h-[500px] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">模块顺序</h2>
            <p className="text-xs text-gray-400 mt-0.5">拖动调整简历模块的显示顺序</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Module list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {sorted.map((section, index) => {
            const meta = SECTION_META[section.type] || SECTION_META.custom
            const Icon = meta.icon
            return (
              <div
                key={section.id}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition group border border-transparent hover:border-gray-100"
              >
                <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 cursor-grab" />
                <div className={`w-7 h-7 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-700">
                  {meta.label}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-20 disabled:cursor-not-allowed transition"
                  >
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index >= sorted.length - 1}
                    className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-20 disabled:cursor-not-allowed transition"
                  >
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">点击箭头调整顺序，个人信息始终显示在顶部</p>
        </div>
      </div>
    </div>
  )
}
