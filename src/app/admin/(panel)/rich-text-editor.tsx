'use client'

import { useEffect } from 'react'
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import {
  FiBold,
  FiCode,
  FiItalic,
  FiLink,
  FiList,
  FiMinus,
  FiRotateCcw,
  FiRotateCw,
} from 'react-icons/fi'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`rounded-lg px-2 py-1.5 text-sm transition disabled:opacity-40 ${
        active ? 'bg-primary-500 text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  function toggleLink() {
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL del enlace (vacío para quitar)', previous ?? 'https://')

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 px-2 py-1.5">
      <ToolbarButton
        label="Negrita"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <FiBold />
      </ToolbarButton>
      <ToolbarButton
        label="Cursiva"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <FiItalic />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-slate-200" />

      {([2, 3] as const).map((level) => (
        <ToolbarButton
          key={level}
          label={`Título ${level}`}
          active={editor.isActive('heading', { level })}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
        >
          <span className="font-bold">H{level}</span>
        </ToolbarButton>
      ))}

      <span className="mx-1 h-5 w-px bg-slate-200" />

      <ToolbarButton
        label="Lista con viñetas"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <FiList />
      </ToolbarButton>
      <ToolbarButton
        label="Lista numerada"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <span className="font-bold">1.</span>
      </ToolbarButton>
      <ToolbarButton
        label="Cita"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <span className="font-bold">&ldquo;</span>
      </ToolbarButton>
      <ToolbarButton
        label="Código"
        active={editor.isActive('code')}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <FiCode />
      </ToolbarButton>
      <ToolbarButton label="Separador" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <FiMinus />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-slate-200" />

      <ToolbarButton label="Enlace" active={editor.isActive('link')} onClick={toggleLink}>
        <FiLink />
      </ToolbarButton>

      <span className="ml-auto flex gap-0.5">
        <ToolbarButton
          label="Deshacer"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <FiRotateCcw />
        </ToolbarButton>
        <ToolbarButton
          label="Rehacer"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <FiRotateCw />
        </ToolbarButton>
      </span>
    </div>
  )
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = '10rem',
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ['http', 'https', 'mailto'] }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none',
        style: `min-height:${minHeight}`,
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
    },
    onUpdate: ({ editor: instance }) => {
      const html = instance.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
  })

  // Sincroniza cuando el formulario carga otro registro.
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const next = value || '<p></p>'
    if (current !== next) editor.commands.setContent(next, { emitUpdate: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  if (!editor) {
    return <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-400">Cargando editor…</div>
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="px-3.5 py-3 text-sm text-slate-900" />
    </div>
  )
}
