import ModernTemplate from '../templates/ModernTemplate.jsx'
import ProfessionalTemplate from '../templates/ProfessionalTemplate.jsx'
import CreativeTemplate from '../templates/CreativeTemplate.jsx'
import ElegantTemplate from '../templates/ElegantTemplate.jsx'
import MinimalTemplate from '../templates/MinimalTemplate.jsx'
import SidebarTemplate from '../templates/SidebarTemplate.jsx'
import ExecutiveTemplate from '../templates/ExecutiveTemplate.jsx'
import TimelineTemplate from '../templates/TimelineTemplate.jsx'
import CompactTemplate from '../templates/CompactTemplate.jsx'

const FONT_MAP = {
  default: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  songti: '"SimSun", "STSong", serif',
  heiti: '"SimHei", "STHeiti", sans-serif',
  kaiti: '"KaiTi", "STKaiti", serif',
  fangsong: '"FangSong", "STFangsong", serif',
}

const TEMPLATE_COMPONENTS = {
  modern: ModernTemplate,
  classic: ModernTemplate,
  professional: ProfessionalTemplate,
  clean: ProfessionalTemplate,
  student: CreativeTemplate,
  graduate: CreativeTemplate,
  campus: ProfessionalTemplate,
  intern: ProfessionalTemplate,
  elegant: ElegantTemplate,
  formal: ElegantTemplate,
  creative: CreativeTemplate,
  tech: MinimalTemplate,
  minimal: MinimalTemplate,
  sidebar: SidebarTemplate,
  executive: ExecutiveTemplate,
  timeline: TimelineTemplate,
  compact: CompactTemplate,
}

export default function ResumePreview({ resume, sections, activeSection, onClickSection }) {
  const settings = {
    fontSize: resume?.fontSize || 14,
    fontFamily: FONT_MAP[resume?.fontFamily] || FONT_MAP.default,
    lineHeight: resume?.lineHeight || 1.5,
    margin: resume?.margin || 15,
    themeColor: resume?.themeColor || '#2563eb',
  }

  const personalSection = sections.find((s) => s.type === 'personal')
  const personal = personalSection ? JSON.parse(personalSection.data) : {}
  const otherSections = sections.filter((s) => s.type !== 'personal')

  const TemplateComponent = TEMPLATE_COMPONENTS[resume?.template] || ModernTemplate

  const isSidebar = resume?.template === 'sidebar'

  return (
    <div
      className="bg-white shadow-lg mx-auto overflow-hidden"
      id="resume-preview"
      style={{
        width: '210mm',
        minHeight: '297mm',
        fontFamily: settings.fontFamily,
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineHeight,
        padding: isSidebar ? '0' : `${settings.margin}mm`,
      }}
    >
      <TemplateComponent
        personal={personal}
        otherSections={otherSections}
        activeSection={activeSection}
        onClickSection={onClickSection}
        personalSectionId={personalSection?.id}
        themeColor={settings.themeColor}
      />
    </div>
  )
}
