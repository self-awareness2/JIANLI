import { Router } from 'express';
import multer from 'multer';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { authMiddleware } from '../middleware/auth.js';
import mammoth from 'mammoth';
import prisma from '../lib/prisma.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('仅支持 PDF 和 Word 文件'));
    }
  },
});

// 从文件中提取文本
async function extractText(buffer, mimetype) {
  if (mimetype === 'application/pdf') {
    const data = new Uint8Array(buffer);
    const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;
    let text = '';
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      // 智能拼接：根据 item 的位置判断是否需要空格或换行
      let lastY = null;
      let lineText = '';
      for (const item of content.items) {
        if (!item.str) continue;
        const y = Math.round(item.transform?.[5] || 0);
        if (lastY !== null && Math.abs(y - lastY) > 5) {
          // Y坐标变化 → 新行
          text += lineText.trim() + '\n';
          lineText = item.str;
        } else {
          // 同一行：如果前后都是CJK则不加空格
          if (lineText.length > 0) {
            const lastChar = lineText[lineText.length - 1];
            const firstChar = item.str[0];
            const isCJK = (c) => c && /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(c);
            if (isCJK(lastChar) && isCJK(firstChar)) {
              lineText += item.str;
            } else {
              lineText += ' ' + item.str;
            }
          } else {
            lineText = item.str;
          }
        }
        lastY = y;
      }
      if (lineText.trim()) text += lineText.trim() + '\n';
    }
    return text;
  }
  // Word (.doc / .docx)
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// 预处理PDF提取的文本：清除CJK字符间的多余空格
function normalizeText(text) {
  let result = text.replace(/([\u4e00-\u9fa5])\s+([\u4e00-\u9fa5])/g, '$1$2');
  result = result.replace(/([\u4e00-\u9fa5])\s+([\u4e00-\u9fa5])/g, '$1$2');
  result = result.replace(/([\u4e00-\u9fa5])\s+([\u4e00-\u9fa5])/g, '$1$2');
  result = result.replace(/([\u4e00-\u9fa5])\s{2,}([a-zA-Z0-9])/g, '$1 $2');
  result = result.replace(/([a-zA-Z0-9])\s{2,}([\u4e00-\u9fa5])/g, '$1 $2');
  result = result.replace(/([\u4e00-\u9fa5])\s+([，。、：；！？）》」』】])/g, '$1$2');
  result = result.replace(/([（《「『【])\s+([\u4e00-\u9fa5])/g, '$1$2');
  return result;
}

// ========== LLM 智能解析 ==========

const DASHSCOPE_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

const PARSE_PROMPT = `你是一个专业的简历解析器。请仔细阅读以下简历文本，提取所有信息并按照指定JSON格式输出。

**要求：**
1. 仔细阅读全文，理解每一段的含义，将内容放到正确的分类中
2. 如果某个字段无法提取，用空字符串""
3. 工作描述和项目描述用要点列表格式，每项前加"- "
4. 技能提取所有提到的技术关键词
5. 日期格式保持原样（如 2018.09）
6. 只输出JSON，不要输出任何其他文字

**输出格式：**
{
  "personal": {
    "name": "姓名",
    "title": "职位/求职意向",
    "phone": "手机号",
    "email": "邮箱",
    "location": "所在城市",
    "experience": "工作经验（如3年）",
    "summary": "个人总结/自我评价（如有）"
  },
  "education": {
    "items": [
      {
        "school": "学校名称",
        "major": "专业",
        "degree": "学历（本科/硕士/博士等）",
        "startDate": "开始日期",
        "endDate": "结束日期",
        "description": "相关描述"
      }
    ]
  },
  "work": {
    "items": [
      {
        "company": "公司名称",
        "position": "职位",
        "startDate": "开始日期",
        "endDate": "结束日期",
        "city": "工作城市",
        "description": "工作描述（要点列表）"
      }
    ]
  },
  "project": {
    "items": [
      {
        "name": "项目名称",
        "role": "角色",
        "startDate": "开始日期",
        "endDate": "结束日期",
        "description": "项目描述（要点列表）"
      }
    ]
  },
  "skill": {
    "items": [
      { "name": "技能名称", "level": "熟练度（精通/熟练/熟悉/了解）" }
    ]
  }
}

**简历文本：**
`;

