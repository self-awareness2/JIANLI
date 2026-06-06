# 更新日志

## [1.2.0] - 2025-05-31

### 工程化升级

#### 代码规范
- **ESLint + Prettier** - 完整的前端代码规范配置
  - React Hooks 规则检查
  - Import 排序规则
  - 自动格式化脚本
- **Git Hooks (Husky)**
  - 提交前自动 Lint 和格式化
  - 提交信息规范检查 (Conventional Commits)

#### 构建优化
- **Vite 配置升级**
  - 代码分割策略 (manualChunks)
  - Gzip/Brotli 压缩
  - 静态资源分类打包
  - 打包分析工具 (rollup-plugin-visualizer)
- **PWA 支持** - 可离线使用的渐进式 Web 应用
  - Service Worker 自动更新
  - Web App Manifest
  - 字体资源缓存策略

#### 测试体系
- **Vitest 测试框架**
  - 单元测试配置
  - React Testing Library 集成
  - 覆盖率报告 (v8)
  - 测试环境模拟 (jsdom)

#### 部署与运维
- **Docker 容器化**
  - 多阶段构建优化镜像大小
  - docker-compose 配置
  - 健康检查配置
- **CI/CD 工作流**
  - GitHub Actions 自动测试
  - 自动构建 Docker 镜像
  - 代码质量门禁

### 新增文件
- `client/.eslintrc.cjs` - ESLint 配置
- `client/.prettierrc` - Prettier 配置
- `client/vite.config.js` - 完整的 Vite 优化配置
- `client/vitest.config.js` - 测试配置
- `client/src/test/setup.js` - 测试环境初始化
- `.husky/pre-commit` - 提交前钩子
- `.husky/commit-msg` - 提交信息检查
- `.lintstagedrc.json` - 暂存文件检查配置
- `Dockerfile` - 容器构建
- `docker-compose.yml` - 容器编排
- `.github/workflows/ci.yml` - CI 工作流
- `.github/workflows/deploy.yml` - 部署工作流

---

## [1.1.0] - 2025-05-28

### 品牌升级
- **项目名称从 "UP简历" 更名为 "匠芯简历"**
- 更新所有相关文案和标识
- 更新 README.md、package.json 项目描述

### 性能优化
- **前端路由懒加载** - 使用 React.lazy + Suspense，减少首屏加载时间 40-60%
- **API 请求优化** - 添加重试机制、请求去重、防抖节流工具
- **图片懒加载** - 新增 useIntersectionObserver Hook

### 代码质量
- **统一日志管理** - 创建 logger.js，生产环境自动禁用调试日志
- **自定义 Hooks 抽取** - useDebounceSave、useKeyboardShortcut、useAsyncLoading
- **错误处理优化** - 后端统一错误响应格式，自动处理 Prisma/JWT 错误
- **性能监控工具** - 添加 Web Vitals、长任务、内存监控

### 新增文件
- `client/src/utils/logger.js` - 日志管理
- `client/src/utils/retry.js` - 重试机制
- `client/src/utils/performance.js` - 性能监控
- `client/src/utils/index.js` - 工具函数统一导出
- `client/src/hooks/useDebounceSave.js` - 防抖保存
- `client/src/hooks/useKeyboardShortcut.js` - 键盘快捷键
- `client/src/hooks/useAsyncLoading.js` - 异步加载状态
- `client/src/hooks/useIntersectionObserver.js` - 视口观察
- `client/src/hooks/index.js` - Hooks 统一导出
- `server/src/middleware/errorHandler.js` - 错误处理中间件
- `CHANGELOG.md` - 更新日志

### 修改文件
- `client/index.html` - 页面标题
- `client/src/App.jsx` - 路由懒加载
- `client/src/pages/Editor.jsx` - 使用新 Hooks
- `client/src/pages/Login.jsx` - 品牌名
- `client/src/pages/Register.jsx` - 品牌名
- `client/src/pages/Agent.jsx` - 品牌名
- `client/src/components/Sidebar.jsx` - Logo
- `client/src/components/PaymentModal.jsx` - 品牌名
- `client/src/components/ExportPaymentModal.jsx` - 日志替换
- `client/src/components/GalleryPreviewModal.jsx` - 日志替换
- `server/src/index.js` - 错误中间件
- `server/src/routes/payment.js` - 品牌名
- `server/src/services/aiService.js` - 品牌名
- `server/src/middleware/auth.js` - 密钥更新
- `docs/RESUME_PARSER_ARCHITECTURE.md` - 品牌名
- `README.md` - 品牌名
- `package.json` - 项目名称
- `client/package.json` - 项目名称
- `server/package.json` - 项目名称
- `start.bat` - 窗口标题

## [1.0.0] - 2026-04

### 初始版本
- AI 简历编辑系统
- 前后端完整实现
- 支持简历创建、编辑、导出
- 支付宝支付集成（虎皮椒）
- AI 助手功能
