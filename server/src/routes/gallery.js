import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import galleryTemplates, { GALLERY_CATEGORIES } from '../data/galleryTemplates.js';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/gallery - 获取简历广场所有模板
router.get('/', (req, res) => {
  const { category } = req.query;
  let templates = galleryTemplates;
  if (category && category !== '全部') {
    templates = templates.filter(t => t.category === category);
  }
  // Don't send full section data in list view for performance
  const list = templates.map(({ sections, ...rest }) => ({
    ...rest,
    sectionTypes: sections.map(s => s.type),
  }));
  res.json({ templates: list, categories: GALLERY_CATEGORIES });
});

// GET /api/gallery/:id - 获取单个模板详情（含完整数据用于预览）
router.get('/:id', (req, res) => {
  const template = galleryTemplates.find(t => t.id === req.params.id);
  if (!template) return res.status(404).json({ error: '模板不存在' });
  res.json({ template });
});

// POST /api/gallery/:id/use - 使用模板：克隆为用户自己的简历
router.post('/:id/use', authMiddleware, async (req, res) => {
  try {
    const gallery = galleryTemplates.find(t => t.id === req.params.id);
    if (!gallery) return res.status(404).json({ error: '模板不存在' });

    const resume = await prisma.resume.create({
      data: {
        userId: req.userId,
        title: `${gallery.title}（来自广场）`,
        template: gallery.template,
        themeColor: gallery.themeColor,
        sections: {
          create: gallery.sections.map(s => ({
            type: s.type,
            order: s.order,
            data: JSON.stringify(s.data),
          })),
        },
      },
      include: { sections: { orderBy: { order: 'asc' } } },
    });

    res.json({ resume });
  } catch (err) {
    console.error('use gallery template error:', err);
    res.status(500).json({ error: '使用模板失败' });
  }
});

export default router;
