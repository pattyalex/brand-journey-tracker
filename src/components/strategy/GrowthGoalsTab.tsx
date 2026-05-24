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
  Target, TrendingUp, Plus, Trash2, X,
  Check, ChevronDown, GripVertical
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import SortableGoalItem from "./SortableGoalItem";
import DroppableMonthPill from "./DroppableMonthPill";
import { Goal, GoalStatus, GoalProgressStatus, progressStatuses, monthShortToFull } from "./types";

// Burgundy color helper
const b = (opacity: number) => `rgba(95, 43, 79, ${opacity})`;

interface GrowthGoalsTabProps {
  threeYearVision: string;
  setThreeYearVision: (v: string) => void;
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
  selectedShortTermYear: number;
  setSelectedShortTermYear: (v: number) => void;
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
  dismissedGoalPlaceholders: Record<string, boolean>;
  dismissGoalPlaceholder: (key: string, e: React.MouseEvent) => void;
  draggedGoal: { id: string; text: string; sourceMonth: string } | null;
  dragOverMonth: string | null;
  handleDragStart: (event: any) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEndMonthlyGoals: (event: DragEndEvent) => void;
  handleDragCancel: () => void;
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const serifFont = "'Georgia', 'Times New Roman', serif";

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
    selectedShortTermYear, setSelectedShortTermYear,
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

  const [showMonthlyInput, setShowMonthlyInput] = React.useState(false);

