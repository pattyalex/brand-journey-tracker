
import React from 'react';
import { Bold, Italic, List, ListOrdered, Heading, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface SimpleTextFormattingToolbarProps {
  onFormat: (formatType: string, formatValue?: string) => void;
}

const SimpleTextFormattingToolbar: React.FC<SimpleTextFormattingToolbarProps> = ({ onFormat }) => {
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
        <button 
          className="p-1 hover:bg-gray-100 rounded text-gray-600" 
          onClick={() => onFormat('heading')}
          title="Heading"
        >
          <Heading className="h-3 w-3" />
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
