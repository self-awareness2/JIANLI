import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { useEffect } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Link as LinkIcon, Undo, Redo
} from 'lucide-react'

export default function RichTextEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '')
    }
  }, [content])

  if (!editor) return null

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden transition-all focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-400 hover:border-gray-300">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-1.5 py-1 border-b border-gray-100 bg-gray-50/80">
        <EditorButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={Bold} title="粗体" />
        <EditorButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={Italic} title="斜体" />
        <EditorButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} icon={UnderlineIcon} title="下划线" />
        <div className="w-px h-4 bg-gray-200 mx-0.5" />
        <EditorButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={List} title="无序列表" />
        <EditorButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} icon={ListOrdered} title="有序列表" />
        <div className="w-px h-4 bg-gray-200 mx-0.5" />
        <EditorButton
          onClick={() => {
            const url = window.prompt('输入链接地址')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}
          active={editor.isActive('link')}
          icon={LinkIcon}
          title="链接"
        />
        <div className="flex-1" />
        <EditorButton onClick={() => editor.chain().focus().undo().run()} icon={Undo} title="撤销" />
        <EditorButton onClick={() => editor.chain().focus().redo().run()} icon={Redo} title="重做" />
      </div>

      {/* Editor Content */}
      <div className="px-3 py-2 min-h-[80px] text-sm bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function EditorButton({ onClick, active, icon: Icon, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-all ${
        active ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  )
}
