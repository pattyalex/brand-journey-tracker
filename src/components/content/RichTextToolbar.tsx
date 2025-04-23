
import React from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Type
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface RichTextToolbarProps {
  editor: Editor | null;
}

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ editor }) => {
  const [isTextSizeOpen, setIsTextSizeOpen] = React.useState(false);
  
  if (!editor) {
    return null;
  }

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.2 } }
  };

  const ToolbarButton = ({ 
    onClick, 
    icon: Icon, 
    isActive = false, 
    title 
  }: { 
    onClick: () => void, 
    icon: React.ElementType, 
    isActive?: boolean,
    title: string
  }) => (
    <motion.button
      onClick={onClick}
      className={cn(
        "p-1 rounded text-gray-600", 
        isActive ? "bg-gray-100 text-primary" : "hover:bg-gray-100"
      )}
      title={title}
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
    >
      <Icon className="h-3 w-3" />
    </motion.button>
  );

  const Divider = () => <span className="text-gray-300 mx-0.5">|</span>;

  return (
    <motion.div 
      className="flex items-center p-1 border-b border-gray-200 bg-white"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.div
        className="flex items-center space-x-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, staggerChildren: 0.05, delayChildren: 0.1 }}
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          icon={Bold}
          isActive={editor.isActive('bold')}
          title="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          icon={Italic}
          isActive={editor.isActive('italic')}
          title="Italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          icon={Underline}
          isActive={editor.isActive('underline')}
          title="Underline"
        />
        <Divider />

        <Popover open={isTextSizeOpen} onOpenChange={setIsTextSizeOpen}>
          <PopoverTrigger asChild>
            <motion.button 
              className={cn(
                "p-1 rounded text-gray-600",
                editor.isActive('heading') ? "bg-gray-100 text-primary" : "hover:bg-gray-100"
              )}
              title="Heading Size"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Type className="h-3 w-3" />
            </motion.button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1">
            <motion.div 
              className="py-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                className={cn(
                  "w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center",
                  editor.isActive('heading', { level: 1 }) && "bg-gray-100"
                )}
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 1 }).run();
                  setIsTextSizeOpen(false);
                }}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Heading1 className="h-3 w-3 mr-2" /> Large Heading
              </motion.button>
              <motion.button
                className={cn(
                  "w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center",
                  editor.isActive('heading', { level: 2 }) && "bg-gray-100"
                )}
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 2 }).run();
                  setIsTextSizeOpen(false);
                }}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
              >
                <Heading2 className="h-3 w-3 mr-2" /> Medium Heading
              </motion.button>
              <motion.button
                className={cn(
                  "w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center",
                  editor.isActive('heading', { level: 3 }) && "bg-gray-100"
                )}
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 3 }).run();
                  setIsTextSizeOpen(false);
                }}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <Heading3 className="h-3 w-3 mr-2" /> Small Heading
              </motion.button>
              <motion.button
                className={cn(
                  "w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center",
                  editor.isActive('paragraph') && !editor.isActive('heading') && "bg-gray-100"
                )}
                onClick={() => {
                  editor.chain().focus().setParagraph().run();
                  setIsTextSizeOpen(false);
                }}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.15 }}
              >
                <Type className="h-3 w-3 mr-2" /> Normal Text
              </motion.button>
            </motion.div>
          </PopoverContent>
        </Popover>
        
        <Divider />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={List}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icon={ListOrdered}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        />
        <Divider />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          icon={AlignLeft}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          icon={AlignCenter}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          icon={AlignRight}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        />
      </motion.div>
    </motion.div>
  );
};

export default RichTextToolbar;
