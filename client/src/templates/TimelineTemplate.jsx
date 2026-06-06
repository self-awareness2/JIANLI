import { Mail, Phone, MapPin, Briefcase } from 'lucide-react'
import { descriptionToHTML } from './utils.js'

const SECTION_TITLES = {
  education: '教育经历',
  work: '工作经历',
  project: '项目经历',
  skill: '专业技能',
  summary: '个人简介',
}

export default function TimelineTemplate({ personal, otherSections, activeSection, onClickSection, personalSectionId, themeColor }) {
  const accent = themeColor || '#6366f1'

  return (
    <>
      {/* Clean centered header */}
      <div
        className={`text-center pb-5 mb-5 cursor-pointer transition ${activeSection === personalSectionId ? 'ring-2 ring-blue-400 ring-offset-2 rounded' : ''}`}
        onClick={() => onClickSection?.(personalSectionId)}
        style={{ borderBottom: `3px solid ${accent}` }}
      >
        <h1 className="text-[26px] font-black tracking-tight text-gray-900">
          {personal.name || '姓名'}
        </h1>
        {personal.title && (
          <p className="text-[14px] mt-1 font-medium" style={{ color: accent }}>{personal.title}</p>
        )}
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mt-3 text-[12px] text-gray-500">
          {personal.phone && (
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {personal.phone}</span>
          )}
          {personal.email && (
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {personal.email}</span>
          )}
          {personal.location && (
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {personal.location}</span>
          )}
          {personal.experience && (
            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {personal.experience}</span>
          )}
        </div>
      </div>

      {/* Sections with timeline */}
      {otherSections.map((section) => {
        const sectionData = JSON.parse(section.data)
        const isTimeline = ['work', 'project', 'education'].includes(section.type)
        return (
          <div
            key={section.id}
            className={`mb-6 cursor-pointer rounded transition ${activeSection === section.id ? 'ring-2 ring-blue-400 ring-offset-2' : 'hover:ring-1 hover:ring-gray-200 hover:ring-offset-1'}`}
            onClick={() => onClickSection?.(section.id)}
          >
            <h2 className="text-[14px] font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>
              {SECTION_TITLES[section.type] || section.type}
            </h2>
            {isTimeline
              ? <TimelineSectionContent type={section.type} data={sectionData} accent={accent} />
              : <PlainSectionContent type={section.type} data={sectionData} accent={accent} />
            }
          </div>
        )
      })}
    </>
  )
}

function TimelineSectionContent({ type, data, accent }) {
  const items = data.items || []
  if (!items.length) return null

  return (
    <div className="relative ml-3">
      {/* Vertical line */}
      <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full" style={{ backgroundColor: `${accent}25` }} />

      {items.map((item, i) => {
        const title = type === 'education' ? (item.school || '学校名称')
          : type === 'work' ? (item.company || '公司名称')
          : (item.name || '项目名称')
        const subtitle = type === 'education' ? [item.degree, item.major].filter(Boolean).join(' · ')
          : type === 'work' ? item.position
          : item.role
        const dates = [item.startDate, item.endDate].filter(Boolean).join(' — ')

        return (
          <div key={i} className="relative pl-6 pb-4 last:pb-0">
            {/* Timeline dot */}
            <div
              className="absolute left-[-4px] top-1.5 w-[10px] h-[10px] rounded-full border-2 bg-white"
              style={{ borderColor: accent }}
            />
            {/* Date badge */}
            {dates && (
              <div className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mb-1"
                style={{ backgroundColor: `${accent}12`, color: accent }}>
                {dates}
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-gray-800 text-[13px]">{title}</span>
              {subtitle && <span className="text-[11px] font-medium" style={{ color: accent }}>{subtitle}</span>}
            </div>
            {item.description && (
              <div className="text-[12px] text-gray-600 mt-1 resume-html leading-relaxed" dangerouslySetInnerHTML={{ __html: descriptionToHTML(item.description) }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function PlainSectionContent({ type, data, accent }) {
  switch (type) {
    case 'skill': return <SkillItems items={data.items || []} accent={accent} />
    case 'summary': return data.summary
      ? <div className="text-[13px] text-gray-600 leading-relaxed resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(data.summary) }} />
      : null
    default: return null
  }
}

function SkillItems({ items, accent }) {
  const valid = items.filter(i => i.name)
  if (!valid.length) return null

  const LEVEL_DOTS = { '精通': 5, '熟练': 4, '掌握': 3, '了解': 2, '入门': 1 }
  const hasLevels = valid.some(i => i.level && LEVEL_DOTS[i.level])

  if (!hasLevels) {
    return (
      <div className="flex flex-wrap gap-2">
        {valid.map((item, i) => (
          <span key={i} className="text-[12px] px-2.5 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: `${accent}10`, color: accent }}>
            {item.name}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
      {valid.map((item, i) => {
        const filled = LEVEL_DOTS[item.level] || 0
        return (
          <div key={i} className="flex items-center justify-between">
            <span className="text-[12px] text-gray-700 font-medium">{item.name}</span>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(n => (
                <div key={n} className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: n <= filled ? accent : `${accent}20` }} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
