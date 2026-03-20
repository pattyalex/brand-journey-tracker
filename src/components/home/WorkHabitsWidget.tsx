import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Habit, getDateString } from "./types";

interface WorkHabitsWidgetProps {
  habits: Habit[];
  habitWeekOffset: number;
  isAddingHabit: boolean;
  setIsAddingHabit: (v: boolean) => void;
  newHabitName: string;
  setNewHabitName: (v: string) => void;
  editingHabitId: string | null;
  editingHabitName: string;
  setEditingHabitName: (v: string) => void;
  editingGoalHabitId: string | null;
  truncatedHabitHover: string | null;
  setTruncatedHabitHover: (v: string | null) => void;
  editingGoalTarget: string;
  setEditingGoalTarget: (v: string) => void;
  newHabitGoalTarget: string;
  setNewHabitGoalTarget: (v: string) => void;
  habitsScrollRef: React.RefObject<HTMLDivElement>;
  getWeekDays: (offset?: number) => Date[];
  getWeeklyCompletions: (habit: Habit, weekOffset?: number) => number;
  isHabitBehindPace: (habit: Habit, completed: number, weekOffset?: number) => boolean;
  toggleHabit: (habitId: string, dateStr: string) => void;
  addHabit: () => void;
  deleteHabit: (habitId: string) => void;
  keepPlaceholderHabit: (name: string, key: string) => void;
  startEditingHabit: (habitId: string, currentName: string) => void;
  saveEditingHabit: () => void;
  cancelEditingHabit: () => void;
  startEditingGoal: (habit: Habit) => void;
  saveGoal: () => void;
  dismissedPlaceholders: Record<string, boolean>;
  dismissPlaceholder: (key: string, e: React.MouseEvent) => void;
}

