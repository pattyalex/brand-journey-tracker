import React from "react";
import { useNavigate } from "react-router-dom";
import { Target, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Priority } from "./types";

interface TopPrioritiesWidgetProps {
  priorities: Priority[];
  editingPriorityId: number | null;
  setEditingPriorityId: (id: number | null) => void;
  handleUpdatePriority: (id: number, text: string) => void;
  handleTogglePriority: (id: number) => void;
  showCelebration: boolean;
  setShowCelebration: (show: boolean) => void;
}

const TopPrioritiesWidget: React.FC<TopPrioritiesWidgetProps> = ({
  priorities,
  editingPriorityId,
  setEditingPriorityId,
  handleUpdatePriority,
  handleTogglePriority,
  showCelebration,
  setShowCelebration,
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative h-full">
      <section className="bg-white/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-[#e0d5db] h-full">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <Target className="w-5 h-5 text-[#612a4f]" />
          <h3
            className="text-base text-[#2d2a26]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Top 3 Priorities
          </h3>
        </div>

        {/* Priority Items */}
        <div className="space-y-0">
          {priorities.map((priority) => {
            return (
              <div
                key={priority.id}
                className="flex items-baseline gap-3 py-2.5"
              >
                {/* Priority Number */}
                <span
                  className="flex-shrink-0 text-xl text-[#612a4f]"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                >
                  {priority.id}.
                </span>

                {/* Priority Text */}
                <div className="flex-1 min-w-0">
                  {editingPriorityId === priority.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={priority.text}
                      onChange={(e) => handleUpdatePriority(priority.id, e.target.value)}
                      onBlur={() => setEditingPriorityId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setEditingPriorityId(null);
                        } else if (e.key === 'Escape') {
                          setEditingPriorityId(null);
                        }
                      }}
                      placeholder={`Priority ${priority.id}...`}
                      className="w-full bg-white border border-gray-200 focus:border-[#612a4f] focus:ring-1 focus:ring-[#612a4f]/20 rounded-lg px-3 py-1 text-[14px] text-[#2d2a26] placeholder:text-gray-400 outline-none transition-all"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                  ) : (
                    <div
                      onClick={() => setEditingPriorityId(priority.id)}
                      className={`cursor-pointer text-[14px] min-h-[24px] flex items-center ${
                        priority.isCompleted
                          ? 'line-through text-gray-400'
                          : priority.text
                            ? 'text-[#2d2a26] font-semibold'
                            : 'text-gray-400 font-semibold'
                      }`}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {priority.text || `Click to set priority ${priority.id}...`}
                    </div>
                  )}
                </div>

                {/* Checkbox */}
                <button
                  onClick={() => handleTogglePriority(priority.id)}
                  className="w-[18px] h-[18px] rounded-md flex items-center justify-center transition-all flex-shrink-0"
                  style={{
                    background: priority.isCompleted
                      ? 'linear-gradient(145deg, #8aae8a 0%, #6a9a6a 100%)'
                      : 'transparent',
                    border: priority.isCompleted
                      ? 'none'
                      : '1.5px solid rgba(139, 115, 130, 0.15)',
                    boxShadow: priority.isCompleted
                      ? '0 2px 6px rgba(106, 154, 106, 0.25)'
                      : 'none',
                  }}
                >
                  {priority.isCompleted && (
                    <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4.5Q2 6 3.5 7Q5.5 4 9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Plan Your Day Link */}
        <div className="border-t border-[#8B7082]/10 mt-4 pt-6">
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/task-board')}
              className="px-2 py-0.5 text-[11px] font-medium text-[#612a4f] bg-[#612a4f]/10 hover:bg-[#612a4f]/15 rounded transition-colors flex items-center gap-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <CalendarDays className="w-3 h-3" /> Plan Your Day
            </button>
          </div>
        </div>
      </section>

      {/* Celebration popup */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-20 left-4 right-4 md:absolute md:bottom-auto md:left-full md:right-auto md:top-[100px] md:ml-4 z-50 md:z-10"
          >
            <div
              className="relative overflow-hidden rounded-xl shadow-lg w-full md:w-[380px]"
              style={{
                background: 'linear-gradient(135deg, #612a4f 0%, #4a1f3d 100%)',
                boxShadow: '0 10px 40px rgba(97, 42, 79, 0.3)',
              }}
            >
              <div className="px-5 py-4 flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}
                >
                  <span className="text-xl">🎉</span>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-white font-semibold text-[15px]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Amazing Work! 🔥
                  </h3>
                  <p
                    className="text-white/80 text-[12px]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    You crushed all your priorities today! 💪
                  </p>
                </div>
                <button
                  onClick={() => setShowCelebration(false)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              <motion.div
                className="absolute bottom-0 left-0 h-[2px] bg-white/40"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopPrioritiesWidget;
