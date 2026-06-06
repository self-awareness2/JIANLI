import { Router } from 'express';
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import crypto from 'crypto';

const router = Router();

// 内部令牌签名密钥
const PAY_SECRET = process.env.PAY_SECRET || 'your-secure-pay-secret-key-2024';
const EXPORT_PRICE = 1.00; // 单次导出价格1元
const ORDER_EXPIRY_MINUTES = 5; // 订单5分钟过期
const TOKEN_EXPIRY_MINUTES = 30; // 令牌30分钟过期

// ========== 虎皮椒支付宝配置 ==========
const XUNHU_APPID = process.env.XUNHU_APPID || '';        // 虎皮椒 appid
const XUNHU_APPSECRET = process.env.XUNHU_APPSECRET || ''; // 虎皮椒 appsecret
const XUNHU_API_URL = 'https://api.xunhupay.com/payment/do.html';
// 异步通知地址（必须是公网可访问的URL）
const XUNHU_NOTIFY_URL = process.env.XUNHU_NOTIFY_URL || 'https://yourdomain.com/api/payments/alipay-notify';
// 是否使用沙箱模式（无真实扣款）
const USE_SANDBOX = process.env.XUNHU_SANDBOX === 'true' || !XUNHU_APPID;

// 生成随机字符串
function generateNonce(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

// 生成订单签名
function signOrder(orderId, userId, amount, nonce, timestamp) {
  const data = `${orderId}|${userId}|${amount}|${nonce}|${timestamp}|${PAY_SECRET}`;
  return crypto.createHmac('sha256', PAY_SECRET).update(data).digest('hex');
}

// 生成导出令牌签名
function signExportToken(token, paymentId, userId, resumeId) {
  const data = `${token}|${paymentId}|${userId}|${resumeId}|${PAY_SECRET}`;
  return crypto.createHmac('sha256', PAY_SECRET).update(data).digest('hex');
}

// 验证导出令牌签名
function verifyExportToken(token, paymentId, userId, resumeId, signature) {
  const expected = signExportToken(token, paymentId, userId, resumeId);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
}

// 生成虎皮椒签名（MD5）
function xunhuSign(params) {
  const sorted = Object.keys(params).sort();
  const str = sorted.map(k => `${k}=${params[k]}`).join('&');
  return crypto.createHash('md5').update(str + XUNHU_APPSECRET).digest('hex');
}

// 验证虎皮椒回调签名
function verifyXunhuSign(params) {
  const { hash, ...rest } = params;
  const expected = xunhuSign(rest);
  return hash === expected;
}

// 调用虎皮椒支付宝下单接口
async function createAlipayOrder(orderId, amount, title = '匠芯简历-PDF导出') {
  // 沙箱模式：返回模拟数据
  if (USE_SANDBOX) {
    console.log('[SANDBOX] 模拟支付宝订单:', orderId, amount);
    return {
      sandbox: true,
      orderId,
      amount,
      qrUrl: `https://qr.alipay.com/sandbox_${orderId}`,
      qrContent: `SANDBOX|alipay|${orderId}|${amount}`,
    };
  }

  // 真实模式：调用虎皮椒API
  const params = {
    version: '1.1',
    appid: XUNHU_APPID,
    trade_order_id: orderId,
    total_fee: amount.toFixed(2),
    title,
    type: 'alipay',
    notify_url: XUNHU_NOTIFY_URL,
    nonce_str: generateNonce(16),
  };
  params.hash = xunhuSign(params);

  const resp = await fetch(XUNHU_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await resp.json();

  if (data.errcode !== 0) {
    console.error('虎皮椒下单失败:', data);
    throw new Error(data.errmsg || '支付宝下单失败');
  }

  return {
    sandbox: false,
    orderId,
    amount,
    qrUrl: data.url_qrcode || data.url,   // 支付宝二维码链接
    qrContent: data.url_qrcode || data.url, // 前端用这个生成二维码图片
    payUrl: data.url,                       // 可跳转的支付链接
  };
}

// 获取支付状态
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const payments = await prisma.payment.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ isPaid: user.isPaid, payments });
  } catch (err) {
    res.status(500).json({ error: '获取支付状态失败' });
  }
});

// 创建支付订单（模拟）
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const payment = await prisma.payment.create({
      data: {
        userId: req.userId,
        amount: amount || 29.9,
        status: 'pending',
      },
    });
    res.json({ payment, payUrl: `#mock-pay-${payment.id}` });
  } catch (err) {
    res.status(500).json({ error: '创建订单失败' });
  }
});

// 模拟支付完成回调（会员购买）
router.post('/confirm/:paymentId', authMiddleware, async (req, res) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: { id: req.params.paymentId, userId: req.userId },
    });
    if (!payment) return res.status(404).json({ error: '订单不存在' });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'paid' },
    });

    await prisma.user.update({
      where: { id: req.userId },
      data: { isPaid: true },
    });

    res.json({ success: true, isPaid: true });
  } catch (err) {
    res.status(500).json({ error: '确认支付失败' });
  }
});

// ==================== 单次导出支付功能 ====================

