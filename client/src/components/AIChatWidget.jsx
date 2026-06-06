import { useState, useRef, useEffect, useCallback } from 'react'
import {
  MessageSquare, X, Send, Sparkles, Trash2, Copy, Check, Minimize2, Maximize2,
  StopCircle, RotateCcw, Bot, User, ChevronDown
} from 'lucide-react'
import { aiAPI } from '../services/api.js'

// ─── Inline Markdown renderer ───
function renderMarkdown(text) {
  if (!text) return ''
  let html = text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="ai-code-block"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    .replace(/^### (.+)$/gm, '<h4 class="font-bold text-gray-800 mt-2 mb-1">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="font-bold text-gray-800 mt-2 mb-1">$1</h3>')
    .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul class="ai-md-list">$1</ul>')
    .replace(/\n/g, '<br/>')
  return html
}

const QUICK_PROMPTS = [
  { icon: '✍️', label: '润色工作描述', prompt: '帮我润色一段工作经历描述，使用STAR法则，突出量化成果。请给我一个模板和示例。' },
  { icon: '📝', label: '生成个人简介', prompt: '帮我写一段100字左右的专业个人简介/自我评价，要突出核心竞争力。' },
  { icon: '🎯', label: '技能列表优化', prompt: '帮我优化技能列表：按精通/熟练/了解分类，并建议补充哪些技能关键词更有竞争力。' },
  { icon: '💡', label: '简历诊断', prompt: '请从内容完整性、措辞专业性、排版可读性三个维度，给我一份简历优化诊断报告。' },
]

export default function AIChatWidget() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [quota, setQuota] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const chatRef = useRef(null)
  const abortRef = useRef(null)
  const streamMsgIdRef = useRef(null)

  // Fetch quota when widget opens
  useEffect(() => {
    if (open) {
      aiAPI.getQuota().then(({ data }) => setQuota(data.quota)).catch(() => {})
    }
  }, [open])

  const isNearBottom = useCallback(() => {
    if (!chatRef.current) return true
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current
    return scrollHeight - scrollTop - clientHeight < 80
  }, [])

  const scrollToBottom = useCallback((force = false) => {
    if (force || isNearBottom()) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isNearBottom])

  useEffect(() => {
    if (open) {
      scrollToBottom(true)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  const handleScroll = useCallback(() => {
    setShowScrollBtn(!isNearBottom())
  }, [isNearBottom])

  // ─── Send with streaming ───
  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || streaming) return

    if (quota !== null && quota <= 0) {
      setMessages(prev => [...prev,
        { role: 'user', content: msg, id: Date.now() + '-u' },
        { role: 'assistant', content: '⚠️ AI 额度已用完，请联系管理员充值。', id: Date.now() + '-err', isError: true }
      ])
      setInput('')
      return
    }

    const userMsg = { role: 'user', content: msg, id: Date.now() + '-u' }
    const assistantId = Date.now() + '-a'

    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '', id: assistantId, streaming: true }])
    setInput('')
    setStreaming(true)
    streamMsgIdRef.current = assistantId
    if (inputRef.current) inputRef.current.style.height = '42px'

    const history = messages
      .filter(m => m.content && !m.isError)
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const controller = await aiAPI.chatStream(
        msg,
        { messages: history },
        (chunk) => {
          setMessages(prev => prev.map(m =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          ))
        },
        (quotaInfo) => {
          setMessages(prev => prev.map(m =>
            m.id === assistantId ? { ...m, streaming: false } : m
          ))
          if (quotaInfo?.quota !== undefined) setQuota(quotaInfo.quota)
          setStreaming(false)
          streamMsgIdRef.current = null
        },
        (error) => {
          setMessages(prev => prev.map(m =>
            m.id === assistantId ? { ...m, content: error || '请求失败', isError: true, streaming: false } : m
          ))
          setStreaming(false)
          streamMsgIdRef.current = null
        }
      )
      abortRef.current = controller
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: '⚠️ 网络连接失败，请重试', isError: true, streaming: false } : m
      ))
      setStreaming(false)
    }
  }

  const stopStreaming = () => {
    if (abortRef.current) abortRef.current.aborted = true
    const id = streamMsgIdRef.current
    if (id) {
      setMessages(prev => prev.map(m =>
        m.id === id ? { ...m, streaming: false, stopped: true } : m
      ))
    }
    setStreaming(false)
  }

  const regenerate = (msgId) => {
    const idx = messages.findIndex(m => m.id === msgId)
    if (idx <= 0) return
    const userMsg = messages[idx - 1]
    if (userMsg?.role !== 'user') return
    setMessages(prev => prev.filter(m => m.id !== msgId))
    setTimeout(() => sendMessage(userMsg.content), 100)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    if (streaming) stopStreaming()
    setMessages([])
  }

  const copyMessage = (id, content) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const isWelcome = messages.length === 0 && !streaming
  const panelW = expanded ? 'w-[540px]' : 'w-[420px]'
  const panelH = expanded ? 'h-[640px]' : 'h-[520px]'

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div className={`fixed bottom-20 right-5 ${panelW} ${panelH} z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden animate-chat-in`}>
          {/* Header - Dark theme like ChatGPT */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold leading-tight">AI 简历助手</h3>
                <div className="flex items-center gap-1">
                  {streaming && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                  <p className="text-[10px] text-white/50">
                    {streaming ? '正在回复...' : '基于 qwen-plus 大模型'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Quota badge */}
              {quota !== null && (
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                  quota > 500 ? 'bg-emerald-500/20 text-emerald-300' :
                  quota > 100 ? 'bg-amber-500/20 text-amber-300' :
                  'bg-red-500/20 text-red-300'
                }`} title={`剩余 AI 额度: ${quota}`}>
                  <Sparkles className="w-2.5 h-2.5" />
                  {quota}
                </div>
              )}
              <button onClick={clearChat} className="p-1.5 hover:bg-white/10 rounded-lg transition" title="清空对话">
                <Trash2 className="w-3.5 h-3.5 text-white/50 hover:text-white/80" />
              </button>
              <button onClick={() => setExpanded(!expanded)} className="p-1.5 hover:bg-white/10 rounded-lg transition" title={expanded ? '缩小' : '放大'}>
                {expanded ? <Minimize2 className="w-3.5 h-3.5 text-white/50" /> : <Maximize2 className="w-3.5 h-3.5 text-white/50" />}
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition" title="关闭">
                <X className="w-3.5 h-3.5 text-white/50 hover:text-white/80" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-gray-50/80"
            ref={chatRef}
            onScroll={handleScroll}
          >
            {/* Welcome screen */}
            {isWelcome && (
              <div className="flex flex-col items-center justify-center h-full py-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">你好，我是 AI 简历助手</h3>
                <p className="text-xs text-gray-400 mb-5 text-center max-w-[280px]">
                  我可以帮你撰写、润色简历内容，优化描述措辞，提供专业建议
                </p>
                <div className="grid grid-cols-2 gap-2 w-full max-w-[320px]">
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp.label}
                      onClick={() => sendMessage(qp.prompt)}
                      className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-left hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm transition group"
                    >
                      <span className="text-base flex-shrink-0">{qp.icon}</span>
                      <span className="text-[11px] font-medium text-gray-600 group-hover:text-blue-600 leading-tight">{qp.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  msg.role === 'user'
                    ? 'bg-blue-600'
                    : 'bg-gradient-to-br from-slate-700 to-slate-800'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-3 h-3 text-white" />
                    : <Bot className="w-3 h-3 text-white" />
                  }
                </div>

                {/* Content */}
                <div className={`group relative max-w-[82%] min-w-[40px] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`text-[13px] leading-relaxed break-words ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-2xl rounded-tr-md px-3.5 py-2.5'
                      : msg.isError
                        ? 'bg-red-50 text-red-600 border border-red-200 rounded-2xl rounded-tl-md px-3.5 py-2.5'
                        : 'bg-white text-gray-700 border border-gray-100 shadow-sm rounded-2xl rounded-tl-md px-3.5 py-2.5'
                  }`}>
                    {msg.role === 'user' ? (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    ) : (
                      <>
                        <div
                          className="ai-chat-content"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                        />
                        {msg.streaming && (
                          <span className="inline-block w-1.5 h-4 bg-blue-500 rounded-sm ml-0.5 animate-pulse" />
                        )}
                      </>
                    )}
                  </div>

                  {/* Action bar for assistant messages */}
                  {msg.role === 'assistant' && !msg.isError && !msg.streaming && msg.content && (
                    <div className="flex items-center gap-0.5 mt-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => copyMessage(msg.id, msg.content)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                        title="复制"
                      >
                        {copiedId === msg.id
                          ? <Check className="w-3 h-3 text-emerald-500" />
                          : <Copy className="w-3 h-3" />
                        }
                      </button>
                      <button
                        onClick={() => regenerate(msg.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                        title="重新生成"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          {showScrollBtn && (
            <button
              onClick={() => scrollToBottom(true)}
              className="absolute bottom-[72px] left-1/2 -translate-x-1/2 p-1.5 bg-white border border-gray-200 rounded-full shadow-lg hover:bg-gray-50 transition z-10"
            >
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          )}

          {/* Input area */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 py-2.5">
            {/* Stop button when streaming */}
            {streaming && (
              <button
                onClick={stopStreaming}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 mb-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-600 font-medium transition"
              >
                <StopCircle className="w-3.5 h-3.5" />
                停止生成
              </button>
            )}
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={streaming ? 'AI 正在回复中...' : '输入你的问题...'}
                rows={1}
                disabled={streaming}
                className="flex-1 resize-none text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 focus:bg-white placeholder:text-gray-300 max-h-24 leading-relaxed transition disabled:opacity-50"
                style={{ minHeight: '42px' }}
                onInput={(e) => {
                  e.target.style.height = '42px'
                  e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px'
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || streaming}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-300 text-center mt-1.5">Enter 发送 · Shift+Enter 换行</p>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 active:scale-90 ${
          open
            ? 'bg-slate-800 hover:bg-slate-900'
            : 'bg-gradient-to-br from-slate-800 to-slate-900 hover:shadow-2xl hover:shadow-slate-900/25'
        }`}
        title={open ? '关闭 AI 助手' : '打开 AI 简历助手'}
      >
        {open ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-white" />
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-800 animate-pulse" />
          </div>
        )}
      </button>
    </>
  )
}
