import { descriptionToHTML } from './utils.js'

const SECTION_TITLES = {
  education: '教育经历',
  work: '工作经历',
  project: '项目经历',
  skill: '专业技能',
  summary: '个人总结',
}

export default function MinimalTemplate({ personal, otherSections, activeSection, onClickSection, personalSectionId, themeColor }) {
  const accent = themeColor || '#525252'

  return (
    <>
      {/* Header - ultra minimal */}
      <div
        className={`mb-6 cursor-pointer rounded transition ${activeSection === personalSectionId ? 'ring-2 ring-blue-400 ring-offset-2' : 'hover:ring-1 hover:ring-gray-200 hover:ring-offset-1'}`}
        onClick={() => onClickSection?.(personalSectionId)}
      >
        <h1 className="text-[22px] font-semibold" style={{ color: accent }}>
          {personal.name || '姓名'}
        </h1>
        <div className="text-[13px] text-gray-500 mt-1 space-x-2">
          {personal.title && <span>{personal.title}</span>}
          {personal.phone && <><span>·</span><span>{personal.phone}</span></>}
          {personal.email && <><span>·</span><span>{personal.email}</span></>}
          {personal.location && <><span>·</span><span>{personal.location}</span></>}
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
            <h2 className="text-[13px] font-semibold uppercase tracking-wider mb-2" style={{ color: accent, opacity: 0.7 }}>
              {SECTION_TITLES[section.type] || section.type}
            </h2>
            <SectionContent type={section.type} data={sectionData} />
          </div>
        )
      })}
    </>
  )
}

function SectionContent({ type, data }) {
  switch (type) {
    case 'education': return <EducationItems items={data.items || []} />
    case 'work': return <WorkItems items={data.items || []} />
    case 'project': return <ProjectItems items={data.items || []} />
    case 'skill': return <SkillItems items={data.items || []} />
    case 'summary': return data.summary ? <div className="text-[13px] text-gray-500 leading-relaxed resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(data.summary) }} /> : null
    default: return null
  }
}

function EducationItems({ items }) {
  return items.map((item, i) => (
    <div key={i} className="mb-2">
      <div className="flex justify-between items-baseline text-[13px]">
        <span className="font-medium text-gray-800">{item.school || '学校名称'}</span>
        <span className="text-gray-400 text-[12px]">{[item.startDate, item.endDate].filter(Boolean).join(' - ')}</span>
      </div>
      <div className="text-[12px] text-gray-500">{[item.major, item.degree].filter(Boolean).join(', ')}</div>
      {item.description && <p className="text-[12px] text-gray-400 mt-0.5">{item.description}</p>}
    </div>
  ))
}

function WorkItems({ items }) {
  return items.map((item, i) => (
    <div key={i} className="mb-3">
      <div className="flex justify-between items-baseline text-[13px]">
        <div>
          <span className="font-medium text-gray-800">{item.company || '公司名称'}</span>
          {item.position && <span className="text-gray-500 ml-2">{item.position}</span>}
        </div>
        <span className="text-gray-400 text-[12px]">{[item.startDate, item.endDate].filter(Boolean).join(' - ')}</span>
      </div>
      {item.description && (
        <div className="text-[12px] text-gray-600 mt-1 resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(item.description) }} />
      )}
    </div>
  ))
}

function ProjectItems({ items }) {
  return items.map((item, i) => (
    <div key={i} className="mb-3">
      <div className="flex justify-between items-baseline text-[13px]">
        <div>
          <span className="font-medium text-gray-800">{item.name || '项目名称'}</span>
          {item.role && <span className="text-gray-400 ml-2 text-[12px]">{item.role}</span>}
        </div>
        <span className="text-gray-400 text-[12px]">{[item.startDate, item.endDate].filter(Boolean).join(' - ')}</span>
      </div>
      {item.description && (
        <div className="text-[12px] text-gray-600 mt-1 resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(item.description) }} />
      )}
    </div>
  ))
}

function SkillItems({ items }) {
  const valid = items.filter((i) => i.name)
  if (!valid.length) return null
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1">
      {valid.map((item, i) => (
        <span key={i} className="text-[12px] text-gray-600 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-gray-400 inline-block" />
          {item.name}
          {item.level && <span className="text-gray-400">({item.level})</span>}
        </span>
      ))}
    </div>
  )
}