async function callLLM(text) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.log('No DASHSCOPE_API_KEY configured, falling back to regex parsing');
    return null;
  }

  const response = await fetch(DASHSCOPE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: '你是一个精确的简历解析器，只输出JSON格式的结构化数据。' },
        { role: 'user', content: PARSE_PROMPT + text },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('LLM API error:', response.status, err);
    return null;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  // 提取JSON（可能被```json包裹）
  const jsonMatch = content.match(/```json\s*([\s\S]*?)```/) || content.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) {
    console.error('LLM response not valid JSON:', content.substring(0, 500));
    return null;
  }

  try {
    const parsed = JSON.parse(jsonMatch[1]);
    return parsed;
  } catch (e) {
    console.error('JSON parse error:', e.message, jsonMatch[1].substring(0, 200));
    return null;
  }
}

// LLM 解析简历（带回退）
async function parseResumeWithLLM(rawText) {
  const text = normalizeText(rawText);

  // 尝试 LLM 解析
  const llmResult = await callLLM(text.substring(0, 8000));
  if (llmResult) {
    console.log('LLM parsing succeeded');
    // 确保数据结构完整
    return sanitizeParsedData(llmResult);
  }

  // LLM 失败，回退到正则解析
  console.log('Falling back to regex parsing');
  return parseResumeRegex(text);
}

// 确保解析结果结构完整，所有字段类型正确
function sanitizeParsedData(data) {
  const empty = {
    personal: { name: '', title: '', phone: '', email: '', location: '', experience: '', summary: '' },
    education: { items: [{ school: '', major: '', degree: '', startDate: '', endDate: '', description: '' }] },
    work: { items: [{ company: '', position: '', startDate: '', endDate: '', city: '', description: '' }] },
    project: { items: [{ name: '', role: '', startDate: '', endDate: '', description: '' }] },
    skill: { items: [{ name: '', level: '' }] },
  };

  const result = {};

  // personal: 确保所有值是字符串
  const p = data.personal || {};
  result.personal = {};
  for (const key of Object.keys(empty.personal)) {
    const val = p[key];
    result.personal[key] = typeof val === 'string' ? val : (Array.isArray(val) ? val.join('\n') : String(val || ''));
  }

  // 各 section: 确保 items 数组存在，description 是字符串
  for (const key of ['education', 'work', 'project', 'skill']) {
    if (data[key]?.items?.length > 0) {
      result[key] = {
        items: data[key].items.map(item => {
          const cleaned = {};
          for (const [k, v] of Object.entries(item)) {
            if (Array.isArray(v)) {
              cleaned[k] = v.join('\n');
            } else {
              cleaned[k] = v == null ? '' : String(v);
            }
          }
          return cleaned;
        }),
      };
    } else {
      result[key] = empty[key];
    }
  }

  return result;
}

