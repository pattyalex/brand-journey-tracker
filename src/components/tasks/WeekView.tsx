import React, { useState, useMemo } from 'react';
import { Plus, Camera, MapPin, GripVertical } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/tasks';
import { Shoot } from '@/types/shoots';
import TaskCheckbox from './TaskCheckbox';
import { formatTimeShort, parseTaskInput } from '@/lib/taskParser';
import { getJSON } from '@/lib/storage';
import { Clock, X, MoreHorizontal, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// ── Time helpers ──
function parse24to12(val: string): { hour: number; minute: number; period: 'AM' | 'PM' } {
  if (!val || !val.includes(':')) return { hour: 12, minute: 0, period: 'AM' };
  const [h, m] = val.split(':').map(Number);
  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return { hour, minute: m, period };
}

function to24(hour: number, minute: number, period: 'AM' | 'PM'): string {
  let h = hour;
  if (period === 'AM' && h === 12) h = 0;
  else if (period === 'PM' && h !== 12) h += 12;
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

interface WeekViewProps {
  weekDates: string[];
  allTasks: Task[];
  today: string;
  currentDate: string;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onAddTask: (title: string, date: string) => void;
  onReorder: (tasks: Task[]) => void;
  onDayClick: (date: string) => void;
  onAddSubtask: (parentId: string, title: string) => void;
}

function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const WeekView: React.FC<WeekViewProps> = ({
  weekDates,
  allTasks,
  today,
  currentDate,
  onToggle,
  onUpdate,
  onDelete,
  onAddTask,
  onReorder,
  onDayClick,
  onAddSubtask,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const activeTask = activeId ? allTasks.find(t => t.id === activeId) : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const allShoots = useMemo(() => getJSON<Shoot[]>('meg_shoots', []), []);

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);
  const handleDragOver = (e: DragOverEvent) => setOverId(e.over?.id as string ?? null);
  const handleDragCancel = () => { setActiveId(null); setOverId(null); };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    setOverId(null);
    const { active, over } = e;
    if (!over) return;

    const task = allTasks.find(t => t.id === active.id);
    if (!task) return;

    const targetId = over.id as string;

    // Dropped on a day column droppable
    if (weekDates.includes(targetId)) {
      if (task.date !== targetId) {
        onUpdate(task.id, { date: targetId });
      }
      return;
    }

    // Dropped on another task
    const targetTask = allTasks.find(t => t.id === targetId);
    if (targetTask) {
      if (task.date !== targetTask.date) {
        // Moving to a different day
        onUpdate(task.id, { date: targetTask.date, order_index: targetTask.order_index + 0.5 });
      } else {
        // Reordering within same day
        const dayTasks = allTasks.filter(t => t.date === task.date && !t.parent_task_id).sort((a, b) => a.order_index - b.order_index);
        const oldIdx = dayTasks.findIndex(t => t.id === active.id);
        const newIdx = dayTasks.findIndex(t => t.id === targetId);
        if (oldIdx !== -1 && newIdx !== -1) {
          const reordered = arrayMove(dayTasks, oldIdx, newIdx);
          const updated = allTasks.map(t => {
            const idx = reordered.findIndex(r => r.id === t.id);
            if (idx !== -1) return { ...t, order_index: idx };
            return t;
          });
          onReorder(updated);
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-0 h-full">
        {weekDates.map(date => {
          const dayTasks = allTasks
            .filter(t => t.date === date && !t.parent_task_id)
            .sort((a, b) => a.order_index - b.order_index);
          const dayShoots = allShoots.filter(s => s.date === date && s.status !== 'Archived');
          const isToday = date === today;
          const isSelected = date === currentDate;
          const d = parseDateLocal(date);
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = d.getDate();

          return (
            <DayColumn
              key={date}
              date={date}
              dayName={dayName}
              dayNum={dayNum}
              isToday={isToday}
              isSelected={isSelected}
              tasks={dayTasks}
              allTasks={allTasks}
              shoots={dayShoots}
              activeId={activeId}
              overId={overId}
              onToggle={onToggle}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddTask={onAddTask}
              onDayClick={onDayClick}
              onAddSubtask={onAddSubtask}
            />
          );
        })}
      </div>
      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeTask ? (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-1.5 flex items-center gap-2 opacity-90 max-w-[200px]">
            <TaskCheckbox checked={activeTask.completed} onChange={() => {}} size="sm" />
            <span className={`text-[12px] truncate ${activeTask.completed ? 'text-gray-300 line-through' : 'text-gray-800'}`}>
              {activeTask.title}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// ── Day Column ──────────────────────────────────────────────

interface DayColumnProps {
  date: string;
  dayName: string;
  dayNum: number;
  isToday: boolean;
  isSelected: boolean;
  tasks: Task[];
  allTasks: Task[];
  shoots: Shoot[];
  activeId: string | null;
  overId: string | null;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onAddTask: (title: string, date: string) => void;
  onDayClick: (date: string) => void;
  onAddSubtask: (parentId: string, title: string) => void;
}

const DayColumn: React.FC<DayColumnProps> = ({
  date, dayName, dayNum, isToday, isSelected, tasks, allTasks, shoots,
  activeId, overId, onToggle, onUpdate, onDelete, onAddTask, onDayClick, onAddSubtask,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: date });
  const [adding, setAdding] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus();
  }, [adding]);

  const handleSubmit = () => {
    if (!inputVal.trim()) return;
    onAddTask(inputVal.trim(), date);
    setInputVal('');
  };

  const taskIds = tasks.map(t => t.id);

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-0 flex flex-col border-r border-gray-100 last:border-r-0 transition-colors duration-150 ${
        isOver ? 'bg-[#612A4F]/[0.03]' : ''
      }`}
      style={{ minHeight: 400 }}
    >
      {/* Day header */}
      <button
        onClick={() => onDayClick(date)}
        className="flex flex-col items-center py-3 hover:bg-gray-50/60 transition-colors"
      >
        <span className={`text-[10px] uppercase tracking-wider font-semibold ${isToday ? 'text-[#612A4F]' : 'text-gray-400'}`}>
          {dayName}
        </span>
        <span className={`text-[15px] font-semibold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full ${
          isToday ? 'bg-[#612A4F] text-white' : isSelected ? 'bg-gray-100 text-gray-800' : 'text-gray-700'
        }`}>
          {dayNum}
        </span>
      </button>

      {/* Shoot banners */}
      {shoots.map(shoot => (
        <div key={shoot.id} className="mx-1.5 mb-1.5 px-2 py-1.5 rounded-lg bg-[#612A4F]/[0.05] border border-[#612A4F]/10">
          <div className="flex items-center gap-1.5">
            <Camera className="w-3 h-3 text-[#612A4F] flex-shrink-0" />
            <span className="text-[10px] font-semibold text-gray-700 truncate">{shoot.name}</span>
          </div>
          {shoot.locations?.[0]?.name && (
            <p className="text-[9px] text-gray-400 flex items-center gap-0.5 mt-0.5 ml-[18px]">
              <MapPin className="w-2 h-2" />
              {shoot.locations[0].name}
            </p>
          )}
        </div>
      ))}

      {/* Tasks */}
      <div className="flex-1 px-1 pb-2 overflow-y-auto">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map(task => {
            const children = allTasks.filter(t => t.parent_task_id === task.id).sort((a, b) => a.order_index - b.order_index);
            const showInsert = activeId && overId === task.id && activeId !== task.id;
            return (
              <div key={task.id}>
                {showInsert && <div className="h-[1px] bg-[#612A4F] rounded-full mx-1" />}
                <WeekTaskRow
                  task={task}
                  onToggle={onToggle}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onAddSubtask={onAddSubtask}
                  activeId={activeId}
                />
                {children.map(child => (
                  <div key={child.id} className="ml-5 border-l border-gray-200 pl-1.5">
                    <WeekTaskRow
                      task={child}
                      onToggle={onToggle}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      isSubtask
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </SortableContext>

        {/* Add task */}
        {adding ? (
          <div className="flex items-center gap-1.5 px-1.5 py-1 mt-0.5">
            <Plus className="w-3 h-3 text-gray-300 flex-shrink-0" />
            <input
              ref={inputRef}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
                if (e.key === 'Escape') { setInputVal(''); setAdding(false); }
              }}
              onBlur={() => { if (!inputVal.trim()) setAdding(false); }}
              className="flex-1 bg-transparent border-none outline-none text-[11px] text-gray-700 placeholder:text-gray-300 min-w-0"
              placeholder=""
            />
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 px-1.5 py-1 mt-0.5 text-gray-300 hover:text-gray-500 transition-colors w-full"
          >
            <Plus className="w-3 h-3" />
            <span className="text-[10px]">Add task</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ── Week Task Row ──────────────────────────────────────────

const WeekTaskRow: React.FC<{
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onAddSubtask?: (parentId: string, title: string) => void;
  activeId?: string | null;
  isSubtask?: boolean;
}> = ({ task, onToggle, onUpdate, onDelete, onAddSubtask, activeId, isSubtask }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !!isSubtask,
  });

  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(task.title);
  const [addingSub, setAddingSub] = useState(false);
  const [subVal, setSubVal] = useState('');
  const [editingTime, setEditingTime] = useState(false);
  const [startTimeVal, setStartTimeVal] = useState(task.time || '');
  const [endTimeVal, setEndTimeVal] = useState(task.end_time || '');
  const editRef = React.useRef<HTMLInputElement>(null);
  const subRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editing && editRef.current) editRef.current.focus();
  }, [editing]);
  React.useEffect(() => {
    if (addingSub && subRef.current) subRef.current.focus();
  }, [addingSub]);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.15 : 1,
  };

  const saveEdit = () => {
    if (editVal.trim() === '') {
      onDelete(task.id);
    } else {
      const parsed = parseTaskInput(editVal);
      onUpdate(task.id, { title: parsed.title, tag: parsed.tag, time: parsed.time ?? task.time, duration: parsed.duration });
    }
    setEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        className="flex items-center gap-1 px-1 py-1 rounded-md group hover:bg-gray-50 transition-colors"
      >
        {!isSubtask && (
          <span {...listeners} className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <GripVertical className="w-2.5 h-2.5 text-gray-300" />
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <TaskCheckbox checked={task.completed} onChange={() => onToggle(task.id)} size={isSubtask ? 'xs' : 'sm'} />
            {editing ? (
              <input
                ref={editRef}
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); saveEdit(); }
                  if (e.key === 'Escape') { setEditing(false); setEditVal(task.title); }
                }}
                className="flex-1 bg-transparent border-none outline-none text-[11px] text-gray-800 min-w-0"
              />
            ) : (
              <span
                onClick={(e) => { e.stopPropagation(); setEditVal(task.title); setEditing(true); }}
                className={`flex-1 text-[11px] cursor-text truncate ${task.completed ? 'text-gray-300 line-through' : 'text-gray-700'}`}
              >
                {task.title}
              </span>
            )}
          </div>
          {task.time && !editing && !editingTime && (
            <p className="text-[9px] text-gray-400 ml-[22px] mt-0.5">
              {formatTimeShort(task.time)}{task.end_time ? ` – ${formatTimeShort(task.end_time)}` : ''}
            </p>
          )}
        </div>
        {!editing && !editingTime && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                onClick={e => e.stopPropagation()}
                className="p-0.5 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
              >
                <MoreHorizontal className="w-3 h-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="p-1 bg-white rounded-lg border border-gray-200 shadow-lg w-[130px] z-[60]"
              align="end"
              sideOffset={4}
              onOpenAutoFocus={e => e.preventDefault()}
            >
              <button
                onClick={e => { e.stopPropagation(); setStartTimeVal(task.time || ''); setEndTimeVal(task.end_time || ''); setEditingTime(true); }}
                className="w-full text-left px-2.5 py-1.5 text-[11px] text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2 transition-colors"
              >
                <Clock className="w-3 h-3 text-gray-400" />
                Set time
              </button>
              {onAddSubtask && !isSubtask && (
                <button
                  onClick={e => { e.stopPropagation(); setAddingSub(true); }}
                  className="w-full text-left px-2.5 py-1.5 text-[11px] text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-3 h-3 text-gray-400" />
                  Add subtask
                </button>
              )}
              <button
                onClick={e => { e.stopPropagation(); onDelete(task.id); }}
                className="w-full text-left px-2.5 py-1.5 text-[11px] text-red-500 hover:bg-red-50 rounded flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </PopoverContent>
          </Popover>
        )}
      </div>
      {addingSub && onAddSubtask && (
        <div className="flex items-center gap-1.5 px-1.5 py-0.5 ml-3">
          <Plus className="w-2.5 h-2.5 text-gray-300 flex-shrink-0" />
          <input
            ref={subRef}
            value={subVal}
            onChange={e => setSubVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); if (subVal.trim()) { onAddSubtask(task.id, subVal.trim()); setSubVal(''); } }
              if (e.key === 'Escape') { setSubVal(''); setAddingSub(false); }
            }}
            onBlur={() => { if (!subVal.trim()) setAddingSub(false); }}
            className="flex-1 bg-transparent border-none outline-none text-[10px] text-gray-500 placeholder:text-gray-300 min-w-0"
            placeholder="Subtask..."
          />
        </div>
      )}
      {editingTime && (
        <div className="px-1 py-1.5">
          <div className="flex flex-col gap-1">
            <WeekTimePicker label="Start" value={startTimeVal} onChange={setStartTimeVal} />
            <WeekTimePicker label="End" value={endTimeVal} onChange={setEndTimeVal} allowClear />
          </div>
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <button
              onClick={() => {
                onUpdate(task.id, { time: startTimeVal || null, end_time: endTimeVal && endTimeVal.includes(':') ? endTimeVal : null });
                setEditingTime(false);
              }}
              className="text-[9px] font-medium text-white bg-[#612A4F] hover:bg-[#7a3563] rounded-md px-2 py-0.5 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setEditingTime(false)}
              className="text-[9px] text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Compact Time Picker for Week View ──

const WeekTimePicker: React.FC<{ label: string; value: string; onChange: (v: string) => void; allowClear?: boolean }> = ({ label, value, onChange, allowClear }) => {
  const isEmpty = !value || !value.includes(':');
  const { hour, minute, period } = parse24to12(value);
  const setHour = (h: number) => { if (h === 0 && allowClear) { onChange(''); return; } onChange(to24(h, isEmpty ? 0 : minute, isEmpty ? 'AM' : period)); };
  const setMinute = (m: number) => onChange(to24(hour, m, period));
  const setPeriod = (p: 'AM' | 'PM') => onChange(to24(hour, minute, p));

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
  const selClass = "appearance-none text-[10px] text-gray-700 bg-white border border-gray-200 rounded-md px-1 py-0.5 outline-none focus:border-[#612A4F] cursor-pointer w-[36px]";

  return (
    <div className="flex items-center gap-0.5">
      <span className="text-[9px] text-gray-400 font-medium w-[26px]">{label}</span>
      <select value={isEmpty ? '' : hour} onChange={e => setHour(Number(e.target.value))} className={selClass}>
        {allowClear && <option value={0}>—</option>}
        {hours.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
      </select>
      <span className="text-[9px] text-gray-400">:</span>
      <select value={minute} onChange={e => setMinute(Number(e.target.value))} className={selClass}>
        {minutes.map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
      </select>
      <button
        onClick={() => setPeriod('AM')}
        className={`text-[8px] font-semibold px-0.5 ${period === 'AM' ? 'text-[#612A4F]' : 'text-gray-300'}`}
      >AM</button>
      <button
        onClick={() => setPeriod('PM')}
        className={`text-[8px] font-semibold px-0.5 ${period === 'PM' ? 'text-[#612A4F]' : 'text-gray-300'}`}
      >PM</button>
    </div>
  );
};

export default WeekView;
