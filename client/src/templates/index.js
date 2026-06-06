// 模板注册表
export const TEMPLATES = {
  modern: {
    id: 'modern',
    name: '现代简约',
    description: '简洁大方，适合互联网/科技行业',
    primaryColor: '#1a1a1a',
    accentColor: '#2563eb',
    headerStyle: 'left',
    sectionDivider: 'border',
  },
  professional: {
    id: 'professional',
    name: '专业商务',
    description: '正式稳重，适合金融/管理岗位',
    primaryColor: '#1e293b',
    accentColor: '#0f766e',
    headerStyle: 'center',
    sectionDivider: 'line',
  },
  creative: {
    id: 'creative',
    name: '创意设计',
    description: '个性鲜明，适合设计/创意岗位',
    primaryColor: '#18181b',
    accentColor: '#7c3aed',
    headerStyle: 'left',
    sectionDivider: 'dot',
  },
  elegant: {
    id: 'elegant',
    name: '优雅经典',
    description: '典雅大气，适合学术/教育行业',
    primaryColor: '#292524',
    accentColor: '#b45309',
    headerStyle: 'center',
    sectionDivider: 'double',
  },
  minimal: {
    id: 'minimal',
    name: '极简风格',
    description: '极度简洁，内容为王',
    primaryColor: '#171717',
    accentColor: '#525252',
    headerStyle: 'left',
    sectionDivider: 'none',
  },

  sidebar: {
    id: 'sidebar',
    name: '侧边栏双栏',
    description: '双栏布局，左侧资料右侧详情，信息层次分明',
    primaryColor: '#1e293b',
    accentColor: '#2563eb',
    headerStyle: 'sidebar',
    sectionDivider: 'line',
  },
  executive: {
    id: 'executive',
    name: '行政精英',
    description: '顶部横幅头部、粗体名字、图标模块标题，商务范儿',
    primaryColor: '#1e293b',
    accentColor: '#1e293b',
    headerStyle: 'banner',
    sectionDivider: 'icon-line',
  },
  timeline: {
    id: 'timeline',
    name: '时间线',
    description: '左侧时间轴串联经历，时间节点清晰直观',
    primaryColor: '#1e1b4b',
    accentColor: '#6366f1',
    headerStyle: 'center',
    sectionDivider: 'timeline',
  },
  compact: {
    id: 'compact',
    name: '紧凑双栏',
    description: '左右分栏内容体，充分利用空间，信息密度高',
    primaryColor: '#134e4a',
    accentColor: '#0f766e',
    headerStyle: 'left',
    sectionDivider: 'line',
  },
}

export const TEMPLATE_LIST = Object.values(TEMPLATES)

export function getTemplate(id) {
  return TEMPLATES[id] || TEMPLATES.modern
}
