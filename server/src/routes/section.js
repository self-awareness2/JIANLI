import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router = Router();

// 更新模块数据
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { data, order } = req.body;
    const section = await prisma.resumeSection.findUnique({
      where: { id: req.params.id },
      include: { resume: true },
    });
    if (!section || section.resume.userId !== req.userId) {
      return res.status(404).json({ error: '模块不存在' });
    }

    const updated = await prisma.resumeSection.update({
      where: { id: req.params.id },
      data: {
        ...(data !== undefined && { data: typeof data === 'string' ? data : JSON.stringify(data) }),
        ...(order !== undefined && { order }),
      },
    });

    // 更新简历的updatedAt
    await prisma.resume.update({
      where: { id: section.resumeId },
      data: { updatedAt: new Date() },
    });

    res.json({ section: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '更新模块失败' });
  }
});

// 添加新模块
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { resumeId, type, data, order } = req.body;
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.userId },
    });
    if (!resume) return res.status(404).json({ error: '简历不存在' });

    const section = await prisma.resumeSection.create({
      data: {
        resumeId,
        type,
        order: order || 0,
        data: typeof data === 'string' ? data : JSON.stringify(data || {}),
      },
    });
    res.json({ section });
  } catch (err) {
    res.status(500).json({ error: '添加模块失败' });
  }
});

// 删除模块
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const section = await prisma.resumeSection.findUnique({
      where: { id: req.params.id },
      include: { resume: true },
    });
    if (!section || section.resume.userId !== req.userId) {
      return res.status(404).json({ error: '模块不存在' });
    }

    await prisma.resumeSection.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '删除模块失败' });
  }
});

// 批量更新模块顺序
router.put('/reorder/:resumeId', authMiddleware, async (req, res) => {
  try {
    const { orders } = req.body; // [{ id, order }]
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.resumeId, userId: req.userId },
    });
    if (!resume) return res.status(404).json({ error: '简历不存在' });

    await Promise.all(
      orders.map((item) =>
        prisma.resumeSection.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '排序失败' });
  }
});

export default router;
