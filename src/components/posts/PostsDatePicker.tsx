import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Post, getPillarStyle, STATUS_COLORS } from '@/types/posts';

interface PostsDatePickerProps {
  value?: string;
  allPosts: Post[];
  onChange: (date: string | undefined) => void;
  onClickPost?: (post: Post) => void;
  detailPanelOpen?: boolean;
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
    const pm = month === 0 ? 11 : month - 1;
    const py = month === 0 ? year - 1 : year;
    days.push({ date: `${py}-${String(pm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, day: d, isCurrentMonth: false });
  }
  for (let d = 1; d <= totalDays; d++) {
    days.push({ date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, day: d, isCurrentMonth: true });
  }
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: `${ny}-${String(nm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, day: d, isCurrentMonth: false });
    }
  }
  return days;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PostsDatePicker: React.FC<PostsDatePickerProps> = ({ value, allPosts, onChange, onClickPost, detailPanelOpen }) => {
  const today = new Date();
  const initDate = value ? new Date(value + 'T00:00:00') : today;
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [open, setOpen] = useState(false);

  const days = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const postsByDate = useMemo(() => {
    const map: Record<string, Post[]> = {};
    allPosts.forEach(p => {
      if (p.scheduledDate) {
        if (!map[p.scheduledDate]) map[p.scheduledDate] = [];
        map[p.scheduledDate].push(p);
      }
    });
    return map;
  }, [allPosts]);

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={`text-sm transition-colors duration-150 cursor-pointer ${value ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 hover:text-gray-400'}`}>
          {value
            ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Set date'}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[780px] p-0 bg-white shadow-xl border border-gray-200 z-[45]" align="end" sideOffset={4} style={{ opacity: 1 }} onOpenAutoFocus={e => e.preventDefault()} onInteractOutside={e => { if (detailPanelOpen) e.preventDefault(); }}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <button onClick={goPrev} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors duration-150">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-gray-800 min-w-[120px] text-center">{monthLabel}</span>
              <button onClick={goNext} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors duration-150">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors duration-150">
              <X className="w-4 h-4" />
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
            {days.map(({ date, day, isCurrentMonth }) => {
              const isToday = date === todayKey;
              const isSelected = date === value;
              const dayPosts = postsByDate[date] || [];

              return (
                <button
                  key={date}
                  onClick={() => { onChange(date); setOpen(false); }}
                  className="border-r border-b border-gray-100 min-h-[100px] p-2 text-left transition-colors duration-100 hover:bg-gray-50 flex flex-col items-stretch justify-start"
                  style={{ backgroundColor: isSelected ? 'rgba(97, 42, 79, 0.06)' : undefined }}
                >
                  <div className="flex justify-end">
                    <span
                      className="text-xs leading-none px-1.5 py-0.5 rounded-full tabular-nums"
                      style={{
                        color: isToday ? 'white' : isCurrentMonth ? '#374151' : '#D1D5DB',
                        backgroundColor: isToday ? '#612a4f' : isSelected ? 'rgba(97, 42, 79, 0.12)' : 'transparent',
                        fontWeight: isToday || isSelected ? 600 : 400,
                      }}
                    >
                      {day}
                    </span>
                  </div>
                  {dayPosts.slice(0, 2).map(p => {
                    const ps = getPillarStyle(p.pillar);
                    return (
                      <div
                        key={p.id}
                        onClick={e => {
                          e.stopPropagation();
                          if (onClickPost) { onClickPost(p); }
                        }}
                        className="mt-1 rounded px-1.5 py-0.5 truncate text-[11px] font-medium leading-tight cursor-pointer hover:opacity-80 transition-opacity duration-150"
                        style={{
                          backgroundColor: p.pillar ? ps.bg : '#F3F4F6',
                          color: p.pillar ? ps.text : '#9CA3AF',
                          borderLeft: `2px solid ${p.pillar ? ps.border : '#E5E7EB'}`,
                        }}
                      >
                        {p.title}
                      </div>
                    );
                  })}
                  {dayPosts.length > 2 && (
                    <div className="text-[10px] text-gray-400 px-1.5 mt-1">+{dayPosts.length - 2} more</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PostsDatePicker;
