
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import React from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[200px] border border-gray-300 rounded-md px-4 py-3 focus:outline-none bg-white",
        spellCheck: "true",
      },
    },
  });

  return (
    <div>
      <div className="flex gap-2 mb-2 border border-gray-200 rounded p-1 bg-gray-50">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded text-sm ${editor?.isActive('bold') ? "bg-gray-200 font-bold" : ""}`}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded text-sm ${editor?.isActive('italic') ? "bg-gray-200 italic" : ""}`}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 rounded text-sm ${editor?.isActive('underline') ? "bg-gray-200 underline" : ""}`}
          title="Underline"
        >
          U
        </button>
        <span className="mx-1 text-gray-300">|</span>
        <button
          type="button"
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          className={`px-2 py-1 rounded text-sm ${editor?.isActive({ textAlign: 'left' }) ? "bg-gray-200" : ""}`}
          title="Align left"
        >
          L
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          className={`px-2 py-1 rounded text-sm ${editor?.isActive({ textAlign: 'center' }) ? "bg-gray-200" : ""}`}
          title="Align center"
        >
          C
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          className={`px-2 py-1 rounded text-sm ${editor?.isActive({ textAlign: 'right' }) ? "bg-gray-200" : ""}`}
          title="Align right"
        >
          R
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
