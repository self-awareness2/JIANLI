import { Mail, Phone, MapPin, Briefcase } from 'lucide-react'
import { descriptionToHTML } from './utils.js'

const SECTION_TITLES = {
  education: '教育经历',
  work: '工作经历',
  project: '项目经历',
  skill: '专业技能',
  summary: '个人总结',
}

export default function CreativeTemplate({ personal, otherSections, activeSection, onClickSection, personalSectionId, themeColor }) {
  const accent = themeColor || '#7c3aed'

  return (
    <>
      {/* Header - with colored bg block */}
      <div
        className={`mb-6 cursor-pointer rounded-xl transition ${activeSection === personalSectionId ? 'ring-2 ring-blue-400 ring-offset-2' : 'hover:ring-1 hover:ring-gray-200 hover:ring-offset-1'}`}
        onClick={() => onClickSection?.(personalSectionId)}
      >
        <div className="rounded-xl p-5" style={{ background: `linear-gradient(135deg, ${accent}08, ${accent}15)` }}>
          <div className="flex items-start gap-4">
            {/* Avatar placeholder */}
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
              style={{ backgroundColor: accent }}
            >
              {(personal.name || '?')[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-[24px] font-bold" style={{ color: accent }}>
                {personal.name || '姓名'}
              </h1>
              <p className="text-[14px] text-gray-500 mt-0.5">
                {personal.title || '职位'}
                {personal.experience ? ` · ${personal.experience}` : ''}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[12px] text-gray-500">
                {personal.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{personal.location}</span>
                )}
                {personal.phone && (
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{personal.phone}</span>
                )}
                {personal.email && (
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{personal.email}</span>
                )}
              </div>
            </div>
          </div>
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
            {/* Section title with dot */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
              <h2 className="text-[15px] font-bold text-gray-900">
                {SECTION_TITLES[section.type] || section.type}
              </h2>
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
    case 'summary': return data.summary ? <div className="text-[13px] text-gray-600 leading-relaxed rounded-lg p-3 resume-html" style={{ background: `${accent}08` }} dangerouslySetInnerHTML={{ __html: descriptionToHTML(data.summary) }} /> : null
    default: return null
  }
}

function EducationItems({ items }) {
  return items.map((item, i) => (
    <div key={i} className="mb-3 ml-4">
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
    <div key={i} className="mb-4 ml-4">
      <div className="flex justify-between items-baseline">
        <span className="font-semibold text-gray-800">{item.company || '公司名称'}</span>
        <div className="text-right text-[12px] text-gray-400 whitespace-nowrap ml-4">
          <div>{[item.startDate, item.endDate].filter(Boolean).join(' - ')}</div>
          {item.city && <div>{item.city}</div>}
        </div>
      </div>
      <div className="text-[13px] mt-0.5" style={{ color: accent }}>{item.position || ''}</div>
      {item.description && (
        <div className="text-[13px] text-gray-600 mt-1.5 resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(item.description) }} />
      )}
    </div>
  ))
}

function ProjectItems({ items, accent }) {
  return items.map((item, i) => (
    <div key={i} className="mb-4 ml-4">
      <div className="flex justify-between items-baseline">
        <div>
          <span className="font-semibold text-gray-800">{item.name || '项目名称'}</span>
          {item.role && <span className="text-[12px] ml-2" style={{ color: accent }}>{item.role}</span>}
        </div>
        <span className="text-[12px] text-gray-400">{[item.startDate, item.endDate].filter(Boolean).join(' - ')}</span>
      </div>
      {item.description && (
        <div className="text-[13px] text-gray-600 mt-1.5 resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(item.description) }} />
      )}
    </div>
  ))
}

function SkillItems({ items, accent }) {
  const valid = items.filter((i) => i.name)
  if (!valid.length) return null
  return (
    <div className="ml-4 grid grid-cols-2 gap-1.5">
      {valid.map((item, i) => (
        <div key={i} className="flex items-center text-[13px]">
          <div className="w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: accent }} />
          <span className="text-gray-800">{item.name}</span>
          {item.level && <span className="text-gray-400 ml-1">({item.level})</span>}
        </div>
      ))}
    </div>
  )
}
