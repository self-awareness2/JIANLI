# 匠芯简历 - 项目完整架构文档

## 最后更新：2026-04-17 v11

---

## 一、项目概述

基于 React + Node.js 的在线简历编辑器，支持 AI 智能创建、导入解析、多模板渲染、PDF 导出。

---

## 二、技术栈

| 层级 | 技术 | 版本/说明 |
|------|------|-----------|
| **前端框架** | React 18 + Vite 4 | SPA，组件化开发 |
| **路由** | react-router-dom v6 | 客户端路由 |
| **样式** | TailwindCSS 3 | 工具类 CSS |
| **图标** | lucide-react | SVG 图标库 |
| **富文本** | @tiptap/react | 简历描述编辑 |
| **HTTP** | axios | API 请求，JWT 拦截器 |
| **PDF 导出** | html2canvas + jsPDF | 客户端截图转 PDF，A4 分页 |
| **提示** | react-hot-toast | Toast 通知 |
| **后端框架** | Express.js (ESM) | REST API 服务 |
| **数据库** | SQLite + Prisma ORM 5 | 轻量持久化 |
| **认证** | JWT (jsonwebtoken) + bcryptjs | Token 认证 |
| **AI 解析/生成** | 通义千问 qwen-plus (DashScope) | LLM 智能解析 & 创建 |
| **PDF 提取** | pdfjs-dist | 服务端提取 PDF 文本 |
| **Word 提取** | mammoth | 提取 .doc/.docx 文本 |
| **服务端环境** | dotenv 17 | 环境变量管理 |
| **浏览器渲染** | puppeteer | 预留服务端渲染/导出能力 |

---

## 三、目录结构

```
JIANLI/
├── client/                    # 前端 React 应用
│   ├── src/
│   │   ├── App.jsx            # 路由配置
│   │   ├── main.jsx           # 入口
│   │   ├── index.css          # 全局样式（含 resume-html、print、动画）
│   │   ├── pages/
│   │   │   ├── Login.jsx      # 登录页
│   │   │   ├── Register.jsx   # 注册页
│   │   │   ├── Dashboard.jsx  # 简历管理列表页
│   │   │   ├── Editor.jsx     # 简历编辑器主页
│   │   │   ├── Agent.jsx      # AI 对话式创建简历
│   │   │   └── Settings.jsx   # 用户设置
│   │   ├── components/
│   │   │   ├── Sidebar.jsx           # 左侧导航栏
│   │   │   ├── EditorToolbar.jsx     # 编辑器顶部工具栏（字体/行高/主题色/导出）
│   │   │   ├── ResumePreview.jsx     # 简历预览容器（id="resume-preview"）
│   │   │   ├── TemplateSelector.jsx  # 模板选择器（搜索/筛选/实时预览）
│   │   │   ├── ModuleOrderPanel.jsx  # 模块顺序拖拽面板
│   │   │   ├── ImportResumeModal.jsx # 导入简历弹窗（含 loading 动画）
│   │   │   ├── PaymentModal.jsx      # 付费弹窗
│   │   │   ├── RichTextEditor.jsx    # Tiptap 富文本编辑器
│   │   │   ├── AIChatWidget.jsx      # AI 对话浮窗组件（右下角全局挂载）
│   │   │   ├── GalleryPreviewModal.jsx # 简历广场模板预览弹窗
│   │   │   └── panels/
│   │   │       ├── PersonalPanel.jsx  # 基本信息编辑面板
│   │   │       ├── EducationPanel.jsx # 教育经历编辑面板
│   │   │       ├── WorkPanel.jsx      # 工作经历编辑面板
│   │   │       ├── ProjectPanel.jsx   # 项目经历编辑面板
│   │   │       ├── SkillPanel.jsx     # 专业技能编辑面板
│   │   │       └── SummaryPanel.jsx   # 个人总结编辑面板
│   │   ├── templates/
│   │   │   ├── index.js              # 模板注册表（id/name/color/style）
│   │   │   ├── utils.js              # descriptionToHTML：纯文本转 HTML
│   │   │   ├── ModernTemplate.jsx    # 现代简约：左对齐，技能方块进度
│   │   │   ├── ProfessionalTemplate.jsx # 专业商务：居中，技能进度条
│   │   │   ├── CreativeTemplate.jsx  # 创意设计：头像色块，两列技能
│   │   │   ├── ElegantTemplate.jsx   # 优雅经典：双线分隔，居中
│   │   │   ├── MinimalTemplate.jsx   # 极简风格：纯文字，无装饰
│   │   │   ├── SidebarTemplate.jsx   # 侧边栏双栏：左侧色块+信息，右侧工作/项目
│   │   │   ├── ExecutiveTemplate.jsx # 行政精英：顶部横幅+图标标题，商务风
│   │   │   ├── TimelineTemplate.jsx  # 时间线：左侧时间轴串联经历
│   │   │   └── CompactTemplate.jsx   # 紧凑双栏：左右分栏，信息密度高
│   │   └── services/
│   │       └── api.js                # axios 实例 + 所有 API 封装
│   ├── package.json
│   └── vite.config.js
├── server/                    # 后端 Express 应用
│   ├── src/
│   │   ├── index.js           # 服务入口，注册所有路由
│   │   ├── services/
│   │   │   └── aiService.js   # AI 业务服务（quota/LLM/prompt/message 组装）
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT 认证中间件
│   │   └── routes/
│   │       ├── auth.js        # /api/auth - 注册/登录/获取用户
│   │       ├── resume.js      # /api/resumes - CRUD + 复制
│   │       ├── section.js     # /api/sections - 模块 CRUD + 排序
│   │       ├── export.js      # /api/export - 导出权限检查
│   │       ├── import.js      # /api/import - PDF/Word 导入 + LLM 解析
│   │       ├── payment.js     # /api/payments - 支付状态
│   │       ├── ai.js          # /api/ai - AI 润色/摘要/对话/流式/额度
│   │       ├── gallery.js     # /api/gallery - 模板广场列表/详情/使用
│   ├── prisma/
│   │   └── schema.prisma      # 数据模型（User, Resume, ResumeSection, Payment）
│   ├── .env                   # DASHSCOPE_API_KEY, JWT_SECRET
│   └── package.json
└── docs/
    └── RESUME_PARSER_ARCHITECTURE.md  # 本文件
```