// 正则解析（LLM失败时的回退方案）
function parseResumeRegex(rawText) {
  const text = normalizeText(rawText);
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);

  const personal = { name: '', title: '', phone: '', email: '', location: '', experience: '', summary: '' };
  const educationItems = [];
  const workItems = [];
  const projectItems = [];
  const skillItems = [];

  // 提取手机号
  const phoneMatch = text.match(/1[3-9]\d{9}/);
  if (phoneMatch) personal.phone = phoneMatch[0];

  // 提取邮箱
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) personal.email = emailMatch[0];

  // 提取地点（常见城市名）
  const cityMatch = text.match(/(北京|上海|广州|深圳|成都|杭州|南京|武汉|重庆|西安|苏州|天津|长沙|郑州|东莞|青岛|无锡|宁波|合肥|厦门|佛山|大连|福州|济南|昆明|石家庄|哈尔滨|沈阳|长春|南宁|贵阳|太原|兰州|海口|银川|乌鲁木齐|呼和浩特|拉萨|西宁|珠海|中山|惠州|江苏|浙江|广东|四川|湖北|湖南|山东|河南|河北|安徽|福建|江西|陕西|辽宁|吉林|黑龙江)/);
  if (cityMatch) personal.location = cityMatch[1];

  // 提取经验
  const expMatch = text.match(/(\d+)\s*年(经验|经历|工作)/);
  if (expMatch) personal.experience = expMatch[1] + '年';

  // 简历分块关键字 - 允许关键字中间有空格
  const sectionKeywords = {
    personal: /^(个人信息|基本信息|个人资料|personal)/i,
    education: /^(教育经历|教育背景|学历|education)/i,
    work: /^(工作经历|工作经验|职业经历|work\s*experience)/i,
    project: /^(项目经历|项目经验|项目|project)/i,
    skill: /^(专业技能|技能特长|技能|技术栈|skills|技术能力)/i,
    summary: /^(个人总结|自我评价|个人简介|个人评价|summary|自我介绍|profile)/i,
  };

  // 检测行是否是分区标题
  function isSectionHeader(line) {
    const cleaned = line.trim();
    for (const [section, regex] of Object.entries(sectionKeywords)) {
      if (regex.test(cleaned)) return section;
    }
    // 也匹配仅包含关键词的短行（可能带有分隔线等）
    if (cleaned.length <= 10) {
      if (/教育/.test(cleaned)) return 'education';
      if (/工作/.test(cleaned)) return 'work';
      if (/项目/.test(cleaned)) return 'project';
      if (/技能/.test(cleaned)) return 'skill';
      if (/评价|总结|简介/.test(cleaned)) return 'summary';
    }
    return null;
  }

  let currentSection = 'personal';
  let currentBlock = [];

  function flushBlock() {
    const blockText = currentBlock.join('\n').trim();
    if (!blockText) return;

    if (currentSection === 'personal') {
      // 从前几行提取个人信息
      for (const line of currentBlock) {
        // 姓名：2-4个中文字符且不含常见关键词
        if (!personal.name) {
          const nameMatch = line.match(/^([\u4e00-\u9fa5]{2,4})$/);
          if (nameMatch && !/经历|技能|教育|工作|项目|信息|简介/.test(nameMatch[1])) {
            personal.name = nameMatch[1];
            continue;
          }
        }
        // 职位行：包含"工程师/设计师/开发/经理"等
        if (!personal.title && /(工程师|设计师|开发|经理|总监|专员|助理|分析师|架构师|产品|运营|测试|前端|后端|全栈)/.test(line)) {
          // 提取职位（去除经验部分）
          personal.title = line.replace(/[\(（].*?[\)）]/g, '').trim();
        }
      }
    } else if (currentSection === 'summary') {
      personal.summary = blockText;
    } else if (currentSection === 'education') {
      // 按日期分割多段教育经历
      const blocks = splitByDate(currentBlock);
      for (const b of blocks) {
        const item = parseEducationBlock(b.join('\n'));
        if (item.school || item.major) educationItems.push(item);
      }
    } else if (currentSection === 'work') {
      const blocks = splitByDate(currentBlock);
      for (const b of blocks) {
        const item = parseWorkBlock(b.join('\n'));
        if (item.company || item.position) workItems.push(item);
      }
    } else if (currentSection === 'project') {
      const blocks = splitByDate(currentBlock);
      for (const b of blocks) {
        const item = parseProjectBlock(b.join('\n'));
        if (item.name) projectItems.push(item);
      }
    } else if (currentSection === 'skill') {
      parseSkills(blockText, skillItems);
    }
    currentBlock = [];
  }

  for (const line of lines) {
    const section = isSectionHeader(line);
    if (section) {
      flushBlock();
      currentSection = section;
    } else {
      currentBlock.push(line);
    }
  }
  flushBlock();

  // 如果没有识别到姓名，尝试用第一行
  if (!personal.name && lines.length > 0) {
    const first = lines[0];
    if (first.length <= 20 && !first.includes('@') && !/\d{5,}/.test(first) && !/经历|技能/.test(first)) {
      personal.name = first;
    }
  }

  // 尝试从前几行提取求职意向
  if (!personal.title) {
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const l = lines[i];
      if (/求职意向|应聘/.test(l)) {
        personal.title = l.replace(/.*[:：]/, '').trim();
        break;
      }
    }
  }

  return {
    personal,
    education: { items: educationItems.length ? educationItems : [{ school: '', major: '', degree: '', startDate: '', endDate: '', description: '' }] },
    work: { items: workItems.length ? workItems : [{ company: '', position: '', startDate: '', endDate: '', city: '', description: '' }] },
    project: { items: projectItems.length ? projectItems : [{ name: '', role: '', startDate: '', endDate: '', description: '' }] },
    skill: { items: skillItems.length ? skillItems : [{ name: '', level: '' }] },
  };
}

// 日期正则
const DATE_RANGE_RE = /(\d{4}[\.\/\-]\d{1,2})\s*[-–~至到]\s*(\d{4}[\.\/\-]\d{1,2}|至今|present)/i;
const DATE_LINE_RE = /\d{4}[\.\/\-]\d{1,2}\s*[-–~至到]/;

