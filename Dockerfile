# 多阶段构建 - 前端
FROM node:20-alpine AS client-builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# 后端构建
FROM node:20-alpine AS server-builder

WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci

COPY server/prisma ./prisma/
RUN npx prisma generate

COPY server/ ./

# 生产环境
FROM node:20-alpine AS production

WORKDIR /app

# 安装生产依赖
COPY server/package*.json ./
RUN npm ci --only=production

# 复制 Prisma 客户端
COPY --from=server-builder /app/server/node_modules/.prisma ./node_modules/.prisma
COPY --from=server-builder /app/server/node_modules/@prisma ./node_modules/@prisma

# 复制后端代码
COPY server/ ./

# 复制前端构建产物
COPY --from=client-builder /app/client/dist ./public

# 创建数据目录
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 3001

# 环境变量
ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL=file:/app/data/dev.db

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# 启动命令
CMD ["node", "src/index.js"]
