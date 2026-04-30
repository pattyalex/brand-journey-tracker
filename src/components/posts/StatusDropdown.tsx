import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { PostStatus, POST_STATUSES, STATUS_COLORS } from '@/types/posts';

interface StatusDropdownProps {
  value: PostStatus;
  onChange: (val: PostStatus) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [recentChange, setRecentChange] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleChange = (status: PostStatus) => {
    onChange(status);
    setOpen(false);
    setRecentChange(true);
    setTimeout(() => setRecentChange(false), 600);
  };

  const colors = STATUS_COLORS[value];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
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

      {open && (
        <div className="absolute top-full left-0 mt-1 z-[60] bg-white rounded-lg border border-gray-200 shadow-lg py-1 min-w-[160px]">
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
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
