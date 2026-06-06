import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  buildChatMessages,
  buildEnhanceDescriptionPrompts,
  buildGenerateSummaryPrompts,
  buildSummaryFallback,
  callLLM,
  checkQuota,
  deductQuota,
  getAiApiKey,
  getChatSystemPrompt,
  isAiConfigured,
  requestChatCompletion,
} from '../services/aiService.js';

const router = Router();

// GET /api/ai/quota — get current user's AI quota
router.get('/quota', authMiddleware, async (req, res) => {
  try {
    const quota = await checkQuota(req.userId);
    res.json({ quota });
  } catch (err) {
    res.status(500).json({ error: '获取额度失败' });
  }
});

// POST /api/ai/enhance-description
// 润色工作/项目描述
router.post('/enhance-description', authMiddleware, async (req, res) => {
  try {
    const quota = await checkQuota(req.userId);
    if (quota <= 0) return res.status(403).json({ error: 'AI 额度已用完', quota: 0 });

    const { description, context } = req.body;
    if (!description) {
      return res.status(400).json({ error: '描述内容不能为空' });
    }

    const { systemPrompt, userPrompt } = buildEnhanceDescriptionPrompts({ description, context });

    const result = await callLLM(systemPrompt, userPrompt, { temperature: 0.7 });

    if (!result) {
      return res.json({ enhanced: description, aiUsed: false });
    }

    const cost = await deductQuota(req.userId, result.length);
    const remaining = await checkQuota(req.userId);
    res.json({ enhanced: result.trim(), aiUsed: true, quotaUsed: cost, quota: remaining });
  } catch (err) {
    console.error('enhance-description error:', err);
    res.status(500).json({ error: 'AI 润色失败，请重试' });
  }
});

// POST /api/ai/generate-summary
// 根据简历数据生成个人总结
router.post('/generate-summary', authMiddleware, async (req, res) => {
  try {
    const quota = await checkQuota(req.userId);
    if (quota <= 0) return res.status(403).json({ error: 'AI 额度已用完', quota: 0 });

    const { personal, education, work, project, skill } = req.body;
    const summaryPayload = { personal, education, work, project, skill };
    const { systemPrompt, userPrompt } = buildGenerateSummaryPrompts(summaryPayload);

    const result = await callLLM(systemPrompt, userPrompt, { temperature: 0.7 });

    if (!result) {
      // Fallback: generate locally
      const fallback = buildSummaryFallback(summaryPayload);
      return res.json({ summary: fallback, aiUsed: false });
    }

    const cost = await deductQuota(req.userId, result.length);
    const remaining = await checkQuota(req.userId);
    res.json({ summary: result.trim(), aiUsed: true, quotaUsed: cost, quota: remaining });
  } catch (err) {
    console.error('generate-summary error:', err);
    res.status(500).json({ error: 'AI 生成摘要失败，请重试' });
  }
});

// POST /api/ai/chat
// 多轮对话式 AI 简历助手
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const quota = await checkQuota(req.userId);
    if (quota <= 0) return res.status(403).json({ error: 'AI 额度已用完', quota: 0 });

    const { message, messages, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: '消息不能为空' });
    }

    const systemPrompt = getChatSystemPrompt();

    const apiKey = getAiApiKey();
    if (!isAiConfigured(apiKey)) {
      return res.json({ reply: '抱歉，AI 服务暂未配置，请联系管理员设置 API Key。', aiUsed: false });
    }

    const chatMessages = buildChatMessages({ systemPrompt, context, messages, message });

    const response = await requestChatCompletion({
      apiKey,
      messages: chatMessages,
      stream: false,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('LLM chat API error:', response.status, err);
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';

    const cost = await deductQuota(req.userId, reply.length);
    const remaining = await checkQuota(req.userId);
    res.json({ reply: reply.trim(), aiUsed: true, quotaUsed: cost, quota: remaining });
  } catch (err) {
    console.error('chat error:', err);
    res.status(500).json({ error: 'AI 对话失败，请重试' });
  }
});

// POST /api/ai/chat-stream
// 流式多轮对话 (Server-Sent Events)
router.post('/chat-stream', authMiddleware, async (req, res) => {
  const { message, messages, context } = req.body;
  if (!message) {
    return res.status(400).json({ error: '消息不能为空' });
  }

  // Quota check
  const quota = await checkQuota(req.userId);
  if (quota <= 0) {
    return res.status(403).json({ error: 'AI 额度已用完', quota: 0 });
  }

  const apiKey = getAiApiKey();
  if (!isAiConfigured(apiKey)) {
    return res.json({ reply: '抱歉，AI 服务暂未配置，请联系管理员设置 API Key。', aiUsed: false });
  }

  const systemPrompt = getChatSystemPrompt({ stream: true });

  const chatMessages = buildChatMessages({
    systemPrompt,
    context,
    messages,
    message,
    contextPrefix: '当前简历上下文：',
  });

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  let clientClosed = false;
  let heartbeatTimer = null;
  let upstreamAbortController = null;

  // 监听客户端断开，及时清理心跳并中止上游流式请求
  req.on('close', () => {
    clientClosed = true;
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (upstreamAbortController) upstreamAbortController.abort();
  });

  // SSE 心跳，避免代理层或中间网络在长连接下断开
  heartbeatTimer = setInterval(() => {
    if (clientClosed) return;
    res.write(': ping\n\n');
  }, 15000);

  try {
    upstreamAbortController = new AbortController();
    const response = await requestChatCompletion({
      apiKey,
      messages: chatMessages,
      stream: true,
      signal: upstreamAbortController.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Stream API error:', response.status, errText);
      if (!clientClosed) {
        res.write(`data: ${JSON.stringify({ error: 'AI 服务异常' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let totalContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (clientClosed) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') {
          continue; // Don't forward upstream DONE; we send our own after quota deduction
        }
        try {
          const parsed = JSON.parse(payload);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            totalContent += delta;
            if (!clientClosed) {
              res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
            }
          }
        } catch {}
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      const trimmed = buffer.trim();
      if (trimmed.startsWith('data:')) {
        const payload = trimmed.slice(5).trim();
        if (payload !== '[DONE]') {
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              totalContent += delta;
              if (!clientClosed) {
                res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
              }
            }
          } catch {}
        }
      }
    }

    if (!clientClosed) {
      // Deduct quota based on total streamed content
      const cost = await deductQuota(req.userId, totalContent.length);
      const remaining = await checkQuota(req.userId);
      res.write(`data: ${JSON.stringify({ quota: remaining, quotaUsed: cost })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }

    if (heartbeatTimer) clearInterval(heartbeatTimer);
  } catch (err) {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (clientClosed) return;
    if (err?.name === 'AbortError') return;

    console.error('chat-stream error:', err);
    res.write(`data: ${JSON.stringify({ error: 'AI 对话失败' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

export default router;
