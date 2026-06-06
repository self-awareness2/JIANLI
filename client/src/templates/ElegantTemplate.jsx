import { Mail, Phone, MapPin } from 'lucide-react'
import { descriptionToHTML } from './utils.js'

const SECTION_TITLES = {
  education: '教育经历',
  work: '工作经历',
  project: '项目经历',
  skill: '专业技能',
  summary: '个人总结',
}

export default function ElegantTemplate({ personal, otherSections, activeSection, onClickSection, personalSectionId, themeColor }) {
  const accent = themeColor || '#b45309'

  return (
    <>
      {/* Header - centered elegant */}
      <div
        className={`mb-6 text-center cursor-pointer rounded transition ${activeSection === personalSectionId ? 'ring-2 ring-blue-400 ring-offset-2' : 'hover:ring-1 hover:ring-gray-200 hover:ring-offset-1'}`}
        onClick={() => onClickSection?.(personalSectionId)}
      >
        <h1 className="text-[30px] font-light tracking-[0.2em] text-gray-800">
          {personal.name || '姓名'}
        </h1>
        <p className="text-[13px] text-gray-500 mt-1 tracking-wider">
          {personal.title || ''}
          {personal.experience ? ` · ${personal.experience}经验` : ''}
        </p>
        <div className="flex items-center justify-center gap-3 mt-3 text-[11px] text-gray-400">
          {personal.phone && <span>{personal.phone}</span>}
          {personal.phone && personal.email && <span>|</span>}
          {personal.email && <span>{personal.email}</span>}
          {(personal.phone || personal.email) && personal.location && <span>|</span>}
          {personal.location && <span>{personal.location}</span>}
        </div>
        {/* Double line divider */}
        <div className="mt-4 space-y-0.5">
          <div className="h-[1.5px] w-full" style={{ backgroundColor: accent }} />
          <div className="h-px w-full" style={{ backgroundColor: `${accent}40` }} />
        </div>
      </div>

      {/* Sections */}
      {otherSections.map((section) => {
        const sectionData = JSON.parse(section.data)
        return (
          <div
            key={section.id}
            className={`mb-5 cursor-pointer rounded transition ${activeSection === section.id ? 'ring-2 ring-blue-400 ring-offset-2' : 'hover:ring-1 hover:ring-gray-200 hover:ring-offset-1'}`}
            onClick={() => onClickSection?.(section.id)}
          >
            <h2 className="text-[13px] font-semibold text-center tracking-[0.15em] uppercase mb-3" style={{ color: accent }}>
              {SECTION_TITLES[section.type] || section.type}
            </h2>
            <SectionContent type={section.type} data={sectionData} accent={accent} />
          </div>
        )
      })}
    </>
  )
}

function SectionContent({ type, data, accent }) {
  switch (type) {
    case 'education': return <EducationItems items={data.items || []} />
    case 'work': return <WorkItems items={data.items || []} accent={accent} />
    case 'project': return <ProjectItems items={data.items || []} accent={accent} />
    case 'skill': return <SkillItems items={data.items || []} accent={accent} />
    case 'summary': return data.summary ? <div className="text-[13px] text-gray-600 leading-relaxed italic resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(data.summary) }} /> : null
    default: return null
  }
}

function EducationItems({ items }) {
  return items.map((item, i) => (
    <div key={i} className="mb-3">
      <div className="flex justify-between items-baseline">
        <span className="font-semibold text-gray-800 text-[14px]">{item.school || '学校名称'}</span>
        <span className="text-[11px] text-gray-400 italic">{[item.startDate, item.endDate].filter(Boolean).join(' — ')}</span>
      </div>
      <div className="text-[12px] text-gray-500 italic">{[item.major, item.degree].filter(Boolean).join(' · ')}</div>
      {item.description && <p className="text-[12px] text-gray-500 mt-1">{item.description}</p>}
    </div>
  ))
}

function WorkItems({ items }) {
  return items.map((item, i) => (
    <div key={i} className="mb-4">
      <div className="flex justify-between items-baseline">
        <span className="font-semibold text-gray-800 text-[14px]">{item.company || '公司名称'}</span>
        <div className="text-right">
          <span className="text-[11px] text-gray-400 italic">{[item.startDate, item.endDate].filter(Boolean).join(' — ')}</span>
        </div>
      </div>
      <div className="flex justify-between text-[12px] text-gray-500 italic mt-0.5">
        <span>{item.position || ''}</span>
        {item.city && <span>{item.city}</span>}
      </div>
      {item.description && (
        <div className="text-[12px] text-gray-600 mt-2 resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(item.description) }} />
      )}
    </div>
  ))
}

function ProjectItems({ items }) {
  return items.map((item, i) => (
    <div key={i} className="mb-4">
      <div className="flex justify-between items-baseline">
        <div>
          <span className="font-semibold text-gray-800 text-[14px]">{item.name || '项目名称'}</span>
          {item.role && <span className="text-[12px] text-gray-400 italic ml-2">{item.role}</span>}
        </div>
        <span className="text-[11px] text-gray-400 italic">{[item.startDate, item.endDate].filter(Boolean).join(' — ')}</span>
      </div>
      {item.description && (
        <div className="text-[12px] text-gray-600 mt-2 resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(item.description) }} />
      )}
    </div>
  ))
}

function SkillItems({ items, accent }) {
  const valid = items.filter((i) => i.name)
  if (!valid.length) return null
  return (
    <div className="text-center">
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-1.5">
        {valid.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-[12px] text-gray-700">
            {i > 0 && <span style={{ color: accent, opacity: 0.5 }}>•</span>}
            <span>{item.name}</span>
            {item.level && (
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${accent}15`, color: accent }}>
                {item.level}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
