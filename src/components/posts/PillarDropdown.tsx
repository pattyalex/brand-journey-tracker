import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getPillarStyle } from '@/types/posts';

interface PillarDropdownProps {
  value: string;
  pillars: string[];
  onChange: (val: string) => void;
  onDelete: (name: string) => void;
}

const PillarDropdown: React.FC<PillarDropdownProps> = ({ value, pillars, onChange, onDelete }) => {
  const [open, setOpen] = useState(false);

  const pillarStyle = value ? getPillarStyle(value) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="text-sm transition-colors duration-150 flex items-center gap-1"
        >
          {value ? (
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: pillarStyle!.bg,
                color: pillarStyle!.text,
                borderColor: pillarStyle!.border,
              }}
            >
              {value}
            </span>
          ) : (
            <span className="text-gray-300 hover:text-gray-400 text-sm">Set pillar</span>
          )}
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 bg-white rounded-lg border border-gray-200 shadow-lg py-1 min-w-[160px] w-[160px] z-[60]" align="start" sideOffset={4} onOpenAutoFocus={e => e.preventDefault()}>
        {pillars.map(p => (
          <button
            key={p}
            onClick={() => { onChange(p); setOpen(false); }}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100"
          >
            {p}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default PillarDropdown;
