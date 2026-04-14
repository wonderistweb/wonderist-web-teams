"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect, useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = "180px" }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: {},
        orderedList: {},
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `tiptap-content prose prose-sm max-w-none focus:outline-none px-3 py-2.5 text-[#1a1a1a] text-sm leading-relaxed`,
        style: `min-height: ${minHeight};`,
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
      },
    },
    immediatelyRender: false,
  });

  // Sync external value changes (e.g. when modal opens with new content)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="border border-[#e5e0db] rounded-lg bg-[#f7f5f2] animate-pulse" style={{ minHeight }} />
    );
  }

  return (
    <div className="border border-[#e5e0db] rounded-lg bg-white focus-within:border-[#226666] focus-within:ring-2 focus-within:ring-[#226666]/10 transition-all overflow-hidden">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  const btn = (active: boolean) =>
    `w-7 h-7 flex items-center justify-center rounded text-[#1a1a1a]/60 hover:text-[#226666] hover:bg-[#f0ece8] transition-colors text-sm ${
      active ? "bg-[#226666]/10 text-[#226666]" : ""
    }`;

  const setLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setShowLinkInput(false);
      return;
    }
    let url = linkUrl.trim();
    if (!/^https?:\/\//i.test(url) && !url.startsWith("mailto:")) {
      url = `https://${url}`;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setLinkUrl("");
    setShowLinkInput(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-[#e5e0db] bg-[#f7f5f2]/60">
      <button type="button" title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>
        <span className="font-bold">H2</span>
      </button>
      <button type="button" title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}>
        <span className="font-bold text-xs">H3</span>
      </button>
      <button type="button" title="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()} className={btn(editor.isActive("paragraph"))}>
        <span className="text-xs">¶</span>
      </button>

      <div className="w-px h-5 bg-[#e5e0db] mx-1" />

      <button type="button" title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}>
        <span className="font-bold">B</span>
      </button>
      <button type="button" title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}>
        <span className="italic">I</span>
      </button>
      <button type="button" title="Strike" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive("strike"))}>
        <span className="line-through">S</span>
      </button>

      <div className="w-px h-5 bg-[#e5e0db] mx-1" />

      <button type="button" title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="5" cy="6" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="5" cy="18" r="1.2" fill="currentColor" stroke="none" />
          <line x1="10" y1="6" x2="20" y2="6" />
          <line x1="10" y1="12" x2="20" y2="12" />
          <line x1="10" y1="18" x2="20" y2="18" />
        </svg>
      </button>
      <button type="button" title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <text x="2" y="8" fontSize="6" fill="currentColor" stroke="none">1.</text>
          <text x="2" y="14" fontSize="6" fill="currentColor" stroke="none">2.</text>
          <text x="2" y="20" fontSize="6" fill="currentColor" stroke="none">3.</text>
          <line x1="9" y1="6" x2="20" y2="6" />
          <line x1="9" y1="12" x2="20" y2="12" />
          <line x1="9" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      <div className="w-px h-5 bg-[#e5e0db] mx-1" />

      <button
        type="button"
        title="Link"
        onClick={() => {
          const existing = editor.getAttributes("link").href || "";
          setLinkUrl(existing);
          setShowLinkInput(!showLinkInput);
        }}
        className={btn(editor.isActive("link"))}
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
      </button>

      {editor.isActive("link") && (
        <button
          type="button"
          title="Remove link"
          onClick={() => editor.chain().focus().unsetLink().run()}
          className={btn(false)}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="w-px h-5 bg-[#e5e0db] mx-1" />

      <button type="button" title="Undo" onClick={() => editor.chain().focus().undo().run()} className={btn(false)}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 00-15-6.7L3 13" />
        </svg>
      </button>
      <button type="button" title="Redo" onClick={() => editor.chain().focus().redo().run()} className={btn(false)}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 7v6h-6" />
          <path d="M3 17a9 9 0 0115-6.7L21 13" />
        </svg>
      </button>

      {showLinkInput && (
        <div className="w-full flex items-center gap-1 mt-1 pt-1 border-t border-[#e5e0db]">
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); setLink(); }
              if (e.key === "Escape") setShowLinkInput(false);
            }}
            placeholder="https://example.com"
            className="flex-1 bg-white border border-[#e5e0db] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#226666]"
            autoFocus
          />
          <button
            type="button"
            onClick={setLink}
            className="px-2 py-1 text-xs bg-[#226666] hover:bg-[#1a5252] text-white rounded font-semibold"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="px-2 py-1 text-xs text-[#1a1a1a]/50 hover:bg-[#f0ece8] rounded"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
