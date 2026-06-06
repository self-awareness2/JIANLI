import prisma from '../lib/prisma.js';

const DASHSCOPE_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

// 获取当前 AI 服务 API Key。
export function getAiApiKey() {
  return process.env.DASHSCOPE_API_KEY;
}

// 校验 AI 服务是否已正确配置。
export function isAiConfigured(apiKey = getAiApiKey()) {
  return Boolean(apiKey && apiKey !== 'your_api_key_here');
}

// 查询指定用户当前 AI 额度。
export async function checkQuota(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { aiQuota: true } });
  return user?.aiQuota ?? 0;
}

// 按 token 估算并扣减额度，保证额度不会变成负数。
export async function deductQuota(userId, tokens) {
  const normalizedTokens = Math.max(0, tokens || 0);
  if (normalizedTokens === 0) return 0;

  const cost = Math.max(1, Math.ceil(normalizedTokens / 80));
  const used = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { aiQuota: true } });
    const currentQuota = user?.aiQuota ?? 0;
    const nextQuota = Math.max(0, currentQuota - cost);

    await tx.user.update({
      where: { id: userId },
      data: { aiQuota: nextQuota },
    });

    return currentQuota - nextQuota;
  });

  return used;
}

// 调用非流式 LLM 接口并返回文本结果。
export async function callLLM(systemPrompt, userPrompt, options = {}) {
  const apiKey = getAiApiKey();
  if (!isAiConfigured(apiKey)) {
    return null;
  }

  const response = await fetch(DASHSCOPE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || 'qwen-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 2000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('LLM API error:', response.status, err);
    throw new Error(`LLM API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// 组装多轮对话消息，包含上下文与历史会话。
export function buildChatMessages({ systemPrompt, context, messages, message, contextPrefix = '当前简历上下文信息：' }) {
  const chatMessages = [{ role: 'system', content: systemPrompt }];

  if (context) {
    chatMessages.push({ role: 'system', content: `${contextPrefix}\n${context}` });
  }

  if (messages && Array.isArray(messages)) {
    const recentMessages = messages.slice(-20);
    recentMessages.forEach((item) => {
      if (item.role === 'user' || item.role === 'assistant') {
        chatMessages.push({ role: item.role, content: item.content });
      }
    });
  }

  chatMessages.push({ role: 'user', content: message });
  return chatMessages;
}

// 调用聊天接口，支持普通与流式两种模式。
export async function requestChatCompletion({ apiKey, messages, stream = false, signal, model = 'qwen-plus' }) {
  return fetch(DASHSCOPE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.8,
      max_tokens: 2000,
      stream,
    }),
    signal,
  });
}

// 构建「润色描述」场景的 system/user prompt。
export function buildEnhanceDescriptionPrompts({ description, context }) {
  const systemPrompt = `你是一位资深的简历优化专家。请帮用户将简短的工作/项目描述润色为专业的简历语言。

规则：
1. 使用要点列表格式，每条以"- "开头
2. 突出具体的成果和数据（如提升了XX%、服务了XX用户等）
3. 使用 STAR 法则（情境-任务-行动-结果）
4. 语言简练有力，避免过于口语化
5. 保持3-5个要点
6. 直接输出润色后的描述文本，不要加多余的解释`;

  const userPrompt = context
    ? `${context}\n\n用户原始描述：\n${description}`
    : `用户原始描述：\n${description}`;

  return { systemPrompt, userPrompt };
}

// 构建「生成个人总结」场景的结构化上下文文本。
export function buildSummaryContext({ personal, education, work, project, skill }) {
  let context = '';

  if (personal?.name) context += `姓名：${personal.name}\n`;
  if (personal?.title) context += `求职意向：${personal.title}\n`;
  if (personal?.experience) context += `工作经验：${personal.experience}\n`;
  if (personal?.location) context += `所在城市：${personal.location}\n`;

  if (education?.items?.length) {
    context += '\n教育经历：\n';
    education.items.forEach((item) => {
      context += `- ${item.school || ''} ${item.major || ''} ${item.degree || ''}\n`;
    });
  }

  if (work?.items?.length) {
    context += '\n工作经历：\n';
    work.items.forEach((item) => {
      context += `- ${item.company || ''} ${item.position || ''}\n`;
      if (item.description) context += `  ${item.description}\n`;
    });
  }

  if (project?.items?.length) {
    context += '\n项目经历：\n';
    project.items.forEach((item) => {
      context += `- ${item.name || ''} (${item.role || ''})\n`;
      if (item.description) context += `  ${item.description}\n`;
    });
  }

  if (skill?.items?.length) {
    context += `\n技能：${skill.items.map((item) => item.name).filter(Boolean).join('、')}\n`;
  }

  return context;
}

// 构建「生成个人总结」场景的 system/user prompt。
export function buildGenerateSummaryPrompts(payload) {
  const systemPrompt = `你是一位资深的简历优化专家。请根据用户提供的简历信息，生成一段精炼的个人总结/自我评价。

规则：
1. 50-150字左右
2. 突出核心优势和亮点
3. 结合具体的技术栈和经验年限
4. 语言专业、自信但不夸张
5. 直接输出总结文本，不要加引号或额外解释`;

  const context = buildSummaryContext(payload);
  const userPrompt = `请根据以下信息生成个人总结：\n\n${context}`;
  return { systemPrompt, userPrompt };
}

// 生成「个人总结」的本地回退文本。
export function buildSummaryFallback({ personal, skill }) {
  const title = personal?.title || '技术人员';
  const experience = personal?.experience || '';
  const skills = skill?.items?.map((item) => item.name).filter(Boolean).slice(0, 5).join('、') || '多项技术';
  return `${experience ? `${experience}经验的` : ''}${title}，熟练掌握${skills}，具备丰富的项目实战经验，注重代码质量与团队协作。`;
}

// 获取聊天助手系统提示词，可根据是否流式返回不同风格。
export function getChatSystemPrompt({ stream = false } = {}) {
  if (stream) {
    return `你是 匠芯简历 的 AI 简历助手，专门帮助用户创建和优化简历。

你的核心能力：
1. 撰写和润色简历各模块（个人简介、工作经历、项目经历、技能等）
2. 使用 STAR 法则优化经历描述，突出量化成果
3. 根据目标职位和行业调整简历措辞和关键词
4. 评估简历完整度，给出具体改进方案
5. 提供面试相关建议

回复风格：
- 简洁专业，结构清晰
- 直接给出可复制使用的优化文本
- 善用 Markdown 格式：**加粗**重点、\`代码标记\`技术词、列表分点
- 中文回复，专业术语可保留英文
- 如果用户只是打招呼，友好回应并引导到简历相关话题`;
  }

  return `你是 匠芯简历 的 AI 简历助手，专门帮助用户创建和优化简历。

你的职责：
1. 帮助用户撰写、润色简历各模块内容（个人简介、工作经历、项目经历、技能等）
2. 提供简历排版和内容结构建议
3. 根据目标职位优化简历措辞
4. 使用 STAR 法则帮助优化经历描述
5. 建议关键技术词和行业术语
6. 评估简历完整度并给出改进建议

回复规则：
- 简洁专业，避免冗长
- 给出具体可操作的建议
- 如果用户提供了简历上下文，结合上下文回答
- 可以直接给出优化后的文本，用户可直接复制使用
- 使用 Markdown 格式化重要内容
- 使用中文回复`;
}