  const currentYear = new Date().getFullYear();
  const filteredShortTermGoals = shortTermGoals.filter(g => (g.year ?? currentYear) === selectedShortTermYear);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  return (
    <TabsContent value="growth-goals" className="space-y-8 mt-0">

      {/* ═══════════════════════════════════════════════════════
          SECTION 1: Monthly Goals
          ═══════════════════════════════════════════════════════ */}
      <div
        id="monthly-goals"
        className="rounded-xl p-6"
        style={{ backgroundColor: b(0.02), border: `0.5px solid ${b(0.08)}` }}
      >
        {/* Section header */}
        <div className="flex items-center justify-between mb-7">
          <h3
            className="text-[22px] font-medium"
            style={{ fontFamily: serifFont, color: '#5F2B4F', letterSpacing: '-0.01em' }}
          >
            Monthly goals
          </h3>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-[12px] font-medium px-3 py-1.5 rounded-md appearance-none cursor-pointer focus:outline-none"
            style={{
              color: '#5F2B4F',
              border: `0.5px solid ${b(0.25)}`,
              backgroundColor: 'white',
            }}
          >
            {[...Array(5)].map((_, i) => {
              const year = 2026 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>

        {/* Month tab bar */}
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEndMonthlyGoals}
          onDragCancel={handleDragCancel}
        >
          <div className="flex mb-9" style={{ borderBottom: `0.5px solid ${b(0.12)}` }}>
            {months.map((month) => {
              const fullMonth = monthShortToFull[month];
              const isSelected = selectedMonthPill === month;
              const isDropTarget = dragOverMonth === fullMonth;

              return (
                <button
                  key={month}
                  onClick={() => setSelectedMonthPill(month)}
                  className="relative px-3.5 py-2 text-[12px] tracking-[0.02em] cursor-pointer transition-colors duration-200"
                  style={{
                    color: isSelected ? '#5F2B4F' : b(0.5),
                    fontWeight: isSelected ? 600 : 400,
                    marginBottom: '-0.5px',
                    borderBottom: isSelected ? '1.5px solid #5F2B4F' : '1.5px solid transparent',
                    backgroundColor: isDropTarget ? b(0.05) : undefined,
                  }}
                >
                  {month}
                </button>
              );
            })}
          </div>

          {/* Current month view */}
          {(() => {
            const fullMonth = monthShortToFull[selectedMonthPill];
            const goals = getMonthlyGoals(selectedYear, fullMonth);
            const inputKey = `${selectedYear}-${fullMonth}`;
            const completedCount = goals.filter(g => g.status === 'completed').length;

            return (
              <div>
                {/* Month hero row */}
                <div className="flex items-baseline justify-between mb-5">
                  <h4
                    className="text-[32px] font-medium leading-none"
                    style={{ fontFamily: serifFont, color: '#5F2B4F', letterSpacing: '-0.015em' }}
                  >
                    {fullMonth}
                  </h4>
                  <span className="text-[11px] tracking-[0.04em]" style={{ color: b(0.55) }}>
                    {completedCount} of {goals.length} complete
                  </span>
                </div>

                {/* Goals list */}
                <div className="flex flex-col gap-2">
                  {goals.length === 0 && !dismissedGoalPlaceholders[`mg-${fullMonth}`] && (
                    <div
                      className="flex items-center gap-3 px-4 py-3.5 rounded-lg"
                      style={{ backgroundColor: b(0.03), border: `0.5px solid ${b(0.1)}` }}
                    >
                      <span className="text-[14px] flex-1" style={{ color: b(0.6) }}>
                        Post 3x/week consistently
                      </span>
                      <span
                        className="text-[9px] uppercase font-medium tracking-[0.08em] flex-shrink-0"
                        style={{ color: b(0.4) }}
                      >
                        Example
                      </span>
                    </div>
                  )}

                  {goals.length > 0 && (
                    <SortableContext
                      items={goals.map(g => g.id)}
                      strategy={verticalListSortingStrategy}
                    >
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
                    </SortableContext>
                  )}

                  {/* Ghost add slot */}
                  {showMonthlyInput ? (
                    <div className="flex gap-2 mt-1">
                      <Input
                        id={`monthly-goal-input-${inputKey}`}
                        placeholder={`Add a goal for ${fullMonth}...`}
                        value={newMonthlyGoalInputs[inputKey] || ''}
                        onChange={(e) => setNewMonthlyGoalInputs(prev => ({ ...prev, [inputKey]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (newMonthlyGoalInputs[inputKey] || '').trim()) {
                            handleAddMonthlyGoal(selectedYear, fullMonth);
                            setShowMonthlyInput(false);
                          }
                          if (e.key === 'Escape') setShowMonthlyInput(false);
                        }}
                        autoFocus
                        className="flex-1 h-11 text-sm bg-white rounded-lg focus:outline-none focus:ring-0"
                        style={{ border: `0.5px solid ${b(0.2)}` }}
                      />
                      <button
                        onClick={() => {
                          if ((newMonthlyGoalInputs[inputKey] || '').trim()) {
                            handleAddMonthlyGoal(selectedYear, fullMonth);
                          }
                          setShowMonthlyInput(false);
                        }}
                        className="flex items-center justify-center w-11 h-11 rounded-lg text-white transition-colors"
                        style={{ backgroundColor: '#5F2B4F' }}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowMonthlyInput(true)}
                      className="group/add flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 bg-transparent hover:bg-[#5F2B4F]/[0.06]"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#5F2B4F]/25 transition-all duration-300 group-hover/add:rotate-90 group-hover/add:text-[#5F2B4F]" />
                      <span className="text-[13px] text-[#5F2B4F]/30 transition-colors duration-200 group-hover/add:text-[#5F2B4F]">
                        Add a goal
                      </span>
                    </button>
                  )}
                </div>

              </div>
            );
          })()}

          {/* Drag Overlay */}
          <DragOverlay>
            {draggedGoal ? (
              dragOverMonth ? (
                <div
                  className="flex items-center gap-2"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid #5F2B4F`,
                    boxShadow: '0 8px 20px rgba(95, 43, 79, 0.3)',
                    background: 'white',
                    maxWidth: '200px',
                  }}
                >
                  <GripVertical className="w-3 h-3 flex-shrink-0" style={{ color: b(0.3) }} />
                  <span className="text-xs truncate" style={{ color: b(0.8) }}>{draggedGoal.text}</span>
                </div>
              ) : (
                <div
                  className="flex items-center gap-3"
                  style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    border: `1px solid #5F2B4F`,
                    boxShadow: '0 12px 28px rgba(95, 43, 79, 0.25)',
                    background: 'white',
                  }}
                >
                  <GripVertical className="w-4 h-4" style={{ color: b(0.3) }} />
                  <span className="text-sm" style={{ color: b(0.8) }}>{draggedGoal.text}</span>
                </div>
              )
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: 1-Year Goals
          ═══════════════════════════════════════════════════════ */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: b(0.02), border: `0.5px solid ${b(0.08)}` }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3
              className="text-[22px] font-medium"
              style={{ fontFamily: serifFont, color: '#5F2B4F', letterSpacing: '-0.01em' }}
            >
              1-Year goals
            </h3>
            {filteredShortTermGoals.length > 0 && (
              <span className="text-[11px] tracking-[0.04em]" style={{ color: b(0.55) }}>
                {filteredShortTermGoals.filter(g => g.status === 'completed').length} of {filteredShortTermGoals.length} complete
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedShortTermYear}
              onChange={(e) => setSelectedShortTermYear(Number(e.target.value))}
              className="text-[12px] font-medium px-3 py-1.5 rounded-md appearance-none cursor-pointer focus:outline-none"
              style={{
                color: '#5F2B4F',
                border: `0.5px solid ${b(0.25)}`,
                backgroundColor: 'white',
              }}
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
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
                  className="w-64 h-9 text-sm rounded-lg focus:outline-none focus:ring-0"
                  style={{ border: `0.5px solid ${b(0.2)}` }}
                />
                <button
                  onClick={() => {
                    if (newShortTermGoal.trim()) handleAddShortTermGoal();
                    setIsAddingShortTermGoal(false);
                  }}
                  className="px-4 h-9 text-sm font-medium text-white rounded-lg flex items-center gap-1.5"
                  style={{ backgroundColor: '#5F2B4F' }}
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </button>
                <button
                  onClick={() => { setNewShortTermGoal(''); setIsAddingShortTermGoal(false); }}
                  className="px-3 h-9 text-sm font-medium transition-colors"
                  style={{ color: b(0.5) }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingShortTermGoal(true)}
                className="px-4 h-9 text-[12px] font-medium rounded-lg flex items-center gap-1.5 transition-colors hover:opacity-90"
                style={{
                  color: '#5F2B4F',
                  border: `0.5px solid ${b(0.25)}`,
                  backgroundColor: 'white',
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Goal
              </button>
            )}
          </div>
        </div>

        {/* Goal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShortTermGoals.map((goal) => {
            const statusConfig = {
              'not-started': { percent: 0, label: '0%', barColor: b(0.25) },
              'somewhat-done': { percent: 25, label: '25%', barColor: '#d4a520' },
              'great-progress': { percent: 75, label: '75%', barColor: '#7cb87c' },
              'completed': { percent: 100, label: '100%', barColor: '#5a8a5a' },
            };
            const currentStatus = statusConfig[goal.status as keyof typeof statusConfig] || statusConfig['not-started'];

            return (
              <div
                key={goal.id}
                className="relative group transition-all duration-200 overflow-hidden rounded-xl p-5"
                style={{
                  backgroundColor: 'white',
                  border: `0.5px solid ${b(0.1)}`,
                }}
              >
                <div>
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
                      className="text-lg font-medium mb-5 cursor-pointer transition-colors"
                      style={{ color: b(0.85) }}
                      onClick={() => handleEditShortTermGoal(goal.id, goal.text)}
                    >
                      {goal.text}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div
                      className="overflow-hidden h-2 rounded-full"
                      style={{ background: b(0.06) }}
                    >
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{ width: `${currentStatus.percent}%`, background: currentStatus.barColor }}
                      />
                    </div>
                    <span className="text-[13px] font-medium" style={{ color: currentStatus.barColor }}>
                      {currentStatus.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-4 flex-wrap">
                  {progressStatuses.map((status) => {
                    const isActive = goal.status === status.value;
                    return (
                      <button
                        key={status.value}
                        onClick={() => handleChangeShortTermGoalStatus(goal.id, status.value)}
                        className="transition-all duration-200 cursor-pointer"
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: isActive ? 600 : 500,
                          background: isActive ? status.bgColor : 'transparent',
                          color: isActive ? status.activeColor : b(0.4),
                          border: isActive ? `1px solid ${status.color}40` : '1px solid transparent',
                          whiteSpace: 'nowrap' as const,
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = b(0.05);
                            e.currentTarget.style.color = b(0.6);
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = b(0.4);
                          }
                        }}
                      >
                        {status.label}
                      </button>
                    );
                  })}
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleDeleteShortTermGoal(goal.id)}
                        className="absolute top-5 right-5 w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        style={{ color: b(0.35) }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs border-0" style={{ backgroundColor: b(0.7), color: 'white' }}>
                      <p>Delete</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          })}

          {/* Empty State */}
          {filteredShortTermGoals.length === 0 && (
            <div className="col-span-full">
              {!dismissedGoalPlaceholders['stg-0'] ? (
                <div className="flex flex-col lg:flex-row items-center gap-10 py-4 px-2">
                  <div
                    className="group relative w-full lg:w-72 flex-shrink-0 rounded-xl p-5 opacity-70"
                    style={{ backgroundColor: b(0.03), border: `0.5px dashed ${b(0.2)}` }}
                  >
                    <span
                      className="text-[9px] uppercase font-medium tracking-[0.08em] absolute top-4 right-4"
                      style={{ color: b(0.4) }}
                    >
                      Example
                    </span>
                    <p className="text-base font-medium mb-5 pr-4" style={{ color: b(0.7) }}>
                      Grow to 50k followers across all platforms
                    </p>
                    <div className="space-y-2">
                      <div className="overflow-hidden h-2 rounded-full" style={{ background: b(0.06) }}>
                        <div className="h-full rounded-full" style={{ width: '0%', background: b(0.3) }} />
                      </div>
                      <span className="text-[13px] font-medium" style={{ color: b(0.3) }}>Not Started</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 max-w-sm">
                    <p className="text-[15px] font-medium" style={{ color: b(0.8) }}>No goals set yet</p>
                    <p className="text-[12px] leading-relaxed" style={{ color: b(0.5) }}>
                      Set ambitious goals for the year ahead. Track your progress and stay focused on what matters most.
                    </p>
                    <button
                      onClick={() => setIsAddingShortTermGoal(true)}
                      className="w-fit px-4 py-2 rounded-lg text-[13px] font-medium text-white flex items-center gap-1.5 transition-colors hover:opacity-90"
                      style={{ backgroundColor: '#5F2B4F' }}
                    >
                      <Plus className="w-3.5 h-3.5" />
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

      {/* ═══════════════════════════════════════════════════════
          SECTION 3: 3-Year Vision
          ═══════════════════════════════════════════════════════ */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: b(0.02), border: `0.5px solid ${b(0.08)}` }}
      >
        <h3
          className="text-[22px] font-medium mb-1"
          style={{ fontFamily: serifFont, color: '#5F2B4F', letterSpacing: '-0.01em' }}
        >
          3-Year vision
        </h3>
        <p className="text-[12px] mb-4" style={{ color: b(0.5) }}>
          Where do you see yourself and your brand in 3 years? Dream big.
        </p>

        <textarea
          value={threeYearVision}
          onChange={(e) => setThreeYearVision(e.target.value)}
          placeholder="In 3 years, I want to..."
          className="w-full min-h-[160px] rounded-lg p-5 text-sm leading-relaxed resize-none focus:outline-none transition-all duration-200"
          style={{
            color: b(0.8),
            border: `0.5px solid ${b(0.12)}`,
            backgroundColor: 'white',
          }}
        />
      </div>

    </TabsContent>
  );
};

export default GrowthGoalsTab;