// 创建单次导出支付订单
router.post('/create-export-order', authMiddleware, async (req, res) => {
  try {
    const { resumeId } = req.body;
    if (!resumeId) {
      return res.status(400).json({ error: '缺少简历ID' });
    }

    // 验证简历归属
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.userId },
    });
    if (!resume) {
      return res.status(404).json({ error: '简历不存在' });
    }

    // 检查是否有未完成的订单（防重复创建）
    const existingPending = await prisma.payment.findFirst({
      where: {
        userId: req.userId,
        resumeId,
        type: 'single_export',
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
    });

    if (existingPending) {
      // 复用已有订单，重新获取支付链接
      const payData = await createAlipayOrder(existingPending.id, existingPending.amount);
      return res.json({
        orderId: existingPending.id,
        amount: existingPending.amount,
        expiresAt: existingPending.expiresAt,
        payData,
      });
    }

    // 创建新订单
    const nonce = generateNonce();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ORDER_EXPIRY_MINUTES * 60 * 1000);

    const payment = await prisma.payment.create({
      data: {
        userId: req.userId,
        amount: EXPORT_PRICE,
        type: 'single_export',
        resumeId,
        nonce,
        expiresAt,
        status: 'pending',
      },
    });

    // 生成签名
    const signature = signOrder(payment.id, req.userId, EXPORT_PRICE, nonce, now.getTime());
    await prisma.payment.update({
      where: { id: payment.id },
      data: { signature },
    });

    // 调用支付宝下单
    const payData = await createAlipayOrder(payment.id, EXPORT_PRICE);

    res.json({
      orderId: payment.id,
      amount: EXPORT_PRICE,
      expiresAt,
      payData,
    });
  } catch (err) {
    console.error('Create export order error:', err);
    res.status(500).json({ error: '创建订单失败' });
  }
});

// 查询订单状态（轮询接口）
router.get('/order-status/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await prisma.payment.findFirst({
      where: { id: orderId, userId: req.userId },
      include: { exportToken: true },
    });

    if (!payment) {
      return res.status(404).json({ error: '订单不存在' });
    }

    // 检查订单是否过期
    if (payment.status === 'pending' && payment.expiresAt && new Date() > payment.expiresAt) {
      await prisma.payment.update({
        where: { id: orderId },
        data: { status: 'expired' },
      });
      payment.status = 'expired';
    }

    // 如果已支付但未生成令牌，生成导出令牌
    let exportToken = null;
    if (payment.status === 'paid' && !payment.exportToken) {
      exportToken = await generateExportToken(payment);
    } else if (payment.exportToken) {
      exportToken = {
        token: payment.exportToken.token,
        signature: payment.exportToken.signature,
        expiresAt: payment.exportToken.expiresAt,
      };
    }

    res.json({
      status: payment.status,
      amount: payment.amount,
      paidAt: payment.paidAt,
      exportToken,
    });
  } catch (err) {
    console.error('Check order status error:', err);
    res.status(500).json({ error: '查询订单状态失败' });
  }
});

// 生成导出令牌的辅助函数
async function generateExportToken(payment) {
  const token = generateNonce(32);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TOKEN_EXPIRY_MINUTES * 60 * 1000);
  const signature = signExportToken(token, payment.id, payment.userId, payment.resumeId);

  const exportToken = await prisma.exportToken.create({
    data: {
      paymentId: payment.id,
      userId: payment.userId,
      resumeId: payment.resumeId,
      token,
      signature,
      expiresAt,
    },
  });

  return {
    token: exportToken.token,
    signature: exportToken.signature,
    expiresAt: exportToken.expiresAt,
  };
}

// ========== 虎皮椒异步通知回调（支付宝付款成功后自动调用） ==========
router.post('/alipay-notify', express.urlencoded({ extended: false }), async (req, res) => {
  try {
    const params = req.body;
    console.log('[Alipay Notify] 收到回调:', JSON.stringify(params));

    // 验证签名
    if (!verifyXunhuSign(params)) {
      console.error('[Alipay Notify] 签名验证失败');
      return res.send('fail');
    }

    // 只处理支付成功的通知
    if (params.status !== 'OD' && params.status !== 'complete') {
      return res.send('success');
    }

    const orderId = params.trade_order_id;
    const payment = await prisma.payment.findUnique({ where: { id: orderId } });

    if (!payment) {
      console.error('[Alipay Notify] 订单不存在:', orderId);
      return res.send('fail');
    }

    // 已处理过的不重复处理
    if (payment.status === 'paid') {
      return res.send('success');
    }

    // 验证金额一致
    const paidAmount = parseFloat(params.total_fee);
    if (Math.abs(paidAmount - payment.amount) > 0.01) {
      console.error('[Alipay Notify] 金额不匹配:', paidAmount, payment.amount);
      return res.send('fail');
    }

    // 更新订单状态为已支付
    const now = new Date();
    await prisma.payment.update({
      where: { id: orderId },
      data: {
        status: 'paid',
        paidAt: now,
      },
    });

    // 生成导出令牌（轮询接口会读取）
    await generateExportToken({
      ...payment,
      status: 'paid',
    });

    console.log('[Alipay Notify] 订单支付成功:', orderId);
    // 必须返回 "success" 告知虎皮椒处理完毕
    res.send('success');
  } catch (err) {
    console.error('[Alipay Notify] 处理异常:', err);
    res.send('fail');
  }
});

// 单次导出支付确认（沙箱/测试用）
router.post('/confirm-export/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await prisma.payment.findFirst({
      where: { id: orderId, userId: req.userId },
    });

    if (!payment) {
      return res.status(404).json({ error: '订单不存在' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: '订单状态异常' });
    }

    if (payment.expiresAt && new Date() > payment.expiresAt) {
      await prisma.payment.update({
        where: { id: orderId },
        data: { status: 'expired' },
      });
      return res.status(400).json({ error: '订单已过期' });
    }

    // 更新支付状态
    const now = new Date();
    await prisma.payment.update({
      where: { id: orderId },
      data: { status: 'paid', paidAt: now },
    });

    // 生成导出令牌
    const exportToken = await generateExportToken({ ...payment, status: 'paid' });

    res.json({
      success: true,
      status: 'paid',
      exportToken,
    });
  } catch (err) {
    console.error('Confirm payment error:', err);
    res.status(500).json({ error: '确认支付失败' });
  }
});

export default router;
