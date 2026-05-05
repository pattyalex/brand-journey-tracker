import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ImageIcon, AlertTriangle, Clock } from 'lucide-react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Post } from '@/types/posts';

interface ScheduleCalendarProps {
  posts: Post[];
  onClickPost: (post: Post) => void;
  onClickEmptyDate: (date: string) => void;
  onEditTime?: (postId: string) => void;
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

function getWeekDays(baseDate: Date) {
  const start = new Date(baseDate);
  start.setDate(start.getDate() - start.getDay());
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

  const goPrevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const goNextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };
  const goPrevWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d); };
  const goNextWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d); };

  const goToday = () => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setWeekBase(today); };
  const goPrev = calView === 'month' ? goPrevMonth : goPrevWeek;
  const goNext = calView === 'month' ? goNextMonth : goNextWeek;
  const dateLabel = calView === 'month' ? monthLabel : weekLabel;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">{dateLabel}</h2>
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setCalView('month')}
              className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all duration-200 ${
                calView === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setCalView('week')}
              className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all duration-200 ${
                calView === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Week
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={goToday} className="px-3 py-1 text-[11px] font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors mr-1">
            Today
          </button>
          <button onClick={goPrev} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={goNext} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers (month view only) */}
      {calView === 'month' && (
        <div className="grid grid-cols-7 px-2">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider py-2">
              {d}
            </div>
          ))}
        </div>
      )}

      {/* Month view */}
      {calView === 'month' && (
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          <div className="grid grid-cols-7 gap-[1px] bg-gray-100 rounded-xl overflow-hidden">
            {monthDays.map(({ date, day, isCurrentMonth }, i) => (
              <MonthCell
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
              />
            ))}
          </div>
        </div>
      )}

      {/* Week view */}
      {calView === 'week' && (
        <>
          <div className="grid grid-cols-7 px-2 pb-1">
            {weekDays.map(({ date, day }, i) => {
              const isToday = date === todayKey;
              return (
                <div key={date} className="flex flex-col items-center py-1">
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${isToday ? 'text-[#612A4F]' : 'text-gray-400'}`}>
                    {WEEKDAYS[i]}
                  </span>
                  <span
                    className="text-[15px] font-semibold mt-0.5 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
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
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            <div className="grid grid-cols-7 gap-[1px] bg-gray-100 rounded-xl overflow-hidden" style={{ minHeight: '700px' }}>
              {weekDays.map(({ date }, i) => (
                <WeekCell
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
    </div>
  );
};

// ── Month Cell ───────────────────────────────────────────────

const MonthCell: React.FC<{
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
}> = ({ date, day, isCurrentMonth, isToday, posts, onClickPost, onEditTime, onClickEmpty, onHover, hoveredId, draggingId, staggerIndex }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `cal-${date}` });

  return (
    <div
      ref={setNodeRef}
      onClick={() => { if (posts.length === 0) onClickEmpty(); }}
      className={`p-1.5 cursor-pointer transition-all duration-150 min-h-[105px] ${
        isCurrentMonth ? 'bg-white' : 'bg-gray-50/80'
      } ${isOver ? 'bg-[#612A4F]/[0.04]' : ''}`}
      style={{
        outline: isOver ? '2px solid rgba(97, 42, 79, 0.15)' : 'none',
        outlineOffset: '-2px',
        borderRadius: isOver ? '8px' : '0',
      }}
    >
      <div className="flex justify-end mb-1">
        <span
          className={`text-[12px] tabular-nums leading-none w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
            isToday ? 'bg-[#612A4F] text-white font-semibold' : isCurrentMonth ? 'text-gray-700 font-medium' : 'text-gray-300'
          }`}
        >
          {day}
        </span>
      </div>
      <div className="space-y-1">
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
                    transition={{ duration: 0.2, delay: staggerIndex * 0.01 }}
                    onMouseEnter={() => onHover(post.id)}
                    onMouseLeave={() => onHover(null)}
                    {...dragHandleProps}
                    className={`flex items-center gap-1.5 rounded-lg px-1.5 py-1 transition-all duration-150 cursor-grab ${
                      isPostHovered
                        ? 'bg-[#612A4F]/[0.06] shadow-sm'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={e => { e.stopPropagation(); onClickPost(post); }}
                  >
                    {post.thumbnail_url ? (
                      <img src={post.thumbnail_url} alt="" className="w-6 h-6 rounded-md object-cover flex-shrink-0 pointer-events-none" />
                    ) : (
                      <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0 pointer-events-none">
                        <ImageIcon className="w-3 h-3 text-gray-300" />
                      </div>
                    )}
                    <span className="text-[11px] text-gray-700 truncate flex-1 pointer-events-none">{post.title}</span>
                    {missingAssets && (
                      <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 pointer-events-none" />
                    )}
                  </motion.div>
                )}
              </DraggablePostWrapper>
              {post.scheduled_time && (
                <div
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); onEditTime?.(post.id); }}
                  style={{ position: 'relative', zIndex: 100 }}
                  className="flex items-center gap-0.5 px-2 mt-0.5 cursor-pointer text-[10px] text-gray-400 hover:text-[#612A4F] transition-colors"
                >
                  <Clock className="w-2.5 h-2.5" />
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

// ── Week Cell ────────────────────────────────────────────────

const WeekCell: React.FC<{
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
      className={`p-2 cursor-pointer transition-all duration-150 h-full ${
        isToday ? 'bg-[#612A4F]/[0.015]' : 'bg-white'
      } ${isOver ? 'bg-[#612A4F]/[0.04]' : ''}`}
      style={{
        outline: isOver ? '2px solid rgba(97, 42, 79, 0.15)' : 'none',
        outlineOffset: '-2px',
      }}
    >
      <div className="space-y-2">
        {posts.map((post) => {
          const isPostHovered = hoveredId === post.id;
          const missingAssets = isWithin48Hours(post.scheduledDate!, post.scheduled_time) && (!post.attachedFiles || post.attachedFiles.length === 0);

          return (
            <div key={post.id}>
              <DraggablePostWrapper postId={post.id}>
                {(dragHandleProps) => (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    onMouseEnter={() => onHover(post.id)}
                    onMouseLeave={() => onHover(null)}
                    {...dragHandleProps}
                    className={`rounded-xl p-2 transition-all duration-150 cursor-grab ${
                      isPostHovered
                        ? 'bg-[#612A4F]/[0.04] shadow-md ring-1 ring-[#612A4F]/10'
                        : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'
                    }`}
                    onClick={e => { e.stopPropagation(); onClickPost(post); }}
                  >
                    {post.thumbnail_url && (
                      <img src={post.thumbnail_url} alt="" className="w-full h-20 rounded-lg object-cover mb-2 pointer-events-none" />
                    )}
                    <p className="text-[12px] font-medium text-gray-800 truncate pointer-events-none">{post.title}</p>
                  </motion.div>
                )}
              </DraggablePostWrapper>
              {post.scheduled_time && (
                <div
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); onEditTime?.(post.id); }}
                  style={{ position: 'relative', zIndex: 100 }}
                  className="flex items-center gap-1 mt-1 px-1 cursor-pointer text-[10px] text-gray-400 hover:text-[#612A4F] transition-colors"
                >
                  <Clock className="w-2.5 h-2.5" />
                  <span className="hover:underline">{formatTime12(post.scheduled_time)}</span>
                </div>
              )}
              {missingAssets && (
                <div className="flex items-center gap-1 mt-1 px-1">
                  <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                  <span className="text-[9px] text-amber-400">Missing assets</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Draggable Post Wrapper ───────────────────────────────────

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
