import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X } from 'lucide-react';

interface TimePickerPopoverProps {
  open: boolean;
  date: string;
  defaultTime?: string;
  onConfirm: (time: string) => void;
  onCancel: () => void;
}

const QUICK_TIMES = ['09:00', '10:00', '12:00', '14:00', '17:00', '19:00'];

const TimePickerPopover: React.FC<TimePickerPopoverProps> = ({ open, date, defaultTime, onConfirm, onCancel }) => {
  const [customTime, setCustomTime] = useState(defaultTime || '10:00');

  // Update custom time when defaultTime changes
  React.useEffect(() => {
    if (defaultTime) setCustomTime(defaultTime);
  }, [defaultTime]);

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[70] bg-black/10"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[75] bg-white rounded-xl shadow-2xl border border-gray-200 w-[260px] p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Set time</p>
                <p className="text-[11px] text-gray-400">{formattedDate}</p>
              </div>
              <button onClick={onCancel} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {QUICK_TIMES.map(t => (
                <button
                  key={t}
                  onClick={() => onConfirm(t)}
                  className="px-2 py-1.5 text-[11px] font-medium text-gray-600 rounded-md border border-gray-150 hover:bg-[#612A4F]/5 hover:border-[#612A4F]/20 hover:text-[#612A4F] transition-colors"
                >
                  {formatTime(t)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <Clock className="w-3 h-3 text-gray-400" />
              <input
                type="time"
                value={customTime}
                onChange={e => setCustomTime(e.target.value)}
                className="flex-1 text-sm text-gray-700 bg-transparent outline-none"
              />
              <button
                onClick={() => onConfirm(customTime)}
                className="px-3 py-1 text-[11px] font-medium text-white bg-[#612A4F] rounded-md hover:bg-[#4B1F3D] transition-colors"
              >
                Set
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TimePickerPopover;