---

## 四、前端路由

| 路径 | 组件 | 说明 |
|------|------|------|
| `/login` | Login | 登录页（无需认证） |
| `/register` | Register | 注册页（无需认证） |
| `/dashboard/resumes` | Dashboard | 简历管理列表（需登录） |
| `/dashboard/editor/:id` | Editor | 简历编辑器（需登录） |
| `/dashboard/agent` | Agent | AI 对话式创建（需登录） |
| `/dashboard/settings` | Settings | 用户设置（需登录） |
| `/dashboard/gallery` | Gallery | 简历广场（需登录） |
| `*` | → `/dashboard/resumes` | 默认重定向 |

---

## 五、后端 API

### 认证 `/api/auth`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/register` | 注册（email/password/name） |
| POST | `/login` | 登录，返回 JWT token |
| GET | `/me` | 获取当前用户信息（需认证） |

### 简历 `/api/resumes`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 获取用户所有简历（含 sections） |
| GET | `/:id` | 获取单个简历 |
| POST | `/` | 创建简历（含默认5个 section） |
| PUT | `/:id` | 更新简历设置（title/template/字体等） |
| DELETE | `/:id` | 删除简历 |
| POST | `/:id/duplicate` | 复制简历（含所有 sections） |

### 模块 `/api/sections`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/` | 创建 section |
| PUT | `/:id` | 更新 section 数据 |
| DELETE | `/:id` | 删除 section |
| PUT | `/reorder/:resumeId` | 批量更新排序 |

### 导入 `/api/import`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/` | 上传 PDF/Word → LLM 解析 → 创建简历 |
| POST | `/preview` | 上传文件 → 仅返回解析结果，不创建 |

### AI `/api/ai`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/quota` | 获取当前用户 AI 剩余额度 |
| POST | `/enhance-description` | AI 润色工作/项目描述（STAR法则） |
| POST | `/generate-summary` | 根据简历全数据生成个人总结 |
| POST | `/chat` | 多轮对话（非流式） |
| POST | `/chat-stream` | SSE 流式对话，结束时返回 quotaUsed/quota |

### 广场 `/api/gallery`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 获取模板列表（支持按 category 过滤） |
| GET | `/:id` | 获取模板完整详情（含 sections） |
| POST | `/:id/use` | 克隆模板到当前用户简历（需认证） |

### 导出 `/api/export`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/check` | 检查用户是否可导出（isPaid） |
| POST | `/:resumeId/pdf` | 返回简历数据（前端用 html2canvas+jsPDF 生成） |

---

