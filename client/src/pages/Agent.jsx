import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Send, MessageCircle, User, Star, ArrowRight, Check, FileText, Sparkles, Zap } from 'lucide-react'
import { resumeAPI, sectionAPI, aiAPI } from '../services/api.js'
import toast from 'react-hot-toast'
import { logger } from '../utils/logger.js'

const STEPS = [
  {
    id: 'greeting',
    question: '你好！我是 匠芯简历 AI 助手 🤖\n我会帮你一步步创建一份专业的简历。\n\n首先，请告诉我你的 **姓名** 和 **求职意向**（比如：张三，前端工程师）',
    field: 'personal',
    parse: (text) => {
      const parts = text.split(/[,，、\s]+/).filter(Boolean)
      return { name: parts[0] || text, title: parts[1] || '' }
    },
  },
  {
    id: 'contact',
    question: '请提供你的联系方式：\n**手机号码** 和 **邮箱**（用逗号分隔）',
    field: 'personal',
    parse: (text) => {
      const parts = text.split(/[,，\s]+/).filter(Boolean)
      const phone = parts.find(p => /\d{11}/.test(p)) || parts[0] || ''
      const email = parts.find(p => /@/.test(p)) || parts[1] || ''
      return { phone, email }
    },
  },
  {
    id: 'location',
    question: '你目前在哪个城市？有多少年工作经验？\n（比如：成都，3年）',
    field: 'personal',
    parse: (text) => {
      const parts = text.split(/[,，\s]+/).filter(Boolean)
      return { location: parts[0] || text, experience: parts[1] || '' }
    },
  },
  {
    id: 'education',
    question: '接下来是教育经历 🎓\n请告诉我：**学校名称**、**专业**、**学历**、**起止时间**\n（比如：电子科技大学，计算机科学，本科，2018.09-2022.06）',
    field: 'education',
    parse: (text) => {
      const parts = text.split(/[,，]+/).map(s => s.trim())
      return {
        items: [{
          school: parts[0] || '',
          major: parts[1] || '',
          degree: parts[2] || '',
          startDate: parts[3]?.split(/[-~]/)[0] || '',
          endDate: parts[3]?.split(/[-~]/)[1] || '',
          description: '',
        }]
      }
    },
  },
  {
    id: 'work',
    question: '现在说说工作经历 💼\n请告诉我：**公司名称**、**职位**、**起止时间**、**城市**\n（比如：字节跳动，前端工程师，2022.07-至今，北京）',
    field: 'work',
    parse: (text) => {
      const parts = text.split(/[,，]+/).map(s => s.trim())
      const dates = (parts[2] || '').split(/[-~]/)
      return {
        items: [{
          company: parts[0] || '',
          position: parts[1] || '',
          startDate: dates[0] || '',
          endDate: dates[1] || '',
          city: parts[3] || '',
          description: '',
        }]
      }
    },
  },
  {
    id: 'work_desc',
    question: '请简要描述你在这家公司的 **主要工作内容和成果**\n（可以用几句话描述，AI 会自动帮你润色成专业的简历语言 ✨）',
    field: 'work_desc',
    parse: (text) => ({ description: text }),
  },
  {
    id: 'project',
    question: '有什么值得一提的项目经历吗？ 🚀\n请告诉我：**项目名称**、**你的角色**、**起止时间**\n（比如：电商平台重构，前端负责人，2023.01-2023.06）',
    field: 'project',
    parse: (text) => {
      const parts = text.split(/[,，]+/).map(s => s.trim())
      const dates = (parts[2] || '').split(/[-~]/)
      return {
        items: [{
          name: parts[0] || '',
          role: parts[1] || '',
          startDate: dates[0] || '',
          endDate: dates[1] || '',
          description: '',
        }]
      }
    },
  },
  {
    id: 'project_desc',
    question: '请描述这个项目的 **主要内容、技术栈和你的贡献**\n（AI 会自动帮你优化描述 ✨）',
    field: 'project_desc',
    parse: (text) => ({ description: text }),
  },
  {
    id: 'skills',
    question: '最后，列出你的 **核心技能**（用逗号分隔）\n（比如：JavaScript, React, Node.js, TypeScript）',
    field: 'skill',
    parse: (text) => {
      const skills = text.split(/[,，、\s]+/).filter(Boolean)
      return { items: skills.map(name => ({ name: name.trim(), level: '熟练' })) }
    },
  },
  {
    id: 'summary',
    question: '请用一两句话 **简要介绍自己**，作为简历的个人简介\n\n💡 输入 **"自动生成"**，AI 将根据你的经历智能生成一段专业的个人总结',
    field: 'summary',
    parse: (text) => ({ summary: text }),
  },
]

