import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, PenLine, PersonStanding, Camera, Laptop, CalendarDays, CheckCircle2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PostStatus, POST_STATUSES, STATUS_COLORS } from '@/types/posts';

const STATUS_ICON_MAP: Record<PostStatus, React.FC<{ className?: string }>> = {
  Idea: Lightbulb,
  Scripted: PenLine,
  'Ready to shoot': PersonStanding,
  Shot: Camera,
  Edited: Laptop,
  Scheduled: CalendarDays,
  Posted: CheckCircle2,
};

export const StatusIcon: React.FC<{ status: PostStatus; className?: string; style?: React.CSSProperties; scale?: number }> = ({ status, className = 'w-3.5 h-3.5', style, scale }) => {
  const Icon = STATUS_ICON_MAP[status];
  const s = scale ?? (status === 'Ready to shoot' ? 1.15 : 1);
  if (s !== 1) {
    return <Icon className={className} style={{ ...style, transform: `scale(${s})` }} />;
  }
  return <Icon className={className} style={style} />;
};

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
            className="flex-shrink-0"
            animate={{ scale: recentChange ? [1, 1.6, 1] : 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <StatusIcon status={value} className="w-3.5 h-3.5" style={{ color: colors.dot }} />
          </motion.div>
          <span className="text-gray-700">{value}</span>
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
              <StatusIcon status={status} className="w-3.5 h-3.5 flex-shrink-0" style={{ color: sc.dot }} />
              {status}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};

export default StatusDropdown;
