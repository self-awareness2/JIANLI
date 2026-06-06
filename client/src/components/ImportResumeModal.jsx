import { useState, useRef } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { importAPI } from '../services/api.js'
import toast from 'react-hot-toast'

const ACCEPTED = '.pdf,.doc,.docx'
const MAX_SIZE = 10 * 1024 * 1024

export default function ImportResumeModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [step, setStep] = useState('upload') // upload | preview | done
  const inputRef = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    if (f.size > MAX_SIZE) {
      toast.error('文件大小不能超过 10MB')
      return
    }
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      toast.error('仅支持 PDF 和 Word 文件')
      return
    }
    setFile(f)
    setPreview(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }

  const handlePreview = async () => {
    if (!file) return
    setUploading(true)
    try {
      const { data } = await importAPI.preview(file)
      setPreview(data)
      setStep('preview')
    } catch (err) {
      toast.error(err.response?.data?.error || '解析失败')
    } finally {
      setUploading(false)
    }
  }

  const handleImport = async () => {
    if (!file) return
    setUploading(true)
    try {
      const { data } = await importAPI.import(file)
      toast.success('简历导入成功！')
      setStep('done')
      setTimeout(() => {
        onSuccess?.(data.resume)
        onClose()
      }, 800)
    } catch (err) {
      toast.error(err.response?.data?.error || '导入失败')
    } finally {
      setUploading(false)
    }
  }

  const renderPersonalPreview = (p) => {
    if (!p) return null
    const fields = [
      ['姓名', p.name],
      ['职位', p.title],
      ['手机', p.phone],
      ['邮箱', p.email],
      ['城市', p.location],
    ].filter(([, v]) => v)
    return fields.length ? (
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {fields.map(([k, v]) => (
          <div key={k} className="text-xs">
            <span className="text-gray-400">{k}：</span>
            <span className="text-gray-700">{v}</span>
          </div>
        ))}
      </div>
    ) : <span className="text-xs text-gray-400">未识别到个人信息</span>
  }

  const renderListPreview = (items, fields) => {
    if (!items?.length) return <span className="text-xs text-gray-400">未识别</span>
    return items.map((item, i) => (
      <div key={i} className="text-xs text-gray-600 py-1 border-b border-gray-50 last:border-0">
        {fields.map(([k, f]) => item[f] ? <span key={f} className="mr-3"><span className="text-gray-400">{k}：</span>{item[f]}</span> : null)}
      </div>
    ))
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">导入简历</h2>
            <p className="text-xs text-gray-400 mt-0.5">支持 PDF、Word (.doc/.docx) 格式</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {step === 'upload' && (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragging
                    ? 'border-blue-400 bg-blue-50'
                    : file
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED}
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                {file ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
                    <p className="text-sm font-medium text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB · 点击更换文件</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-600">拖拽文件到此处，或<span className="text-blue-500 font-medium">点击选择</span></p>
                    <p className="text-xs text-gray-400">支持 PDF / Word，最大 10MB</p>
                  </div>
                )}
              </div>

              {/* Loading overlay */}
              {uploading && (
                <div className="mt-5 flex flex-col items-center py-6">
                  <div className="relative w-12 h-12 mb-3">
                    <div className="absolute inset-0 border-2 border-blue-100 rounded-full" />
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-full border-t-transparent animate-spin" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">AI 正在解析简历...</p>
                  <p className="text-xs text-gray-400 mt-1">正在识别简历内容并提取结构化数据，请稍候</p>
                </div>
              )}

              {/* Actions */}
              {!uploading && (
                <div className="flex items-center justify-end gap-3 mt-5">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    取消
                  </button>
                  <button
                    onClick={handlePreview}
                    disabled={!file}
                    className="px-5 py-2 bg-white border border-gray-200 text-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-40"
                  >
                    预览解析
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!file}
                    className="px-5 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition disabled:opacity-40 font-medium shadow-sm"
                  >
                    直接导入
                  </button>
                </div>
              )}
            </>
          )}

          {step === 'preview' && preview && (
            <>
              <div className="space-y-4">
                {/* 提示 */}
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    以下是自动解析的结果，导入后可在编辑器中进一步调整
                  </p>
                </div>

                {/* 个人信息 */}
                <PreviewSection title="基本信息">
                  {renderPersonalPreview(preview.parsed?.personal)}
                </PreviewSection>

                {/* 教育 */}
                <PreviewSection title="教育经历">
                  {renderListPreview(preview.parsed?.education?.items, [
                    ['学校', 'school'], ['专业', 'major'], ['学历', 'degree'],
                  ])}
                </PreviewSection>

                {/* 工作 */}
                <PreviewSection title="工作经历">
                  {renderListPreview(preview.parsed?.work?.items, [
                    ['公司', 'company'], ['职位', 'position'],
                  ])}
                </PreviewSection>

                {/* 项目 */}
                <PreviewSection title="项目经历">
                  {renderListPreview(preview.parsed?.project?.items, [
                    ['项目', 'name'], ['角色', 'role'],
                  ])}
                </PreviewSection>

                {/* 技能 */}
                <PreviewSection title="专业技能">
                  <div className="flex flex-wrap gap-1.5">
                    {preview.parsed?.skill?.items?.filter(s => s.name).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                        {s.name}{s.level ? ` · ${s.level}` : ''}
                      </span>
                    ))}
                    {(!preview.parsed?.skill?.items?.some(s => s.name)) && (
                      <span className="text-xs text-gray-400">未识别</span>
                    )}
                  </div>
                </PreviewSection>

                {/* 原始文本 */}
                {preview.extractedText && (
                  <details className="group">
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                      查看提取的原始文本
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {preview.extractedText}
                    </pre>
                  </details>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-5">
                <button
                  onClick={() => { setStep('upload'); setPreview(null) }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  返回
                </button>
                <button
                  onClick={handleImport}
                  disabled={uploading}
                  className="px-6 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition disabled:opacity-40 font-medium"
                >
                  {uploading ? '导入中...' : '确认导入'}
                </button>
              </div>
            </>
          )}

          {step === 'done' && (
            <div className="py-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900">导入成功！</p>
              <p className="text-sm text-gray-400 mt-1">即将跳转到编辑器...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PreviewSection({ title, children }) {
  return (
    <div className="border border-gray-100 rounded-lg p-3">
      <h4 className="text-xs font-semibold text-gray-500 mb-2">{title}</h4>
      {children}
    </div>
  )
}
