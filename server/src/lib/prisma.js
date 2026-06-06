import { PrismaClient } from '@prisma/client';

// Prisma 单例，避免在热更新或多模块中重复创建连接实例
const prisma = globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;
