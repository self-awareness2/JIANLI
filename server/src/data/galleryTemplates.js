// 简历广场 - 各行各业模板简历数据（47个模板）
const galleryTemplates = [
  // ========== 互联网/IT ==========
  { id: 'g-fe-dev', category: '互联网/IT', title: '前端开发工程师', description: '3年React/Vue全栈前端', template: 'modern', themeColor: '#2563eb', tags: ['前端','React','Vue'], hot: true, sections: [
    { type: 'personal', order: 0, data: { name: '张伟', title: '高级前端开发工程师', phone: '138****1234', email: 'zhangwei@email.com', location: '北京', experience: '3年' } },
    { type: 'education', order: 1, data: { items: [{ school: '北京理工大学', major: '计算机科学与技术', degree: '本科', startDate: '2017.09', endDate: '2021.06', description: 'GPA 3.6/4.0' }] } },
    { type: 'work', order: 2, data: { items: [
      { company: '字节跳动', position: '前端开发工程师', startDate: '2022.03', endDate: '至今', city: '北京', description: '- 负责抖音创作者平台前端架构，日活超500万\n- 主导微前端改造，部署效率提升60%\n- 优化LCP从3.2s降至1.1s，留存率提升15%' },
      { company: '美团', position: '前端实习生', startDate: '2021.07', endDate: '2022.02', city: '北京', description: '- 独立完成订单管理模块开发\n- React+TS重构jQuery页面' }
    ] } },
    { type: 'skill', order: 3, data: { items: [{ name: 'React/Next.js', level: '精通' },{ name: 'TypeScript', level: '精通' },{ name: 'Vue 3', level: '熟练' },{ name: 'Node.js', level: '熟练' },{ name: 'Webpack/Vite', level: '熟练' },{ name: 'CSS/Tailwind', level: '精通' }] } },
    { type: 'summary', order: 4, data: { summary: '3年前端开发经验，精通React和TypeScript生态，具备大型项目架构设计能力。擅长性能优化和工程化建设。' } },
  ]},
  { id: 'g-be-dev', category: '互联网/IT', title: '后端开发工程师', description: '5年Java/Go后端经验', template: 'professional', themeColor: '#059669', tags: ['后端','Java','微服务'], hot: true, sections: [
    { type: 'personal', order: 0, data: { name: '李强', title: '高级后端开发工程师', phone: '139****5678', email: 'liqiang@email.com', location: '上海', experience: '5年' } },
    { type: 'education', order: 1, data: { items: [{ school: '上海交通大学', major: '软件工程', degree: '硕士', startDate: '2016.09', endDate: '2019.06', description: '' }] } },
    { type: 'work', order: 2, data: { items: [
      { company: '阿里巴巴', position: '高级Java工程师', startDate: '2021.04', endDate: '至今', city: '上海', description: '- 负责淘宝交易链路核心服务，日均2000万笔订单\n- 分布式事务方案，一致性达99.999%\n- 微服务迁移，可用性提升至99.99%' },
      { company: '百度', position: 'Java工程师', startDate: '2019.07', endDate: '2021.03', city: '北京', description: '- 百度地图POI服务，日10亿次调用\n- Redis多级缓存，命中率98%' }
    ] } },
    { type: 'skill', order: 3, data: { items: [{ name: 'Java/Spring Boot', level: '精通' },{ name: 'Go', level: '熟练' },{ name: 'MySQL/Redis', level: '精通' },{ name: 'Kafka', level: '熟练' },{ name: '微服务/K8s', level: '熟练' },{ name: '系统设计', level: '精通' }] } },
    { type: 'summary', order: 4, data: { summary: '5年后端开发经验，精通分布式系统设计。具备千万级并发系统架构能力。' } },
  ]},
  { id: 'g-pm', category: '互联网/IT', title: '产品经理', description: '3年B端产品经验', template: 'elegant', themeColor: '#7c3aed', tags: ['产品','B端','需求分析'], sections: [
    { type: 'personal', order: 0, data: { name: '王芳', title: '高级产品经理', phone: '137****9012', email: 'wangfang@email.com', location: '杭州', experience: '3年' } },
    { type: 'education', order: 1, data: { items: [{ school: '浙江大学', major: '信息管理', degree: '本科', startDate: '2017.09', endDate: '2021.06', description: '' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '网易', position: '产品经理', startDate: '2022.01', endDate: '至今', city: '杭州', description: '- 企业协作平台MAU从5万增至30万\n- 产出PRD 50+篇，A/B测试转化率提升25%\n- 跨部门协作按期交付率95%' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: '需求分析', level: '精通' },{ name: 'Axure/Figma', level: '精通' },{ name: '数据分析', level: '熟练' },{ name: 'SQL', level: '熟练' },{ name: '项目管理', level: '熟练' }] } },
    { type: 'summary', order: 4, data: { summary: '3年B端产品经理，擅长复杂业务需求转化，数据驱动决策。' } },
  ]},
  { id: 'g-data', category: '互联网/IT', title: '数据分析师', description: '2年数据分析经验', template: 'sidebar', themeColor: '#0891b2', tags: ['数据','Python','SQL'], sections: [
    { type: 'personal', order: 0, data: { name: '陈静', title: '数据分析师', phone: '136****3456', email: 'chenjing@email.com', location: '深圳', experience: '2年' } },
    { type: 'education', order: 1, data: { items: [{ school: '中山大学', major: '统计学', degree: '硕士', startDate: '2019.09', endDate: '2022.06', description: '' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '腾讯', position: '数据分析师', startDate: '2022.07', endDate: '至今', city: '深圳', description: '- 微信支付用户行为分析体系，覆盖2亿+用户\n- A/B测试50+次，转化率提升18%\n- Python自动化报表，节省每周20+小时' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: 'Python/Pandas', level: '精通' },{ name: 'SQL', level: '精通' },{ name: 'Tableau', level: '熟练' },{ name: '统计分析', level: '熟练' },{ name: 'Excel/VBA', level: '精通' }] } },
    { type: 'summary', order: 4, data: { summary: '2年数据分析经验，擅长数据驱动业务增长。精通Python和SQL。' } },
  ]},
  { id: 'g-ai', category: '互联网/IT', title: 'AI算法工程师', description: '3年深度学习/NLP经验', template: 'timeline', themeColor: '#6d28d9', tags: ['AI','深度学习','NLP'], hot: true, sections: [
    { type: 'personal', order: 0, data: { name: '赵明', title: 'AI算法工程师', phone: '135****7890', email: 'zhaoming@email.com', location: '北京', experience: '3年' } },
    { type: 'education', order: 1, data: { items: [{ school: '清华大学', major: '人工智能', degree: '硕士', startDate: '2018.09', endDate: '2021.06', description: '顶会论文2篇(ACL, EMNLP)' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '商汤科技', position: '高级算法工程师', startDate: '2021.07', endDate: '至今', city: '北京', description: '- LLM微调与部署，推理速度提升3倍\n- 多模态内容理解系统，准确率96.5%\n- RAG检索增强生成，客户满意度提升40%' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: 'PyTorch', level: '精通' },{ name: 'Python', level: '精通' },{ name: 'LLM/RAG', level: '精通' },{ name: 'NLP/CV', level: '熟练' },{ name: 'CUDA优化', level: '熟练' }] } },
    { type: 'summary', order: 4, data: { summary: '3年AI算法工程师，专注LLM和NLP。有顶会论文，具备模型研发到工程落地全流程能力。' } },
  ]},
  { id: 'g-devops', category: '互联网/IT', title: 'DevOps工程师', description: '4年运维/DevOps经验', template: 'compact', themeColor: '#475569', tags: ['DevOps','K8s','CI/CD'], sections: [
    { type: 'personal', order: 0, data: { name: '周鹏', title: 'DevOps工程师', phone: '138****2222', email: 'zhoupeng@email.com', location: '北京', experience: '4年' } },
    { type: 'education', order: 1, data: { items: [{ school: '北京航空航天大学', major: '计算机科学', degree: '本科', startDate: '2016.09', endDate: '2020.06', description: '' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '滴滴出行', position: 'DevOps高级工程师', startDate: '2021.05', endDate: '至今', city: '北京', description: '- 搭建CI/CD流水线，日均部署次数从20提升至200+\n- Kubernetes集群管理，3000+Pod稳定运行\n- 监控告警体系覆盖率从60%提升至99%' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: 'Kubernetes', level: '精通' },{ name: 'Docker', level: '精通' },{ name: 'Jenkins/GitLab CI', level: '精通' },{ name: 'Prometheus', level: '熟练' },{ name: 'Terraform', level: '熟练' },{ name: 'Shell/Python', level: '熟练' }] } },
    { type: 'summary', order: 4, data: { summary: '4年DevOps经验，擅长CI/CD流水线和K8s集群管理。注重自动化和可观测性建设。' } },
  ]},
  { id: 'g-test', category: '互联网/IT', title: '测试工程师', description: '3年自动化测试经验', template: 'minimal', themeColor: '#0d9488', tags: ['测试','自动化','质量'], sections: [
    { type: 'personal', order: 0, data: { name: '林凯', title: '高级测试工程师', phone: '137****3333', email: 'linkai@email.com', location: '杭州', experience: '3年' } },
    { type: 'education', order: 1, data: { items: [{ school: '杭州电子科技大学', major: '软件工程', degree: '本科', startDate: '2017.09', endDate: '2021.06', description: '' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '蚂蚁集团', position: '高级测试工程师', startDate: '2021.08', endDate: '至今', city: '杭州', description: '- 搭建支付宝自动化测试框架，用例2000+条\n- 接口自动化覆盖率从30%提升至85%\n- 发现线上P0级缺陷5个，避免资损超千万' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: 'Selenium/Appium', level: '精通' },{ name: 'Python', level: '精通' },{ name: 'JMeter', level: '熟练' },{ name: 'SQL', level: '熟练' },{ name: 'Jenkins', level: '熟练' }] } },
    { type: 'summary', order: 4, data: { summary: '3年自动化测试经验，擅长测试框架搭建和质量保障体系建设。' } },
  ]},
  // ========== 金融 ==========
  { id: 'g-finance', category: '金融', title: '金融分析师', description: '4年投行分析经验，CFA', template: 'executive', themeColor: '#1e3a5f', tags: ['金融','CFA','投资'], sections: [
    { type: 'personal', order: 0, data: { name: '刘洋', title: '高级金融分析师', phone: '138****2345', email: 'liuyang@email.com', location: '上海', experience: '4年' } },
    { type: 'education', order: 1, data: { items: [{ school: '复旦大学', major: '金融学', degree: '硕士', startDate: '2017.09', endDate: '2020.06', description: 'CFA三级' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '中金公司', position: '高级研究员', startDate: '2022.03', endDate: '至今', city: '上海', description: '- 覆盖消费板块15家上市公司，深度报告30+篇\n- 推荐标的平均超额收益25%\n- 搭建行业数据库和估值模型' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: '财务建模', level: '精通' },{ name: '行业研究', level: '精通' },{ name: 'Wind/Bloomberg', level: '精通' },{ name: 'Python量化', level: '熟练' },{ name: 'Excel/VBA', level: '精通' }] } },
    { type: 'summary', order: 4, data: { summary: '4年卖方研究经验，CFA持证人。擅长消费和TMT行业研究。' } },
  ]},
  { id: 'g-risk', category: '金融', title: '风控经理', description: '5年金融风控经验', template: 'professional', themeColor: '#374151', tags: ['风控','银行','反欺诈'], sections: [
    { type: 'personal', order: 0, data: { name: '孙涛', title: '高级风控经理', phone: '139****4567', email: 'suntao@email.com', location: '北京', experience: '5年' } },
    { type: 'education', order: 1, data: { items: [{ school: '中国人民大学', major: '金融工程', degree: '硕士', startDate: '2016.09', endDate: '2019.06', description: '' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '蚂蚁集团', position: '高级风控策略师', startDate: '2021.05', endDate: '至今', city: '杭州', description: '- 花呗/借呗信用模型，管理资产500亿+\n- 反欺诈拦截率提升30%，误杀率降低15%\n- 实时风控引擎，毫秒级决策' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: '风险建模', level: '精通' },{ name: 'Python/R', level: '熟练' },{ name: 'SQL/Hive', level: '精通' },{ name: '反欺诈', level: '精通' },{ name: 'FRM', level: '持证' }] } },
    { type: 'summary', order: 4, data: { summary: '5年金融风控经验，FRM持证。擅长信用评估和反欺诈。' } },
  ]},
  { id: 'g-pe', category: '金融', title: '私募股权投资', description: '4年PE/VC投资经验', template: 'executive', themeColor: '#1e293b', tags: ['PE','VC','投资','尽调'], sections: [
    { type: 'personal', order: 0, data: { name: '钱浩', title: '投资副总裁', phone: '138****6666', email: 'qianhao@email.com', location: '北京', experience: '4年' } },
    { type: 'education', order: 1, data: { items: [{ school: '北京大学光华管理学院', major: 'MBA', degree: '硕士', startDate: '2017.09', endDate: '2019.06', description: '' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '红杉资本', position: '投资副总裁', startDate: '2021.06', endDate: '至今', city: '北京', description: '- 主导消费/科技赛道投资，累计投资金额超5亿元\n- 完成项目尽调20+个，已投项目IRR达35%+\n- 投后管理6个项目，协助2家完成下一轮融资' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: '行业研究', level: '精通' },{ name: '财务分析', level: '精通' },{ name: '尽职调查', level: '精通' },{ name: '商务谈判', level: '熟练' },{ name: '投后管理', level: '熟练' }] } },
    { type: 'summary', order: 4, data: { summary: '4年PE投资经验，聚焦消费和科技赛道。具备从项目筛选到投后管理的全流程投资能力。' } },
  ]},
  // ========== 设计 ==========
  { id: 'g-ui', category: '设计', title: 'UI/UX设计师', description: '4年产品设计经验', template: 'creative', themeColor: '#ec4899', tags: ['UI','UX','Figma'], hot: true, sections: [
    { type: 'personal', order: 0, data: { name: '林小雨', title: '高级UI/UX设计师', phone: '136****6789', email: 'linxy@email.com', location: '深圳', experience: '4年' } },
    { type: 'education', order: 1, data: { items: [{ school: '中国美术学院', major: '视觉传达', degree: '本科', startDate: '2016.09', endDate: '2020.06', description: '' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '小红书', position: '高级交互设计师', startDate: '2022.04', endDate: '至今', city: '上海', description: '- 社区核心功能交互设计，3亿月活\n- 设计系统搭建，组件复用率85%\n- 发布流程优化，完成率提升22%' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: 'Figma', level: '精通' },{ name: 'Sketch', level: '精通' },{ name: '交互设计', level: '精通' },{ name: 'After Effects', level: '熟练' },{ name: '用户研究', level: '熟练' }] } },
    { type: 'summary', order: 4, data: { summary: '4年产品设计经验，擅长UX设计和设计系统搭建。' } },
  ]},
  { id: 'g-graphic', category: '设计', title: '平面设计师', description: '3年品牌视觉设计', template: 'creative', themeColor: '#f59e0b', tags: ['平面','品牌','PS'], sections: [
    { type: 'personal', order: 0, data: { name: '周蕾', title: '资深平面设计师', phone: '137****8901', email: 'zhoulei@email.com', location: '广州', experience: '3年' } },
    { type: 'education', order: 1, data: { items: [{ school: '广州美术学院', major: '平面设计', degree: '本科', startDate: '2017.09', endDate: '2021.06', description: '' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '奥美广告', position: '资深设计师', startDate: '2022.01', endDate: '至今', city: '广州', description: '- 宝洁、联合利华等国际品牌视觉设计\n- 主导品牌VI升级项目3个，满意度100%\n- 红点设计奖提名' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: 'Photoshop', level: '精通' },{ name: 'Illustrator', level: '精通' },{ name: 'InDesign', level: '熟练' },{ name: 'C4D', level: '熟练' },{ name: '品牌设计', level: '精通' }] } },
    { type: 'summary', order: 4, data: { summary: '3年品牌视觉设计经验，服务多个国际品牌。' } },
  ]},
  // ========== 市场/运营 ==========
  { id: 'g-mkt', category: '市场/运营', title: '市场营销经理', description: '5年品牌营销经验', template: 'elegant', themeColor: '#dc2626', tags: ['营销','品牌','推广'], sections: [
    { type: 'personal', order: 0, data: { name: '黄丽', title: '市场营销经理', phone: '138****0123', email: 'huangli@email.com', location: '上海', experience: '5年' } },
    { type: 'education', order: 1, data: { items: [{ school: '上海外国语大学', major: '市场营销', degree: '本科', startDate: '2015.09', endDate: '2019.06', description: '' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '完美日记', position: '品牌营销总监', startDate: '2022.06', endDate: '至今', city: '广州', description: '- 年度营销预算5000万+，ROI达1:8\n- 双11 GMV突破3亿，同比增长45%\n- KOL矩阵500+达人，曝光超10亿' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: '品牌策略', level: '精通' },{ name: '整合营销', level: '精通' },{ name: '社交媒体', level: '精通' },{ name: '数据分析', level: '熟练' },{ name: '预算管理', level: '熟练' }] } },
    { type: 'summary', order: 4, data: { summary: '5年品牌营销经验，擅长整合营销和效果转化。' } },
  ]},
  { id: 'g-ops', category: '市场/运营', title: '内容运营', description: '3年新媒体运营', template: 'modern', themeColor: '#ea580c', tags: ['运营','新媒体','短视频'], sections: [
    { type: 'personal', order: 0, data: { name: '吴欣', title: '高级内容运营', phone: '135****2345', email: 'wuxin@email.com', location: '北京', experience: '3年' } },
    { type: 'education', order: 1, data: { items: [{ school: '中国传媒大学', major: '新闻学', degree: '本科', startDate: '2017.09', endDate: '2021.06', description: '' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '快手', position: '高级内容运营', startDate: '2022.03', endDate: '至今', city: '北京', description: '- 教育垂类运营，月活增长300%\n- 创作者激励体系，优质内容产出提升200%\n- 爆款话题活动10+次，单次曝光5000万' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: '内容策划', level: '精通' },{ name: '短视频运营', level: '精通' },{ name: '数据分析', level: '熟练' },{ name: '文案撰写', level: '精通' },{ name: 'SEO', level: '熟练' }] } },
    { type: 'summary', order: 4, data: { summary: '3年内容运营经验，擅长短视频和用户增长。' } },
  ]},
  { id: 'g-growth', category: '市场/运营', title: '增长运营', description: '3年用户增长经验', template: 'sidebar', themeColor: '#0ea5e9', tags: ['增长','拉新','转化'], sections: [
    { type: 'personal', order: 0, data: { name: '何磊', title: '用户增长负责人', phone: '136****4444', email: 'helei@email.com', location: '深圳', experience: '3年' } },
    { type: 'education', order: 1, data: { items: [{ school: '深圳大学', major: '电子商务', degree: '本科', startDate: '2017.09', endDate: '2021.06', description: '' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '拼多多', position: '增长运营经理', startDate: '2022.04', endDate: '至今', city: '上海', description: '- 负责社交裂变增长策略，日新增用户50万+\n- 设计邀请机制，K因子从1.2提升至2.5\n- A/B测试200+次，注册转化率提升35%' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: '增长策略', level: '精通' },{ name: 'SQL/Python', level: '熟练' },{ name: 'A/B测试', level: '精通' },{ name: '用户生命周期', level: '精通' },{ name: '渠道投放', level: '熟练' }] } },
    { type: 'summary', order: 4, data: { summary: '3年用户增长经验，擅长社交裂变和转化优化。' } },
  ]},
  // ========== 教育 ==========
  { id: 'g-teacher', category: '教育', title: '高中英语教师', description: '6年教学经验', template: 'compact', themeColor: '#0d9488', tags: ['教师','英语','教育'], sections: [
    { type: 'personal', order: 0, data: { name: '杨雪', title: '高中英语教师', phone: '136****4567', email: 'yangxue@email.com', location: '成都', experience: '6年' } },
    { type: 'education', order: 1, data: { items: [{ school: '四川师范大学', major: '英语教育', degree: '硕士', startDate: '2015.09', endDate: '2018.06', description: '专八、高级教师资格证' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '成都七中', position: '高中英语教师', startDate: '2018.09', endDate: '至今', city: '成都', description: '- 连续3年带高三，一本上线率超85%\n- 开发校本课程，阅读成绩平均提升15分\n- 英语竞赛指导，一等奖3人次\n- 区级优秀教师' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: '课程设计', level: '精通' },{ name: '班级管理', level: '精通' },{ name: '教学研究', level: '熟练' },{ name: '多媒体教学', level: '熟练' }] } },
    { type: 'summary', order: 4, data: { summary: '6年高中英语教学经验，教学成果突出。' } },
  ]},
  // ========== 医疗/健康 ==========
  { id: 'g-doctor', category: '医疗/健康', title: '主治医师', description: '8年三甲临床经验', template: 'executive', themeColor: '#047857', tags: ['医生','临床','三甲'], sections: [
    { type: 'personal', order: 0, data: { name: '陈明德', title: '主治医师·心内科', phone: '138****7890', email: 'chenmd@email.com', location: '北京', experience: '8年' } },
    { type: 'education', order: 1, data: { items: [{ school: '北京大学医学部', major: '临床医学', degree: '博士', startDate: '2012.09', endDate: '2020.06', description: 'SCI论文5篇' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '北京协和医院', position: '主治医师', startDate: '2020.07', endDate: '至今', city: '北京', description: '- 管理病区20张床位，年接诊3000+人次\n- 心脏介入手术200+台，并发症率<1%\n- 临床研究成果在JACC发表' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: '心脏介入', level: '精通' },{ name: '临床诊断', level: '精通' },{ name: '临床研究', level: '熟练' },{ name: '医患沟通', level: '精通' }] } },
    { type: 'summary', order: 4, data: { summary: '8年心内科临床经验，擅长冠心病介入诊疗。' } },
  ]},
  // ========== 人力资源 ==========
  { id: 'g-hr', category: '人力资源', title: 'HRBP经理', description: '6年HR全模块经验', template: 'elegant', themeColor: '#7c3aed', tags: ['HR','招聘','HRBP'], sections: [
    { type: 'personal', order: 0, data: { name: '许慧', title: 'HRBP高级经理', phone: '136****1234', email: 'xuhui@email.com', location: '北京', experience: '6年' } },
    { type: 'education', order: 1, data: { items: [{ school: '中国人民大学', major: '人力资源管理', degree: '硕士', startDate: '2015.09', endDate: '2018.06', description: '' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '京东', position: 'HRBP高级经理', startDate: '2021.06', endDate: '至今', city: '北京', description: '- 对接技术中心1000+人团队\n- 招聘完成率120%，周期从45天缩至28天\n- 绩效优良率提升18%，人效提升25%' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: '招聘管理', level: '精通' },{ name: '绩效管理', level: '精通' },{ name: '组织发展', level: '熟练' },{ name: '员工关系', level: '精通' },{ name: '劳动法规', level: '熟练' }] } },
    { type: 'summary', order: 4, data: { summary: '6年HR全模块经验，擅长招聘和组织发展。' } },
  ]},
  // ========== 制造/工程 ==========
  { id: 'g-mech', category: '制造/工程', title: '机械工程师', description: '5年汽车零部件研发', template: 'professional', themeColor: '#475569', tags: ['机械','制造','CAD'], sections: [
    { type: 'personal', order: 0, data: { name: '王建国', title: '高级机械工程师', phone: '138****5678', email: 'wangjg@email.com', location: '武汉', experience: '5年' } },
    { type: 'education', order: 1, data: { items: [{ school: '华中科技大学', major: '机械设计制造', degree: '硕士', startDate: '2016.09', endDate: '2019.06', description: '' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '比亚迪', position: '高级机械工程师', startDate: '2021.03', endDate: '至今', city: '深圳', description: '- 新能源汽车电驱系统结构设计，量产项目3个\n- 减速器壳体优化，降本15%，NVH提升20%\n- DFMEA分析，产品一次合格率98%' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: 'CATIA/UG', level: '精通' },{ name: 'ANSYS', level: '熟练' },{ name: 'GD&T', level: '精通' },{ name: 'AutoCAD', level: '精通' },{ name: 'DFMEA', level: '熟练' }] } },
    { type: 'summary', order: 4, data: { summary: '5年汽车机械设计经验，熟悉电驱系统开发全流程。' } },
  ]},
  // ========== 应届生/实习 ==========
  { id: 'g-fresh-cs', category: '应届生/实习', title: '计算机应届生', description: '985本科，大厂实习', template: 'modern', themeColor: '#2563eb', tags: ['应届生','校招','计算机'], hot: true, sections: [
    { type: 'personal', order: 0, data: { name: '刘宇轩', title: '求职意向：后端开发', phone: '135****0123', email: 'liuyx@email.com', location: '南京', experience: '应届' } },
    { type: 'education', order: 1, data: { items: [{ school: '南京大学', major: '计算机科学', degree: '本科', startDate: '2021.09', endDate: '2025.06', description: 'GPA 3.8/4.0，国家奖学金' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '华为', position: '后端实习生', startDate: '2024.06', endDate: '2024.09', city: '深圳', description: '- 华为云对象存储后端开发，Go+gRPC\n- 分片上传优化，速度提升40%\n- 自动化测试50+例，覆盖率90%' }] } },
    { type: 'project', order: 3, data: { items: [{ name: '分布式KV存储引擎', role: '项目负责人', startDate: '2024.01', endDate: '2024.05', description: '- Raft共识算法，3节点高可用\n- LSM-Tree引擎，写入10万QPS\n- 校级优秀毕设' }] } },
    { type: 'skill', order: 4, data: { items: [{ name: 'Go/Java', level: '熟练' },{ name: 'Python', level: '熟练' },{ name: 'MySQL/Redis', level: '熟练' },{ name: 'React', level: '熟练' },{ name: 'Git', level: '熟练' }] } },
    { type: 'summary', order: 5, data: { summary: '南京大学CS应届生，GPA 3.8。有华为实习和分布式系统项目经验。' } },
  ]},
  { id: 'g-fresh-fin', category: '应届生/实习', title: '金融应届生', description: '211金融硕士，券商实习', template: 'elegant', themeColor: '#1e3a5f', tags: ['应届生','金融','券商'], sections: [
    { type: 'personal', order: 0, data: { name: '张雨涵', title: '求职意向：投行分析师', phone: '136****2345', email: 'zhangyh@email.com', location: '上海', experience: '应届' } },
    { type: 'education', order: 1, data: { items: [{ school: '上海财经大学', major: '金融学', degree: '硕士', startDate: '2022.09', endDate: '2025.06', description: 'CPA过3门，CFA一级' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '中信证券', position: '投行实习生', startDate: '2024.06', endDate: '2024.12', city: '上海', description: '- 参与3个IPO项目尽调\n- 建立财务预测模型，协助估值分析\n- 协调中介机构工作' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: '财务分析', level: '熟练' },{ name: 'Wind', level: '熟练' },{ name: 'Excel/PPT', level: '精通' },{ name: '尽职调查', level: '熟练' },{ name: '英语(CET-6 620)', level: '精通' }] } },
    { type: 'summary', order: 4, data: { summary: '上财金融硕士，CPA过3门。有中信投行实习经验。' } },
  ]},
  { id: 'g-fresh-design', category: '应届生/实习', title: '设计应届生', description: '美院本科，互联网实习', template: 'creative', themeColor: '#ec4899', tags: ['应届生','设计','UI'], sections: [
    { type: 'personal', order: 0, data: { name: '陈艺', title: '求职意向：UI设计师', phone: '137****3456', email: 'chenyi@email.com', location: '杭州', experience: '应届' } },
    { type: 'education', order: 1, data: { items: [{ school: '中国美术学院', major: '数字媒体艺术', degree: '本科', startDate: '2021.09', endDate: '2025.06', description: '红点概念奖' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '阿里巴巴', position: 'UX设计实习', startDate: '2024.07', endDate: '2024.12', city: '杭州', description: '- 钉钉移动端改版，会议模块交互优化\n- 高保真设计稿50+页，获优秀实习生\n- 搭建设计组件库' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: 'Figma', level: '精通' },{ name: 'Sketch', level: '熟练' },{ name: 'After Effects', level: '熟练' },{ name: '交互设计', level: '熟练' }] } },
    { type: 'summary', order: 4, data: { summary: '中国美院应届生，红点概念奖获得者。有阿里UX实习经验。' } },
  ]},
  // ========== 法律 ==========
  { id: 'g-lawyer', category: '法律', title: '执业律师', description: '5年诉讼/非诉经验', template: 'executive', themeColor: '#1e293b', tags: ['律师','法律','诉讼'], sections: [
    { type: 'personal', order: 0, data: { name: '张文博', title: '执业律师', phone: '138****5678', email: 'zhangwb@email.com', location: '北京', experience: '5年' } },
    { type: 'education', order: 1, data: { items: [{ school: '中国政法大学', major: '法学', degree: '硕士', startDate: '2016.09', endDate: '2019.06', description: '法律职业资格证A证' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '金杜律师事务所', position: '资深律师', startDate: '2021.04', endDate: '至今', city: '北京', description: '- 商事诉讼50+件，胜诉率85%，涉案10亿+\n- 企业并购尽调，金额超50亿\n- 3家上市公司常年法律顾问' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: '商事诉讼', level: '精通' },{ name: '合同审核', level: '精通' },{ name: '并购法务', level: '熟练' },{ name: '法律文书', level: '精通' },{ name: '英语法律', level: '熟练' }] } },
    { type: 'summary', order: 4, data: { summary: '5年执业律师，擅长商事争议解决和企业法律顾问服务。' } },
  ]},
  // ========== 销售 ==========
  { id: 'g-sales', category: '销售', title: '销售经理', description: '6年B2B企业销售', template: 'professional', themeColor: '#b91c1c', tags: ['销售','B2B','大客户'], hot: true, sections: [
    { type: 'personal', order: 0, data: { name: '陈志远', title: '大客户销售经理', phone: '139****7890', email: 'chenzy@email.com', location: '上海', experience: '6年' } },
    { type: 'education', order: 1, data: { items: [{ school: '上海大学', major: '工商管理', degree: '本科', startDate: '2014.09', endDate: '2018.06', description: '' }] } },
    { type: 'work', order: 2, data: { items: [{ company: 'Salesforce', position: '大客户销售经理', startDate: '2022.01', endDate: '至今', city: '上海', description: '- 华东区Top50客户，年签单3000万+\n- 连续3年超额完成(120%/135%/140%)\n- 带领5人团队，全国TOP 3' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: '大客户销售', level: '精通' },{ name: '商务谈判', level: '精通' },{ name: 'CRM', level: '熟练' },{ name: '团队管理', level: '熟练' },{ name: '方案呈现', level: '精通' }] } },
    { type: 'summary', order: 4, data: { summary: '6年B2B销售经验，连续超额完成目标。' } },
  ]},
  // ========== 财务/会计 ==========
  { id: 'g-cpa', category: '财务/会计', title: '财务主管', description: '5年财务管理，CPA', template: 'minimal', themeColor: '#065f46', tags: ['财务','CPA','审计'], sections: [
    { type: 'personal', order: 0, data: { name: '吴晓燕', title: '财务主管', phone: '137****8901', email: 'wuxy@email.com', location: '杭州', experience: '5年' } },
    { type: 'education', order: 1, data: { items: [{ school: '浙江工商大学', major: '会计学', degree: '本科', startDate: '2015.09', endDate: '2019.06', description: 'CPA全科、中级会计师' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '海康威视', position: '财务主管', startDate: '2021.06', endDate: '至今', city: '杭州', description: '- 管理团队8人，月度结算和年度审计\n- 预算准确率从80%提升至95%\n- 优化资金管理，年节约200万+' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: '财务分析', level: '精通' },{ name: '预算管理', level: '精通' },{ name: 'SAP/金蝶', level: '精通' },{ name: '税务筹划', level: '熟练' },{ name: 'Excel/VBA', level: '精通' }] } },
    { type: 'summary', order: 4, data: { summary: '5年财务管理，CPA持证。有四大和制造业双重背景。' } },
  ]},
  // ========== 行政/文秘 ==========
  { id: 'g-admin', category: '行政/文秘', title: '行政主管', description: '4年行政管理经验', template: 'compact', themeColor: '#6b7280', tags: ['行政','办公室','后勤'], sections: [
    { type: 'personal', order: 0, data: { name: '李雅', title: '行政主管', phone: '136****6789', email: 'liya@email.com', location: '成都', experience: '4年' } },
    { type: 'education', order: 1, data: { items: [{ school: '四川大学', major: '行政管理', degree: '本科', startDate: '2016.09', endDate: '2020.06', description: '' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '新希望集团', position: '行政主管', startDate: '2022.03', endDate: '至今', city: '成都', description: '- 管理200+人办公区，满意度95分\n- 年度行政预算800万，节约12%\n- 大型活动20+场，参与2000+人' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: '办公室管理', level: '精通' },{ name: '预算管理', level: '熟练' },{ name: '活动组织', level: '精通' },{ name: 'Office', level: '精通' }] } },
    { type: 'summary', order: 4, data: { summary: '4年行政管理经验，细致高效。' } },
  ]},
  // ========== 物流/供应链 ==========
  { id: 'g-scm', category: '物流/供应链', title: '供应链经理', description: '6年供应链管理', template: 'sidebar', themeColor: '#92400e', tags: ['供应链','采购','物流'], sections: [
    { type: 'personal', order: 0, data: { name: '马强', title: '供应链经理', phone: '138****9012', email: 'maqiang@email.com', location: '苏州', experience: '6年' } },
    { type: 'education', order: 1, data: { items: [{ school: '苏州大学', major: '物流管理', degree: '本科', startDate: '2014.09', endDate: '2018.06', description: 'CPIM认证' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '立讯精密', position: '供应链高级经理', startDate: '2021.03', endDate: '至今', city: '苏州', description: '- iPhone核心组件供应链，年采购20亿+\n- 供应商交付准时率从88%提升至97%\n- VMI管理模式，周转率提升35%' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: '供应链规划', level: '精通' },{ name: '采购管理', level: '精通' },{ name: 'SAP', level: '熟练' },{ name: '供应商管理', level: '精通' },{ name: '库存优化', level: '精通' }] } },
    { type: 'summary', order: 4, data: { summary: '6年供应链管理，CPIM认证。苹果供应链体系经验。' } },
  ]},
  // ========== 传媒/广告 ==========
  { id: 'g-copy', category: '传媒/广告', title: '资深文案策划', description: '4年广告创意文案', template: 'creative', themeColor: '#7c3aed', tags: ['文案','创意','广告'], sections: [
    { type: 'personal', order: 0, data: { name: '苏婉', title: '资深文案策划', phone: '135****0123', email: 'suwan@email.com', location: '上海', experience: '4年' } },
    { type: 'education', order: 1, data: { items: [{ school: '复旦大学', major: '广告学', degree: '本科', startDate: '2016.09', endDate: '2020.06', description: '' }] } },
    { type: 'work', order: 2, data: { items: [{ company: 'W+K', position: '资深文案', startDate: '2022.05', endDate: '至今', city: '上海', description: '- 服务Nike、可口可乐等全球品牌\n- Nike"不要轻看你"campaign，全网播放2亿+\n- 获ONE SHOW银奖、金投赏金奖' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: '创意文案', level: '精通' },{ name: '品牌策略', level: '熟练' },{ name: 'TVC脚本', level: '精通' },{ name: 'Social文案', level: '精通' },{ name: '提案呈现', level: '熟练' }] } },
    { type: 'summary', order: 4, data: { summary: '4年4A广告文案经验，多次获国际广告奖项。' } },
  ]},
  // ========== 建筑/房地产 ==========
  { id: 'g-arch', category: '建筑/房地产', title: '建筑设计师', description: '5年建筑方案设计', template: 'timeline', themeColor: '#78716c', tags: ['建筑','设计','BIM'], sections: [
    { type: 'personal', order: 0, data: { name: '赵刚', title: '主创建筑师', phone: '139****1111', email: 'zhaogang@email.com', location: '上海', experience: '5年' } },
    { type: 'education', order: 1, data: { items: [{ school: '同济大学', major: '建筑学', degree: '硕士', startDate: '2016.09', endDate: '2019.06', description: '一级注册建筑师' }] } },
    { type: 'work', order: 2, data: { items: [{ company: 'gmp建筑事务所', position: '主创建筑师', startDate: '2021.04', endDate: '至今', city: '上海', description: '- 主持商业综合体方案设计，总建面30万㎡\n- 项目获LEED金级认证\n- 参与国际竞赛，获2项优胜奖' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: 'Rhino/GH', level: '精通' },{ name: 'Revit/BIM', level: '精通' },{ name: 'AutoCAD', level: '精通' },{ name: 'PS/AI', level: '熟练' },{ name: '绿色建筑', level: '熟练' }] } },
    { type: 'summary', order: 4, data: { summary: '5年建筑设计经验，一级注册建筑师。擅长商业和文化类项目。' } },
  ]},
  // ========== 电商 ==========
  { id: 'g-ecom', category: '电商', title: '电商运营总监', description: '5年电商运营管理', template: 'modern', themeColor: '#e11d48', tags: ['电商','天猫','直播'], sections: [
    { type: 'personal', order: 0, data: { name: '钟涛', title: '电商运营总监', phone: '138****2222', email: 'zhongtao@email.com', location: '杭州', experience: '5年' } },
    { type: 'education', order: 1, data: { items: [{ school: '浙江大学', major: '电子商务', degree: '本科', startDate: '2015.09', endDate: '2019.06', description: '' }] } },
    { type: 'work', order: 2, data: { items: [{ company: '三只松鼠', position: '电商运营总监', startDate: '2022.01', endDate: '至今', city: '芜湖', description: '- 管理天猫/京东/抖音全渠道运营，年GMV 8亿+\n- 搭建直播团队，直播GMV从0做到月均2000万\n- 双11当天GMV破亿，同比增长50%' }] } },
    { type: 'skill', order: 3, data: { items: [{ name: '平台运营', level: '精通' },{ name: '直播电商', level: '精通' },{ name: '数据分析', level: '熟练' },{ name: '团队管理', level: '精通' },{ name: '供应链协同', level: '熟练' }] } },
    { type: 'summary', order: 4, data: { summary: '5年电商运营经验，全渠道运营年GMV 8亿+。' } },
  ]},
]

export const GALLERY_CATEGORIES = [
  '全部', '互联网/IT', '金融', '设计', '市场/运营', '教育', '医疗/健康', '人力资源', '制造/工程', '应届生/实习', '法律', '销售', '财务/会计', '行政/文秘', '物流/供应链', '传媒/广告', '建筑/房地产', '电商'
]

export default galleryTemplates
