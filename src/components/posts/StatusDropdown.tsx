import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PostStatus, POST_STATUSES, STATUS_COLORS } from '@/types/posts';

interface StatusDropdownProps {
  value: PostStatus;
  onChange: (val: PostStatus) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [recentChange, setRecentChange] = useState(false);

  const handleChange = (status: PostStatus) => {
    onChange(status);
    setOpen(false);
    setRecentChange(true);
    setTimeout(() => setRecentChange(false), 600);
  };

  const colors = STATUS_COLORS[value];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 text-sm transition-colors duration-150"
        >
          <motion.div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: colors.dot }}
            animate={{ scale: recentChange ? [1, 1.6, 1] : 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
          <span className="font-medium text-gray-700">{value}</span>
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 bg-white rounded-lg border border-gray-200 shadow-lg py-1 min-w-[160px] w-auto z-[60]" align="start" sideOffset={4} onOpenAutoFocus={e => e.preventDefault()}>
        {POST_STATUSES.map(status => {
          const sc = STATUS_COLORS[status];
          return (
            <button
              key={status}
              onClick={() => handleChange(status)}
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100 flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sc.dot }} />
              {status}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};

export default StatusDropdown;
