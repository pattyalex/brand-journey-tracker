import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Archive } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import { Post, getPillarStyle } from '@/types/posts';
import PostCard from './PostCard';

interface PostsCalendarViewProps {
  posts: Post[];
  allPosts: Post[]; // unfiltered, to count unscheduled
  onClickPost: (post: Post) => void;
  onUpdatePost: (id: string, updates: Partial<Post>) => void;
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

  // Padding from previous month
  const prevMonthLast = new Date(year, month, 0).getDate();
  for (let i = startPad - 1; i >= 0; i--) {
    const d = prevMonthLast - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    days.push({
      date: formatDateKey(prevYear, prevMonth, d),
      day: d,
      isCurrentMonth: false,
    });
  }

  // Current month
  for (let d = 1; d <= totalDays; d++) {
    days.push({ date: formatDateKey(year, month, d), day: d, isCurrentMonth: true });
  }

  // Padding to fill last row
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
  onCreateOnDate,
  onSwitchToList,
}) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const days = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const scheduledPosts = useMemo(
    () => posts.filter(p => p.scheduledDate),
    [posts]
  );

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

  const unscheduledCount = useMemo(
    () => allPosts.filter(p => !p.scheduledDate).length,
    [allPosts]
  );

  const activePost = activeId ? posts.find(p => p.id === activeId) : null;

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
    // Validate it looks like a date
    if (/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      onUpdatePost(postId, { scheduledDate: newDate });
    }
  };

  const hasPostsThisMonth = scheduledPosts.some(p => {
    if (!p.scheduledDate) return false;
    const [y, m] = p.scheduledDate.split('-').map(Number);
    return y === viewYear && m === viewMonth + 1;
  });

  return (
    <div>
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
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
              onClickEmpty={() => onCreateOnDate(date)}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
          {activePost && (
            <div className="opacity-80 scale-105">
              <PostCard post={activePost} variant="calendar" onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Empty month state */}
      {!hasPostsThisMonth && (
        <div className="flex flex-col items-center py-8 text-center">
          <p className="text-xs text-gray-400 italic">No posts scheduled this month</p>
        </div>
      )}

      {/* Unscheduled banner */}
      {unscheduledCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-lg"
        >
          <Archive className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500">
            {unscheduledCount} unscheduled post{unscheduledCount !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onSwitchToList}
            className="text-xs font-medium text-[#612a4f] hover:underline transition-colors duration-150"
          >
            view in List
          </button>
        </motion.div>
      )}
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
  onClickEmpty: () => void;
}

const CalendarCell: React.FC<CalendarCellProps> = ({
  date,
  day,
  isCurrentMonth,
  isToday,
  posts,
  onClickPost,
  onClickEmpty,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: date });

  return (
    <div
      ref={setNodeRef}
      onClick={() => { if (posts.length === 0) onClickEmpty(); }}
      className="border-r border-b border-gray-100 min-h-[90px] p-1 cursor-pointer transition-colors duration-150"
      style={{
        backgroundColor: isOver
          ? 'rgba(97, 42, 79, 0.04)'
          : isCurrentMonth
          ? 'white'
          : '#FAFAFA',
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
          <DraggableCalendarCard key={post.id} post={post} onClick={onClickPost} />
        ))}
      </div>
    </div>
  );
};

// ── Draggable Calendar Card ──────────────────────────────────

import { useDraggable } from '@dnd-kit/core';

const DraggableCalendarCard: React.FC<{ post: Post; onClick: (post: Post) => void }> = ({ post, onClick }) => {
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
      <PostCard post={post} variant="calendar" onClick={onClick} />
    </div>
  );
};

export default PostsCalendarView;
