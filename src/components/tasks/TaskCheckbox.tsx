import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface TaskCheckboxProps {
  checked: boolean;
  onChange: () => void;
  size?: 'sm' | 'md';
}

const TaskCheckbox: React.FC<TaskCheckboxProps> = ({ checked, onChange, size = 'md' }) => {
  const px = size === 'sm' ? 14 : 16;
  const mobilePx = size === 'sm' ? 20 : 24;

  return (
    <button
      onClick={e => { e.stopPropagation(); onChange(); }}
      className="flex-shrink-0 flex items-center justify-center focus:outline-none"
      style={{ width: px, height: px }}
    >
      <motion.div
        animate={checked ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="rounded flex items-center justify-center transition-colors duration-200"
        style={{
          width: px,
          height: px,
          borderRadius: 4,
          border: checked ? 'none' : '1.5px solid #8B7082',
          backgroundColor: checked ? '#612A4F' : 'transparent',
        }}
      >
        {checked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            <Check className="text-white" style={{ width: px * 0.65, height: px * 0.65 }} strokeWidth={3} />
          </motion.div>
        )}
      </motion.div>
    </button>
  );
};

export default TaskCheckbox;
