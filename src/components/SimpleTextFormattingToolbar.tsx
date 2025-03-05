
import React, { useState } from 'react';
import { Bold, Italic, List, ListOrdered, Underline, AlignLeft, AlignCenter, AlignRight, Palette } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface SimpleTextFormattingToolbarProps {
  onFormat: (formatType: string, formatValue?: string) => void;
}

const SimpleTextFormattingToolbar: React.FC<SimpleTextFormattingToolbarProps> = ({ onFormat }) => {
  const colors = [
    { name: 'Default', value: 'default' },
    { name: 'Red', value: '#e74c3c' },
    { name: 'Blue', value: '#3498db' },
    { name: 'Green', value: '#2ecc71' },
    { name: 'Purple', value: '#9b59b6' },
    { name: 'Orange', value: '#e67e22' },
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
        <Popover>
          <PopoverTrigger asChild>
            <button 
              className="p-1 hover:bg-gray-100 rounded text-gray-600" 
              title="Text Color"
            >
              <Palette className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-32 p-1">
            <div className="grid grid-cols-3 gap-1">
              {colors.map((color) => (
                <button
                  key={color.value}
                  className="w-full p-1 h-6 rounded"
                  style={{ 
                    backgroundColor: color.value === 'default' ? 'transparent' : color.value,
                    border: color.value === 'default' ? '1px solid #e2e8f0' : 'none' 
                  }}
                  onClick={() => onFormat('color', color.value)}
                  title={color.name}
                >
                  {color.value === 'default' && 
                    <span className="text-xs text-gray-600">Default</span>
                  }
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