export default function Agent() {
  const [searchParams] = useSearchParams()
  const resumeId = searchParams.get('resumeId')
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [collectedData, setCollectedData] = useState({})
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [aiProcessing, setAiProcessing] = useState(false)
  const [quota, setQuota] = useState(null)
  const messagesEndRef = useRef(null)
  const collectedDataRef = useRef(collectedData)
  collectedDataRef.current = collectedData
  const initedRef = useRef(false)

  useEffect(() => {
    aiAPI.getQuota().then(({ data }) => setQuota(data.quota)).catch(() => {})
  }, [])

  useEffect(() => {
    if (initedRef.current) return
    initedRef.current = true
    setTimeout(() => {
      addBotMessage(STEPS[0].question)
    }, 500)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addBotMessage = (text) => {
    setIsTyping(true)
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text, time: new Date() }])
      setIsTyping(false)
    }, 600 + Math.random() * 400)
  }

  const addBotMessageDirect = (text) => {
    setMessages(prev => [...prev, { role: 'bot', text, time: new Date() }])
  }

  // AI-powered: enhance work/project description
  const enhanceDescription = async (rawText, contextType) => {
    try {
      const data = collectedDataRef.current
      let context = ''
      if (contextType === 'work' && data.work?.items?.[0]) {
        const w = data.work.items[0]
        context = `公司：${w.company}，职位：${w.position}，时间：${w.startDate}-${w.endDate}`
      } else if (contextType === 'project' && data.project?.items?.[0]) {
        const p = data.project.items[0]
        context = `项目：${p.name}，角色：${p.role}，时间：${p.startDate}-${p.endDate}`
      }
      if (data.personal?.title) context += `，求职意向：${data.personal.title}`

      const { data: result } = await aiAPI.enhanceDescription(rawText, context)
      return result.enhanced || rawText
    } catch (err) {
      logger.error('AI enhance failed:', err)
      return rawText
    }
  }

  // AI-powered: generate summary
  const generateAISummary = async () => {
    try {
      const data = collectedDataRef.current
      const { data: result } = await aiAPI.generateSummary({
        personal: data.personal,
        education: data.education,
        work: data.work,
        project: data.project,
        skill: data.skill,
      })
      return result.summary || fallbackSummary(data)
    } catch (err) {
      logger.error('AI summary failed:', err)
      return fallbackSummary(collectedDataRef.current)
    }
  }

  const fallbackSummary = (data) => {
    const title = data.personal?.title || '技术人员'
    const exp = data.personal?.experience || ''
    const skills = data.skill?.items?.map(i => i.name).filter(Boolean).slice(0, 5).join('、') || '多项技术'
    return `${exp ? exp + '经验的' : ''}${title}，熟练掌握${skills}，具备丰富的项目实战经验，注重代码质量与团队协作。`
  }

  const handleSend = async () => {
    if (!input.trim() || isTyping || aiProcessing) return
    const text = input.trim()
    setInput('')

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text, time: new Date() }])

    // Parse response
    const step = STEPS[currentStep]
    if (!step) return

    const parsed = step.parse(text)

    // Handle AI-enhanced fields
    if (step.field === 'work_desc') {
      setAiProcessing(true)
      setIsTyping(true)
      addBotMessageDirect('✨ AI 正在润色你的工作描述...')

      const enhanced = await enhanceDescription(parsed.description, 'work')

      setCollectedData(prev => {
        const updated = { ...prev }
        if (updated.work?.items?.[0]) {
          updated.work.items[0].description = enhanced
        }
        return updated
      })

      setAiProcessing(false)
      setIsTyping(false)

      // Show enhanced result
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      if (nextStep < STEPS.length) {
        addBotMessage(`✅ 已用 AI 润色你的工作描述：\n\n${enhanced}\n\n---\n\n${STEPS[nextStep].question}`)
      }
      return
    }

    if (step.field === 'project_desc') {
      setAiProcessing(true)
      setIsTyping(true)
      addBotMessageDirect('✨ AI 正在润色你的项目描述...')

      const enhanced = await enhanceDescription(parsed.description, 'project')

      setCollectedData(prev => {
        const updated = { ...prev }
        if (updated.project?.items?.[0]) {
          updated.project.items[0].description = enhanced
        }
        return updated
      })

      setAiProcessing(false)
      setIsTyping(false)

      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      if (nextStep < STEPS.length) {
        addBotMessage(`✅ 已用 AI 润色你的项目描述：\n\n${enhanced}\n\n---\n\n${STEPS[nextStep].question}`)
      }
      return
    }

    if (step.field === 'summary') {
      if (text === '自动生成' || text === '自动' || text.includes('自动生成')) {
        setAiProcessing(true)
        setIsTyping(true)
        addBotMessageDirect('✨ AI 正在根据你的经历生成个人总结...')

        const summary = await generateAISummary()

        setCollectedData(prev => ({
          ...prev,
          personal: { ...(prev.personal || {}), summary },
        }))

        setAiProcessing(false)
        setIsTyping(false)

        const nextStep = currentStep + 1
        setCurrentStep(nextStep)
        addBotMessage(`✅ AI 生成的个人总结：\n\n${summary}\n\n---\n\n🎉 太棒了！所有信息已收集完成！\n\n我正在帮你生成简历...`)
        setTimeout(() => saveResume(), 1500)
        return
      } else {
        // User provided their own summary
        setCollectedData(prev => ({
          ...prev,
          personal: { ...(prev.personal || {}), summary: parsed.summary },
        }))
      }
    } else {
      // Standard field merge
      setCollectedData(prev => {
        const updated = { ...prev }
        if (step.field === 'personal') {
          updated.personal = { ...(updated.personal || {}), ...parsed }
        } else {
          updated[step.field] = parsed
        }
        return updated
      })
    }

    // Move to next step
    const nextStep = currentStep + 1
    if (nextStep < STEPS.length) {
      setCurrentStep(nextStep)
      setTimeout(() => {
        addBotMessage(`✅ 收到！\n\n${STEPS[nextStep].question}`)
      }, 300)
    } else {
      // All done
      setCurrentStep(nextStep)
      setTimeout(() => {
        addBotMessage('🎉 太棒了！所有信息已收集完成！\n\n我正在帮你生成简历...')
        setTimeout(() => saveResume(), 1500)
      }, 300)
    }
  }

  const [createdResumeId, setCreatedResumeId] = useState(null)

  const saveResume = async () => {
    try {
      const targetId = resumeId
      const summaryData = collectedData.personal?.summary
        ? { summary: collectedData.personal.summary }
        : null

      // Remove summary from personal data (it goes in a separate section)
      const personalClean = { ...collectedData.personal }
      delete personalClean.summary

      if (targetId) {
        // Update existing resume sections
        const { data: resumeData } = await resumeAPI.get(targetId)
        const existingSections = resumeData.resume.sections || []

        const sectionMap = {
          personal: personalClean,
          education: collectedData.education,
          work: collectedData.work,
          project: collectedData.project,
          skill: collectedData.skill,
          summary: summaryData,
        }

        for (const section of existingSections) {
          if (sectionMap[section.type]) {
            await sectionAPI.update(section.id, { data: JSON.stringify(sectionMap[section.type]) })
          }
        }

        // Create summary section if it doesn't exist
        if (summaryData && !existingSections.find(s => s.type === 'summary')) {
          await sectionAPI.create({
            resumeId: targetId,
            type: 'summary',
            order: existingSections.length,
            data: summaryData,
          })
        }

        setCreatedResumeId(targetId)
        setIsComplete(true)
        addBotMessage(`✨ 简历已更新完成！\n\n点击下方按钮前往编辑器查看和微调你的简历。`)
      } else {
        // Create new resume
        const { data } = await resumeAPI.create({
          title: `${personalClean.name || ''}的简历`,
        })
        const newId = data.resume.id

        // Create all sections
        const sectionDefs = [
          { type: 'personal', data: personalClean },
          { type: 'education', data: collectedData.education },
          { type: 'work', data: collectedData.work },
          { type: 'project', data: collectedData.project },
          { type: 'skill', data: collectedData.skill },
          { type: 'summary', data: summaryData },
        ]

        for (let i = 0; i < sectionDefs.length; i++) {
          const { type, data: sData } = sectionDefs[i]
          if (sData) {
            await sectionAPI.create({
              resumeId: newId,
              type,
              order: i,
              data: sData,
            })
          }
        }

        setCreatedResumeId(newId)
        setIsComplete(true)
        addBotMessage(`✨ 简历创建完成！\n\n点击下方按钮前往编辑器查看和微调你的简历。`)
      }
    } catch (err) {
      logger.error('Save resume error:', err)
      addBotMessage('❌ 保存失败，请重试。')
    }
  }

  const goToEditor = () => {
    const id = createdResumeId || resumeId
    if (id) {
      navigate(`/dashboard/editor/${id}`)
    } else {
      navigate('/dashboard/resumes')
    }
  }

  const progress = Math.round((currentStep / STEPS.length) * 100)

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">AI 简历助手</h1>
            <p className="text-xs text-gray-400">对话式创建专业简历</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Quota */}
          {quota !== null && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
              quota > 500 ? 'bg-emerald-50 text-emerald-600' :
              quota > 100 ? 'bg-amber-50 text-amber-600' :
              'bg-red-50 text-red-600'
            }`}>
              <Zap className="w-3 h-3" />
              额度 {quota}
            </div>
          )}
          {/* Progress */}
          <div className="flex items-center space-x-2">
            <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 font-medium">{progress}%</span>
          </div>
          <button
            onClick={() => navigate('/dashboard/resumes')}
            className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            退出
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-500'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-4 h-4 text-white" />
                    : <MessageCircle className="w-4 h-4 text-white" />
                  }
                </div>
                {/* Bubble */}
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
                }`}>
                  {msg.text.split('**').map((part, j) =>
                    j % 2 === 1
                      ? <strong key={j} className={msg.role === 'user' ? 'text-white' : 'text-gray-900'}>{part}</strong>
                      : <span key={j}>{part}</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing / AI processing indicator */}
          {(isTyping || aiProcessing) && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  aiProcessing
                    ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                }`}>
                  {aiProcessing
                    ? <Sparkles className="w-4 h-4 text-white animate-pulse" />
                    : <MessageCircle className="w-4 h-4 text-white" />
                  }
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                  {aiProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-gray-500">AI 处理中...</span>
                    </div>
                  ) : (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Complete action */}
          {isComplete && (
            <div className="flex justify-center pt-4">
              <button
                onClick={goToEditor}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition shadow-lg shadow-blue-200 text-sm font-semibold"
              >
                <FileText className="w-4 h-4" />
                <span>前往编辑器</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      {!isComplete && (
        <div className="border-t border-gray-200 bg-white px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  rows={1}
                  placeholder="输入你的回答..."
                  className="w-full resize-none px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm placeholder:text-gray-400 transition"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping || aiProcessing}
                className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              按 Enter 发送 · Shift + Enter 换行 · 步骤 {Math.min(currentStep + 1, STEPS.length)}/{STEPS.length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
