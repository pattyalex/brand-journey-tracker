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
  selectedShortTermYear: number;
  setSelectedShortTermYear: (v: number) => void;
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
      activationConstraint: {
        distance: 5,
      },
    })
  );

  return (
    <TabsContent value="growth-goals" className="space-y-8 mt-0">

      {/* SECTION 1: Monthly Goals */}
      <div
        id="monthly-goals"
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#612A4F] text-white shadow-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#612A4F]">Monthly Goals</h3>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 text-sm border border-gray-100 bg-white text-gray-700 font-medium rounded-xl focus:outline-none focus:border-[#612a4f]"
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
          <div className="flex flex-wrap gap-2 mb-4">
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
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#612A4F]" />
                    <h4 className="text-base font-semibold text-[#612A4F]">
                      {fullMonth} {selectedYear}
                    </h4>
                  </div>
                  {goals.length > 0 && (
                    <span className="text-xs font-medium text-[#7a9a7a]">
                      {completedCount}/{goals.length} completed
                    </span>
                  )}
                </div>

                {goals.length === 0 ? (
                  !dismissedGoalPlaceholders[`mg-${fullMonth}`] ? (
                    <div className="flex flex-col lg:flex-row items-center gap-8 py-2">
                      <div className="group relative w-full lg:w-72 flex-shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-dashed border-[#D8C8D3] opacity-50 hover:opacity-70 transition-opacity">
                        <div className="w-5 h-5 rounded-full border-2 border-[#D8C8D3] flex-shrink-0" />
                        <span className="text-sm font-medium text-[#3d3a38] flex-1">Post 3x per week consistently</span>
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
                        <h3 className="text-xl font-bold text-[#2d2a26]" >No goals set yet</h3>
                        <p className="text-sm text-[#8B7082] leading-relaxed">
                          Set your intentions for {fullMonth}. Break big goals into monthly wins.
                        </p>
                        <button
                          onClick={() => {
                            setShowMonthlyInput(true);
                          }}
                          className="w-fit h-10 px-5 rounded-xl bg-[#612A4F] hover:bg-[#4e2140] text-white text-sm font-medium transition-colors flex items-center gap-2"
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
                {showMonthlyInput ? (
                  <div className="flex gap-3 mt-5">
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
                        if (e.key === 'Escape') {
                          setShowMonthlyInput(false);
                        }
                      }}
                      autoFocus
                      className="flex-1 h-12 text-sm bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)]"
                    />
                    <button
                      onClick={() => {
                        if ((newMonthlyGoalInputs[inputKey] || '').trim()) {
                          handleAddMonthlyGoal(selectedYear, fullMonth);
                        }
                        setShowMonthlyInput(false);
                      }}
                      className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#612A4F] hover:bg-[#4e2140] text-white transition-colors"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowMonthlyInput(true)}
                    className="group/add mt-5 w-9 h-9 hover:w-auto hover:px-4 text-sm font-medium text-[#612A4F] hover:bg-[#612A4F]/5 transition-all flex items-center justify-center gap-2 overflow-hidden"
                    style={{ borderRadius: '12px' }}
                  >
                    <Plus className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden group-hover/add:inline whitespace-nowrap">Add Goal</span>
                  </button>
                )}
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

      {/* SECTION 2: 1-Year Goals */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#612A4F] text-white shadow-sm">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#612A4F]">1-Year Goals</h3>
              {filteredShortTermGoals.length > 0 && (
                <span className="text-xs text-[#7a9a7a]">
                  {filteredShortTermGoals.filter(g => g.status === 'completed').length}/{filteredShortTermGoals.length} completed
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
          <select
            value={selectedShortTermYear}
            onChange={(e) => setSelectedShortTermYear(Number(e.target.value))}
            className="px-4 py-2 text-sm border border-gray-100 bg-white text-gray-700 font-medium rounded-xl focus:outline-none focus:border-[#612a4f]"
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
                className="w-64 h-10 text-sm border border-gray-100 rounded-xl focus:outline-none focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)]"
              />
              <button
                onClick={() => {
                  if (newShortTermGoal.trim()) {
                    handleAddShortTermGoal();
                  }
                  setIsAddingShortTermGoal(false);
                }}
                className="px-5 h-10 text-sm font-medium text-white transition-all flex items-center gap-2"
                style={{ borderRadius: '14px', background: '#612A4F' }}
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
                background: '#612A4F',
                borderRadius: '14px'
              }}
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </button>
          )}
          </div>
        </div>

        {/* Goal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShortTermGoals.map((goal, index) => {
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
                className="relative group transition-all duration-200 hover:shadow-md overflow-hidden bg-white rounded-xl border border-gray-100 p-5"
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

                <div className="flex items-center gap-1 mt-4 flex-wrap">
                    {progressStatuses.map((status) => {
                      const isActive = goal.status === status.value;
                      const button = (
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
                            color: isActive ? status.activeColor : '#b0a8ac',
                            border: isActive ? `1px solid ${status.color}40` : '1px solid transparent',
                            whiteSpace: 'nowrap' as const,
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = 'rgba(139,115,130,0.08)';
                              e.currentTarget.style.color = '#8B7082';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#b0a8ac';
                            }
                          }}
                        >
                          {status.label}
                        </button>
                      );

                      return button;
                    })}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleDeleteShortTermGoal(goal.id)}
                        className="absolute top-5 right-5 w-5 h-5 flex items-center justify-center rounded-full text-[#8B7082]/50 hover:text-[#8B7082] hover:bg-white/80 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-500 text-white text-xs border-0">
                      <p>Delete</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          })}

          {/* Empty State / Placeholders */}
          {filteredShortTermGoals.length === 0 && (
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
                      <h2 className="text-2xl font-bold text-[#2d2a26] leading-tight mb-3" >No goals set yet</h2>
                      <p className="text-sm text-[#8B7082] leading-relaxed">
                        Set ambitious goals for the year ahead. Track your progress and stay focused on what matters most for your growth.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddingShortTermGoal(true)}
                      className="w-fit h-10 px-5 rounded-xl bg-gradient-to-r from-[#612a4f] to-[#4d2140] hover:from-[#4d2140] hover:to-[#3a1830] text-white text-sm font-semibold shadow-[0_4px_16px_rgba(97,42,79,0.3)] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
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

      {/* SECTION 3: 3-Year Vision */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-[#612A4F] text-white shadow-sm">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-[#612A4F]">3-Year Vision</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-11">
          Where do you see yourself and your brand in 3 years? Dream big.
        </p>

        <textarea
          value={threeYearVision}
          onChange={(e) => setThreeYearVision(e.target.value)}
          placeholder="In 3 years, I want to..."
          className="w-full min-h-[160px] border border-gray-100 rounded-xl p-5 text-sm text-gray-800 placeholder:text-gray-300 leading-relaxed resize-none focus:outline-none focus:border-[#612a4f] focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-all duration-200"
        />
      </div>

    </TabsContent>
  );
};

export default GrowthGoalsTab;
