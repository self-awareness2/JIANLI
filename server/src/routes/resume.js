import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router = Router();

// 获取用户所有简历
router.get('/', authMiddleware, async (req, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.userId },
      include: { sections: { orderBy: { order: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ resumes });
  } catch (err) {
    res.status(500).json({ error: '获取简历列表失败' });
  }
});

// 获取单个简历
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { sections: { orderBy: { order: 'asc' } } },
    });
    if (!resume) return res.status(404).json({ error: '简历不存在' });
    res.json({ resume });
  } catch (err) {
    res.status(500).json({ error: '获取简历失败' });
  }
});

// 创建简历（含默认模块）
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    const resume = await prisma.resume.create({
      data: {
        userId: req.userId,
        title: title || '未命名简历',
        sections: {
          create: [
            {
              type: 'personal',
              order: 0,
              data: JSON.stringify({
                name: '', title: '', phone: '', email: '',
                location: '', experience: '', summary: '',
              }),
            },
            {
              type: 'education',
              order: 1,
              data: JSON.stringify({ items: [{ school: '', major: '', degree: '', startDate: '', endDate: '', description: '' }] }),
            },
            {
              type: 'work',
              order: 2,
              data: JSON.stringify({ items: [{ company: '', position: '', startDate: '', endDate: '', city: '', description: '' }] }),
            },
            {
              type: 'project',
              order: 3,
              data: JSON.stringify({ items: [{ name: '', role: '', startDate: '', endDate: '', description: '' }] }),
            },
            {
              type: 'skill',
              order: 4,
              data: JSON.stringify({ items: [{ name: '', level: '' }] }),
            },
          ],
        },
      },
      include: { sections: { orderBy: { order: 'asc' } } },
    });
    res.json({ resume });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '创建简历失败' });
  }
});

// 更新简历设置
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, template, fontSize, fontFamily, lineHeight, margin, theme, themeColor } = req.body;
    const resume = await prisma.resume.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data: {
        ...(title !== undefined && { title }),
        ...(template !== undefined && { template }),
        ...(fontSize !== undefined && { fontSize }),
        ...(fontFamily !== undefined && { fontFamily }),
        ...(lineHeight !== undefined && { lineHeight: parseFloat(lineHeight) }),
        ...(margin !== undefined && { margin: parseInt(margin) }),
        ...(theme !== undefined && { theme }),
        ...(themeColor !== undefined && { themeColor }),
      },
    });
    const updated = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { sections: { orderBy: { order: 'asc' } } },
    });
    res.json({ resume: updated });
  } catch (err) {
    res.status(500).json({ error: '更新简历失败' });
  }
});

// 删除简历
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.resume.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '删除简历失败' });
  }
});

// 复制简历
router.post('/:id/duplicate', authMiddleware, async (req, res) => {
  try {
    const original = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { sections: true },
    });
    if (!original) return res.status(404).json({ error: '简历不存在' });

    const copy = await prisma.resume.create({
      data: {
        userId: req.userId,
        title: `${original.title} (副本)`,
        template: original.template,
        fontSize: original.fontSize,
        fontFamily: original.fontFamily,
        lineHeight: original.lineHeight,
        margin: original.margin,
        theme: original.theme,
        sections: {
          create: original.sections.map((s) => ({
            type: s.type,
            order: s.order,
            data: s.data,
          })),
        },
      },
      include: { sections: { orderBy: { order: 'asc' } } },
    });
    res.json({ resume: copy });
  } catch (err) {
    res.status(500).json({ error: '复制简历失败' });
  }
});

export default router;
