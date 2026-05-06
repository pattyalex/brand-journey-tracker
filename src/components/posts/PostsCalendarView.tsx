import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, LayoutList } from 'lucide-react';
import PostContextMenu from './PostContextMenu';
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
import { Post, getPillarStyle, STATUS_COLORS } from '@/types/posts';
import PostCard from './PostCard';
import { StatusIcon } from './StatusDropdown';
import { PlatformIconsDisplay } from './PlatformSelector';

interface PostsCalendarViewProps {
  posts: Post[];
  allPosts: Post[];
  pillars: string[];
  onClickPost: (post: Post) => void;
  onUpdatePost: (id: string, updates: Partial<Post>) => void;
  onDeletePost: (id: string) => void;
  onDuplicatePost: (id: string) => void;
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
  pillars,
  onClickPost,
  onUpdatePost,
  onDeletePost,
  onDuplicatePost,
  onSendToSchedule,
  onCreateOnDate,
  onSwitchToList,
}) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarPillarFilter, setSidebarPillarFilter] = useState<string>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const days = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const scheduledPosts = useMemo(() => posts.filter(p => p.scheduledDate), [posts]);

  const unscheduledPosts = useMemo(() => allPosts.filter(p => !p.scheduledDate), [allPosts]);

  const unscheduledByPillar = useMemo(() => {
    const filtered = sidebarPillarFilter === 'all'
      ? unscheduledPosts
      : unscheduledPosts.filter(p => (p.pillar || 'Uncategorized') === sidebarPillarFilter);
    const groups: { pillar: string; posts: Post[] }[] = [];
    const map = new Map<string, Post[]>();
    filtered.forEach(p => {
      const key = p.pillar || 'Uncategorized';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    const seen = new Set<string>();
    pillars.forEach(pil => {
      if (map.has(pil)) { groups.push({ pillar: pil, posts: map.get(pil)! }); seen.add(pil); }
    });
    map.forEach((posts, pil) => {
      if (!seen.has(pil)) groups.push({ pillar: pil, posts });
    });
    return groups;
  }, [unscheduledPosts, pillars]);

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
    const targetId = over.id as string;
    if (targetId === 'all-posts-sidebar') {
      onUpdatePost(postId, { scheduledDate: undefined });
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(targetId)) {
      onUpdatePost(postId, { scheduledDate: targetId });
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4">
        {/* Unplanned sidebar */}
        <div
          className="flex-shrink-0 transition-all duration-300 ease-in-out"
          style={{ width: sidebarOpen ? '20%' : '40px', minWidth: sidebarOpen ? '200px' : '40px', maxWidth: sidebarOpen ? '280px' : '40px' }}
        >
          {sidebarOpen ? (
            <DroppableSidebar>
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <LayoutList className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Unplanned</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-0.5 rounded hover:bg-gray-200/60 text-gray-400 hover:text-gray-600 transition-colors duration-150"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="px-2 py-1.5 border-b border-gray-100">
                <select
                  value={sidebarPillarFilter}
                  onChange={e => setSidebarPillarFilter(e.target.value)}
                  className="w-full text-[11px] text-gray-600 bg-white border border-gray-200 rounded-md px-2 py-1 outline-none hover:border-gray-300 focus:border-gray-300 transition-colors duration-150 cursor-pointer"
                >
                  <option value="all">All pillars</option>
                  {pillars.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="overflow-y-auto p-2 space-y-3" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                {unscheduledByPillar.length > 0 ? (
                  unscheduledByPillar.map(({ pillar, posts: pillarPosts }) => {
                    const style = getPillarStyle(pillar);
                    return (
                      <div key={pillar}>
                        <div className="flex items-center gap-1.5 px-1 py-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: style.text }}>
                            {pillar}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {pillarPosts.map(post => (
                            <DraggableSidebarCard key={post.id} post={post} onClick={onClickPost} onDelete={onDeletePost} onDuplicate={onDuplicatePost} />
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[11px] text-gray-400 text-center py-6">
                    Drag posts here to remove from timeline
                  </p>
                )}
              </div>
            </DroppableSidebar>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-full bg-gray-50/80 rounded-lg border border-gray-100 flex flex-col items-center pt-3 gap-1 hover:bg-gray-100/60 transition-colors duration-150"
            >
              <LayoutList className="w-3.5 h-3.5 text-gray-400" />
              <ChevronRight className="w-3 h-3 text-gray-400 mt-1" />
            </button>
          )}
        </div>

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

// ── Droppable Sidebar ────────────────────────────────────────

const DroppableSidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'all-posts-sidebar' });
  return (
    <div
      ref={setNodeRef}
      className="bg-gray-50/80 rounded-lg border h-full transition-colors duration-150"
      style={{
        borderColor: isOver ? '#612a4f' : 'rgb(243 244 246)',
        backgroundColor: isOver ? 'rgba(97, 42, 79, 0.04)' : undefined,
      }}
    >
      {children}
    </div>
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
                <DraggableSidebarCard key={post.id} post={post} onClick={onClickPost} onDelete={onDeletePost} onDuplicate={onDuplicatePost} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Draggable Sidebar Card ───────────────────────────────────

const DraggableSidebarCard: React.FC<{
  post: Post;
  onClick: (post: Post) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}> = ({ post, onClick, onDelete, onDuplicate }) => {
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
      className="px-2 py-1.5 rounded-md cursor-grab active:cursor-grabbing hover:shadow-sm transition-all duration-150 group/card"
      style={{ backgroundColor: pillarStyle.bg }}
    >
      <div className="flex items-start gap-1">
        <p className="text-[11px] font-medium text-gray-800 truncate flex-1">{post.title}</p>
        <PostContextMenu
          onExpand={() => onClick(post)}
          onDuplicate={() => onDuplicate(post.id)}
          onDelete={() => onDelete(post.id)}
          iconSize="w-3 h-3"
          triggerClass="opacity-0 group-hover/card:opacity-100 p-0.5 rounded text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-all duration-150 flex-shrink-0"
        />
      </div>
      <div className="flex items-center justify-between mt-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-gray-400">{post.format || 'No format'}</span>
          <PlatformIconsDisplay platforms={post.platforms} size={9} />
        </div>
        <span className="flex items-center gap-0.5 text-[9px] text-gray-400">
          <StatusIcon status={post.status} className="w-2 h-2" style={{ color: STATUS_COLORS[post.status]?.dot }} />
          {post.status}
        </span>
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
