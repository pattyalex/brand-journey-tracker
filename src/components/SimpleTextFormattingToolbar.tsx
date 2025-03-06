
import React, { useState } from 'react';
import { Bold, Italic, List, ListOrdered, Underline, AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  
  return (
    <div className="flex items-center p-1 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-1">
        <button 
          className="p-1 hover:bg-gray-100 rounded text-gray-600" 
          onClick={() => onFormat('bold')}
          title="Bold"
        >
          <Bold className="h-3 w-3" />
        </button>
        <button 
          className="p-1 hover:bg-gray-100 rounded text-gray-600" 
          onClick={() => onFormat('italic')}
          title="Italic"
        >
          <Italic className="h-3 w-3" />
        </button>
        <button 
          className="p-1 hover:bg-gray-100 rounded text-gray-600" 
          onClick={() => onFormat('underline')}
          title="Underline"
        >
          <Underline className="h-3 w-3" />
        </button>
        <span className="text-gray-300 mx-0.5">|</span>
        
        <Popover open={isTextSizeOpen} onOpenChange={setIsTextSizeOpen}>
          <PopoverTrigger asChild>
            <button 
              className="p-1 hover:bg-gray-100 rounded text-gray-600 flex items-center" 
              title="Text Size"
            >
              <Type className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-32 p-0">
            <div className="py-1">
              {textSizes.map(size => (
                <button
                  key={size.value}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                  onClick={() => {
                    onFormat('size', size.value);
                    setIsTextSizeOpen(false);
                  }}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <span className="text-gray-300 mx-0.5">|</span>
        <button 
          className="p-1 hover:bg-gray-100 rounded text-gray-600" 
          onClick={() => onFormat('bullet')}
          title="Bullet List"
        >
          <List className="h-3 w-3" />
        </button>
        <button 
          className="p-1 hover:bg-gray-100 rounded text-gray-600" 
          onClick={() => onFormat('numbered')}
          title="Numbered List"
        >
          <ListOrdered className="h-3 w-3" />
        </button>
        <span className="text-gray-300 mx-0.5">|</span>
        <button 
          className="p-1 hover:bg-gray-100 rounded text-gray-600" 
          onClick={() => onFormat('align', 'left')}
          title="Align Left"
        >
          <AlignLeft className="h-3 w-3" />
        </button>
        <button 
          className="p-1 hover:bg-gray-100 rounded text-gray-600" 
          onClick={() => onFormat('align', 'center')}
          title="Align Center"
        >
          <AlignCenter className="h-3 w-3" />
        </button>
        <button 
          className="p-1 hover:bg-gray-100 rounded text-gray-600" 
          onClick={() => onFormat('align', 'right')}
          title="Align Right"
        >
          <AlignRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

export default SimpleTextFormattingToolbar;
