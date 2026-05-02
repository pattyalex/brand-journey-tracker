import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ImageIcon, AlertTriangle } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { Post, STATUS_COLORS } from '@/types/posts';
import { StatusIcon } from '@/components/posts/StatusDropdown';

interface ScheduleCalendarProps {
  posts: Post[];
  onClickPost: (post: Post) => void;
  onClickEmptyDate: (date: string) => void;
  onHover: (id: string | null) => void;
  hoveredId: string | null;
  draggingId: string | null;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

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

function isWithin48Hours(dateStr: string, timeStr?: string): boolean {
  const now = new Date();
  const scheduled = new Date(`${dateStr}T${timeStr || '00:00'}:00`);
  const diff = scheduled.getTime() - now.getTime();
  return diff > 0 && diff <= 48 * 60 * 60 * 1000;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  posts,
  onClickPost,
  onClickEmptyDate,
  onHover,
  hoveredId,
  draggingId,
}) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const days = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const postsByDate = useMemo(() => {
    const map: Record<string, Post[]> = {};
    posts.forEach(p => {
      if (p.scheduledDate) {
        if (!map[p.scheduledDate]) map[p.scheduledDate] = [];
        map[p.scheduledDate].push(p);
      }
    });
    return map;
  }, [posts]);

  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const goToday = () => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); };

  const scheduledCount = posts.filter(p => p.scheduledDate).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider">Content Calendar</span>
            <span className="text-[11px] text-gray-500 ml-1">— {monthLabel}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">Your publishing schedule at a glance.</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={goToday} className="px-2 py-0.5 text-[10px] font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded hover:bg-gray-50 transition-colors mr-1">
            Today
          </button>
          <button onClick={goPrev} className="p-1 rounded hover:bg-gray-100 text-gray-400 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={goNext} className="p-1 rounded hover:bg-gray-100 text-gray-400 transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider py-1.5">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 border-l border-gray-100 h-full" style={{ gridAutoRows: 'minmax(90px, 1fr)' }}>
          {days.map(({ date, day, isCurrentMonth }, i) => (
            <CalendarDateCell
              key={date}
              date={date}
              day={day}
              isCurrentMonth={isCurrentMonth}
              isToday={date === todayKey}
              posts={postsByDate[date] || []}
              onClickPost={onClickPost}
              onClickEmpty={() => onClickEmptyDate(date)}
              onHover={onHover}
              hoveredId={hoveredId}
              draggingId={draggingId}
              staggerIndex={i}
            />
          ))}
        </div>
      </div>

      {/* Empty state */}
      {scheduledCount === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '120px' }}>
          <p className="text-sm text-gray-300 text-center">
            Drag posts here to schedule them
          </p>
        </div>
      )}
    </div>
  );
};

// ── Calendar Date Cell ────────────────────────────────────────

interface CalendarDateCellProps {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  posts: Post[];
  onClickPost: (post: Post) => void;
  onClickEmpty: () => void;
  onHover: (id: string | null) => void;
  hoveredId: string | null;
  draggingId: string | null;
  staggerIndex: number;
}

const CalendarDateCell: React.FC<CalendarDateCellProps> = ({
  date,
  day,
  isCurrentMonth,
  isToday,
  posts,
  onClickPost,
  onClickEmpty,
  onHover,
  hoveredId,
  draggingId,
  staggerIndex,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: `cal-${date}` });

  return (
    <div
      ref={setNodeRef}
      onClick={() => { if (posts.length === 0) onClickEmpty(); }}
      className={`border-r border-b border-gray-100 p-1 cursor-pointer transition-colors duration-150 ${
        isCurrentMonth ? 'bg-white' : 'bg-gray-50/50'
      }`}
      style={{
        backgroundColor: isOver ? 'rgba(97, 42, 79, 0.04)' : undefined,
        outline: isOver ? '1.5px solid rgba(97, 42, 79, 0.2)' : 'none',
        outlineOffset: '-1px',
        borderRadius: isOver ? '4px' : '0',
      }}
    >
      <div className="flex justify-end mb-0.5">
        <span
          className="text-[11px] tabular-nums leading-none px-1 py-0.5 rounded-full"
          style={{
            color: isToday ? 'white' : isCurrentMonth ? '#1f2937' : '#9ca3af',
            backgroundColor: isToday ? '#612A4F' : 'transparent',
            fontWeight: isToday ? 600 : 400,
          }}
        >
          {day}
        </span>
      </div>
      <div className="space-y-0.5">
        {posts.map((post, i) => {
          const isPostHovered = hoveredId === post.id;
          const missingAssets = isWithin48Hours(post.scheduledDate!, post.scheduled_time) && (!post.attachedFiles || post.attachedFiles.length === 0);

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: draggingId === post.id ? 0.3 : 1, y: 0 }}
              transition={{ duration: 0.2, delay: staggerIndex * 0.015 }}
              onClick={e => { e.stopPropagation(); onClickPost(post); }}
              onMouseEnter={() => onHover(post.id)}
              onMouseLeave={() => onHover(null)}
              className={`flex items-center gap-1 rounded px-1 py-0.5 transition-all duration-150 hover:bg-gray-50 ${
                isPostHovered ? 'ring-1 ring-[#612A4F]/20 bg-[#612A4F]/[0.03]' : ''
              }`}
            >
              {post.thumbnail_url ? (
                <img src={post.thumbnail_url} alt="" className="w-5 h-5 rounded-sm object-cover flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-sm bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-2.5 h-2.5 text-gray-300" />
                </div>
              )}
              <span className="text-[11px] text-gray-800 truncate flex-1">{post.title}</span>
              {post.scheduled_time && (
                <span className="text-[10px] text-gray-500 flex-shrink-0">{formatTime12(post.scheduled_time)}</span>
              )}
              {missingAssets && (
                <AlertTriangle className="w-2.5 h-2.5 text-amber-500 flex-shrink-0" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

function formatTime12(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'p' : 'a';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}${ampm}`;
}

export default ScheduleCalendar;
