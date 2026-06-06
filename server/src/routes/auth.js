import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken, authMiddleware } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router = Router();

// 注册
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: '该邮箱已注册' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name: name || '' },
    });

    const token = generateToken(user.id);
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, isPaid: user.isPaid, aiQuota: user.aiQuota },
    });
  } catch (err) {
    res.status(500).json({ error: '注册失败' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: '邮箱或密码错误' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: '邮箱或密码错误' });
    }

    const token = generateToken(user.id);
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, isPaid: user.isPaid, aiQuota: user.aiQuota },
    });
  } catch (err) {
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取当前用户信息
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, isPaid: true, avatar: true, aiQuota: true },
    });
    if (!user) return res.status(404).json({ error: '用户不存在' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

export default router;
