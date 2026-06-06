import { Mail, Phone, MapPin, Briefcase } from 'lucide-react'
import { descriptionToHTML } from './utils.js'

const SECTION_TITLES = {
  education: '教育经历',
  work: '工作经历',
  project: '项目经历',
  skill: '专业技能',
  summary: '个人简介',
}

const SIDEBAR_TYPES = new Set(['skill', 'education', 'summary'])

const LEVEL_WIDTH = { '精通': '100%', '熟练': '80%', '掌握': '60%', '了解': '40%', '入门': '20%' }

export default function SidebarTemplate({ personal, otherSections, activeSection, onClickSection, personalSectionId, themeColor }) {
  const accent = themeColor || '#2563eb'

  const sidebarSections = otherSections.filter(s => SIDEBAR_TYPES.has(s.type))
  const mainSections = otherSections.filter(s => !SIDEBAR_TYPES.has(s.type))

  return (
    <div className="flex h-full min-h-full">
      {/* Left Sidebar */}
      <div className="w-[36%] flex-shrink-0 min-h-full" style={{ backgroundColor: `${accent}0d` }}>
        {/* Header in sidebar */}
        <div
          className={`px-5 pt-6 pb-5 cursor-pointer transition ${activeSection === personalSectionId ? 'ring-2 ring-inset ring-blue-400' : ''}`}
          style={{ backgroundColor: accent }}
          onClick={() => onClickSection?.(personalSectionId)}
        >
          {/* Avatar circle */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-3 mx-auto"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
          >
            {(personal.name || '?')[0]}
          </div>
          <h1 className="text-[20px] font-bold text-white text-center leading-tight">
            {personal.name || '姓名'}
          </h1>
          {personal.title && (
            <p className="text-[12px] text-center mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {personal.title}
            </p>
          )}
        </div>

        {/* Contact info */}
        <div className="px-5 py-4 space-y-2" style={{ borderBottom: `1px solid ${accent}20` }}>
          {personal.phone && (
            <div className="flex items-center gap-2 text-[12px] text-gray-600">
              <Phone className="w-3 h-3 flex-shrink-0" style={{ color: accent }} />
              <span>{personal.phone}</span>
            </div>
          )}
          {personal.email && (
            <div className="flex items-center gap-2 text-[12px] text-gray-600">
              <Mail className="w-3 h-3 flex-shrink-0" style={{ color: accent }} />
              <span className="break-all">{personal.email}</span>
            </div>
          )}
          {personal.location && (
            <div className="flex items-center gap-2 text-[12px] text-gray-600">
              <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: accent }} />
              <span>{personal.location}</span>
            </div>
          )}
          {personal.experience && (
            <div className="flex items-center gap-2 text-[12px] text-gray-600">
              <Briefcase className="w-3 h-3 flex-shrink-0" style={{ color: accent }} />
              <span>{personal.experience} 工作经验</span>
            </div>
          )}
        </div>

        {/* Sidebar sections */}
        <div className="px-5 py-4 space-y-5">
          {sidebarSections.map((section) => {
            const sectionData = JSON.parse(section.data)
            return (
              <div
                key={section.id}
                className={`cursor-pointer rounded transition ${activeSection === section.id ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                onClick={() => onClickSection?.(section.id)}
              >
                <h2 className="text-[12px] font-bold uppercase tracking-wider mb-2" style={{ color: accent }}>
                  {SECTION_TITLES[section.type] || section.type}
                </h2>
                <div className="h-px mb-2.5" style={{ backgroundColor: `${accent}30` }} />
                <SidebarSectionContent type={section.type} data={sectionData} accent={accent} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Main Content */}
      <div className="flex-1 px-6 py-6 min-h-full">
        {mainSections.map((section) => {
          const sectionData = JSON.parse(section.data)
          return (
            <div
              key={section.id}
              className={`mb-6 cursor-pointer rounded transition ${activeSection === section.id ? 'ring-2 ring-blue-400 ring-offset-2' : 'hover:ring-1 hover:ring-gray-200 hover:ring-offset-1'}`}
              onClick={() => onClickSection?.(section.id)}
            >
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[14px] font-bold whitespace-nowrap" style={{ color: accent }}>
                  {SECTION_TITLES[section.type] || section.type}
                </h2>
                <div className="flex-1 h-[1.5px]" style={{ backgroundColor: accent }} />
              </div>
              <MainSectionContent type={section.type} data={sectionData} accent={accent} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ===== Sidebar section renderers ===== */
function SidebarSectionContent({ type, data, accent }) {
  switch (type) {
    case 'skill': return <SidebarSkills items={data.items || []} accent={accent} />
    case 'education': return <SidebarEducation items={data.items || []} accent={accent} />
    case 'summary': return data.summary
      ? <div className="text-[11px] text-gray-600 leading-relaxed resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(data.summary) }} />
      : null
    default: return null
  }
}

function SidebarSkills({ items, accent }) {
  const valid = items.filter(i => i.name)
  if (!valid.length) return null
  const hasLevels = valid.some(i => i.level && LEVEL_WIDTH[i.level])
  if (!hasLevels) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {valid.map((item, i) => (
          <span key={i} className="text-[11px] px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${accent}15`, color: accent }}>
            {item.name}
          </span>
        ))}
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {valid.map((item, i) => (
        <div key={i}>
          <div className="flex justify-between text-[11px] mb-0.5">
            <span className="text-gray-700 font-medium">{item.name}</span>
            {item.level && <span style={{ color: accent }}>{item.level}</span>}
          </div>
          <div className="h-1 rounded-full" style={{ backgroundColor: `${accent}20` }}>
            <div className="h-1 rounded-full" style={{ backgroundColor: accent, width: LEVEL_WIDTH[item.level] || '50%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function SidebarEducation({ items }) {
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i} className="text-[11px]">
          <div className="font-semibold text-gray-800">{item.school || '学校名称'}</div>
          {(item.major || item.degree) && (
            <div className="text-gray-500 mt-0.5">{[item.major, item.degree].filter(Boolean).join(' · ')}</div>
          )}
          {(item.startDate || item.endDate) && (
            <div className="text-gray-400 mt-0.5">{[item.startDate, item.endDate].filter(Boolean).join(' - ')}</div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ===== Main section renderers ===== */
function MainSectionContent({ type, data, accent }) {
  switch (type) {
    case 'work': return <WorkItems items={data.items || []} accent={accent} />
    case 'project': return <ProjectItems items={data.items || []} accent={accent} />
    case 'education': return <EducationItems items={data.items || []} accent={accent} />
    case 'skill': return <SkillItems items={data.items || []} accent={accent} />
    case 'summary': return data.summary
      ? <div className="text-[13px] text-gray-600 leading-relaxed resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(data.summary) }} />
      : null
    default: return null
  }
}

function WorkItems({ items, accent }) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="relative pl-4" style={{ borderLeft: `2px solid ${accent}30` }}>
          <div
            className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: accent }}
          />
          <div className="flex justify-between items-baseline">
            <span className="font-semibold text-gray-900 text-[13px]">{item.company || '公司名称'}</span>
            <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">
              {[item.startDate, item.endDate].filter(Boolean).join(' - ')}
            </span>
          </div>
          <div className="flex justify-between text-[12px] mt-0.5">
            <span style={{ color: accent }} className="font-medium">{item.position || ''}</span>
            {item.city && <span className="text-gray-400">{item.city}</span>}
          </div>
          {item.description && (
            <div className="text-[12px] text-gray-600 mt-1.5 resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(item.description) }} />
          )}
        </div>
      ))}
    </div>
  )
}

