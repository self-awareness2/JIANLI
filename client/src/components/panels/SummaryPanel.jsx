import { FileText } from 'lucide-react'

export default function SummaryPanel({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value })
  }

  const len = data.summary?.length || 0
  const isShort = len > 0 && len < 50
  const isGood = len >= 50 && len <= 200
  const isLong = len > 200

  return (
    <div className="space-y-3">
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
          <FileText className="w-3.5 h-3.5 text-gray-400" />
          个人总结
        </label>
        <textarea
          value={data.summary || ''}
          onChange={(e) => handleChange('summary', e.target.value)}
          placeholder="简要描述你的职业目标、核心优势和个人特点..."
          rows={5}
          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm leading-relaxed transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 hover:border-gray-300 resize-none placeholder:text-gray-300"
        />
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-xs text-gray-400">
            {isShort && '内容偏短，建议补充更多细节'}
            {isGood && '长度合适'}
            {isLong && '内容偏长，建议精简'}
            {len === 0 && '建议 50-200 字，突出核心竞争力'}
          </p>
          <span className={`text-xs font-medium ${isGood ? 'text-emerald-500' : isLong ? 'text-orange-400' : 'text-gray-300'}`}>
            {len} 字
          </span>
        </div>
      </div>
    </div>
  )
}
