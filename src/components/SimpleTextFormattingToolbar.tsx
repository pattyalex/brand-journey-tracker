
import React, { useState } from 'react';
import { Bold, Italic, List, ListOrdered, Underline, AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";

interface SimpleTextFormattingToolbarProps {
  onFormat: (formatType: string, formatValue?: string) => void;
}

const SimpleTextFormattingToolbar: React.FC<SimpleTextFormattingToolbarProps> = ({ onFormat }) => {
  const [isTextSizeOpen, setIsTextSizeOpen] = useState(false);
  
  const textSizes = [
    { label: 'Small', value: 'small' },
    { label: 'Normal', value: 'normal' },
    { label: 'Large', value: 'large' },
    { label: 'Extra Large', value: 'x-large' },
  ];

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.2 } }
  };
  
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
        <motion.button 
          className="p-1 hover:bg-gray-100 rounded text-gray-600" 
          onClick={() => onFormat('bold')}
          title="Bold"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Bold className="h-3 w-3" />
        </motion.button>
        <motion.button 
          className="p-1 hover:bg-gray-100 rounded text-gray-600" 
          onClick={() => onFormat('italic')}
          title="Italic"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Italic className="h-3 w-3" />
        </motion.button>
        <motion.button 
          className="p-1 hover:bg-gray-100 rounded text-gray-600" 
          onClick={() => onFormat('underline')}
          title="Underline"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Underline className="h-3 w-3" />
        </motion.button>
        <span className="text-gray-300 mx-0.5">|</span>
        
        <Popover open={isTextSizeOpen} onOpenChange={setIsTextSizeOpen}>
          <PopoverTrigger asChild>
            <motion.button 
              className="p-1 hover:bg-gray-100 rounded text-gray-600 flex items-center" 
              title="Text Size"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Type className="h-3 w-3" />
            </motion.button>
          </PopoverTrigger>
          <PopoverContent className="w-32 p-0">
            <motion.div 
              className="py-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {textSizes.map((size, index) => (
                <motion.button
                  key={size.value}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                  onClick={() => {
                    onFormat('size', size.value);
                    setIsTextSizeOpen(false);
                  }}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  {size.label}
                </motion.button>
              ))}
            </motion.div>
          </PopoverContent>
        </Popover>
        
        <span className="text-gray-300 mx-0.5">|</span>
        <motion.button 
          className="p-1 hover:bg-gray-100 rounded text-gray-600" 
          onClick={() => onFormat('bullet')}
          title="Bullet List"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <List className="h-3 w-3" />
        </motion.button>
        <motion.button 
          className="p-1 hover:bg-gray-100 rounded text-gray-600" 
          onClick={() => onFormat('numbered')}
          title="Numbered List"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <ListOrdered className="h-3 w-3" />
        </motion.button>
        <span className="text-gray-300 mx-0.5">|</span>
        <motion.button 
          className="p-1 hover:bg-gray-100 rounded text-gray-600" 
          onClick={() => onFormat('align', 'left')}
          title="Align Left"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <AlignLeft className="h-3 w-3" />
        </motion.button>
        <motion.button 
          className="p-1 hover:bg-gray-100 rounded text-gray-600" 
          onClick={() => onFormat('align', 'center')}
          title="Align Center"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <AlignCenter className="h-3 w-3" />
        </motion.button>
        <motion.button 
          className="p-1 hover:bg-gray-100 rounded text-gray-600" 
          onClick={() => onFormat('align', 'right')}
          title="Align Right"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <AlignRight className="h-3 w-3" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default SimpleTextFormattingToolbar;
