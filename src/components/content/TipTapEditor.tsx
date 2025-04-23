
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useMemo } from 'react';
import './tiptap-styles.css';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  onSelectionChange?: (selectedText: string) => void;
  placeholder?: string;
}

const TipTapEditor = ({ 
  content, 
  onChange, 
  onSelectionChange,
  placeholder = 'Start writing your content ideas here...' 
}: TipTapEditorProps) => {
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content || `<p>${placeholder}</p>`,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      if (onSelectionChange && !editor.isActive('image')) {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        if (selectedText) {
          onSelectionChange(selectedText);
        }
      }
    },
    editorProps: {
      attributes: {
        class: 'prose focus:outline-none min-h-full p-4 border-none outline-none', // Add border-none and outline-none
        spellcheck: 'true',
      },
    },
  });

  const isEditorReady = useMemo(() => !!editor, [editor]);

  return (
    <div className="w-full h-full overflow-auto bg-white border-none outline-none"> {/* Add border-none and outline-none */}
      {isEditorReady && (
        <EditorContent 
          editor={editor} 
          className="h-full min-h-[calc(100vh-220px)] border-none outline-none" // Add border-none and outline-none
        />
      )}
    </div>
  );
};

export default TipTapEditor;
