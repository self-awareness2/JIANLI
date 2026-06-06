import { Mail, Phone, MapPin, Briefcase } from 'lucide-react'
import { descriptionToHTML } from './utils.js'

const SECTION_TITLES = {
  education: '教育背景',
  work: '职业经历',
  project: '项目成果',
  skill: '核心技能',
  summary: '职业概述',
}

export default function ExecutiveTemplate({ personal, otherSections, activeSection, onClickSection, personalSectionId, themeColor }) {
  const accent = themeColor || '#1e293b'

  return (
    <>
      {/* Executive Banner Header */}
      <div
        className={`-mx-[15mm] -mt-[15mm] px-[15mm] cursor-pointer transition ${activeSection === personalSectionId ? 'ring-2 ring-inset ring-blue-400' : ''}`}
        onClick={() => onClickSection?.(personalSectionId)}
      >
        {/* Accent top bar */}
        <div className="h-2" style={{ backgroundColor: accent }} />
        <div className="px-8 py-6 bg-gray-50">
          <h1 className="text-[28px] font-black tracking-tight" style={{ color: accent }}>
            {personal.name || '姓名'}
          </h1>
          {personal.title && (
            <p className="text-[15px] font-medium text-gray-500 mt-1 tracking-wide uppercase">{personal.title}</p>
          )}
          {/* Contact row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3">
            {personal.phone && (
              <span className="flex items-center gap-1.5 text-[12px] text-gray-500">
                <Phone className="w-3 h-3" style={{ color: accent }} /> {personal.phone}
              </span>
            )}
            {personal.email && (
              <span className="flex items-center gap-1.5 text-[12px] text-gray-500">
                <Mail className="w-3 h-3" style={{ color: accent }} /> {personal.email}
              </span>
            )}
            {personal.location && (
              <span className="flex items-center gap-1.5 text-[12px] text-gray-500">
                <MapPin className="w-3 h-3" style={{ color: accent }} /> {personal.location}
              </span>
            )}
            {personal.experience && (
              <span className="flex items-center gap-1.5 text-[12px] text-gray-500">
                <Briefcase className="w-3 h-3" style={{ color: accent }} /> {personal.experience}
              </span>
            )}
          </div>
        </div>
        <div className="h-[1px]" style={{ backgroundColor: accent }} />
      </div>

      {/* Sections */}
      <div className="mt-6">
        {otherSections.map((section) => {
          const sectionData = JSON.parse(section.data)
          return (
            <div
              key={section.id}
              className={`mb-5 cursor-pointer rounded transition ${activeSection === section.id ? 'ring-2 ring-blue-400 ring-offset-2' : 'hover:ring-1 hover:ring-gray-200 hover:ring-offset-1'}`}
              onClick={() => onClickSection?.(section.id)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[13px] font-bold" style={{ backgroundColor: accent }}>
                  {(SECTION_TITLES[section.type] || '?')[0]}
                </div>
                <h2 className="text-[15px] font-bold tracking-wide" style={{ color: accent }}>
                  {SECTION_TITLES[section.type] || section.type}
                </h2>
                <div className="flex-1 h-[1px] bg-gray-200" />
              </div>
              <SectionContent type={section.type} data={sectionData} accent={accent} />
            </div>
          )
        })}
      </div>
    </>
  )
}

function SectionContent({ type, data, accent }) {
  switch (type) {
    case 'education': return <EducationItems items={data.items || []} accent={accent} />
    case 'work': return <WorkItems items={data.items || []} accent={accent} />
    case 'project': return <ProjectItems items={data.items || []} accent={accent} />
    case 'skill': return <SkillItems items={data.items || []} accent={accent} />
    case 'summary': return data.summary
      ? <div className="text-[13px] text-gray-600 leading-relaxed pl-11 resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(data.summary) }} />
      : null
    default: return null
  }
}

function EducationItems({ items }) {
  return items.map((item, i) => (
    <div key={i} className="mb-3 pl-11">
      <div className="flex justify-between items-baseline">
        <div>
          <span className="font-bold text-gray-800 text-[14px]">{item.school || '学校名称'}</span>
          {(item.major || item.degree) && (
            <span className="text-[12px] text-gray-500 ml-2">{[item.degree, item.major].filter(Boolean).join(' · ')}</span>
          )}
        </div>
        <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap ml-3">
          {[item.startDate, item.endDate].filter(Boolean).join(' — ')}
        </span>
      </div>
    </div>
  ))
}

function WorkItems({ items, accent }) {
  return items.map((item, i) => (
    <div key={i} className="mb-4 pl-11">
      <div className="flex justify-between items-baseline">
        <div>
          <span className="font-bold text-gray-800 text-[14px]">{item.company || '公司名称'}</span>
          {item.position && (
            <span className="text-[12px] font-semibold ml-2" style={{ color: accent }}>{item.position}</span>
          )}
        </div>
        <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap ml-3">
          {[item.startDate, item.endDate].filter(Boolean).join(' — ')}
        </span>
      </div>
      {item.description && (
        <div className="text-[12px] text-gray-600 mt-1.5 resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(item.description) }} />
      )}
    </div>
  ))
}

function ProjectItems({ items, accent }) {
  return items.map((item, i) => (
    <div key={i} className="mb-4 pl-11">
      <div className="flex justify-between items-baseline">
        <div>
          <span className="font-bold text-gray-800 text-[14px]">{item.name || '项目名称'}</span>
          {item.role && <span className="text-[12px] ml-2" style={{ color: accent }}>{item.role}</span>}
        </div>
        <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap ml-3">
          {[item.startDate, item.endDate].filter(Boolean).join(' — ')}
        </span>
      </div>
      {item.description && (
        <div className="text-[12px] text-gray-600 mt-1.5 resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(item.description) }} />
      )}
    </div>
  ))
}

function SkillItems({ items, accent }) {
  const valid = items.filter(i => i.name)
  if (!valid.length) return null
  return (
    <div className="pl-11 flex flex-wrap gap-2">
      {valid.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1 rounded-lg border font-medium"
          style={{ borderColor: `${accent}30`, color: accent, backgroundColor: `${accent}08` }}>
          {item.name}
          {item.level && <span className="text-[10px] opacity-60">· {item.level}</span>}
        </span>
      ))}
    </div>
  )
}
