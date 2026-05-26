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
  Target, Plus, X,
  Check, GripVertical, ChevronDown
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
        style={{ backgroundColor: b(0.06), border: `0.5px solid ${b(0.1)}` }}
      >
        {/* Section header */}
        <div className="flex items-center justify-between mb-7">
          <h3
            className="text-base font-semibold"
            style={{ color: '#5F2B4F' }}
          >
            Monthly goals
          </h3>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-[12px] font-medium pl-3 pr-7 py-1.5 rounded-md appearance-none cursor-pointer focus:outline-none"
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
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: '#5F2B4F' }} />
          </div>
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
                  className="relative px-3.5 py-2 tracking-[0.02em] cursor-pointer transition-all duration-200"
                  style={{
                    color: isSelected ? '#5F2B4F' : b(0.5),
                    fontWeight: isSelected ? 600 : 400,
                    fontSize: isSelected ? '13.5px' : '12px',
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
                {/* Goals list */}
                <div className="flex flex-col gap-2">
                  {goals.length === 0 && !dismissedGoalPlaceholders[`mg-${fullMonth}`] && (
                    <div
                      className="flex items-center gap-3 px-4 py-3.5 rounded-lg"
                      style={{ backgroundColor: 'white', border: `0.5px solid ${b(0.1)}` }}
                    >
                      <span className="text-[14px] flex-1" style={{ color: b(0.6) }}>
                        Post 3 times/week on Instagram
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
                        onBlur={() => {
                          if (!(newMonthlyGoalInputs[inputKey] || '').trim()) setShowMonthlyInput(false);
                        }}
                        className="flex-1 h-11 text-sm bg-white rounded-lg focus:outline-none focus:ring-0 placeholder:italic placeholder:text-gray-400"
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
                      <Plus className="w-3.5 h-3.5 text-[#5F2B4F]/50 transition-all duration-300 group-hover/add:rotate-90 group-hover/add:text-[#5F2B4F]" />
                      <span className="text-[13px] text-[#5F2B4F]/50 transition-colors duration-200 group-hover/add:text-[#5F2B4F]">
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

      {/* SECTION 2: 1-Year Goals */}
      <div
        className="bg-white p-6"
        style={{
          borderRadius: '24px',
          boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-[#612A4F]">1-Year goals</h3>
          </div>
          <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedShortTermYear}
              onChange={(e) => setSelectedShortTermYear(Number(e.target.value))}
              className="text-[12px] font-medium pl-3 pr-7 py-1.5 rounded-md appearance-none cursor-pointer focus:outline-none"
              style={{
                color: '#5F2B4F',
                border: '0.5px solid rgba(95, 43, 79, 0.25)',
                backgroundColor: 'white',
              }}
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: '#5F2B4F' }} />
          </div>
          </div>
        </div>

        {/* Goal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShortTermGoals.map((goal, index) => {
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
                className="relative group transition-all duration-300 hover:shadow-md overflow-hidden"
                style={{
                  background: scheme.bg,
                  borderRadius: '16px',
                  padding: '20px 24px'
                }}
              >
                <span
                  className="absolute top-[38px] right-5"
                  style={{
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
                      className="text-[15px] font-semibold mb-5 cursor-pointer transition-colors"
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
              {!dismissedGoalPlaceholders['stg-0'] && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    "Gain 50k followers",
                    "Launch a digital product",
                    "Earn $70,000 from brand deals"
                  ].map((example, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-2xl p-5 border border-gray-200 opacity-50"
                      style={{ background: 'rgba(180,140,165,0.05)' }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#a07090' }}>Example</span>
                        {idx === 0 && (
                          <button
                            onClick={(e) => dismissGoalPlaceholder('stg-0', e)}
                            className="text-gray-300 hover:text-gray-500 transition-colors"
                            title="Dismiss"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-base font-semibold mb-5 text-gray-400">{example}</p>
                      <div className="space-y-2">
                        <div className="overflow-hidden h-2 rounded-full" style={{ background: 'rgba(139,115,130,0.1)' }}>
                          <div className="h-full rounded-full" style={{ width: '0%' }} />
                        </div>
                        <span className="text-[13px] font-bold text-gray-300">Not Started</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Goal inline */}
        {isAddingShortTermGoal ? (
          <div className="flex gap-2 mt-3">
            <Input
              placeholder={`Add a goal for ${selectedShortTermYear}...`}
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
              onBlur={() => {
                if (!newShortTermGoal.trim()) setIsAddingShortTermGoal(false);
              }}
              className="flex-1 h-11 text-sm bg-white rounded-lg focus:outline-none focus:ring-0 placeholder:italic placeholder:text-gray-400"
              style={{ border: `0.5px solid rgba(95, 43, 79, 0.2)` }}
            />
            <button
              onClick={() => {
                if (newShortTermGoal.trim()) handleAddShortTermGoal();
                setIsAddingShortTermGoal(false);
              }}
              className="flex items-center justify-center w-11 h-11 rounded-lg text-white transition-colors"
              style={{ backgroundColor: '#5F2B4F' }}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingShortTermGoal(true)}
            className="group/add flex items-center gap-3 px-4 py-3 mt-3 rounded-lg cursor-pointer transition-all duration-200 bg-transparent hover:bg-[#5F2B4F]/[0.06]"
          >
            <Plus className="w-3.5 h-3.5 text-[#5F2B4F]/50 transition-all duration-300 group-hover/add:rotate-90 group-hover/add:text-[#5F2B4F]" />
            <span className="text-[13px] text-[#5F2B4F]/50 transition-colors duration-200 group-hover/add:text-[#5F2B4F]">
              Add a goal
            </span>
          </button>
        )}
      </div>

      {/* SECTION 3: 3-Year Vision Hero Banner */}
      <div
        className="relative overflow-hidden p-8 shadow-[0_6px_24px_rgba(97,42,79,0.18)]"
        style={{
          background: 'linear-gradient(135deg, #5a4452 0%, #7b5a6e 50%, #9b7a8e 100%)',
          borderRadius: '24px'
        }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full -translate-y-1/3 translate-x-1/3" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full translate-y-1/2 -translate-x-1/3" style={{ background: 'rgba(255,255,255,0.03)' }} />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
        <div className="absolute bottom-1/4 right-1/3 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />

        <div className="relative z-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Your North Star
          </p>
          <h2 className="text-base font-semibold text-white leading-tight mb-4">
            3-Year Vision
          </h2>

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
              placeholder="Where do you see yourself and your brand in 3 years? Dream big..."
              className="w-full min-h-[160px] bg-transparent border-0 rounded-xl p-5 text-white placeholder:text-white/40 placeholder:italic placeholder:text-[15px] focus:placeholder:text-transparent text-base leading-relaxed resize-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none transition-all duration-200"
              style={{ boxShadow: 'none' }}
            />
          </div>
        </div>
      </div>

    </TabsContent>
  );
};

export default GrowthGoalsTab;
