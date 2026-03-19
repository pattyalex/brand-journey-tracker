import React from "react";
import {
  DndContext,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Target, TrendingUp, Plus, Trash2,
  Check, Calendar, GripVertical
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import SortableGoalItem from "./SortableGoalItem";
import DroppableMonthPill from "./DroppableMonthPill";
import { Goal, GoalStatus, GoalProgressStatus, progressStatuses, monthShortToFull } from "./types";

interface GrowthGoalsTabProps {
  // 3-Year Vision
  threeYearVision: string;
  setThreeYearVision: (v: string) => void;
  // Short-Term Goals
  shortTermGoals: Goal[];
  isAddingShortTermGoal: boolean;
  setIsAddingShortTermGoal: (v: boolean) => void;
  newShortTermGoal: string;
  setNewShortTermGoal: (v: string) => void;
  handleAddShortTermGoal: () => void;
  handleChangeShortTermGoalStatus: (id: string, status: GoalStatus) => void;
  handleDeleteShortTermGoal: (id: string) => void;
  handleEditShortTermGoal: (id: string, text: string) => void;
  handleSaveShortTermGoal: () => void;
  editingShortTermId: string | null;
  editingShortTermText: string;
  setEditingShortTermText: (v: string) => void;
  setEditingShortTermId: (v: string | null) => void;
  // Monthly Goals
  selectedYear: number;
  setSelectedYear: (v: number) => void;
  selectedMonthPill: string;
  setSelectedMonthPill: (v: string) => void;
  getMonthlyGoals: (year: number, month: string) => Goal[];
  newMonthlyGoalInputs: {[key: string]: string};
  setNewMonthlyGoalInputs: (v: React.SetStateAction<{[key: string]: string}>) => void;
  handleAddMonthlyGoal: (year: number, month: string) => void;
  handleChangeMonthlyGoalStatus: (year: number, month: string, id: string, status: GoalStatus) => void;
  handleDeleteMonthlyGoal: (year: number, month: string, id: string) => void;
  handleEditMonthlyGoal: (id: string, text: string) => void;
  handleSaveMonthlyGoal: (year: number, month: string) => void;
  editingMonthlyId: string | null;
  editingMonthlyText: string;
  setEditingMonthlyText: (v: string) => void;
  setEditingMonthlyId: (v: string | null) => void;
  // Dismissed placeholders
  dismissedGoalPlaceholders: Record<string, boolean>;
  dismissGoalPlaceholder: (key: string, e: React.MouseEvent) => void;
  // Drag and drop
  draggedGoal: { id: string; text: string; sourceMonth: string } | null;
  dragOverMonth: string | null;
  handleDragStart: (event: any) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEndMonthlyGoals: (event: DragEndEvent) => void;
  handleDragCancel: () => void;
}

const GrowthGoalsTab: React.FC<GrowthGoalsTabProps> = (props) => {
  const {
    threeYearVision, setThreeYearVision,
    shortTermGoals,
    isAddingShortTermGoal, setIsAddingShortTermGoal,
    newShortTermGoal, setNewShortTermGoal,
    handleAddShortTermGoal,
    handleChangeShortTermGoalStatus,
    handleDeleteShortTermGoal,
    handleEditShortTermGoal,
    handleSaveShortTermGoal,
    editingShortTermId, editingShortTermText, setEditingShortTermText, setEditingShortTermId,
    selectedYear, setSelectedYear,
    selectedMonthPill, setSelectedMonthPill,
    getMonthlyGoals,
    newMonthlyGoalInputs, setNewMonthlyGoalInputs,
    handleAddMonthlyGoal,
    handleChangeMonthlyGoalStatus,
    handleDeleteMonthlyGoal,
    handleEditMonthlyGoal,
    handleSaveMonthlyGoal,
    editingMonthlyId, editingMonthlyText, setEditingMonthlyText, setEditingMonthlyId,
    dismissedGoalPlaceholders, dismissGoalPlaceholder,
    draggedGoal, dragOverMonth,
    handleDragStart, handleDragOver,
    handleDragEndMonthlyGoals, handleDragCancel,
  } = props;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  return (
    <TabsContent value="growth-goals" className="space-y-8 mt-0">

      {/* SECTION 1: 3-Year Vision Hero Banner */}
      <div
        className="relative overflow-hidden p-10 shadow-[0_8px_32px_rgba(97,42,79,0.25)]"
        style={{
          background: 'linear-gradient(135deg, #4a3442 0%, #6b4a5e 50%, #8b6a7e 100%)',
          borderRadius: '24px'
        }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full -translate-y-1/3 translate-x-1/3" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full translate-y-1/2 -translate-x-1/3" style={{ background: 'rgba(255,255,255,0.03)' }} />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
        <div className="absolute bottom-1/4 right-1/3 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-1">
            <div
              className="flex items-center justify-center backdrop-blur-sm"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.15)'
              }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Your North Star
              </p>
              <h2 className="text-[32px] font-semibold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                3-Year Vision
              </h2>
            </div>
          </div>
          <p className="text-sm mb-6 ml-[60px]" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'DM Sans', sans-serif" }}>
            Where do you see yourself and your brand in 3 years? Dream big.
          </p>

          <div
            className="backdrop-blur-sm"
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '4px'
            }}
          >
            <textarea
              value={threeYearVision}
              onChange={(e) => setThreeYearVision(e.target.value)}
              placeholder="In 3 years, I want to..."
              className="w-full min-h-[160px] bg-transparent border-0 rounded-xl p-5 text-white placeholder:text-white/40 text-base leading-relaxed resize-none focus:outline-none transition-all duration-200"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: 1-Year Goals */}
      <div
        className="bg-white p-6"
        style={{
          borderRadius: '24px',
          boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(145deg, #7a9a7a 0%, #5a8a5a 100%)'
              }}
            >
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#612A4F]" style={{ fontFamily: "'Playfair Display', serif" }}>1-Year Goals</h3>
              {shortTermGoals.length > 0 && (
                <span className="text-xs text-[#7a9a7a]">
                  {shortTermGoals.filter(g => g.status === 'completed').length}/{shortTermGoals.length} completed
                </span>
              )}
            </div>
          </div>
          {isAddingShortTermGoal ? (
            <div className="flex gap-2">
              <Input
                placeholder="Enter your goal..."
                value={newShortTermGoal}
                onChange={(e) => setNewShortTermGoal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newShortTermGoal.trim()) {
                    handleAddShortTermGoal();
                    setIsAddingShortTermGoal(false);
                  }
                  if (e.key === 'Escape') {
                    setNewShortTermGoal('');
                    setIsAddingShortTermGoal(false);
                  }
                }}
                autoFocus
                className="w-64 h-10 text-sm border border-[#E8E4E6] focus:outline-none focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)]"
                style={{ borderRadius: '14px' }}
              />
              <button
                onClick={() => {
                  if (newShortTermGoal.trim()) {
                    handleAddShortTermGoal();
                  }
                  setIsAddingShortTermGoal(false);
                }}
                className="px-5 h-10 text-sm font-medium text-white transition-all flex items-center gap-2"
                style={{
                  background: 'linear-gradient(145deg, #612A4F 0%, #4d2140 100%)',
                  borderRadius: '14px'
                }}
              >
                <Check className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => {
                  setNewShortTermGoal('');
                  setIsAddingShortTermGoal(false);
                }}
                className="px-3 h-10 text-sm font-medium text-gray-500 hover:text-gray-700 transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingShortTermGoal(true)}
              className="px-5 h-10 text-sm font-medium text-white transition-all flex items-center gap-2 hover:opacity-90"
              style={{
                background: 'linear-gradient(145deg, #612A4F 0%, #4d2140 100%)',
                borderRadius: '14px'
              }}
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </button>
          )}
        </div>

        {/* Goal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shortTermGoals.map((goal, index) => {
            const softColors = [
              { bg: 'rgba(180, 140, 165, 0.12)', accent: '#a07090', accentRgb: '180, 140, 165' },
              { bg: 'rgba(165, 180, 190, 0.09)', accent: '#8a9ba5', accentRgb: '165, 180, 190' },
              { bg: 'rgba(200, 175, 155, 0.12)', accent: '#b09080', accentRgb: '200, 175, 155' },
              { bg: 'rgba(175, 160, 190, 0.08)', accent: '#9585a8', accentRgb: '175, 160, 190' },
              { bg: 'rgba(185, 200, 180, 0.12)', accent: '#95a890', accentRgb: '185, 200, 180' },
              { bg: 'rgba(210, 180, 170, 0.11)', accent: '#c0a095', accentRgb: '210, 180, 170' },
            ];

            const completedScheme = { bg: 'rgba(122, 154, 122, 0.12)', accent: '#5a8a5a', accentRgb: '90, 138, 90' };

            const scheme = goal.status === 'completed'
              ? completedScheme
              : softColors[index % softColors.length];

            const statusConfig = {
              'not-started': { percent: 0, color: '#9ca3af', label: '0%', barColor: '#9ca3af' },
              'somewhat-done': { percent: 25, color: '#d4a520', label: '25%', barColor: '#d4a520' },
              'great-progress': { percent: 75, color: '#7cb87c', label: '75%', barColor: '#7cb87c' },
              'completed': { percent: 100, color: '#5a8a5a', label: '100%', barColor: '#5a8a5a' },
            };
            const currentStatus = statusConfig[goal.status as keyof typeof statusConfig] || statusConfig['not-started'];

            return (
              <div
                key={goal.id}
                className="relative group transition-all duration-300 hover:shadow-md"
                style={{
                  background: scheme.bg,
                  borderRadius: '16px',
                  padding: '20px 24px'
                }}
              >
                <span
                  className="absolute top-4 right-5"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '32px',
                    fontWeight: 600,
                    color: scheme.accent,
                    opacity: 0.6
                  }}
                >
                  {index + 1}
                </span>

                <div className="pr-10">
                  {editingShortTermId === goal.id ? (
                    <Input
                      value={editingShortTermText}
                      onChange={(e) => setEditingShortTermText(e.target.value)}
                      onBlur={handleSaveShortTermGoal}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveShortTermGoal();
                        if (e.key === 'Escape') setEditingShortTermId(null);
                      }}
                      autoFocus
                      className="mb-4 text-sm"
                    />
                  ) : (
                    <p
                      className="text-lg font-semibold mb-5 cursor-pointer transition-colors"
                      style={{ color: '#3d3a38' }}
                      onClick={() => handleEditShortTermGoal(goal.id, goal.text)}
                    >
                      {goal.text}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div
                      className="overflow-hidden"
                      style={{
                        height: '8px',
                        borderRadius: '10px',
                        background: 'rgba(139, 115, 130, 0.1)'
                      }}
                    >
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${currentStatus.percent}%`,
                          borderRadius: '10px',
                          background: currentStatus.barColor
                        }}
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[13px] font-bold" style={{ color: currentStatus.barColor }}>{currentStatus.label}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-4">
                    {progressStatuses.map((status) => {
                      const isActive = goal.status === status.value;
                      const button = (
                        <button
                          key={status.value}
                          onClick={() => handleChangeShortTermGoalStatus(goal.id, status.value)}
                          className="transition-all duration-200"
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '10px',
                            fontWeight: isActive ? 600 : 500,
                            background: isActive ? status.bgColor : 'transparent',
                            color: isActive ? status.activeColor : '#b0a8ac',
                            border: isActive ? `1px solid ${status.color}40` : '1px solid transparent',
                            whiteSpace: 'nowrap' as const,
                          }}
                        >
                          {status.label}
                        </button>
                      );

                      if (status.value === 'completed') {
                        return (
                          <TooltipProvider key={status.value}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {button}
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Impeccable Work, Congrats!</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      }
                      return button;
                    })}
                    <button
                      onClick={() => handleDeleteShortTermGoal(goal.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
              </div>
            );
          })}

          {/* Empty State / Placeholders */}
          {shortTermGoals.length === 0 && (
            <div className="col-span-full">
              {!dismissedGoalPlaceholders['stg-0'] ? (
                <div className="flex flex-col lg:flex-row items-center gap-10 py-4 px-2">
                  <div className="group relative w-full lg:w-72 flex-shrink-0 rounded-2xl p-5 border-2 border-dashed border-[#D8C8D3] opacity-50 hover:opacity-70 transition-opacity" style={{ background: 'rgba(180,140,165,0.08)' }}>
                    <button
                      onClick={(e) => dismissGoalPlaceholder('stg-0', e)}
                      className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all opacity-50 hover:opacity-100"
                      title="Dismiss"
                    >
                      <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                    <div className="text-[10px] font-semibold uppercase tracking-widest mb-3 px-2 py-0.5 rounded w-fit" style={{ color: '#a07090', background: 'rgba(160,112,144,0.12)' }}>Example</div>
                    <p className="text-base font-semibold mb-5 pr-4" style={{ color: '#3d3a38' }}>Grow to 50k followers across all platforms</p>
                    <div className="space-y-2">
                      <div className="overflow-hidden h-2 rounded-full" style={{ background: 'rgba(139,115,130,0.1)' }}>
                        <div className="h-full rounded-full" style={{ width: '0%', background: '#a07090' }} />
                      </div>
                      <span className="text-[13px] font-bold" style={{ color: '#9ca3af' }}>Not Started</span>
                    </div>
                  </div>

                  <div className="hidden lg:block w-px self-stretch bg-gradient-to-b from-transparent via-[#D8C8D3] to-transparent" />

                  <div className="flex flex-col gap-4 max-w-sm">
                    <div>
                      <h2 className="text-2xl font-bold text-[#2d2a26] leading-tight mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>No goals set yet</h2>
                      <p className="text-sm text-[#8B7082] leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        Set ambitious goals for the year ahead. Track your progress and stay focused on what matters most for your growth.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddingShortTermGoal(true)}
                      className="w-fit h-10 px-5 rounded-xl bg-gradient-to-r from-[#612a4f] to-[#4d2140] hover:from-[#4d2140] hover:to-[#3a1830] text-white text-sm font-semibold shadow-[0_4px_16px_rgba(97,42,79,0.3)] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      <Plus className="w-4 h-4" />
                      Add your first goal
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={Target}
                  title="No goals set yet"
                  description="Define your yearly goals to stay focused on what matters most for your growth."
                  actionLabel="Add Goal"
                  onAction={() => setIsAddingShortTermGoal(true)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: Monthly Goals */}
      <div
        id="monthly-goals"
        className="bg-white p-6"
        style={{
          borderRadius: '24px',
          boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(145deg, #612A4F 0%, #4d2140 100%)'
              }}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-[#612A4F]" style={{ fontFamily: "'Playfair Display', serif" }}>Monthly Goals</h3>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 text-sm border border-[#E8E4E6] bg-white text-[#612A4F] font-medium focus:outline-none focus:border-[#612a4f]"
            style={{ borderRadius: '12px' }}
          >
            {[...Array(5)].map((_, i) => {
              const year = 2026 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>

        {/* Month Pill Selector and Goals with Cross-Month Drag and Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEndMonthlyGoals}
          onDragCancel={handleDragCancel}
        >
          <div className="flex flex-wrap gap-2" style={{ marginBottom: '-60px' }}>
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => {
              const fullMonth = monthShortToFull[month];
              const isSelected = selectedMonthPill === month;
              const isDropTarget = dragOverMonth === fullMonth;

              return (
                <DroppableMonthPill
                  key={month}
                  month={month}
                  fullMonth={fullMonth}
                  isSelected={isSelected}
                  isDropTarget={isDropTarget}
                  onClick={() => setSelectedMonthPill(month)}
                />
              );
            })}
          </div>

          {/* Expanded Month View */}
          {(() => {
            const fullMonth = monthShortToFull[selectedMonthPill];
            const goals = getMonthlyGoals(selectedYear, fullMonth);
            const inputKey = `${selectedYear}-${fullMonth}`;
            const completedCount = goals.filter(g => g.status === 'completed').length;

            return (
              <div
                style={{
                  background: 'linear-gradient(145deg, rgba(139, 115, 130, 0.03) 0%, rgba(139, 115, 130, 0.06) 100%)',
                  borderRadius: '18px',
                  padding: '24px',
                  border: '1px solid rgba(139, 115, 130, 0.08)'
                }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#612A4F]" />
                    <h4 className="text-xl text-[#612A4F]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                      {fullMonth} {selectedYear}
                    </h4>
                  </div>
                  {goals.length > 0 && (
                    <span className="text-sm font-medium" style={{ color: '#7a9a7a' }}>
                      {completedCount}/{goals.length} completed
                    </span>
                  )}
                </div>

                {goals.length === 0 ? (
                  !dismissedGoalPlaceholders[`mg-${fullMonth}`] ? (
                    <div className="flex flex-col lg:flex-row items-center gap-8 py-2">
                      <div className="group relative w-full lg:w-72 flex-shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-dashed border-[#D8C8D3] opacity-50 hover:opacity-70 transition-opacity">
                        <div className="w-5 h-5 rounded-full border-2 border-[#D8C8D3] flex-shrink-0" />
                        <span className="text-sm font-medium text-[#3d3a38] flex-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Post 3x per week consistently</span>
                        <span className="text-[9px] font-semibold uppercase tracking-wide text-[#8B7082] bg-[#8B7082]/10 px-1.5 py-0.5 rounded flex-shrink-0">Example</span>
                        <button
                          onClick={(e) => dismissGoalPlaceholder(`mg-${fullMonth}`, e)}
                          className="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all opacity-50 hover:opacity-100 flex-shrink-0"
                          title="Dismiss"
                        >
                          <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </button>
                      </div>

                      <div className="hidden lg:block w-px self-stretch bg-gradient-to-b from-transparent via-[#D8C8D3] to-transparent" />

                      <div className="flex flex-col gap-3 max-w-xs">
                        <h3 className="text-xl font-bold text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif" }}>No goals set yet</h3>
                        <p className="text-sm text-[#8B7082] leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          Set your intentions for {fullMonth}. Break big goals into monthly wins.
                        </p>
                        <button
                          onClick={() => {
                            const el = document.getElementById(`monthly-goal-input-${inputKey}`);
                            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            el?.focus();
                          }}
                          className="w-fit h-10 px-5 rounded-xl bg-gradient-to-r from-[#612a4f] to-[#4d2140] hover:from-[#4d2140] hover:to-[#3a1830] text-white text-sm font-semibold shadow-[0_4px_16px_rgba(97,42,79,0.3)] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          <Plus className="w-4 h-4" />
                          Add your first goal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      icon={Target}
                      title="No goals set yet"
                      description="Define your monthly goals to stay focused on what matters most for your growth."
                    />
                  )
                ) : (
                  <SortableContext
                    items={goals.map(g => g.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {goals.map((goal) => (
                        <SortableGoalItem
                          key={goal.id}
                          goal={goal}
                          onStatusChange={(status) => handleChangeMonthlyGoalStatus(selectedYear, fullMonth, goal.id, status)}
                          onEdit={() => handleEditMonthlyGoal(goal.id, goal.text)}
                          onDelete={() => handleDeleteMonthlyGoal(selectedYear, fullMonth, goal.id)}
                          isEditing={editingMonthlyId === goal.id}
                          editingText={editingMonthlyText}
                          onEditingTextChange={setEditingMonthlyText}
                          onSave={() => handleSaveMonthlyGoal(selectedYear, fullMonth)}
                          onCancelEdit={() => setEditingMonthlyId(null)}
                          linkedGoalIndex={goal.linkedGoalId ? shortTermGoals.findIndex(g => g.id === goal.linkedGoalId) : undefined}
                        />
                      ))}
                    </div>
                  </SortableContext>
                )}

                {/* Add Goal Input */}
                <div className="flex gap-3 mt-5">
                  <Input
                    id={`monthly-goal-input-${inputKey}`}
                    placeholder={`Add a goal for ${fullMonth}...`}
                    value={newMonthlyGoalInputs[inputKey] || ''}
                    onChange={(e) => setNewMonthlyGoalInputs(prev => ({ ...prev, [inputKey]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMonthlyGoal(selectedYear, fullMonth)}
                    className="flex-1 h-12 text-sm bg-white border border-[#E8E4E6] focus:outline-none focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)]"
                    style={{ borderRadius: '14px' }}
                  />
                  <button
                    onClick={() => handleAddMonthlyGoal(selectedYear, fullMonth)}
                    disabled={!(newMonthlyGoalInputs[inputKey] || '').trim()}
                    className="flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'linear-gradient(145deg, #612A4F 0%, #4d2140 100%)'
                    }}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Drag Overlay for visual feedback */}
          <DragOverlay>
            {draggedGoal ? (
              dragOverMonth ? (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid #612A4F',
                    boxShadow: '0 8px 20px rgba(97, 42, 79, 0.3)',
                    background: 'white',
                    maxWidth: '200px',
                  }}
                  className="flex items-center gap-2"
                >
                  <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-[#3d3a38] truncate">{draggedGoal.text}</span>
                </div>
              ) : (
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    border: '1px solid #612A4F',
                    boxShadow: '0 12px 28px rgba(97, 42, 79, 0.25)',
                    background: 'white',
                  }}
                  className="flex items-center gap-3"
                >
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-[#3d3a38]">{draggedGoal.text}</span>
                </div>
              )
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

    </TabsContent>
  );
};

export default GrowthGoalsTab;
