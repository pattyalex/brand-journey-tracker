import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface TaskCheckboxProps {
  checked: boolean;
  onChange: () => void;
  size?: 'xs' | 'sm' | 'md';
}

const TaskCheckbox: React.FC<TaskCheckboxProps> = ({ checked, onChange, size = 'md' }) => {
  const px = size === 'xs' ? 12 : size === 'sm' ? 16 : 18;

  return (
    <button
      onClick={e => { e.stopPropagation(); onChange(); }}
      className="flex-shrink-0 flex items-center justify-center focus:outline-none"
      style={{ width: px, height: px }}
    >
      <motion.div
        animate={checked ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex items-center justify-center transition-all duration-200"
        style={{
          width: px,
          height: px,
          borderRadius: '50%',
          border: checked ? '1.5px solid #612A4F' : '1.5px solid #C4B5BD',
          backgroundColor: checked ? '#612A4F' : 'transparent',
        }}
      >
        {checked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            <Check className="text-white" style={{ width: px * 0.55, height: px * 0.55 }} strokeWidth={2.5} />
          </motion.div>
        )}
      </motion.div>
    </button>
  );
};

export default TaskCheckbox;
