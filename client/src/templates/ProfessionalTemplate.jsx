import { Mail, Phone, MapPin, Briefcase } from 'lucide-react'
import { descriptionToHTML } from './utils.js'

const SECTION_TITLES = {
  education: '教育经历',
  work: '工作经历',
  project: '项目经历',
  skill: '专业技能',
  summary: '个人总结',
}

export default function ProfessionalTemplate({ personal, otherSections, activeSection, onClickSection, personalSectionId, themeColor }) {
  const accent = themeColor || '#0f766e'

  return (
    <>
      {/* Header - Centered with accent bar */}
      <div
        className={`mb-6 text-center cursor-pointer rounded transition ${activeSection === personalSectionId ? 'ring-2 ring-blue-400 ring-offset-2' : 'hover:ring-1 hover:ring-gray-200 hover:ring-offset-1'}`}
        onClick={() => onClickSection?.(personalSectionId)}
      >
        <h1 className="text-[28px] font-bold tracking-widest" style={{ color: accent }}>
          {personal.name || '姓名'}
        </h1>
        <p className="text-[14px] text-gray-500 mt-1 tracking-wide">
          {personal.title || '职位'}
          {personal.experience ? ` · ${personal.experience}经验` : ''}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 mt-3 text-[12px] text-gray-500">
          {personal.phone && (
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{personal.phone}</span>
          )}
          {personal.email && (
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{personal.email}</span>
          )}
          {personal.location && (
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{personal.location}</span>
          )}
        </div>
        <div className="mt-4 h-[2px] w-full" style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }} />
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
            {/* Section title with line */}
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-[14px] font-bold whitespace-nowrap tracking-wider" style={{ color: accent }}>
                {SECTION_TITLES[section.type] || section.type}
              </h2>
              <div className="flex-1 h-px" style={{ backgroundColor: accent, opacity: 0.3 }} />
            </div>
            <SectionContent type={section.type} data={sectionData} accent={accent} />
          </div>
        )
      })}
    </>
  )
}

function SectionContent({ type, data, accent }) {
  switch (type) {
    case 'education': return <EducationItems items={data.items || []} accent={accent} />
    case 'work': return <WorkItems items={data.items || []} accent={accent} />
    case 'project': return <ProjectItems items={data.items || []} accent={accent} />
    case 'skill': return <SkillItems items={data.items || []} accent={accent} />
    case 'summary': return data.summary ? <div className="text-[13px] text-gray-600 leading-relaxed pl-3 resume-html" style={{ borderLeft: `2px solid ${accent}30` }} dangerouslySetInnerHTML={{ __html: descriptionToHTML(data.summary) }} /> : null
    default: return null
  }
}

function EducationItems({ items, accent }) {
  return items.map((item, i) => (
    <div key={i} className="mb-3 pl-3" style={{ borderLeft: `2px solid ${accent}30` }}>
      <div className="flex justify-between items-baseline">
        <span className="font-semibold text-gray-800">{item.school || '学校名称'}</span>
        <span className="text-[12px] text-gray-400">{[item.startDate, item.endDate].filter(Boolean).join(' - ')}</span>
      </div>
      <div className="text-[13px] text-gray-500">{[item.major, item.degree].filter(Boolean).join(' · ')}</div>
      {item.description && <p className="text-[12px] text-gray-500 mt-1">{item.description}</p>}
    </div>
  ))
}

function WorkItems({ items, accent }) {
  return items.map((item, i) => (
    <div key={i} className="mb-4 pl-3" style={{ borderLeft: `2px solid ${accent}30` }}>
      <div className="flex justify-between items-baseline">
        <span className="font-semibold text-gray-800">{item.company || '公司名称'}</span>
        <span className="text-[12px] text-gray-400">{[item.startDate, item.endDate].filter(Boolean).join(' - ')}</span>
      </div>
      <div className="flex justify-between text-[13px] text-gray-500 mt-0.5">
        <span>{item.position || ''}</span>
        <span>{item.city || ''}</span>
      </div>
      {item.description && (
        <div className="text-[13px] text-gray-600 mt-1.5 resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(item.description) }} />
      )}
    </div>
  ))
}

function ProjectItems({ items, accent }) {
  return items.map((item, i) => (
    <div key={i} className="mb-4 pl-3" style={{ borderLeft: `2px solid ${accent}30` }}>
      <div className="flex justify-between items-baseline">
        <div>
          <span className="font-semibold text-gray-800">{item.name || '项目名称'}</span>
          {item.role && <span className="text-[12px] text-gray-400 ml-2">{item.role}</span>}
        </div>
        <span className="text-[12px] text-gray-400">{[item.startDate, item.endDate].filter(Boolean).join(' - ')}</span>
      </div>
      {item.description && (
        <div className="text-[13px] text-gray-600 mt-1.5 resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(item.description) }} />
      )}
    </div>
  ))
}

const LEVEL_WIDTH = { '精通': '100%', '熟练': '80%', '掌握': '60%', '了解': '40%', '入门': '20%' }

function SkillItems({ items, accent }) {
  const valid = items.filter((i) => i.name)
  if (!valid.length) return null
  const hasLevels = valid.some(i => i.level && LEVEL_WIDTH[i.level])
  if (!hasLevels) {
    return (
      <div className="flex flex-wrap gap-2">
        {valid.map((item, i) => (
          <span key={i} className="px-2.5 py-0.5 rounded text-[12px] font-medium"
            style={{ backgroundColor: `${accent}12`, color: accent }}>
            {item.name}
          </span>
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
      {valid.map((item, i) => (
        <div key={i}>
          <div className="flex justify-between text-[12px] mb-0.5">
            <span className="text-gray-800 font-medium">{item.name}</span>
            {item.level && <span style={{ color: accent }} className="opacity-70">{item.level}</span>}
          </div>
          <div className="h-1 rounded-full w-full" style={{ backgroundColor: `${accent}18` }}>
            <div className="h-1 rounded-full" style={{ backgroundColor: accent, width: LEVEL_WIDTH[item.level] || '50%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
