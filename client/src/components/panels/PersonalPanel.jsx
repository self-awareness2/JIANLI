import { Mail, Phone, MapPin, Briefcase, User, FileText } from 'lucide-react'

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 hover:border-gray-300 placeholder:text-gray-300'

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        {label}
      </label>
      {children}
    </div>
  )
}

export default function PersonalPanel({ data, onChange }) {
  const update = (field, value) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-5">
      {/* 姓名 & 职位 */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="姓名" icon={User}>
          <input value={data.name || ''} onChange={(e) => update('name', e.target.value)} className={inputClass} placeholder="请输入姓名" />
        </Field>
        <Field label="求职意向" icon={Briefcase}>
          <input value={data.title || ''} onChange={(e) => update('title', e.target.value)} className={inputClass} placeholder="如：前端工程师" />
        </Field>
      </div>

      {/* 联系方式 */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">联系方式</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="手机" icon={Phone}>
            <input value={data.phone || ''} onChange={(e) => update('phone', e.target.value)} className={inputClass} placeholder="手机号码" />
          </Field>
          <Field label="邮箱" icon={Mail}>
            <input type="email" value={data.email || ''} onChange={(e) => update('email', e.target.value)} className={inputClass} placeholder="邮箱地址" />
          </Field>
        </div>
      </div>

      {/* 地点 & 经验 */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="所在城市" icon={MapPin}>
          <input value={data.location || ''} onChange={(e) => update('location', e.target.value)} className={inputClass} placeholder="如：北京" />
        </Field>
        <Field label="工作经验">
          <input value={data.experience || ''} onChange={(e) => update('experience', e.target.value)} className={inputClass} placeholder="如：3年" />
        </Field>
      </div>

      {/* 个人简介 */}
      <Field label="个人简介" icon={FileText}>
        <textarea
          value={data.summary || ''}
          onChange={(e) => update('summary', e.target.value)}
          rows={3}
          className={inputClass + ' resize-none'}
          placeholder="简短介绍自己的核心优势..."
        />
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${(data.summary?.length || 0) > 150 ? 'text-orange-400' : 'text-gray-300'}`}>
            {data.summary?.length || 0} 字
          </span>
        </div>
      </Field>
    </div>
  )
}
