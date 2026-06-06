import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import crypto from 'crypto';

const router = Router();
const PAY_SECRET = process.env.PAY_SECRET || 'your-secure-pay-secret-key-2024';

// 验证导出令牌签名
function verifyExportToken(token, paymentId, userId, resumeId, signature) {
  const data = `${token}|${paymentId}|${userId}|${resumeId}|${PAY_SECRET}`;
  const expected = crypto.createHmac('sha256', PAY_SECRET).update(data).digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
}

// 导出PDF（支持会员和单次付费两种模式）
router.post('/:resumeId/pdf', authMiddleware, async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { exportToken } = req.body;

    // 获取用户信息
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    let canExport = false;
    let exportMode = null;

    // 模式1：永久会员
    if (user.isPaid) {
      canExport = true;
      exportMode = 'membership';
    }

    // 模式2：单次付费（提供有效导出令牌）
    if (!canExport && exportToken) {
      const tokenRecord = await prisma.exportToken.findUnique({
        where: { token: exportToken },
        include: { payment: true },
      });

      if (tokenRecord) {
        // 验证令牌有效性
        if (
          tokenRecord.userId === req.userId &&
          tokenRecord.resumeId === resumeId &&
          !tokenRecord.used &&
          new Date() <= tokenRecord.expiresAt &&
          verifyExportToken(exportToken, tokenRecord.paymentId, tokenRecord.userId, tokenRecord.resumeId, tokenRecord.signature)
        ) {
          canExport = true;
          exportMode = 'single_export';

          // 标记令牌为已使用
          await prisma.exportToken.update({
            where: { id: tokenRecord.id },
            data: { used: true, usedAt: new Date() },
          });
        }
      }
    }

    if (!canExport) {
      return res.status(403).json({
        error: '需要付费才能导出PDF',
        requirePayment: true,
        singleExportPrice: 1.00,
      });
    }

    // 获取简历数据
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.userId },
      include: { sections: { orderBy: { order: 'asc' } } },
    });

    if (!resume) {
      return res.status(404).json({ error: '简历不存在' });
    }

    // 返回简历数据，前端使用浏览器打印为PDF
    res.json({
      resume,
      canExport: true,
      exportMode,
    });
  } catch (err) {
    console.error('Export PDF error:', err);
    res.status(500).json({ error: '导出失败' });
  }
});

// 检查是否可以导出
router.get('/check/:resumeId', authMiddleware, async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { exportToken } = req.query;

    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    let canExport = user.isPaid;
    let singleExportValid = false;

    // 检查单次导出令牌
    if (!canExport && exportToken) {
      const tokenRecord = await prisma.exportToken.findUnique({
        where: { token: exportToken },
      });

      if (
        tokenRecord &&
        tokenRecord.userId === req.userId &&
        tokenRecord.resumeId === resumeId &&
        !tokenRecord.used &&
        new Date() <= tokenRecord.expiresAt
      ) {
        singleExportValid = true;
      }
    }

    canExport = canExport || singleExportValid;

    res.json({
      canExport,
      isMember: user.isPaid,
      singleExportValid,
      singleExportPrice: 1.00,
    });
  } catch (err) {
    console.error('Check export status error:', err);
    res.status(500).json({ error: '检查失败' });
  }
});

export default router;
