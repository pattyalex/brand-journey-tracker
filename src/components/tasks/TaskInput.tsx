import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { parseTaskInput, formatTimeShort } from '@/lib/taskParser';
import { getTagColor } from '@/types/tasks';

interface TaskInputProps {
  onAdd: (title: string, time: string | null, end_time: string | null, duration: string | null, tag: string | null) => void;
  autoFocus?: boolean;
  placeholder?: string;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAdd, autoFocus = false, placeholder }) => {
  const [active, setActive] = useState(autoFocus);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active && inputRef.current) inputRef.current.focus();
  }, [active]);

  const parsed = value.trim() ? parseTaskInput(value) : null;

  const handleSubmit = () => {
    if (!value.trim()) return;
    const p = parseTaskInput(value);
    if (p.title) {
      onAdd(p.title, p.time, p.end_time, p.duration, p.tag);
      setValue('');
      // Keep input focused for next task
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setValue('');
      setActive(false);
    }
  };

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="flex items-center gap-2 py-2 px-2 -mx-2 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-[#f9f7f5] transition-colors duration-150 w-full"
      >
        <Plus className="w-4 h-4" />
        <span className="text-[14px]">Add task</span>
      </button>
    );
  }

  return (
    <div className="py-1.5 px-2 -mx-2 rounded-lg bg-[#f9f7f5]">
      <div className="flex items-center gap-2">
        <Plus className="w-4 h-4 text-gray-300 flex-shrink-0" />
        <input
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (!value.trim()) setActive(false); }}
          placeholder={placeholder || 'Type a task... (try "9am meeting #work 1h")'}
          className="flex-1 bg-transparent border-none outline-none text-[14px] text-gray-800 placeholder:text-gray-300"
        />
      </div>
      {/* Parsed chips preview */}
      <AnimatePresence>
        {parsed && (parsed.time || parsed.tag || parsed.duration) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 mt-1.5 ml-6"
          >
            {parsed.time && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200/60 text-gray-500 font-medium">
                {formatTimeShort(parsed.time)}{parsed.end_time ? `–${formatTimeShort(parsed.end_time)}` : ''}
              </span>
            )}
            {parsed.tag && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded inline-flex items-center gap-1"
                style={{
                  backgroundColor: getTagColor(parsed.tag).bg,
                  color: getTagColor(parsed.tag).text,
                }}
              >
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: getTagColor(parsed.tag).dot }} />
                {parsed.tag}
              </span>
            )}
            {parsed.duration && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200/60 text-gray-500 font-medium">
                {parsed.duration}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskInput;
