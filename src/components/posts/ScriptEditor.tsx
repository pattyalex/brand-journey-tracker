import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
} from 'lucide-react';

interface ScriptEditorProps {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
}

const ToolbarButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, isActive, title, children }) => (
  <button
    type="button"
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    className={`p-1 rounded transition-colors duration-100 ${
      isActive ? 'bg-gray-200 text-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
    }`}
    title={title}
  >
    {children}
  </button>
);

const ScriptEditor: React.FC<ScriptEditorProps> = ({ value, onChange, onBlur }) => {
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Underline,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      onChange(editor.getHTML());
    },
    onBlur: () => {
      onBlur?.();
    },
    editorProps: {
      attributes: {
        class: 'outline-none text-sm text-gray-700 leading-relaxed min-h-[6rem] max-h-[500px] overflow-y-auto px-3 py-2',
        spellCheck: 'true',
      },
    },
  });

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value]);

  if (!editor) return null;

  return (
    <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-gray-100 bg-gray-50/80">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <List className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered list"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default ScriptEditor;
