# 匠芯简历 - AI简历制作工具

专业、快速、智能的简历制作平台。

## 技术栈

- **前端**: React 18 + Vite + TailwindCSS + Tiptap + React Router
- **后端**: Node.js + Express + Prisma + SQLite
- **认证**: JWT

## 快速开始

### 1. 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 2. 初始化数据库

```bash
cd server
npx prisma db push
npx prisma generate
```

### 3. 启动项目

```bash
# 终端1: 启动后端 (端口3001)
cd server
npm run dev

# 终端2: 启动前端 (端口5173)
cd client
npm run dev
```

### 4. 访问

打开浏览器访问 `http://localhost:5173`

## 功能特性

- ✅ 用户注册/登录 (JWT 认证)
- ✅ 简历列表管理 (创建/复制/删除/搜索/排序)
- ✅ 简历编辑器 (表单编辑 + 实时A4预览)
- ✅ 模块拖拽排序 (自定义简历结构)
- ✅ 富文本编辑 (加粗/斜体/列表/链接)
- ✅ 多模板支持 (多种专业模板切换)
- ✅ 模板广场 (浏览和使用社区模板)
- ✅ PDF 导出 (单次付费 / 会员无限导出)
- ✅ 支付宝支付 (虎皮椒接入)
- ✅ AI 简历助手 (智能创建/润色/优化)
- ✅ AI 对话式创建 (引导式简历生成)
- ✅ 简历导入 (支持 Word/PDF 解析)
- ✅ 深色主题支持

## 技术亮点

- **前端性能优化**: 路由懒加载、组件按需加载、请求去重
- **代码质量**: 自定义 Hooks、统一错误处理、条件日志
- **后端架构**: 中间件模式、统一错误响应、Prisma ORM
- **支付集成**: 虎皮椒支付宝、异步通知、订单签名验证

## 项目结构

```
JIANLI/
├── client/              # 前端 (React + Vite)
│   ├── src/
│   │   ├── components/  # 组件
│   │   ├── pages/       # 页面
│   │   ├── hooks/       # 自定义 Hooks
│   │   ├── utils/       # 工具函数
│   │   └── templates/   # 简历模板
│   └── package.json
├── server/              # 后端 (Node.js + Express)
│   ├── src/
│   │   ├── routes/      # API 路由
│   │   ├── services/    # 业务逻辑
│   │   ├── middleware/  # 中间件
│   │   └── lib/         # 工具库
│   ├── prisma/          # 数据库模型
│   └── package.json
└── package.json         # 根目录脚本
```

## 更多命令

```bash
# 同时启动前后端（需要安装 concurrently）
npm run dev

# 数据库管理
npm run db:studio      # 打开 Prisma Studio
npm run db:push        # 推送模型变更
npm run db:generate    # 生成 Prisma Client

# 构建
npm run build          # 构建前端生产包
```
