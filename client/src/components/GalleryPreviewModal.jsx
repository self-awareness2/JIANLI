import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Download, Loader2 } from 'lucide-react'
import ResumePreview from './ResumePreview.jsx'
import { galleryAPI } from '../services/api.js'
import { logger } from '../utils/logger.js'

export default function GalleryPreviewModal({ templateId, onClose, onUse }) {
  const [template, setTemplate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scale, setScale] = useState(0.6)
  const containerRef = useRef(null)

  useEffect(() => {
    loadTemplate()
  }, [templateId])

  const calcScale = useCallback(() => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.clientWidth - 48 // padding
    const a4Width = 794 // 210mm ≈ 794px
    const s = Math.min(containerWidth / a4Width, 0.85)
    setScale(s)
  }, [])

  useEffect(() => {
    calcScale()
    window.addEventListener('resize', calcScale)
    return () => window.removeEventListener('resize', calcScale)
  }, [calcScale, loading])

  const loadTemplate = async () => {
    try {
      setLoading(true)
      const { data } = await galleryAPI.get(templateId)
      setTemplate(data.template)
    } catch (err) {
      logger.error('Load template error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Build a fake resume object for ResumePreview
  const fakeResume = template ? {
    id: template.id,
    template: template.template,
    themeColor: template.themeColor,
    fontSize: 14,
    fontFamily: 'default',
    lineHeight: 1.5,
    margin: 15,
    sections: template.sections.map((s, i) => ({
      id: `preview-${i}`,
      type: s.type,
      order: s.order,
      data: JSON.stringify(s.data),
    })),
  } : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-[92vw] max-w-[780px] h-[90vh] flex flex-col overflow-hidden animate-chat-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="min-w-0 flex-1 mr-3">
            <h2 className="text-sm font-bold text-gray-800 truncate">{template?.title || '加载中...'}</h2>
            {template && <p className="text-xs text-gray-400 mt-0.5 truncate">{template.category} · {template.description}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onUse}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              使用此模板
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Preview content - scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6" ref={containerRef}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : fakeResume ? (
            <div className="flex justify-center">
              <div
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center',
                  marginBottom: `-${(1 - scale) * 1123}px`, // compensate for scale shrink (A4 height ~1123px)
                }}
              >
                <div className="shadow-2xl rounded-lg overflow-hidden">
                  <ResumePreview
                    resume={fakeResume}
                    sections={fakeResume.sections}
                    activeSection={null}
                    onClickSection={() => {}}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center">模板加载失败</p>
          )}
        </div>
      </div>
    </div>
  )
}
