import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Plus, Trash2, X } from 'lucide-react';
import { Task, getTagColor } from '@/types/tasks';
import { parseTaskInput } from '@/lib/taskParser';
import TaskCheckbox from './TaskCheckbox';

interface ToDoSoonSectionProps {
  tasks: Task[];
  onMoveToToday: (taskId: string) => void;
  onAdd: (title: string, tag: string | null) => void;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onRemoveTag: (taskId: string) => void;
  showCompleted: boolean;
}

const ToDoSoonSection: React.FC<ToDoSoonSectionProps> = ({ tasks, onMoveToToday, onAdd, onToggle, onDelete, onRemoveTag, showCompleted }) => {
  const [adding, setAdding] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus();
  }, [adding]);

  const handleSubmit = () => {
    if (!inputVal.trim()) return;
    const parsed = parseTaskInput(inputVal);
    onAdd(parsed.title, parsed.tag);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
    if (e.key === 'Escape') { setInputVal(''); setAdding(false); }
  };

  const visible = showCompleted ? tasks : tasks.filter(t => !t.completed);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[13px] font-semibold text-gray-600 uppercase tracking-wider">
          To do soon
        </p>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-gray-300 hover:text-gray-600 hover:bg-gray-200 rounded-full p-0.5 transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
      {visible.length === 0 && !adding && (
        <p className="text-[13px] text-gray-300 italic py-4">
          Write down things you need to do but haven't scheduled yet.
        </p>
      )}
      <AnimatePresence initial={false}>
        {visible.map(task => {
          const tagColor = task.tag ? getTagColor(task.tag) : null;
          return (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="py-1.5 px-2 -mx-2 rounded-lg group hover:bg-gray-50/60 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <TaskCheckbox
                  checked={task.completed}
                  onChange={() => onToggle(task.id)}
                  size="md"
                />
                <span className={`text-[14px] flex-1 ${task.completed ? 'text-gray-300 line-through' : 'text-gray-800'} transition-colors duration-200`}>
                  {task.title}
                </span>
                {!task.completed && (
                  <button
                    onClick={() => onMoveToToday(task.id)}
                    className="flex items-center gap-1 text-[11px] text-[#612A4F] font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:underline flex-shrink-0"
                  >
                    <ArrowRight className="w-3 h-3" />
                    today
                  </button>
                )}
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-0.5 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              {tagColor && (
                <div className="ml-[26px] mt-0.5">
                  <span
                    className="inline-flex items-center gap-1 text-[11px] px-1.5 py-px rounded-lg group/tag"
                    style={{ backgroundColor: tagColor.bg, color: tagColor.text }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tagColor.dot }} />
                    {task.tag}
                    <button
                      onClick={e => { e.stopPropagation(); onRemoveTag(task.id); }}
                      className="opacity-0 group-hover/tag:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      {adding && (
        <div className="flex items-center gap-2.5 py-1.5 px-2 -mx-2">
          <Plus className="w-4 h-4 text-gray-300 flex-shrink-0" />
          <input
            ref={inputRef}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (!inputVal.trim()) setAdding(false); }}
            placeholder="Add something to do soon..."
            className="flex-1 bg-transparent border-none outline-none text-[14px] text-gray-800 placeholder:text-gray-300"
          />
        </div>
      )}
    </div>
  );
};

export default ToDoSoonSection;
