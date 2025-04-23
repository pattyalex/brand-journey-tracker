
import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

const TOOLBAR_BUTTON =
  "px-2 py-1 rounded transition-colors duration-100 text-sm mr-1 last:mr-0";
const TOOLBAR_ACTIVE =
  "bg-blue-100 text-blue-800 font-semibold shadow-inner";
const TOOLBAR_INACTIVE =
  "hover:bg-gray-100 text-gray-500";

export default function WritingSpace() {
  // Restore: Section headline/title
  // Restore: Two top action buttons
  // Adjust: Editor area as described

  // WARNING! If this section is ever moved, update any references

  // ---- RESTORED HEADER AND BUTTONS ----
  return (
    <section className="w-full max-w-2xl mx-auto my-8">
      {/* Restored Section Title */}
      <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900">
        Quick Writing Space
      </h2>
      {/* Restored Buttons */}
      <div className="flex items-center mb-4 gap-2">
        <button
          type="button"
          className="px-3 py-1.5 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Save Note
        </button>
        <button
          type="button"
          className="px-3 py-1.5 rounded border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition"
        >
          Clear
        </button>
      </div>
      {/* ---- END RESTORATIONS ---- */}

      {/* ---- SIMPLE, FUNCTIONAL TIPTAP EDITOR ---- */}
      <WritingEditor />
    </section>
  );
}

function WritingEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    editorProps: {
      attributes: {
        class:
          // border, radius, padding, and proper focus ring
          "min-h-[180px] w-full bg-white outline-none border border-[#ccc] rounded-lg p-3 focus:border-blue-400 transition-shadow text-base",
        spellCheck: "true",
        style: "box-shadow: none; resize: none;",
      },
    },
    content: "<p>Start writing here...</p>",
  });

  if (!editor) return null;

  const toolbarButton = (cmd: () => void, active: boolean, label: string, Icon?: React.ElementType) => (
    <button
      type="button"
      className={`${TOOLBAR_BUTTON} ${active ? TOOLBAR_ACTIVE : TOOLBAR_INACTIVE}`}
      onMouseDown={e => {
        e.preventDefault();
        cmd();
      }}
      aria-label={label}
      title={label}
    >
      {Icon ? <Icon size={16} /> : label}
    </button>
  );

  return (
    <div>
      <div className="flex gap-1 pb-2 pl-1">
        {toolbarButton(
          () => editor.chain().focus().toggleBold().run(),
          editor.isActive("bold"),
          "Bold",
          BoldIcon
        )}
        {toolbarButton(
          () => editor.chain().focus().toggleItalic().run(),
          editor.isActive("italic"),
          "Italic",
          ItalicIcon
        )}
        {toolbarButton(
          () => editor.chain().focus().toggleUnderline().run(),
          editor.isActive("underline"),
          "Underline",
          UnderlineIcon
        )}

        <span className="mx-2 text-gray-300">|</span>
        {toolbarButton(
          () => editor.chain().focus().setTextAlign("left").run(),
          editor.isActive({ textAlign: "left" }),
          "Align left",
          AlignLeft
        )}
        {toolbarButton(
          () => editor.chain().focus().setTextAlign("center").run(),
          editor.isActive({ textAlign: "center" }),
          "Align center",
          AlignCenter
        )}
        {toolbarButton(
          () => editor.chain().focus().setTextAlign("right").run(),
          editor.isActive({ textAlign: "right" }),
          "Align right",
          AlignRight
        )}
      </div>
      <div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
