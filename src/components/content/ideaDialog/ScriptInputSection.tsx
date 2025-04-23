
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; 
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ScriptInputSectionProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  // Add support for scriptText prop (alias for value)
  scriptText?: string;
  onScriptTextChange?: (value: string) => void;
  // Add support for collapse functionality
  onCollapseChange?: (isOpen: boolean) => void;
}

const ScriptInputSection: React.FC<ScriptInputSectionProps> = ({ 
  value, 
  onChange, 
  className,
  scriptText,
  onScriptTextChange,
  onCollapseChange
}) => {
  // Use scriptText as fallback if value is not provided
  const textValue = scriptText !== undefined ? scriptText : value;
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (onScriptTextChange) {
      onScriptTextChange(newValue);
    }
  };
  
  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapseChange) {
      onCollapseChange(!newCollapsedState); // invert because our naming is different from the consumer
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <Label htmlFor="script">Script</Label>
        {onCollapseChange && (
          <button 
            type="button" 
            onClick={toggleCollapse}
            className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        )}
      </div>
      <Card className="overflow-hidden">
        <Textarea
          id="script"
          placeholder="Write your script or content here..."
          value={textValue}
          onChange={handleTextChange}
          className="min-h-[200px] resize-none border-0 focus-visible:ring-0 p-4"
        />
      </Card>
    </div>
  );
};

export default ScriptInputSection;