## 六、数据模型（Prisma）

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String
  name      String    @default("")
  avatar    String    @default("")
  isPaid    Boolean   @default(false)
  aiQuota   Int       @default(1000)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  resumes   Resume[]
  payments  Payment[]
}

model Resume {
  id         String          @id @default(cuid())
  userId     String
  title      String          @default("未命名简历")
  template   String          @default("modern")
  fontSize   Int             @default(14)
  fontFamily String          @default("default")
  lineHeight Float           @default(1.5)
  margin     Int             @default(15)
  theme      String          @default("light")
  themeColor String          @default("#2563eb")
  createdAt  DateTime        @default(now())
  updatedAt  DateTime        @updatedAt
  user       User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  sections   ResumeSection[]
}

model ResumeSection {
  id        String   @id @default(cuid())
  resumeId  String
  type      String
  order     Int      @default(0)
  data      String   @default("{}")
  resume    Resume   @relation(fields: [resumeId], references: [id], onDelete: Cascade)
}

model Payment {
  id        String   @id @default(cuid())
  userId    String
  amount    Float
  status    String   @default("pending")
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 七、简历数据结构（Section.data JSON）

```json
// personal
{ "name": "", "title": "", "phone": "", "email": "", "location": "", "experience": "", "summary": "" }

// education
{ "items": [{ "school": "", "major": "", "degree": "", "startDate": "", "endDate": "", "description": "" }] }

// work
{ "items": [{ "company": "", "position": "", "startDate": "", "endDate": "", "city": "", "description": "" }] }

// project
{ "items": [{ "name": "", "role": "", "startDate": "", "endDate": "", "description": "" }] }

// skill
{ "items": [{ "name": "", "level": "" }] }

// summary
{ "summary": "" }
```

---

## 八、PDF 导出流程（客户端）

```
点击「导出 PDF」
  → html2canvas 截图 #resume-preview（scale:2 高清）
  → 临时重置 CSS transform（避免缩放影响截图）
  → jsPDF 创建 A4 文档
  → 计算图片高度，自动分页
  → pdf.save("简历名称.pdf") 下载
```

---

## 九、简历导入流程（服务端）

```
用户上传 PDF/Word
  → multer 接收文件
  → extractText(buffer, mimetype)
      ├── PDF: pdfjs-dist 按 Y 坐标拼接文本行
      └── Word: mammoth extractRawText
  → normalizeText() 清除 CJK 间多余空格
  → callLLM(text) 调用 qwen-plus
      ├── 成功 → JSON.parse → sanitizeParsedData
      └── 失败 → parseResumeRegex() 正则回退
  → 创建 Resume + Sections → 返回 resumeId
```

---

## 十、AI 创建简历流程（Agent）

```
对话式收集：姓名 → 联系方式 → 城市/经验 → 教育 → 工作 → 工作描述(AI润色) → 项目 → 项目描述(AI润色) → 技能 → 个人总结(AI生成/手填)
  → saveResume()：创建 Resume + 所有 Sections
  → 跳转到 Editor
```

---

## 十一、前端核心组件说明

### Editor.jsx
- 左侧：Section 折叠卡片列表（accordion），每个 section 对应一个 Panel 组件
- 右侧：EditorToolbar（固定顶部） + ResumePreview（A4 预览，可缩放）
- 自动保存：useCallback + debounce 500ms
- 状态：saveStatus（saved/saving/unsaved）

### Dashboard.jsx
- 搜索（名称/模板/姓名）、5种排序、网格/列表视图切换
- 批量选择 + 批量删除
- 内联重命名（双击或菜单）
- 右键菜单：编辑/重命名/复制/AI优化/删除

### Agent.jsx
- 步骤式对话（STEPS 数组驱动）
- work_desc / project_desc 步骤调用 `/api/ai/enhance-description`
- summary 步骤输入「自动生成」调用 `/api/ai/generate-summary`
- AI 处理时显示 spinner，输入框禁用

### AIChatWidget.jsx / Agent.jsx（额度联动）
- 页面打开时调用 `/api/ai/quota` 获取额度
- 对话请求前做额度拦截（额度<=0 时阻断并提示）
- 流式对话结束后根据 SSE 返回更新剩余额度

### TemplateSelector.jsx（已重构）
- 支持模板搜索（名称/标签）
- 支持风格/场景/人群筛选
- 支持实时预览（右侧使用当前简历数据渲染）
- VIP 模板锁定提示与视觉区分

### templates/utils.js
- `isHTML(str)` — 检测是否为 HTML 内容
- `descriptionToHTML(str)` — 纯文本 bullet（`-` 开头）→ `<ul><li>`，换行 → `<br>`

---

## 十二、环境变量

### `server/.env`
```
DASHSCOPE_API_KEY=sk-xxxxx   # 通义千问（dashscope.console.aliyun.com）
JWT_SECRET=your_secret       # JWT 签名密钥
DATABASE_URL="file:./dev.db" # SQLite 路径
PORT=3001
```

---

## 十三、更新记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v1 | 2026-04-10 | 项目初始化，基础编辑器 |
| v2 | 2026-04-11 | LLM 智能简历解析（qwen-plus） |
| v3 | 2026-04-11 | AI 创建简历接入真实 API；Dashboard 管理功能增强（搜索/排序/视图/批量/重命名） |
| v4 | 2026-04-11 | PDF 真实导出（html2canvas+jsPDF）；完整架构文档 |
| v5 | 2026-04-13 | 模板升级：所有模板 summary 改用 HTML 渲染；ModernTemplate 技能方块进度；ProfessionalTemplate 技能进度条；ElegantTemplate 技能标签优化；MinimalTemplate 技能点分隔；新增 SidebarTemplate 双栏布局模板 |
| v6 | 2026-04-13 | 编辑器UI大幅优化：完成度进度条、分组工具栏、Ctrl+S快捷键、平滑滚动、默认90%缩放；新增3个模板：ExecutiveTemplate(行政精英)、TimelineTemplate(时间线)、CompactTemplate(紧凑双栏) |
| v7 | 2026-04-13 | 新增全局 AI 对话浮窗（AIChatWidget）：右下角气泡按钮可展开聊天面板，支持多轮对话、快速提示、消息复制、面板缩放；后端 /api/ai/chat 升级为多轮消息支持 |
| v8 | 2026-04-13 | 新增简历广场（Gallery）：支持分类筛选/搜索/实时预览/一键导入；后端新增 /api/gallery 路由；侧边栏新增广场入口 |
| v9 | 2026-04-15 | AI 额度系统上线：`User.aiQuota`、`/api/ai/quota`、流式与非流式统一扣减；`/api/ai/chat-stream` 在自定义 `[DONE]` 前返回 quota/quotaUsed；前端 Agent/AIChatWidget 全链路额度显示与拦截 |
| v10 | 2026-04-17 | 模板切换体验重构：TemplateSelector 增加搜索+多维筛选+实时预览；模板元数据增强（style/scene/target/tags）；文档同步到当前实现并补充框架升级路线 |
| v11 | 2026-04-17 | 后端 AI P0/P1 重构：PrismaClient 路由单例化、Quota 扣减防负数、`/api/ai/chat-stream` 增加心跳与断连清理；新增 `server/src/services/aiService.js` 下沉 quota/LLM/prompt/message 组装逻辑，`ai.js` 路由瘦身 |

---

## 十四、框架升级路线（建议）

### Phase 1（稳定性，1~2周）
1. **统一 PrismaClient 生命周期**：避免每个 route 单独 new，改为单例模块（降低连接管理风险）。
2. **Quota 扣减防负数**：在扣减逻辑增加下界保护（`max(aiQuota - cost, 0)` 语义化处理）。
3. **SSE 可靠性增强**：增加超时/心跳与客户端中断处理，防止长连接悬挂。
4. **文档-实现一致性校验脚本**：在 CI 中校验关键 API 路径、模型字段。

### Phase 2（工程化，2~4周）
1. **后端分层**：`routes -> services -> repositories`，把 LLM、quota、gallery 逻辑拆出 route。
2. **Schema 校验**：引入 `zod`/`valibot` 做请求体与响应体校验，减少脏数据入库。
3. **统一错误码体系**：规范 `errorCode/message/requestId`，便于前端精确提示与排错。
4. **日志与观测**：引入结构化日志（pino/winston）+ traceId。

### Phase 3（框架升级，按兼容窗口推进）
1. **前端**：Vite 4 -> 5，React Router v6 保持，逐步引入 TypeScript（先 `services` 与 `templates`）。
2. **后端**：Express 4 -> 5（待生态稳定），Prisma 保持同大版本并按月小步升级。
3. **渲染导出**：评估将高保真 PDF 导出迁移到 Puppeteer 服务端（解决客户端性能瓶颈与字体差异）。

### 当前优先级建议
- P0：Quota 边界 + Prisma 单例 + SSE 稳定性
- P1：Route 分层重构 + Schema 校验
- P2：TypeScript 渐进迁移 + 服务端 PDF
