import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, CalendarPlus } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { Post, getPillarStyle } from '@/types/posts';
import PostCard from './PostCard';

interface PostsCalendarViewProps {
  posts: Post[];
  allPosts: Post[];
  pillars: string[];
  onClickPost: (post: Post) => void;
  onUpdatePost: (id: string, updates: Partial<Post>) => void;
  onSendToSchedule?: (id: string) => void;
  onCreateOnDate: (date: string) => void;
  onSwitchToList: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];

  const prevMonthLast = new Date(year, month, 0).getDate();
  for (let i = startPad - 1; i >= 0; i--) {
    const d = prevMonthLast - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    days.push({ date: formatDateKey(prevYear, prevMonth, d), day: d, isCurrentMonth: false });
  }

  for (let d = 1; d <= totalDays; d++) {
    days.push({ date: formatDateKey(year, month, d), day: d, isCurrentMonth: true });
  }

  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: formatDateKey(nextYear, nextMonth, d), day: d, isCurrentMonth: false });
    }
  }

  return days;
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const PostsCalendarView: React.FC<PostsCalendarViewProps> = ({
  posts,
  allPosts,
  onClickPost,
  onUpdatePost,
  onSendToSchedule,
  onCreateOnDate,
  onSwitchToList,
}) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const days = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const scheduledPosts = useMemo(() => posts.filter(p => p.scheduledDate), [posts]);

  const unscheduledPosts = useMemo(() => allPosts.filter(p => !p.scheduledDate), [allPosts]);


  const postsByDate = useMemo(() => {
    const map: Record<string, Post[]> = {};
    scheduledPosts.forEach(p => {
      if (p.scheduledDate) {
        if (!map[p.scheduledDate]) map[p.scheduledDate] = [];
        map[p.scheduledDate].push(p);
      }
    });
    return map;
  }, [scheduledPosts]);

  const activePost = activeId ? allPosts.find(p => p.id === activeId) : null;

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const goToday = () => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); };
  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const postId = active.id as string;
    const newDate = over.id as string;
    if (/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      onUpdatePost(postId, { scheduledDate: newDate });
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4">
        {/* No date yet sidebar */}
        {unscheduledPosts.length > 0 && (
          <div
            className="flex-shrink-0 transition-all duration-300 ease-in-out"
            style={{ width: sidebarOpen ? '20%' : '40px', minWidth: sidebarOpen ? '200px' : '40px', maxWidth: sidebarOpen ? '280px' : '40px' }}
          >
            {sidebarOpen ? (
              <div className="bg-gray-50/80 rounded-lg border border-gray-100 h-full">
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <CalendarPlus className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">No date yet</span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-0.5 rounded hover:bg-gray-200/60 text-gray-400 hover:text-gray-600 transition-colors duration-150"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="overflow-y-auto p-2 space-y-1.5" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                  {unscheduledPosts.map(post => (
                    <DraggableSidebarCard key={post.id} post={post} onClick={onClickPost} />
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-10 h-full bg-gray-50/80 rounded-lg border border-gray-100 flex flex-col items-center pt-3 gap-1 hover:bg-gray-100/60 transition-colors duration-150"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[9px] font-semibold text-gray-400 writing-vertical" style={{ writingMode: 'vertical-lr' }}>
                  {unscheduledPosts.length} unscheduled
                </span>
                <ChevronRight className="w-3 h-3 text-gray-400 mt-1" />
              </button>
            )}
          </div>
        )}

        {/* Calendar */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button onClick={goPrev} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors duration-150">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-gray-800 min-w-[140px] text-center">{monthLabel}</span>
              <button onClick={goNext} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors duration-150">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={goToday}
              className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors duration-150"
            >
              Today
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-medium text-gray-400 uppercase tracking-wider py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 border-t border-l border-gray-100">
            {days.map(({ date, day, isCurrentMonth }) => (
              <CalendarCell
                key={date}
                date={date}
                day={day}
                isCurrentMonth={isCurrentMonth}
                isToday={date === todayKey}
                posts={postsByDate[date] || []}
                onClickPost={onClickPost}
                onSendToSchedule={onSendToSchedule}
                onClickEmpty={() => onCreateOnDate(date)}
              />
            ))}
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
        {activePost && (
          <div className="opacity-90 scale-105 shadow-lg rounded">
            <PostCard post={activePost} variant="calendar" onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

// ── Pillar Group in Sidebar ──────────────────────────────────

const PillarGroup: React.FC<{ pillar: string; posts: Post[]; onClickPost: (post: Post) => void }> = ({ pillar, posts, onClickPost }) => {
  const [expanded, setExpanded] = useState(true);
  const style = getPillarStyle(pillar);

  return (
    <div>
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-1.5 w-full px-1 py-1 rounded hover:bg-gray-100/60 transition-colors duration-150"
      >
        <span className="text-[11px] font-semibold text-gray-600 flex-1 text-left truncate">{pillar}</span>
        {expanded ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pt-1">
              {posts.map(post => (
                <DraggableSidebarCard key={post.id} post={post} onClick={onClickPost} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Draggable Sidebar Card ───────────────────────────────────

const DraggableSidebarCard: React.FC<{ post: Post; onClick: (post: Post) => void }> = ({ post, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: post.id });
  const pillarStyle = getPillarStyle(post.pillar);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        opacity: isDragging ? 0.3 : 1,
      }}
      {...attributes}
      {...listeners}
      onClick={() => onClick(post)}
      className="px-2 py-1.5 rounded-md bg-white border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all duration-150 group"
    >
      <p className="text-[11px] font-medium text-gray-800 truncate">{post.title}</p>
      <div className="flex items-center justify-between mt-0.5">
        <span className="text-[9px] text-gray-400">{post.format || 'No format'}</span>
        <span className="text-[9px] text-gray-400">{post.status}</span>
      </div>
    </div>
  );
};

// ── Calendar Cell ────────────────────────────────────────────

interface CalendarCellProps {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  posts: Post[];
  onClickPost: (post: Post) => void;
  onSendToSchedule?: (id: string) => void;
  onClickEmpty: () => void;
}

const CalendarCell: React.FC<CalendarCellProps> = ({
  date,
  day,
  isCurrentMonth,
  isToday,
  posts,
  onClickPost,
  onSendToSchedule,
  onClickEmpty,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: date });
  const [hovered, setHovered] = useState(false);

  const bg = isOver
    ? 'rgba(0, 0, 0, 0.04)'
    : hovered
    ? 'rgba(0, 0, 0, 0.02)'
    : isCurrentMonth
    ? 'white'
    : '#FAFAFA';

  return (
    <div
      ref={setNodeRef}
      onClick={() => { if (posts.length === 0) onClickEmpty(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="border-r border-b border-gray-100 min-h-[105px] p-1 cursor-pointer transition-colors duration-150"
      style={{
        backgroundColor: bg,
        outline: isOver ? '1px solid rgba(0, 0, 0, 0.15)' : 'none',
        outlineOffset: '-2px',
        borderRadius: isOver ? '4px' : '0',
      }}
    >
      <div className="flex justify-end mb-0.5">
        <span
          className="text-[11px] tabular-nums leading-none px-1 py-0.5 rounded-full"
          style={{
            color: isToday ? 'white' : isCurrentMonth ? '#374151' : '#D1D5DB',
            backgroundColor: isToday ? '#612a4f' : 'transparent',
            fontWeight: isToday ? 600 : 400,
          }}
        >
          {day}
        </span>
      </div>
      <div className="space-y-0.5">
        {posts.map(post => (
          <DraggableCalendarCard key={post.id} post={post} onClick={onClickPost} onSendToSchedule={onSendToSchedule} />
        ))}
      </div>
    </div>
  );
};

// ── Draggable Calendar Card ──────────────────────────────────

const DraggableCalendarCard: React.FC<{ post: Post; onClick: (post: Post) => void; onSendToSchedule?: (id: string) => void }> = ({ post, onClick, onSendToSchedule }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: post.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        opacity: isDragging ? 0.3 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <PostCard post={post} variant="calendar" onClick={onClick} onSendToSchedule={onSendToSchedule} />
    </div>
  );
};

export default PostsCalendarView;
