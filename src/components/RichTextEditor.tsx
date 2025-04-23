
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import React from "react";
import { Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

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
        class: "min-h-full h-full flex-1 px-4 py-3 focus:outline-none bg-white overflow-y-auto",
        spellCheck: "true",
      },
    },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-2 border border-gray-200 rounded p-1 bg-gray-50">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-2 rounded text-sm ${editor?.isActive('bold') ? "bg-gray-200" : ""}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-2 rounded text-sm ${editor?.isActive('italic') ? "bg-gray-200" : ""}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded text-sm ${editor?.isActive('underline') ? "bg-gray-200" : ""}`}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <span className="mx-1 text-gray-300">|</span>
        <button
          type="button"
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded text-sm ${editor?.isActive({ textAlign: 'left' }) ? "bg-gray-200" : ""}`}
          title="Align left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded text-sm ${editor?.isActive({ textAlign: 'center' }) ? "bg-gray-200" : ""}`}
          title="Align center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded text-sm ${editor?.isActive({ textAlign: 'right' }) ? "bg-gray-200" : ""}`}
          title="Align right"
        >
          <AlignRight className="h-4 w-4" />
        </button>
      </div>
      <EditorContent 
        editor={editor} 
        className="flex-1 h-full overflow-y-auto" 
      />
    </div>
  );
};

export default RichTextEditor;