// 按日期行分割多条记录（更鲁棒的方案）
function splitByDate(lines) {
  // 策略：找到包含日期范围的行，这些行（或其前一行）是新记录的开始
  const blocks = [];
  let current = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const hasDate = DATE_LINE_RE.test(line);

    if (hasDate && current.length > 0) {
      // 日期行出现了：检查是否当前行同时包含标题（如"电子科技大学 2018.09 - 2022.07"）
      // 或者日期独占一行（前一行是标题）
      const prevLine = current[current.length - 1];
      const prevIsBullet = /^[•·\-\*►]/.test(prevLine);
      const prevIsLong = prevLine.length > 50;

      if (!prevIsBullet && !prevIsLong && !/\d{4}/.test(prevLine)) {
        // 前一行可能是标题行（公司名/学校名），和日期行归为新记录
        const titleLine = current.pop();
        if (current.length > 0) blocks.push([...current]);
        current = [titleLine, line];
      } else {
        // 前面是描述性内容，把之前的存为一条记录
        blocks.push([...current]);
        current = [line];
      }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) blocks.push(current);
  return blocks.length ? blocks : [lines];
}

// 从行中提取日期范围
function extractDate(text) {
  const m = text.match(DATE_RANGE_RE);
  return m ? { startDate: m[1], endDate: m[2] } : { startDate: '', endDate: '' };
}

// 去除行中的日期部分，只留标题
function stripDate(text) {
  return text.replace(DATE_RANGE_RE, '').replace(/\d{4}[\.\/\-]\d{1,2}/g, '').trim();
}

// 判断是否为 bullet / 描述行
function isBullet(line) {
  return /^[•·\-\*►●○]/.test(line) || /^负责|^参与|^开发|^设计|^实现|^优化|^使用|^基于|^通过|^构建|^编写|^主导/.test(line);
}

function parseEducationBlock(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const item = { school: '', major: '', degree: '', startDate: '', endDate: '', description: '' };

  const dates = extractDate(text);
  item.startDate = dates.startDate;
  item.endDate = dates.endDate;

  // 学历
  const degreeMatch = text.match(/(博士|硕士|本科|大专|学士|MBA|PhD|Master|Bachelor)/i);
  if (degreeMatch) item.degree = degreeMatch[1];

  // 遍历行提取字段
  const descLines = [];
  for (const l of lines) {
    const clean = stripDate(l);
    if (!clean) continue;

    // 学校
    if (!item.school && /大学|学院|University|College|Institute/i.test(clean)) {
      item.school = clean.replace(/(本科|硕士|博士|大专|学士)/, '').trim();
      continue;
    }
    // 专业行 - 包含专业名但不是描述
    if (!item.major && clean.length < 30 && !isBullet(clean)) {
      // 如果含学历关键词，可能是 "计算机科学与技术 本科" 这样的行
      const majorText = clean.replace(/(本科|硕士|博士|大专|学士|专业[:：]?)/g, '').trim();
      if (majorText && majorText.length < 25 && !/^主修|^GPA/.test(majorText)) {
        item.major = majorText;
        continue;
      }
    }
    // 其余为描述
    if (clean.length > 2) descLines.push(clean);
  }

  // 如果没找到学校，用第一行
  if (!item.school && lines[0]) {
    item.school = stripDate(lines[0]).replace(/(本科|硕士|博士)/, '').trim();
  }

  if (descLines.length) {
    item.description = descLines.join('\n');
  }

  return item;
}

function parseWorkBlock(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const item = { company: '', position: '', startDate: '', endDate: '', city: '', description: '' };

  const dates = extractDate(text);
  item.startDate = dates.startDate;
  item.endDate = dates.endDate;

  // 城市提取
  const cityRe = /(北京|上海|广州|深圳|成都|杭州|南京|武汉|重庆|西安|苏州|天津|长沙|郑州|无锡|宁波|合肥|厦门|佛山|大连|福州|济南|昆明|沈阳|四川|江苏|浙江|广东|湖北|山东|河南|河北|安徽|福建|江西|陕西|辽宁|吉林|黑龙江)/;

  const descLines = [];
  let headerDone = false;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const clean = stripDate(l);
    if (!clean) continue;

    // 第一个非空行 → 公司名
    if (!item.company && !headerDone) {
      // 公司名：含"公司/集团/研究所/有限/科技"等，或是非bullet的短行
      if (/公司|集团|研究所|有限|科技|技术|软件|网络|信息|工厂|研究院|实验室|事务所/i.test(clean) || (!isBullet(clean) && clean.length < 30)) {
        item.company = clean.replace(cityRe, '').trim();
        const cm = clean.match(cityRe);
        if (cm) item.city = cm[1];
        continue;
      }
    }

    // 第二个非描述行 → 职位
    if (item.company && !item.position && !headerDone && !isBullet(clean) && clean.length < 30) {
      // 职位行：含职称关键词
      item.position = clean.replace(cityRe, '').trim();
      const cm = clean.match(cityRe);
      if (cm && !item.city) item.city = cm[1];
      headerDone = true;
      continue;
    }

    // 描述行
    if (clean.length > 2) {
      headerDone = true;
      descLines.push(clean);
    }
  }

  if (descLines.length) {
    item.description = descLines.map(l => l.replace(/^[•·►●○]\s*/, '- ')).join('\n');
  }

  return item;
}

