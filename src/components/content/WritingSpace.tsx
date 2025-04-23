
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

const TOOLBAR_BUTTON =
  "px-2 py-1 rounded transition-colors duration-100 text-sm mr-1 last:mr-0";
const TOOLBAR_ACTIVE =
  "bg-gray-100 text-blue-600 font-semibold shadow-inner";
const TOOLBAR_INACTIVE =
  "hover:bg-gray-50 text-gray-500";

export default function WritingSpace() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "<p>Start writing here...</p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm md:prose-base min-h-[250px] w-full bg-white focus:outline-none outline-none border-none shadow-none resize-none p-4 box-border",
        style:
          "border: none; outline: none; box-shadow: none; background: white;",
        spellCheck: "true",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex gap-1 pb-3 px-1">
        <button
          type="button"
          className={`${TOOLBAR_BUTTON} ${
            editor.isActive("bold") ? TOOLBAR_ACTIVE : TOOLBAR_INACTIVE
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
          aria-label="Bold"
        >
          <b>B</b>
        </button>

        <button
          type="button"
          className={`${TOOLBAR_BUTTON} ${
            editor.isActive("italic") ? TOOLBAR_ACTIVE : TOOLBAR_INACTIVE
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
          aria-label="Italic"
        >
          <i>I</i>
        </button>

        <button
          type="button"
          className={`${TOOLBAR_BUTTON} ${
            editor.isActive("underline") ? TOOLBAR_ACTIVE : TOOLBAR_INACTIVE
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleUnderline().run();
          }}
          aria-label="Underline"
        >
          <u>U</u>
        </button>

        <div className="ml-3 flex gap-1">
          <button
            type="button"
            className={`${TOOLBAR_BUTTON} ${
              editor.isActive({ textAlign: "left" })
                ? TOOLBAR_ACTIVE
                : TOOLBAR_INACTIVE
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign("left").run();
            }}
            aria-label="Align left"
          >
            <span style={{ fontWeight: 500 }}>L</span>
          </button>
          <button
            type="button"
            className={`${TOOLBAR_BUTTON} ${
              editor.isActive({ textAlign: "center" })
                ? TOOLBAR_ACTIVE
                : TOOLBAR_INACTIVE
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign("center").run();
            }}
            aria-label="Align center"
          >
            <span style={{ fontWeight: 500 }}>C</span>
          </button>
          <button
            type="button"
            className={`${TOOLBAR_BUTTON} ${
              editor.isActive({ textAlign: "right" })
                ? TOOLBAR_ACTIVE
                : TOOLBAR_INACTIVE
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign("right").run();
            }}
            aria-label="Align right"
          >
            <span style={{ fontWeight: 500 }}>R</span>
          </button>
        </div>
      </div>
      <div className="rounded-lg w-full bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