const WorkHabitsWidget: React.FC<WorkHabitsWidgetProps> = ({
  habits,
  habitWeekOffset,
  isAddingHabit,
  setIsAddingHabit,
  newHabitName,
  setNewHabitName,
  editingHabitId,
  editingHabitName,
  setEditingHabitName,
  editingGoalHabitId,
  truncatedHabitHover,
  setTruncatedHabitHover,
  editingGoalTarget,
  setEditingGoalTarget,
  newHabitGoalTarget,
  setNewHabitGoalTarget,
  habitsScrollRef,
  getWeekDays,
  getWeeklyCompletions,
  isHabitBehindPace,
  toggleHabit,
  addHabit,
  deleteHabit,
  keepPlaceholderHabit,
  startEditingHabit,
  saveEditingHabit,
  cancelEditingHabit,
  startEditingGoal,
  saveGoal,
  dismissedPlaceholders,
  dismissPlaceholder,
}) => {
  const navigate = useNavigate();

  return (
    <section className="flex-1 bg-white/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-[#e0d5db]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <svg width="18" height="14" viewBox="0 0 10 8" fill="none">
            <path d="M1 4.5Q2 6 3.5 7Q5.5 4 9 1" stroke="#612a4f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3
            className="text-base text-[#2d2a26]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Work Habits
          </h3>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsAddingHabit(true)}
                className="text-[#612a4f] hover:text-[#4a3442] hover:bg-[#612a4f]/10 p-1 rounded transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white border-black">
              <p>Add Habit</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Habits Grid */}
      {habits.length > 0 || isAddingHabit ? (
        <div>
          {/* Day Headers */}
          <div className="grid grid-cols-[1fr_repeat(7,28px)_20px] sm:grid-cols-[1fr_repeat(7,36px)_20px] gap-0.5 sm:gap-1 mb-1 pb-3" style={{ borderBottom: '1px solid rgba(139, 115, 130, 0.08)' }}>
            <div></div>
            {getWeekDays(habitWeekOffset).map((day, idx) => {
              const isToday = getDateString(day) === getDateString(new Date());
              const dayLabel = ['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx];
              return (
                <div key={idx} className="text-center">
                  <div
                    className="text-[10px] font-semibold"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: isToday ? '#6b4a5e' : '#8b7a85',
                    }}
                  >
                    {dayLabel}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Habit Rows */}
          <div
            ref={habitsScrollRef}
            className={`pt-2 ${habits.length >= 5 ? 'space-y-1 max-h-[150px] overflow-y-auto' : habits.length >= 3 ? 'space-y-1' : 'space-y-5'}`}
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}
          >
            {habits.map((habit) => {
              const weeklyCompleted = getWeeklyCompletions(habit, habitWeekOffset);
              const weeklyTarget = habit.goal?.target || 7;
              const isBehind = isHabitBehindPace(habit, weeklyCompleted, habitWeekOffset);

              return (
              <div
                key={habit.id}
                className={`grid grid-cols-[1fr_repeat(7,28px)_20px] sm:grid-cols-[1fr_repeat(7,36px)_20px] gap-0.5 sm:gap-1 items-center group ${habits.length >= 3 ? 'py-1.5' : 'py-2'}`}
              >
                {/* Habit Name */}
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  {editingHabitId === habit.id ? (
                    <Input
                      autoFocus
                      value={editingHabitName}
                      onChange={(e) => setEditingHabitName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditingHabit();
                        if (e.key === 'Escape') cancelEditingHabit();
                      }}
                      onBlur={saveEditingHabit}
                      className="flex-1 h-7 text-[13px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1 bg-transparent"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                  ) : (
                    <>
                      <div className="relative min-w-0 flex-1">
                        <span
                          className="text-[13px] text-[#2d2a26] truncate cursor-pointer hover:text-[#6b4a5e] transition-colors block"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                          onClick={() => startEditingHabit(habit.id, habit.name)}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.clientWidth) {
                              setTruncatedHabitHover(habit.id);
                            }
                          }}
                          onMouseLeave={() => setTruncatedHabitHover(null)}
                        >
                          {habit.name}
                        </span>
                        {truncatedHabitHover === habit.id && (
                          <div
                            className="absolute left-0 bottom-full mb-1 z-50 px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap"
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: '12px',
                              backgroundColor: '#1a1a1a',
                              color: 'white',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                            }}
                          >
                            {habit.name}
                          </div>
                        )}
                      </div>
                      {/* Progress Badge - Clickable to edit goal */}
                      {editingGoalHabitId === habit.id ? (
                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                          <span
                            className="text-[10px] text-[#7a9a7a]"
                            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
                          >
                            {weeklyCompleted}/
                          </span>
                          <input
                            autoFocus
                            type="text"
                            value={editingGoalTarget}
                            onChange={(e) => setEditingGoalTarget(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveGoal();
                              if (e.key === 'Escape') saveGoal();
                            }}
                            onBlur={saveGoal}
                            className="w-6 h-5 text-[10px] text-center border border-[#7a9a7a] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#7a9a7a]"
                            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditingGoal(habit)}
                          className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: '10px',
                            color: isBehind ? '#8b7a85' : '#7a9a7a',
                            backgroundColor: isBehind ? 'rgba(139, 122, 133, 0.1)' : 'rgba(122, 154, 122, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            marginLeft: '8px',
                            border: 'none',
                          }}
                        >
                          {weeklyCompleted}/{weeklyTarget}
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Day Checkboxes */}
                {getWeekDays(habitWeekOffset).map((day, dayIdx) => {
                  const dateStr = getDateString(day);
                  const isCompleted = habit.completedDates.includes(dateStr);
                  const isToday = dateStr === getDateString(new Date());

                  return (
                    <div
                      key={dayIdx}
                      className="flex justify-center"
                    >
                      <button
                        onClick={() => toggleHabit(habit.id, dateStr)}
                        className="w-[18px] h-[18px] rounded-md flex items-center justify-center transition-all"
                        style={{
                          background: isCompleted
                            ? 'linear-gradient(145deg, #8aae8a 0%, #6a9a6a 100%)'
                            : 'transparent',
                          border: isCompleted
                            ? 'none'
                            : '1.5px solid rgba(139, 115, 130, 0.15)',
                          boxShadow: isCompleted
                            ? '0 2px 6px rgba(106, 154, 106, 0.25)'
                            : 'none',
                        }}
                      >
                        {isCompleted && (
                          <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4.5Q2 6 3.5 7Q5.5 4 9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })}

                {/* Delete button */}
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 flex items-center justify-center"
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            );
            })}

            {/* Add Habit Row */}
            {isAddingHabit && (
              <div className="pt-3 mt-2" style={{ borderTop: '1px solid rgba(139, 115, 130, 0.08)' }}>
                <div className="flex items-center gap-2">
                  <Input
                    autoFocus
                    placeholder="Enter habit name..."
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addHabit();
                      if (e.key === 'Escape') {
                        setIsAddingHabit(false);
                        setNewHabitName("");
                        setNewHabitGoalTarget("");
                      }
                    }}
                    className="flex-1 h-9 text-[13px] border border-gray-200 rounded-lg focus:border-[#6b4a5e] focus:ring-0 focus:outline-none"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                  <div className="flex items-center gap-1">
                    <Input
                      placeholder="4"
                      value={newHabitGoalTarget}
                      onChange={(e) => setNewHabitGoalTarget(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addHabit();
                        if (e.key === 'Escape') {
                          setIsAddingHabit(false);
                          setNewHabitName("");
                          setNewHabitGoalTarget("");
                        }
                      }}
                      className="w-10 h-9 text-[13px] text-center border border-gray-200 rounded-lg focus:border-[#6b4a5e] focus:ring-1 focus:ring-[#6b4a5e]/20"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                    <span
                      className="text-[11px] text-[#8b7a85]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      /wk
                    </span>
                  </div>
                  <button
                    onClick={addHabit}
                    className="h-9 px-4 rounded-lg text-white text-xs font-semibold"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      background: 'linear-gradient(145deg, #7a9a7a 0%, #5a8a5a 100%)',
                    }}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingHabit(false);
                      setNewHabitName("");
                      setNewHabitGoalTarget("");
                    }}
                    className="h-9 px-3 rounded-lg text-[13px] text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Scroll indicator for 5+ habits */}
          {habits.length >= 5 && (
            <div className="flex justify-center -mb-4">
              <button
                onClick={() => {
                  if (habitsScrollRef.current) {
                    habitsScrollRef.current.scrollBy({ top: 50, behavior: 'smooth' });
                  }
                }}
                className="text-[#8B7082] hover:text-[#612a4f] hover:bg-[#612a4f]/10 p-0.5 rounded transition-all"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        (() => {
          const allHabits = [
            { name: 'Morning workout', days: [true, true, false, true, false, false, false] },
            { name: 'Post on social media', days: [true, false, true, false, true, false, false] },
            { name: 'Review analytics', days: [false, true, false, false, false, false, false] },
          ];
          const visibleHabits = allHabits.filter((_, i) => !dismissedPlaceholders[`wh-${i}`]);
          return visibleHabits.length === 0 ? (
            <div className="py-6 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(97,42,79,0.07)' }}>
                <svg width="16" height="16" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="#612a4f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p className="text-xs text-[#8b7a85] text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>Build routines that support your growth</p>
              <button onClick={() => setIsAddingHabit(true)} className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#612a4f] border border-[#612a4f]/30 hover:bg-[#612a4f] hover:text-white transition-all" style={{ fontFamily: "'DM Sans', sans-serif" }}>Add a habit</button>
            </div>
          ) : (
            <div className="py-2">
              {visibleHabits.map((habit) => {
                const origIdx = allHabits.findIndex(h => h.name === habit.name);
                return (
                  <div key={origIdx} className="group grid grid-cols-[1fr_repeat(7,28px)_44px] sm:grid-cols-[1fr_repeat(7,32px)_44px] gap-0.5 sm:gap-1 items-center py-2.5 border-b border-[#8B7082]/08 last:border-b-0 opacity-30 hover:opacity-60 transition-opacity">
                    <span className="text-sm font-semibold text-[#2d2a26] truncate pr-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>{habit.name}</span>
                    {habit.days.map((checked, d) => (
                      <div key={d} className="w-[20px] h-[20px] sm:w-[26px] sm:h-[26px] rounded-md mx-auto flex items-center justify-center" style={{ background: checked ? 'linear-gradient(145deg, #8aae8a, #6a9a6a)' : 'rgba(139,115,130,0.08)', border: checked ? 'none' : '1.5px solid rgba(139,115,130,0.15)' }}>
                        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                    ))}
                    <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => keepPlaceholderHabit(habit.name, `wh-${origIdx}`)} className="w-5 h-5 flex items-center justify-center rounded-full text-[#612a4f] hover:bg-[#612a4f] hover:text-white transition-all flex-shrink-0" title="Keep this habit">
                        <svg width="9" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button onClick={(e) => dismissPlaceholder(`wh-${origIdx}`, e)} className="w-5 h-5 flex items-center justify-center rounded-full text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all flex-shrink-0" title="Remove">
                        <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
              <button onClick={() => setIsAddingHabit(true)} className="mt-3 text-xs font-semibold text-[#612a4f] hover:text-[#4a3442] transition-colors" style={{ fontFamily: "'DM Sans', sans-serif" }}>+ Add a habit</button>
            </div>
          );
        })()
      )}
    </section>
  );
};

export default WorkHabitsWidget;
