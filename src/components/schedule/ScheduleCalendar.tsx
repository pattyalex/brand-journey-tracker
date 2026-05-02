import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ImageIcon, AlertTriangle, Clock } from 'lucide-react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Post } from '@/types/posts';

interface ScheduleCalendarProps {
  posts: Post[];
  onClickPost: (post: Post) => void;
  onClickEmptyDate: (date: string) => void;
  onEditTime: (postId: string) => void;
  onHover: (id: string | null) => void;
  hoveredId: string | null;
  draggingId: string | null;
}

type CalendarView = 'month' | 'week';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function dateToKey(d: Date): string {
  return formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
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

function getWeekDays(baseDate: Date): { date: string; day: number; month: number; year: number; isCurrentMonth: boolean }[] {
  const start = new Date(baseDate);
  start.setDate(start.getDate() - start.getDay()); // Sunday
  const days: { date: string; day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      date: dateToKey(d),
      day: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
      isCurrentMonth: d.getMonth() === baseDate.getMonth(),
    });
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
  onEditTime,
  onHover,
  hoveredId,
  draggingId,
}) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [calView, setCalView] = useState<CalendarView>('month');
  const [weekBase, setWeekBase] = useState(today);

  const monthDays = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const weekDays = useMemo(() => getWeekDays(weekBase), [weekBase]);
  const todayKey = dateToKey(today);

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekLabel = (() => {
    const days = getWeekDays(weekBase);
    const start = new Date(days[0].year, days[0].month, days[0].day);
    const end = new Date(days[6].year, days[6].month, days[6].day);
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(start)} — ${fmt(end)}, ${end.getFullYear()}`;
  })();

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

  // Month navigation
  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Week navigation
  const goPrevWeek = () => {
    const d = new Date(weekBase);
    d.setDate(d.getDate() - 7);
    setWeekBase(d);
  };
  const goNextWeek = () => {
    const d = new Date(weekBase);
    d.setDate(d.getDate() + 7);
    setWeekBase(d);
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setWeekBase(today);
  };

  const goPrev = calView === 'month' ? goPrevMonth : goPrevWeek;
  const goNext = calView === 'month' ? goNextMonth : goNextWeek;
  const dateLabel = calView === 'month' ? monthLabel : weekLabel;

  const scheduledCount = posts.filter(p => p.scheduledDate).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider">Content Calendar</span>
            <span className="text-[11px] text-gray-500 ml-1">{dateLabel}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">Your publishing schedule at a glance</p>
        </div>
        <div className="flex items-center gap-1.5">
          {/* View toggle */}
          <div className="flex items-center border border-gray-200 rounded overflow-hidden mr-1">
            <button
              onClick={() => setCalView('month')}
              className={`px-2 py-0.5 text-[10px] font-medium transition-colors ${
                calView === 'month' ? 'bg-[#612A4F] text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setCalView('week')}
              className={`px-2 py-0.5 text-[10px] font-medium transition-colors ${
                calView === 'week' ? 'bg-[#612A4F] text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
          </div>
          <button onClick={goToday} className="px-2 py-0.5 text-[10px] font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
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

      {/* Weekday headers (month view only) */}
      {calView === 'month' && (
        <div className="grid grid-cols-7 border-b border-gray-300/40">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider py-1.5">
              {d}
            </div>
          ))}
        </div>
      )}

      {/* Month view */}
      {calView === 'month' && (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-7 border-l border-gray-300/40 h-full" style={{ gridAutoRows: 'minmax(90px, 1fr)' }}>
            {monthDays.map(({ date, day, isCurrentMonth }, i) => (
              <CalendarDateCell
                key={date}
                date={date}
                day={day}
                isCurrentMonth={isCurrentMonth}
                isToday={date === todayKey}
                posts={postsByDate[date] || []}
                onClickPost={onClickPost}
                onEditTime={onEditTime}
                onClickEmpty={() => onClickEmptyDate(date)}
                onHover={onHover}
                hoveredId={hoveredId}
                draggingId={draggingId}
                staggerIndex={i}
                expanded={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Week view */}
      {calView === 'week' && (
        <>
          {/* Week header with day names + dates */}
          <div className="grid grid-cols-7 border-b border-gray-300/40">
            {weekDays.map(({ date, day }, i) => {
              const isToday = date === todayKey;
              return (
                <div key={date} className="flex flex-col items-center py-2 border-r border-gray-300/40 last:border-r-0">
                  <span className={`text-[11px] font-medium uppercase tracking-wider ${isToday ? 'text-[#612A4F]' : 'text-gray-400'}`}>
                    {WEEKDAYS[i]}
                  </span>
                  <span
                    className="text-[15px] font-semibold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full"
                    style={{
                      color: isToday ? 'white' : '#374151',
                      backgroundColor: isToday ? '#612A4F' : 'transparent',
                    }}
                  >
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Week body — tall columns with time-row lines */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-7 border-l border-gray-300/40 relative" style={{ minHeight: '700px' }}>
              {/* Day columns */}
              {weekDays.map(({ date, day, isCurrentMonth }, i) => (
                <WeekDayColumn
                  key={date}
                  date={date}
                  isToday={date === todayKey}
                  posts={postsByDate[date] || []}
                  onClickPost={onClickPost}
                  onEditTime={onEditTime}
                  onClickEmpty={() => onClickEmptyDate(date)}
                  onHover={onHover}
                  hoveredId={hoveredId}
                  draggingId={draggingId}
                />
              ))}
            </div>
          </div>
        </>
      )}

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

// ── Week Day Column ──────────────────────────────────────────

const WeekDayColumn: React.FC<{
  date: string;
  isToday: boolean;
  posts: Post[];
  onClickPost: (post: Post) => void;
  onEditTime?: (postId: string) => void;
  onClickEmpty: () => void;
  onHover: (id: string | null) => void;
  hoveredId: string | null;
  draggingId: string | null;
}> = ({ date, isToday, posts, onClickPost, onEditTime, onClickEmpty, onHover, hoveredId, draggingId }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `cal-${date}` });

  return (
    <div
      ref={setNodeRef}
      onClick={() => { if (posts.length === 0) onClickEmpty(); }}
      className={`border-r border-gray-300/40 last:border-r-0 p-2 cursor-pointer transition-colors duration-150 h-full ${
        isToday ? 'bg-[#612A4F]/[0.02]' : ''
      }`}
      style={{
        backgroundColor: isOver ? 'rgba(97, 42, 79, 0.04)' : undefined,
        outline: isOver ? '1.5px solid rgba(97, 42, 79, 0.2)' : 'none',
        outlineOffset: '-1px',
      }}
    >
      <div className="space-y-1.5">
        {posts.map((post) => {
          const isPostHovered = hoveredId === post.id;
          const missingAssets = isWithin48Hours(post.scheduledDate!, post.scheduled_time) && (!post.attachedFiles || post.attachedFiles.length === 0);

          return (
            <div key={post.id} className="group/weekpost">
              <DraggablePostWrapper postId={post.id}>
                {(dragHandleProps) => (
                  <motion.div
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={() => onHover(post.id)}
                    onMouseLeave={() => onHover(null)}
                    {...dragHandleProps}
                    className={`rounded-md p-1.5 transition-all duration-150 hover:bg-gray-50 cursor-grab ${
                      isPostHovered ? 'ring-1 ring-[#612A4F]/20 bg-[#612A4F]/[0.03]' : 'bg-white border border-gray-100'
                    }`}
                    onClick={e => { e.stopPropagation(); onClickPost(post); }}
                  >
                    {post.thumbnail_url && (
                      <img src={post.thumbnail_url} alt="" className="w-full h-16 rounded object-cover mb-1.5 pointer-events-none" />
                    )}
                    <p className="text-[11px] font-medium text-gray-800 truncate pointer-events-none">{post.title}</p>
                  </motion.div>
                )}
              </DraggablePostWrapper>
              {post.scheduled_time && (
                <div
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); onEditTime?.(post.id); }}
                  style={{ position: 'relative', zIndex: 100 }}
                  className="flex items-center gap-1 mt-0.5 px-1.5 cursor-pointer text-[10px] text-gray-400 hover:text-[#612A4F] transition-colors"
                >
                  <Clock className="w-2.5 h-2.5" />
                  <span className="hover:underline">{formatTime12(post.scheduled_time)}</span>
                </div>
              )}
              {missingAssets && (
                <div className="flex items-center gap-1 mt-0.5 px-1.5">
                  <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
                  <span className="text-[9px] text-amber-500">Missing assets</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
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
  onEditTime?: (postId: string) => void;
  onClickEmpty: () => void;
  onHover: (id: string | null) => void;
  hoveredId: string | null;
  draggingId: string | null;
  staggerIndex: number;
  expanded: boolean;
}

const CalendarDateCell: React.FC<CalendarDateCellProps> = ({
  date,
  day,
  isCurrentMonth,
  isToday,
  posts,
  onClickPost,
  onEditTime,
  onClickEmpty,
  onHover,
  hoveredId,
  draggingId,
  staggerIndex,
  expanded,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: `cal-${date}` });

  const dateObj = new Date(date + 'T00:00:00');
  return (
    <div
      ref={setNodeRef}
      onClick={() => { if (posts.length === 0) onClickEmpty(); }}
      className={`border-r border-b border-gray-300/40 p-1.5 cursor-pointer transition-colors duration-150 ${
        isCurrentMonth ? 'bg-white' : 'bg-gray-50/50'
      } ${expanded ? 'min-h-[200px]' : ''}`}
      style={{
        backgroundColor: isOver ? 'rgba(97, 42, 79, 0.04)' : undefined,
        outline: isOver ? '1.5px solid rgba(97, 42, 79, 0.2)' : 'none',
        outlineOffset: '-1px',
        borderRadius: isOver ? '4px' : '0',
      }}
    >
      <div className="flex justify-end mb-1">
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
      <div className={expanded ? 'space-y-1' : 'space-y-0.5'}>
        {posts.map((post) => {
          const isPostHovered = hoveredId === post.id;
          const missingAssets = isWithin48Hours(post.scheduledDate!, post.scheduled_time) && (!post.attachedFiles || post.attachedFiles.length === 0);

          return (
            <div key={post.id}>
              <DraggablePostWrapper postId={post.id}>
                {(dragHandleProps) => (
                  <motion.div
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: staggerIndex * 0.015 }}
                    onMouseEnter={() => onHover(post.id)}
                    onMouseLeave={() => onHover(null)}
                    {...dragHandleProps}
                    className={`flex items-center gap-1.5 rounded px-1.5 py-1 transition-all duration-150 hover:bg-gray-50 cursor-grab ${
                      isPostHovered ? 'ring-1 ring-[#612A4F]/20 bg-[#612A4F]/[0.03]' : ''
                    }`}
                    onClick={e => { e.stopPropagation(); onClickPost(post); }}
                  >
                    {post.thumbnail_url ? (
                      <img src={post.thumbnail_url} alt="" className={`${expanded ? 'w-8 h-8' : 'w-5 h-5'} rounded-sm object-cover flex-shrink-0 pointer-events-none`} />
                    ) : (
                      <div className={`${expanded ? 'w-8 h-8' : 'w-5 h-5'} rounded-sm bg-gray-100 flex items-center justify-center flex-shrink-0 pointer-events-none`}>
                        <ImageIcon className={`${expanded ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'} text-gray-300`} />
                      </div>
                    )}
                    <span className={`${expanded ? 'text-[12px]' : 'text-[11px]'} text-gray-800 truncate flex-1 pointer-events-none`}>{post.title}</span>
                    {missingAssets && (
                      <AlertTriangle className="w-2.5 h-2.5 text-amber-500 flex-shrink-0 pointer-events-none" />
                    )}
                  </motion.div>
                )}
              </DraggablePostWrapper>
              {post.scheduled_time && (
                <div
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); onEditTime?.(post.id); }}
                  style={{ position: 'relative', zIndex: 100 }}
                  className="flex items-center gap-0.5 px-1.5 mt-0.5 cursor-pointer text-[10px] text-gray-500 hover:text-[#612A4F] transition-colors"
                >
                  <Clock className="w-2 h-2" />
                  <span className="hover:underline">{formatTime12(post.scheduled_time)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Draggable Post Entry (used in both views) ────────────────

const DraggablePostWrapper: React.FC<{
  postId: string;
  children: (dragHandleProps: Record<string, any>) => React.ReactNode;
}> = ({ postId, children }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `cal-post-${postId}` });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 50 : 'auto',
      }}
    >
      {children({ ...attributes, ...listeners, style: { cursor: 'grab' } })}
    </div>
  );
};

function formatTime12(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default ScheduleCalendar;
