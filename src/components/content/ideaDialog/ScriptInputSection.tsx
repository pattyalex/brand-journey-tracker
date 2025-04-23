
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; 
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ScriptInputSectionProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const ScriptInputSection: React.FC<ScriptInputSectionProps> = ({ 
  value, 
  onChange, 
  className 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="script">Script</Label>
      <Card className="overflow-hidden">
        <Textarea
          id="script"
          placeholder="Write your script or content here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[200px] resize-none border-0 focus-visible:ring-0 p-4"
        />
      </Card>
    </div>
  );
};

export default ScriptInputSection;