function ProjectItems({ items, accent }) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="relative pl-4" style={{ borderLeft: `2px solid ${accent}30` }}>
          <div
            className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: accent }}
          />
          <div className="flex justify-between items-baseline">
            <div>
              <span className="font-semibold text-gray-900 text-[13px]">{item.name || '项目名称'}</span>
              {item.role && <span className="text-[11px] ml-2" style={{ color: accent }}>{item.role}</span>}
            </div>
            <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">
              {[item.startDate, item.endDate].filter(Boolean).join(' - ')}
            </span>
          </div>
          {item.description && (
            <div className="text-[12px] text-gray-600 mt-1.5 resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(item.description) }} />
          )}
        </div>
      ))}
    </div>
  )
}

function EducationItems({ items, accent }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex justify-between items-baseline">
          <div>
            <span className="font-semibold text-gray-800 text-[13px]">{item.school}</span>
            <div className="text-[12px] text-gray-500">{[item.major, item.degree].filter(Boolean).join(' · ')}</div>
          </div>
          <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">
            {[item.startDate, item.endDate].filter(Boolean).join(' - ')}
          </span>
        </div>
      ))}
    </div>
  )
}

function SkillItems({ items, accent }) {
  const valid = items.filter(i => i.name)
  if (!valid.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {valid.map((item, i) => (
        <span key={i} className="text-[12px] px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: `${accent}12`, color: accent }}>
          {item.name}{item.level ? ` · ${item.level}` : ''}
        </span>
      ))}
    </div>
  )
}
