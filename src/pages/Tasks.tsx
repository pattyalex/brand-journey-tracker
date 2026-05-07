import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ChevronRight, ChevronLeft, Camera, MapPin, CalendarDays, List } from 'lucide-react';
import { Task, DailyNote } from '@/types/tasks';
import { Shoot } from '@/types/shoots';
import { getJSON, setJSON } from '@/lib/storage';
import { getSeedTasks, getSeedDailyNote } from '@/data/tasksSeedData';
import { useAuth } from '@/contexts/AuthContext';
import * as tasksApi from '@/services/tasksService';
import { parseTaskInput } from '@/lib/taskParser';
import DayHeader from '@/components/tasks/DayHeader';
import TaskList from '@/components/tasks/TaskList';
import NotesArea from '@/components/tasks/NotesArea';
import ToDoSoonSection from '@/components/tasks/ToDoSoonSection';
import TagSummary from '@/components/tasks/TagSummary';
import WeekView from '@/components/tasks/WeekView';

type TaskViewMode = 'day' | 'week';

const TASKS_KEY = 'meg_tasks';
const NOTES_KEY = 'meg_daily_notes';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseDateForHeader(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isValidDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

const Tasks: React.FC = () => {
  const { date: dateParam } = useParams<{ date?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const today = todayStr();
  const currentDate = dateParam && isValidDate(dateParam) ? dateParam : today;

  useEffect(() => {
    if (!dateParam || !isValidDate(dateParam)) {
      navigate(`/tasks/${today}`, { replace: true });
    }
  }, [dateParam, today, navigate]);

  // State
  const [allTasks, setAllTasks] = useState<Task[]>(() => {
    const saved = getJSON<Task[] | null>(TASKS_KEY, null);
    return saved && saved.length > 0 ? saved : getSeedTasks();
  });

  const [allNotes, setAllNotes] = useState<DailyNote[]>(() => {
    const saved = getJSON<DailyNote[] | null>(NOTES_KEY, null);
    if (saved && saved.length > 0) return saved;
    return [getSeedDailyNote()];
  });

  const [showCompleted, setShowCompleted] = useState(true);
  const [soonCollapsed, setSoonCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<TaskViewMode>('day');

  // Week dates: Monday to Sunday of the current week
  const weekDates = useMemo(() => {
    const d = new Date(currentDate.replace(/-/g, '/'));
    const day = d.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + mondayOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    });
  }, [currentDate]);

  // Load shoots for the current day
  const dayShoots = useMemo(() => {
    const allShoots = getJSON<Shoot[]>('meg_shoots', []);
    return allShoots.filter(s => s.date === currentDate && s.status !== 'Archived');
  }, [currentDate]);

  // Load from Supabase on mount
  useEffect(() => {
    if (!userId) return;
    tasksApi.fetchTasks(userId).then(remote => {
      if (remote.length > 0) {
        setAllTasks(remote);
      } else {
        const local = getJSON<Task[] | null>(TASKS_KEY, null);
        if (local && local.length > 0) {
          tasksApi.upsertTasks(local, userId).catch(console.error);
        }
      }
    }).catch(err => {
      console.error('[Tasks] Failed to load from Supabase:', err);
    });

    tasksApi.fetchDailyNotes(userId).then(remote => {
      if (remote.length > 0) {
        setAllNotes(remote);
      } else {
        const local = getJSON<DailyNote[] | null>(NOTES_KEY, null);
        if (local && local.length > 0) {
          local.forEach(n => tasksApi.upsertDailyNote(n, userId).catch(console.error));
        }
      }
    }).catch(err => {
      console.error('[Tasks] Failed to load daily notes from Supabase:', err);
    });
  }, [userId]);

  // Persist to localStorage (cache)
  useEffect(() => { setJSON(TASKS_KEY, allTasks); }, [allTasks]);
  useEffect(() => { setJSON(NOTES_KEY, allNotes); }, [allNotes]);

  // Debounced sync to Supabase (tasks change frequently via reorder, indent, etc.)
  const syncTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!userId) return;
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      tasksApi.upsertTasks(allTasks, userId).catch(console.error);
    }, 1500);
    return () => clearTimeout(syncTimer.current);
  }, [allTasks, userId]);

  // Sync notes to Supabase on change
  const noteSyncTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!userId) return;
    clearTimeout(noteSyncTimer.current);
    noteSyncTimer.current = setTimeout(() => {
      allNotes.forEach(n => tasksApi.upsertDailyNote(n, userId).catch(console.error));
    }, 1500);
    return () => clearTimeout(noteSyncTimer.current);
  }, [allNotes, userId]);

  // Derived
  const dayTasks = useMemo(() =>
    allTasks.filter(t => t.date === currentDate),
    [allTasks, currentDate]
  );

  const backlogTasks = useMemo(() =>
    allTasks.filter(t => t.date === 'backlog' && !t.parent_task_id)
      .sort((a, b) => a.order_index - b.order_index),
    [allTasks]
  );

  const dayNote = useMemo(() =>
    allNotes.find(n => n.date === currentDate),
    [allNotes, currentDate]
  );

  // Navigation
  const goToDate = useCallback((d: string) => navigate(`/tasks/${d}`), [navigate]);
  const goPrev = useCallback(() => goToDate(shiftDate(currentDate, -1)), [currentDate, goToDate]);
  const goNext = useCallback(() => goToDate(shiftDate(currentDate, 1)), [currentDate, goToDate]);
  const goToday = useCallback(() => goToDate(todayStr()), [goToDate]);

  // Day task handlers
  const handleToggle = useCallback((id: string) => {
    setAllTasks(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed, updated_at: new Date().toISOString() } : t
    ));
  }, []);

  const handleUpdate = useCallback((id: string, updates: Partial<Task>) => {
    setAllTasks(prev => prev.map(t =>
      t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
    ));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setAllTasks(prev => prev.filter(t => t.id !== id && t.parent_task_id !== id));
  }, []);

  const handleAdd = useCallback((title: string, time: string | null, end_time: string | null, duration: string | null, tag: string | null) => {
    const maxOrder = dayTasks.reduce((max, t) => Math.max(max, t.order_index), -1);
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      date: currentDate,
      time,
      end_time,
      duration,
      tag,
      completed: false,
      parent_task_id: null,
      order_index: maxOrder + 1,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAllTasks(prev => [...prev, newTask]);
  }, [currentDate, dayTasks]);

  const handleReorder = useCallback((reorderedTasks: Task[]) => {
    setAllTasks(reorderedTasks);
  }, []);

  const handleIndent = useCallback((id: string) => {
    setAllTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task || task.parent_task_id) return prev;

      const sameDayParents = prev
        .filter(t => t.date === task.date && !t.parent_task_id && t.id !== id)
        .sort((a, b) => a.order_index - b.order_index);

      const candidates = sameDayParents.filter(t => t.order_index < task.order_index);
      const parent = candidates[candidates.length - 1];
      if (!parent) return prev;

      if (prev.some(t => t.parent_task_id === parent.id && prev.some(gc => gc.parent_task_id === t.id))) {
        return prev;
      }

      const parentChildren = prev.filter(t => t.parent_task_id === parent.id);
      return prev.map(t =>
        t.id === id
          ? { ...t, parent_task_id: parent.id, order_index: parentChildren.length, updated_at: new Date().toISOString() }
          : t
      );
    });
  }, []);

  const handleOutdent = useCallback((id: string) => {
    setAllTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task || !task.parent_task_id) return prev;

      const parent = prev.find(t => t.id === task.parent_task_id);
      if (!parent) return prev;

      return prev.map(t =>
        t.id === id
          ? { ...t, parent_task_id: parent.parent_task_id, order_index: parent.order_index + 0.5, updated_at: new Date().toISOString() }
          : t
      );
    });
  }, []);

  const handleAddSubtask = useCallback((parentId: string, title: string) => {
    setAllTasks(prev => {
      const siblings = prev.filter(t => t.parent_task_id === parentId);
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        date: currentDate,
        time: null,
        end_time: null,
        duration: null,
        tag: null,
        completed: false,
        parent_task_id: parentId,
        order_index: siblings.length,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return [...prev, newTask];
    });
  }, [currentDate]);

  // Week view: add task to a specific date
  const handleAddTaskForDate = useCallback((title: string, date: string) => {
    const dateTasks = allTasks.filter(t => t.date === date);
    const maxOrder = dateTasks.reduce((max, t) => Math.max(max, t.order_index), -1);
    const parsed = parseTaskInput(title);
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: parsed.title,
      date,
      time: parsed.time,
      end_time: parsed.end_time,
      duration: parsed.duration,
      tag: parsed.tag,
      completed: false,
      parent_task_id: null,
      order_index: maxOrder + 1,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAllTasks(prev => [...prev, newTask]);
  }, [allTasks]);

  // Week navigation
  const goPrevWeek = useCallback(() => goToDate(shiftDate(currentDate, -7)), [currentDate, goToDate]);
  const goNextWeek = useCallback(() => goToDate(shiftDate(currentDate, 7)), [currentDate, goToDate]);

  // Backlog handlers
  const handleMoveBacklogToToday = useCallback((id: string) => {
    setAllTasks(prev => {
      const maxOrder = prev.filter(t => t.date === currentDate).reduce((max, t) => Math.max(max, t.order_index), -1);
      return prev.map(t =>
        t.id === id ? { ...t, date: currentDate, order_index: maxOrder + 1, updated_at: new Date().toISOString() } : t
      );
    });
  }, [currentDate]);

  const handleAddBacklog = useCallback((title: string, tag: string | null) => {
    const maxOrder = backlogTasks.reduce((max, t) => Math.max(max, t.order_index), -1);
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      date: 'backlog',
      time: null,
      end_time: null,
      duration: null,
      tag,
      completed: false,
      parent_task_id: null,
      order_index: maxOrder + 1,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAllTasks(prev => [...prev, newTask]);
  }, [backlogTasks]);

  const handleToggleBacklog = useCallback((id: string) => {
    setAllTasks(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed, updated_at: new Date().toISOString() } : t
    ));
  }, []);

  const handleDeleteBacklog = useCallback((id: string) => {
    setAllTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleNotesChange = useCallback((content: string) => {
    setAllNotes(prev => {
      const existing = prev.find(n => n.date === currentDate);
      if (existing) {
        return prev.map(n => n.date === currentDate ? { ...n, content, updated_at: new Date().toISOString() } : n);
      }
      return [...prev, { id: `note-${Date.now()}`, date: currentDate, content, updated_at: new Date().toISOString() }];
    });
  }, [currentDate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goPrev, goNext]);

  // Week header label
  const weekLabel = useMemo(() => {
    if (weekDates.length < 7) return '';
    const start = parseDateForHeader(weekDates[0]);
    const end = parseDateForHeader(weekDates[6]);
    const sMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const eMonth = end.toLocaleDateString('en-US', { month: 'short' });
    if (sMonth === eMonth) {
      return `${sMonth} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${sMonth} ${start.getDate()} – ${eMonth} ${end.getDate()}, ${end.getFullYear()}`;
  }, [weekDates]);

  return (
    <div className="h-full overflow-hidden bg-white relative">
      <div className="h-full flex">
      {/* Left: Tasks area */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto flex flex-col">
        {/* View toggle */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2 flex-shrink-0">
          {viewMode === 'week' ? (
            <div className="flex items-center gap-0.5">
              <button onClick={goPrevWeek} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[13px] font-medium text-gray-600 min-w-[160px] text-center">{weekLabel}</span>
              <button onClick={goNextWeek} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={goToday} className="ml-1 px-2 py-1 text-[11px] font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
                Today
              </button>
            </div>
          ) : (
            <div />
          )}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                viewMode === 'day' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="w-3 h-3" />
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                viewMode === 'week' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <CalendarDays className="w-3 h-3" />
              Week
            </button>
          </div>
        </div>

        {viewMode === 'day' ? (
        <div className="flex-1 overflow-y-auto">
        <div className="max-w-[760px] mx-auto px-6 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDate}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <DayHeader
                date={currentDate}
                onPrev={goPrev}
                onNext={goNext}
                onToday={goToday}
              />

              {/* Shoot banners for this day */}
              {dayShoots.map(shoot => (
                <div
                  key={shoot.id}
                  className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl bg-[#612A4F]/[0.05] border border-[#612A4F]/10"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#612A4F]/10 flex items-center justify-center flex-shrink-0">
                    <Camera className="w-4 h-4 text-[#612A4F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800">{shoot.name}</p>
                    {shoot.locations?.[0]?.name && (
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        {shoot.locations[0].name}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-[#612A4F]/60 uppercase tracking-wider flex-shrink-0">Shoot day</span>
                </div>
              ))}

              {dayTasks.some(t => t.completed) && (
                <div className="flex justify-end mb-3">
                  <button
                    onClick={() => setShowCompleted(prev => !prev)}
                    className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showCompleted ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {showCompleted ? 'Hide completed' : 'Show completed'}
                  </button>
                </div>
              )}

              <TaskList
                tasks={dayTasks}
                date={currentDate}
                showCompleted={showCompleted}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onAdd={handleAdd}
                onReorder={handleReorder}
                onIndent={handleIndent}
                onOutdent={handleOutdent}
                onAddSubtask={handleAddSubtask}
              />

            </motion.div>
          </AnimatePresence>
        </div>
        </div>
        ) : (
        <div className="flex-1 overflow-hidden px-2 pb-4">
          <WeekView
            weekDates={weekDates}
            allTasks={allTasks}
            today={today}
            currentDate={currentDate}
            onToggle={handleToggle}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onAddTask={handleAddTaskForDate}
            onReorder={handleReorder}
            onDayClick={(date) => { goToDate(date); setViewMode('day'); }}
            onAddSubtask={handleAddSubtask}
          />
        </div>
        )}
      </div>

      {/* Right: To do soon sidebar — 1/4 width, collapsible */}
      <div
        className="h-full flex-shrink-0 border-l border-gray-100 transition-all duration-300 ease-out"
        style={{
          width: soonCollapsed ? 0 : '22%',
          minWidth: soonCollapsed ? 0 : 260,
          opacity: soonCollapsed ? 0 : 1,
          overflow: soonCollapsed ? 'hidden' : 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'transparent transparent',
        }}
        onMouseEnter={e => { e.currentTarget.style.scrollbarColor = 'rgba(0,0,0,0.15) transparent'; }}
        onMouseLeave={e => { e.currentTarget.style.scrollbarColor = 'transparent transparent'; }}
      >
        <div className="px-5 pt-[76px] pb-8">
          <ToDoSoonSection
            tasks={backlogTasks}
            onMoveToToday={handleMoveBacklogToToday}
            onAdd={handleAddBacklog}
            onToggle={handleToggleBacklog}
            onDelete={handleDeleteBacklog}
            onRemoveTag={(id: string) => handleUpdate(id, { tag: null })}
            showCompleted={showCompleted}
          />
          <TagSummary tasks={dayTasks} />
        </div>
      </div>
      </div>

      {/* Collapse/expand toggle */}
      <div
        className="absolute top-[78px] group transition-all duration-300 ease-out z-20"
        style={{ right: soonCollapsed ? 12 : 'calc(22% - 12px)' }}
      >
        <button
          onClick={() => setSoonCollapsed(prev => !prev)}
          className="w-[22px] h-[22px] flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 shadow-sm transition-colors"
        >
          {soonCollapsed ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
        <div className="absolute right-0 top-[calc(100%+6px)] px-2.5 py-1 rounded-md bg-gray-500 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-100 pointer-events-none">
          {soonCollapsed ? 'Show To Do Soon' : 'Hide To Do Soon'}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
