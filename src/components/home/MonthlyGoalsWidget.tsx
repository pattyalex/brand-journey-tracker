import React from "react";
import { useNavigate } from "react-router-dom";
import { Target, Trash2, ArrowRight, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { MonthlyGoal } from "./types";

interface MonthlyGoalsWidgetProps {
  getCurrentMonth: () => string;
  getCurrentYear: () => number;
  getCurrentMonthGoals: () => MonthlyGoal[];
  editingMonthlyGoalId: number | null;
  setEditingMonthlyGoalId: (id: number | null) => void;
  editingMonthlyGoalText: string;
  setEditingMonthlyGoalText: (text: string) => void;
  handleEditMonthlyGoal: (id: number, newText: string) => void;
  handleCycleGoalStatus: (id: number) => void;
  handleDeleteMonthlyGoal: (id: number) => void;
  monthlyGoalsScrollRef: React.RefObject<HTMLDivElement>;
  dismissedPlaceholders: Record<string, boolean>;
  dismissPlaceholder: (key: string, e: React.MouseEvent) => void;
  keepPlaceholderGoal: (text: string, status: string, key: string) => void;
}

const MonthlyGoalsWidget: React.FC<MonthlyGoalsWidgetProps> = ({
  getCurrentMonth,
  getCurrentYear,
  getCurrentMonthGoals,
  editingMonthlyGoalId,
  setEditingMonthlyGoalId,
  editingMonthlyGoalText,
  setEditingMonthlyGoalText,
  handleEditMonthlyGoal,
  handleCycleGoalStatus,
  handleDeleteMonthlyGoal,
  monthlyGoalsScrollRef,
  dismissedPlaceholders,
  dismissPlaceholder,
  keepPlaceholderGoal,
}) => {
  const navigate = useNavigate();

  return (
    <section className="lg:flex-[0.75] bg-white/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-[#e0d5db]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <svg className="w-5 h-5 text-[#612a4f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>
            <h3
              className="text-base text-[#2d2a26]"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
            >
              Monthly Goals
            </h3>
            <p className="text-[11px] text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{getCurrentMonth()} {getCurrentYear()}</p>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate('/strategy-growth?tab=growth-goals#monthly-goals')}
                className="text-[#8B7082] hover:text-[#612a4f] hover:bg-[#612a4f]/10 p-1 rounded transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white border-black">
              <p>View All</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Goals List */}
      {getCurrentMonthGoals().length === 0 ? (
        (() => {
          const allGoals = [
            { text: 'Reach 10k followers on Instagram', status: 'On It' },
            { text: 'Close 2 brand deals this month', status: 'Not Started' },
            { text: 'Post 3x per week consistently', status: 'Almost There' },
          ];
          const visibleGoals = allGoals.filter((_, i) => !dismissedPlaceholders[`mg-${i}`]);
          return visibleGoals.length === 0 ? (
            <div className="py-6 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(97,42,79,0.07)' }}>
                <Target className="w-4 h-4 text-[#612a4f]" />
              </div>
              <p className="text-xs text-[#8b7a85] text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>Set intentions for this month</p>
              <button onClick={() => navigate('/strategy-growth?tab=growth-goals#monthly-goals')} className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#612a4f] border border-[#612a4f]/30 hover:bg-[#612a4f] hover:text-white transition-all" style={{ fontFamily: "'DM Sans', sans-serif" }}>Add a goal</button>
            </div>
          ) : (
            <div className="py-2 space-y-2">
              {visibleGoals.map((goal) => {
                const origIdx = allGoals.findIndex(g => g.text === goal.text);
                return (
                  <div key={origIdx} className="group flex items-center px-3 py-2.5 rounded-xl border border-gray-100 opacity-30 hover:opacity-50 transition-opacity">
                    <span className="text-sm font-semibold text-[#2d2a26] flex-1 pr-2 cursor-pointer" onClick={() => navigate('/strategy-growth?tab=growth-goals#monthly-goals')} style={{ fontFamily: "'DM Sans', sans-serif" }}>{goal.text}</span>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap mr-2 cursor-pointer" onClick={() => navigate('/strategy-growth?tab=growth-goals#monthly-goals')} style={{ fontFamily: "'DM Sans', sans-serif" }}>{goal.status}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={() => keepPlaceholderGoal(goal.text, goal.status, `mg-${origIdx}`)} className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded-full text-[#612a4f] hover:bg-[#612a4f] hover:text-white transition-all flex-shrink-0">
                            <svg width="9" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white border-black"><p>Keep Goal</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={(e) => dismissPlaceholder(`mg-${origIdx}`, e)} className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-300 transition-all flex-shrink-0">
                            <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white border-black"><p>Remove Goal</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                );
              })}
              <button onClick={() => navigate('/strategy-growth?tab=growth-goals#monthly-goals')} className="text-xs font-semibold text-[#612a4f] hover:text-[#4a3442] transition-all duration-200 pt-1 px-3 py-1.5 -ml-3 rounded-lg hover:bg-[rgba(97,42,79,0.08)] hover:-translate-y-0.5 hover:shadow-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>+ Set your first goal</button>
            </div>
          );
        })()
      ) : (
      <>
      <div ref={monthlyGoalsScrollRef} className={`${getCurrentMonthGoals().length >= 5 ? 'max-h-[160px] overflow-y-auto' : ''}`} style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}>
        <div className={`pt-2 ${getCurrentMonthGoals().length <= 2 ? 'space-y-4' : getCurrentMonthGoals().length <= 4 ? 'space-y-1' : 'space-y-1'}`}>
          {getCurrentMonthGoals().map((goal) => {
            const statusConfig: Record<string, { bgColor: string; textColor: string; borderColor: string; label: string }> = {
              'not-started': { bgColor: 'rgba(156, 163, 175, 0.15)', textColor: '#6b7280', borderColor: 'rgba(156, 163, 175, 0.4)', label: 'Not Started' },
              'somewhat-done': { bgColor: 'rgba(212, 165, 32, 0.15)', textColor: '#b8860b', borderColor: 'rgba(212, 165, 32, 0.4)', label: 'On It' },
              'great-progress': { bgColor: 'rgba(124, 184, 124, 0.15)', textColor: '#5a9a5a', borderColor: 'rgba(124, 184, 124, 0.4)', label: 'Great Progress' },
              'completed': { bgColor: '#5a8a5a', textColor: '#ffffff', borderColor: '#5a8a5a', label: 'Fully Completed!' },
            };
            const status = statusConfig[goal.status] || statusConfig['not-started'];

            return (
              <div key={goal.id} className="group">
                <div
                  className={`flex items-center gap-3 border-b border-[#8B7082]/10 last:border-b-0 transition-all ${getCurrentMonthGoals().length <= 2 ? 'py-3' : 'py-2'}`}
                >
                  {/* Goal text */}
                  {editingMonthlyGoalId === goal.id ? (
                    <Input
                      value={editingMonthlyGoalText}
                      onChange={(e) => setEditingMonthlyGoalText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditMonthlyGoal(goal.id, editingMonthlyGoalText);
                        else if (e.key === 'Escape') { setEditingMonthlyGoalId(null); setEditingMonthlyGoalText(""); }
                      }}
                      onBlur={() => handleEditMonthlyGoal(goal.id, editingMonthlyGoalText)}
                      className="flex-1 text-sm h-8 bg-white"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                      autoFocus
                    />
                ) : (
                  <span
                    onDoubleClick={() => { setEditingMonthlyGoalId(goal.id); setEditingMonthlyGoalText(goal.text); }}
                    className="flex-1 text-sm font-semibold cursor-pointer text-[#2d2a26]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {goal.text}
                  </span>
                )}

                {/* Status badge - clickable to cycle */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleCycleGoalStatus(goal.id); }}
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: status.bgColor,
                    color: status.textColor,
                    border: `1px solid ${status.borderColor}`,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {status.label}
                </button>

                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteMonthlyGoal(goal.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        </div>
      </div>
      {/* Scroll indicator for 5+ goals */}
      {getCurrentMonthGoals().length >= 5 && (
        <div className="flex justify-center -mb-4">
          <button
            onClick={() => {
              if (monthlyGoalsScrollRef.current) {
                monthlyGoalsScrollRef.current.scrollBy({ top: 50, behavior: 'smooth' });
              }
            }}
            className="text-[#8B7082] hover:text-[#612a4f] hover:bg-[#612a4f]/10 p-0.5 rounded transition-all"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
      </>
      )}
    </section>
  );
};

export default MonthlyGoalsWidget;
