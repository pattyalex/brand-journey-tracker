
import { useEditor, EditorContent } from '@tiptap/react';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Paragraph from '@tiptap/extension-paragraph';
import Document from '@tiptap/extension-document';
import Text from '@tiptap/extension-text';
import TextAlign from '@tiptap/extension-text-align';
import Heading from '@tiptap/extension-heading';
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
      Document,
      Paragraph.configure({
        HTMLAttributes: {
          class: 'my-2',
        },
      }),
      Text,
      Bold,
      Italic,
      Underline,
      BulletList,
      OrderedList,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Heading.configure({
        levels: [1, 2, 3],
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
        class: 'prose focus:outline-none min-h-full p-4',
        spellcheck: 'true',
      },
    },
  });

  const isEditorReady = useMemo(() => !!editor, [editor]);

  return (
    <div className="w-full h-full overflow-auto bg-white">
      {isEditorReady && (
        <EditorContent 
          editor={editor} 
          className="h-full min-h-[calc(100vh-220px)]"
        />
      )}
    </div>
  );
};

export default TipTapEditor;
