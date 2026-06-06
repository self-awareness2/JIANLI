import { descriptionToHTML } from './utils.js'

const SECTION_TITLES = {
  education: '教育背景',
  work: '工作经历',
  project: '项目经历',
  skill: '专业技能',
  summary: '个人简介',
}

const LEVEL_PERCENT = { '精通': 95, '熟练': 80, '掌握': 60, '了解': 40, '入门': 20 }

export default function CompactTemplate({ personal, otherSections, activeSection, onClickSection, personalSectionId, themeColor }) {
  const accent = themeColor || '#0f766e'

  return (
    <>
      {/* Compact header: name left, contact right */}
      <div
        className={`pb-3 mb-4 cursor-pointer transition ${activeSection === personalSectionId ? 'ring-2 ring-blue-400 ring-offset-2 rounded' : ''}`}
        onClick={() => onClickSection?.(personalSectionId)}
        style={{ borderBottom: `2px solid ${accent}` }}
      >
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[24px] font-black text-gray-900 leading-none">{personal.name || '姓名'}</h1>
            {personal.title && (
              <p className="text-[13px] font-semibold mt-1" style={{ color: accent }}>{personal.title}</p>
            )}
          </div>
          <div className="text-right text-[11px] text-gray-500 leading-relaxed">
            {personal.phone && <div>{personal.phone}</div>}
            {personal.email && <div>{personal.email}</div>}
            {[personal.location, personal.experience].filter(Boolean).length > 0 && (
              <div>{[personal.location, personal.experience].filter(Boolean).join(' · ')}</div>
            )}
          </div>
        </div>
      </div>

      {/* Two-column body: left = main content, right = skills + summary */}
      <div className="flex gap-6">
        {/* Left: Work + Project + Education (wider) */}
        <div className="flex-1 min-w-0">
          {otherSections.filter(s => ['work', 'project', 'education'].includes(s.type)).map((section) => {
            const sectionData = JSON.parse(section.data)
            return (
              <div
                key={section.id}
                className={`mb-4 cursor-pointer rounded transition ${activeSection === section.id ? 'ring-2 ring-blue-400 ring-offset-2' : 'hover:ring-1 hover:ring-gray-200 hover:ring-offset-1'}`}
                onClick={() => onClickSection?.(section.id)}
              >
                <h2 className="text-[12px] font-bold uppercase tracking-widest pb-1 mb-2" style={{ color: accent, borderBottom: `1px solid ${accent}40` }}>
                  {SECTION_TITLES[section.type] || section.type}
                </h2>
                <MainContent type={section.type} data={sectionData} accent={accent} />
              </div>
            )
          })}
        </div>

        {/* Right: Skills + Summary (narrower) */}
        <div className="w-[35%] flex-shrink-0">
          {otherSections.filter(s => ['skill', 'summary'].includes(s.type)).map((section) => {
            const sectionData = JSON.parse(section.data)
            return (
              <div
                key={section.id}
                className={`mb-4 cursor-pointer rounded transition ${activeSection === section.id ? 'ring-2 ring-blue-400 ring-offset-2' : 'hover:ring-1 hover:ring-gray-200 hover:ring-offset-1'}`}
                onClick={() => onClickSection?.(section.id)}
              >
                <h2 className="text-[12px] font-bold uppercase tracking-widest pb-1 mb-2" style={{ color: accent, borderBottom: `1px solid ${accent}40` }}>
                  {SECTION_TITLES[section.type] || section.type}
                </h2>
                <SideContent type={section.type} data={sectionData} accent={accent} />
              </div>
            )
          })}

          {/* Any remaining sections not in the above two groups */}
          {otherSections.filter(s => !['work', 'project', 'education', 'skill', 'summary'].includes(s.type)).map((section) => {
            const sectionData = JSON.parse(section.data)
            return (
              <div
                key={section.id}
                className={`mb-4 cursor-pointer rounded transition ${activeSection === section.id ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
                onClick={() => onClickSection?.(section.id)}
              >
                <h2 className="text-[12px] font-bold uppercase tracking-widest pb-1 mb-2" style={{ color: accent, borderBottom: `1px solid ${accent}40` }}>
                  {section.type}
                </h2>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

function MainContent({ type, data, accent }) {
  const items = data.items || []
  if (type === 'education') {
    return items.map((item, i) => (
      <div key={i} className="mb-2">
        <div className="flex justify-between items-baseline">
          <span className="font-bold text-gray-800 text-[12px]">{item.school || '学校'}</span>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">{[item.startDate, item.endDate].filter(Boolean).join(' - ')}</span>
        </div>
        {(item.major || item.degree) && (
          <div className="text-[11px] text-gray-500">{[item.degree, item.major].filter(Boolean).join(' · ')}</div>
        )}
      </div>
    ))
  }
  if (type === 'work') {
    return items.map((item, i) => (
      <div key={i} className="mb-3">
        <div className="flex justify-between items-baseline">
          <div>
            <span className="font-bold text-gray-800 text-[12px]">{item.company || '公司'}</span>
            {item.position && <span className="text-[11px] ml-1.5 font-medium" style={{ color: accent }}>{item.position}</span>}
          </div>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">{[item.startDate, item.endDate].filter(Boolean).join(' - ')}</span>
        </div>
        {item.description && (
          <div className="text-[11px] text-gray-600 mt-1 resume-html leading-relaxed" dangerouslySetInnerHTML={{ __html: descriptionToHTML(item.description) }} />
        )}
      </div>
    ))
  }
  if (type === 'project') {
    return items.map((item, i) => (
      <div key={i} className="mb-3">
        <div className="flex justify-between items-baseline">
          <div>
            <span className="font-bold text-gray-800 text-[12px]">{item.name || '项目'}</span>
            {item.role && <span className="text-[11px] ml-1.5" style={{ color: accent }}>{item.role}</span>}
          </div>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">{[item.startDate, item.endDate].filter(Boolean).join(' - ')}</span>
        </div>
        {item.description && (
          <div className="text-[11px] text-gray-600 mt-1 resume-html leading-relaxed" dangerouslySetInnerHTML={{ __html: descriptionToHTML(item.description) }} />
        )}
      </div>
    ))
  }
  return null
}

function SideContent({ type, data, accent }) {
  if (type === 'summary' && data.summary) {
    return <div className="text-[11px] text-gray-600 leading-relaxed resume-html" dangerouslySetInnerHTML={{ __html: descriptionToHTML(data.summary) }} />
  }
  if (type === 'skill') {
    const valid = (data.items || []).filter(i => i.name)
    if (!valid.length) return null
    const hasLevels = valid.some(i => i.level && LEVEL_PERCENT[i.level])
    if (!hasLevels) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {valid.map((item, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: `${accent}12`, color: accent }}>
              {item.name}
            </span>
          ))}
        </div>
      )
    }
    return (
      <div className="space-y-1.5">
        {valid.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="text-gray-700 font-medium">{item.name}</span>
              <span style={{ color: accent }}>{item.level}</span>
            </div>
            <div className="h-1 rounded-full" style={{ backgroundColor: `${accent}15` }}>
              <div className="h-1 rounded-full transition-all" style={{ backgroundColor: accent, width: `${LEVEL_PERCENT[item.level] || 50}%` }} />
            </div>
          </div>
        ))}
      </div>
    )
  }
  return null
}
