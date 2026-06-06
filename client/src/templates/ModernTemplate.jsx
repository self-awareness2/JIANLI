import { Mail, Phone, MapPin, Briefcase } from 'lucide-react'
import { descriptionToHTML } from './utils.js'

const SECTION_TITLES = {
  education: '教育经历',
  work: '工作经历',
  project: '项目经历',
  skill: '专业技能',
  summary: '个人总结',
}

export default function ModernTemplate({ personal, otherSections, activeSection, onClickSection, personalSectionId, themeColor = '#1a1a1a' }) {
  return (
    <>
      {/* Header - Left aligned */}
      <div
        className={`mb-5 pb-4 cursor-pointer rounded transition ${activeSection === personalSectionId ? 'ring-2 ring-blue-400 ring-offset-2' : 'hover:ring-1 hover:ring-gray-200 hover:ring-offset-1'}`}
        style={{ borderBottom: `2px solid ${themeColor}` }}
        onClick={() => onClickSection?.(personalSectionId)}
      >
        <h1 className="text-[26px] font-bold tracking-wide" style={{ color: themeColor }}>
          {personal.name || '姓名'}
        </h1>
        <p className="text-[15px] text-gray-600 mt-1">
          {personal.title || '职位'}
          {personal.experience ? `（${personal.experience}经验）` : ''}
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-[13px] text-gray-500">
          {personal.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />{personal.location}
            </span>
          )}
          {personal.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />{personal.phone}
            </span>
          )}
          {personal.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />{personal.email}
            </span>
          )}
          {personal.experience && (
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />工作经验: {personal.experience}
            </span>
          )}
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
            <h2 className="text-[15px] font-bold pb-1.5 mb-3 tracking-wide" style={{ color: themeColor, borderBottom: `2px solid ${themeColor}` }}>
              {SECTION_TITLES[section.type] || section.type}
            </h2>
            <SectionContent type={section.type} data={sectionData} themeColor={themeColor} />
          </div>
        )
      })}
    </>
  )
}

function SectionContent({ type, data, themeColor }) {
  switch (type) {
    case 'education': return <EducationItems items={data.items || []} />
    case 'work': return <WorkItems items={data.items || []} />
    case 'project': return <ProjectItems items={data.items || []} />
    case 'skill': return <SkillItems items={data.items || []} themeColor={themeColor} />
    case 'summary': return data.summary ? <div className="text-[13px] text-gray-600 leading-relaxed resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(data.summary) }} /> : null
    default: return null
  }
}

function EducationItems({ items }) {
  return items.map((item, i) => (
    <div key={i} className="mb-2.5">
      <div className="flex justify-between items-baseline">
        <div>
          <span className="font-bold text-gray-900">{item.school || '学校名称'}</span>
        </div>
        <span className="text-[12px] text-gray-500 ml-4 whitespace-nowrap">
          {[item.startDate, item.endDate].filter(Boolean).join(' - ')}
        </span>
      </div>
      <div className="text-[13px] text-gray-600 mt-0.5">
        {[item.major, item.degree].filter(Boolean).join(' · ')}
      </div>
      {item.description && <p className="text-[13px] text-gray-500 mt-1">{item.description}</p>}
    </div>
  ))
}

function WorkItems({ items }) {
  return items.map((item, i) => (
    <div key={i} className="mb-4">
      <div className="flex justify-between items-baseline">
        <div>
          <span className="font-bold text-gray-900">{item.company || '公司名称'}</span>
        </div>
        <span className="text-[12px] text-gray-500 ml-4 whitespace-nowrap">
          {[item.startDate, item.endDate].filter(Boolean).join(' - ')}
        </span>
      </div>
      <div className="flex justify-between items-baseline mt-0.5">
        <span className="text-[13px] text-gray-600">{item.position || ''}</span>
        {item.city && <span className="text-[12px] text-gray-400">{item.city}</span>}
      </div>
      {item.description && (
        <div className="text-[13px] text-gray-600 mt-1.5 resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(item.description) }} />
      )}
    </div>
  ))
}

function ProjectItems({ items }) {
  return items.map((item, i) => (
    <div key={i} className="mb-4">
      <div className="flex justify-between items-baseline">
        <div>
          <span className="font-bold text-gray-900">{item.name || '项目名称'}</span>
          {item.role && <span className="text-[13px] text-gray-500 ml-2">{item.role}</span>}
        </div>
        <span className="text-[12px] text-gray-500 ml-4 whitespace-nowrap">
          {[item.startDate, item.endDate].filter(Boolean).join(' - ')}
        </span>
      </div>
      {item.description && (
        <div className="text-[13px] text-gray-600 mt-1.5 resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(item.description) }} />
      )}
    </div>
  ))
}

const LEVEL_MAP = { '精通': 5, '熟练': 4, '掌握': 3, '了解': 2, '入门': 1 }

function SkillItems({ items, themeColor }) {
  const accent = themeColor || '#2563eb'
  const valid = items.filter((i) => i.name)
  if (!valid.length) return null

  const hasLevels = valid.some(i => i.level)
  if (!hasLevels) {
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {valid.map((item, i) => (
          <span key={i} className="text-[13px] text-gray-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: accent }} />
            {item.name}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
      {valid.map((item, i) => {
        const dots = LEVEL_MAP[item.level] || 0
        return (
          <div key={i} className="flex items-center justify-between">
            <span className="text-[13px] text-gray-800 truncate mr-2">{item.name}</span>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {[1,2,3,4,5].map(n => (
                <div key={n} className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: n <= dots ? accent : `${accent}20` }} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