function parseProjectBlock(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const item = { name: '', role: '', startDate: '', endDate: '', description: '' };

  const dates = extractDate(text);
  item.startDate = dates.startDate;
  item.endDate = dates.endDate;

  const descLines = [];
  let headerDone = false;

  for (const l of lines) {
    const clean = stripDate(l);
    if (!clean) continue;

    // 项目名：第一个非bullet短行
    if (!item.name && !isBullet(clean) && clean.length < 40) {
      item.name = clean;
      continue;
    }

    // 角色行
    if (!item.role && !headerDone && !isBullet(clean) && clean.length < 20) {
      item.role = clean;
      headerDone = true;
      continue;
    }

    // 描述
    if (clean.length > 2) {
      headerDone = true;
      descLines.push(clean);
    }
  }

  if (descLines.length) {
    item.description = descLines.map(l => l.replace(/^[•·►●○]\s*/, '- ')).join('\n');
  }

  return item;
}

function parseSkills(text, items) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 策略1：查找 "技能名 — 熟练度" 或 "技能名, 技能名" 模式
  // 策略2：提取技术关键词
  const techKeywords = new Set();

  for (const line of lines) {
    // 跳过纯标题行
    if (/^(专业技能|技能|技术栈|skills)$/i.test(line)) continue;

    // 熟练度行："熟练掌握 XXX"
    const levelMatch = line.match(/(精通|熟练|熟悉|了解|掌握)/);  
    const level = levelMatch ? levelMatch[1].replace('掌握', '熟练') : '';

    // 提取逗号/顿号分隔的技能列表（如 "C++11, Qt, OpenCV"）
    const techLine = line.replace(/(精通|熟练掌握|熟练|熟悉|了解|掌握)[^,，、]*/g, '').trim();
    const techs = techLine.split(/[,，、;；\s]+/).map(s => s.trim()).filter(s =>
      s.length >= 1 && s.length < 30 && !/^(和|与|等|的|进行|使用|具备|良好|核心|特性)$/.test(s)
    );

    for (const t of techs) {
      // 只保留看起来像技术名的（含英文、数字、或短中文）
      if (/[a-zA-Z0-9+#]/.test(t) || (t.length <= 8 && /[\u4e00-\u9fa5]/.test(t))) {
        if (!techKeywords.has(t)) {
          techKeywords.add(t);
          items.push({ name: t, level });
        }
      }
    }
  }
}

// 导入简历
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const text = await extractText(req.file.buffer, req.file.mimetype);
    console.log('=== Extracted text (first 2000 chars) ===');
    console.log(text.substring(0, 2000));
    console.log('=== End extracted text ===');
    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: '无法提取文件内容，请检查文件是否有效' });
    }

    const parsed = await parseResumeWithLLM(text);
    console.log('=== Parsed result ===');
    console.log(JSON.stringify(parsed, null, 2).substring(0, 1500));
    console.log('=== End parsed result ===');

    // 创建简历
    const resume = await prisma.resume.create({
      data: {
        userId: req.userId,
        title: parsed.personal.name ? `${parsed.personal.name}的简历` : '导入的简历',
        sections: {
          create: [
            { type: 'personal', order: 0, data: JSON.stringify(parsed.personal) },
            { type: 'education', order: 1, data: JSON.stringify(parsed.education) },
            { type: 'work', order: 2, data: JSON.stringify(parsed.work) },
            { type: 'project', order: 3, data: JSON.stringify(parsed.project) },
            { type: 'skill', order: 4, data: JSON.stringify(parsed.skill) },
          ],
        },
      },
      include: { sections: { orderBy: { order: 'asc' } } },
    });

    res.json({
      resume,
      extractedText: text.substring(0, 500),
      message: '简历导入成功',
    });
  } catch (err) {
    console.error('Import error:', err);
    if (err.message === '仅支持 PDF 和 Word 文件') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: '导入失败，请重试' });
  }
});

// 预览解析结果（不创建简历）
router.post('/preview', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const text = await extractText(req.file.buffer, req.file.mimetype);
    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: '无法提取文件内容' });
    }

    const parsed = await parseResumeWithLLM(text);
    res.json({ parsed, extractedText: text.substring(0, 2000) });
  } catch (err) {
    console.error('Preview error:', err);
    res.status(500).json({ error: '解析失败' });
  }
});

export default router;
