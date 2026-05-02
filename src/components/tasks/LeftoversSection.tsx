import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { Task, getTagColor } from '@/types/tasks';

interface LeftoversSectionProps {
  tasks: Task[];
  onMoveToToday: (taskId: string) => void;
  onDismiss: (taskId: string) => void;
}

const LeftoversSection: React.FC<LeftoversSectionProps> = ({ tasks, onMoveToToday, onDismiss }) => {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
        Yesterday's leftovers
      </p>
      <AnimatePresence initial={false}>
        {tasks.map(task => {
          const tagColor = task.tag ? getTagColor(task.tag) : null;
          return (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg group hover:bg-gray-50/60 transition-colors"
            >
              <span className="text-[14px] text-gray-500 flex-1">{task.title}</span>
              {tagColor && (
                <span
                  className="inline-flex items-center gap-1 text-[11px] px-1.5 py-px rounded-lg"
                  style={{ backgroundColor: tagColor.bg, color: tagColor.text }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tagColor.dot }} />
                  {task.tag}
                </span>
              )}
              <button
                onClick={() => onMoveToToday(task.id)}
                className="flex items-center gap-1 text-[11px] text-[#612A4F] font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
              >
                <ArrowRight className="w-3 h-3" />
                today
              </button>
              <button
                onClick={() => onDismiss(task.id)}
                className="p-0.5 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default LeftoversSection;
