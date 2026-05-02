import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, GripVertical, ChevronRight, ChevronDown, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDraggable,
  closestCenter,
  rectIntersection,
  CollisionDetection,
} from '@dnd-kit/core';
// arrayMove used internally by ScheduleGrid
import { toast } from 'sonner';
import { Post, PostStatus, DEFAULT_PILLARS, DEFAULT_FORMATS } from '@/types/posts';
import { getJSON, setJSON } from '@/lib/storage';
import { seedPosts } from '@/data/postsSeedData';
import { uploadPostThumbnail } from '@/lib/postImageUpload';
import PostDetailPanel from '@/components/posts/PostDetailPanel';
import ReadySidebar from '@/components/schedule/ReadySidebar';
import ScheduleGrid from '@/components/schedule/ScheduleGrid';
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar';
import TimePickerPopover from '@/components/schedule/TimePickerPopover';

type MobileTab = 'Ready' | 'Grid' | 'Calendar';

const GRID_STORAGE_KEY = 'meg_schedule_grid';
const GRID_SLOTS = 12;

// ── Initial grid from seed data ──
function getInitialGrid(): (string | null)[] {
  const saved = getJSON<(string | null)[] | null>(GRID_STORAGE_KEY, null);
  if (saved && saved.length === GRID_SLOTS) return saved;
  // Seed: first 4 cells filled, rest empty
  const grid: (string | null)[] = new Array(GRID_SLOTS).fill(null);
  grid[0] = 'seed-1';
  grid[1] = 'seed-2';
  grid[2] = 'seed-3';
  grid[3] = 'seed-8';
  return grid;
}

const Schedule: React.FC = () => {
  // ── State ──────────────────────────────────────────────────
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = getJSON<Post[] | null>('meg_posts', null);
    return saved && saved.length > 0 ? saved : seedPosts;
  });
  const [gridOrder, setGridOrder] = useState<(string | null)[]>(getInitialGrid);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileTab, setMobileTab] = useState<MobileTab>('Ready');
  const [readyCollapsed, setReadyCollapsed] = useState(false);
  const [leftColumnCollapsed, setLeftColumnCollapsed] = useState(false);
  const [pillars] = useState<string[]>(DEFAULT_PILLARS);
  const [formats] = useState<string[]>(DEFAULT_FORMATS);

  // Time picker state
  const [timePicker, setTimePicker] = useState<{ open: boolean; postId: string; date: string; defaultTime?: string }>({ open: false, postId: '', date: '' });

  // ── Responsive ─────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Persist ────────────────────────────────────────────────
  useEffect(() => { setJSON('meg_posts', posts); }, [posts]);
  useEffect(() => { setJSON(GRID_STORAGE_KEY, gridOrder); }, [gridOrder]);

  // ── Derived data ───────────────────────────────────────────
  const postsMap = useMemo(() => {
    const map = new Map<string, Post>();
    posts.forEach(p => map.set(p.id, p));
    return map;
  }, [posts]);

  const gridPostIds = useMemo(() => new Set(gridOrder.filter(Boolean) as string[]), [gridOrder]);

  const readyPosts = useMemo(() => {
    return posts.filter(p => {
      if (!p.sent_to_schedule || p.status === 'Posted') return false;
      const inGrid = gridPostIds.has(p.id);
      const inCalendar = !!p.scheduledDate;
      // Show in ready unless BOTH are done
      return !(inGrid && inCalendar);
    });
  }, [posts, gridPostIds]);

  const scheduledPosts = useMemo(() => {
    return posts.filter(p => p.sent_to_schedule && p.scheduledDate);
  }, [posts]);

  // ── Handlers ───────────────────────────────────────────────
  const handleUpdatePost = useCallback((id: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    setSelectedPost(prev => prev && prev.id === id ? { ...prev, ...updates } : prev);
  }, []);

  const handleDeletePost = useCallback((id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    setGridOrder(prev => prev.filter(pid => pid !== id));
    setSelectedPost(prev => prev?.id === id ? null : prev);
  }, []);

  const handleRemoveFromSchedule = useCallback((id: string) => {
    setPosts(prev => prev.map(p =>
      p.id === id
        ? { ...p, sent_to_schedule: false, scheduledDate: undefined, scheduled_time: undefined, status: 'Edited' as PostStatus }
        : p
    ));
    setGridOrder(prev => prev.map(pid => pid === id ? null : pid));
    setSelectedPost(null);
    toast.success('Removed from Schedule');
  }, []);

  const handleRemoveFromGrid = useCallback((id: string) => {
    setGridOrder(prev => prev.map(pid => pid === id ? null : pid));
  }, []);

  const handleUploadThumbnail = useCallback(async (postId: string, file: File) => {
    const url = await uploadPostThumbnail(file, postId);
    handleUpdatePost(postId, { thumbnail_url: url });
  }, [handleUpdatePost]);

  const handleUploadToEmptyCell = useCallback(async (cellIndex: number, file: File) => {
    const newId = Date.now().toString();
    const url = await uploadPostThumbnail(file, newId);
    const newPost: Post = {
      id: newId,
      title: 'Untitled post',
      pillar: '',
      format: '',
      status: 'Edited',
      thumbnail_url: url,
      sent_to_schedule: true,
      order: posts.length,
      createdAt: new Date().toISOString(),
    };
    setPosts(prev => [...prev, newPost]);
    setGridOrder(prev => {
      const next = [...prev];
      while (next.length <= cellIndex) next.push(null);
      next[cellIndex] = newId;
      return next;
    });
  }, [posts.length]);

  const handleScheduleOnDate = useCallback((postId: string, date: string, time: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, scheduledDate: date, scheduled_time: time, status: 'Scheduled' as PostStatus }
        : p
    ));
    setSelectedPost(prev => prev && prev.id === postId
      ? { ...prev, scheduledDate: date, scheduled_time: time, status: 'Scheduled' as PostStatus }
      : prev
    );
    toast.success('Post scheduled');
  }, []);

  const handleEditTime = useCallback((postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post?.scheduledDate) {
      // Delay to prevent the same click from triggering the backdrop's onCancel
      requestAnimationFrame(() => {
        setTimePicker({ open: true, postId, date: post.scheduledDate!, defaultTime: post.scheduled_time });
      });
    }
  }, [posts]);

  const handleUnschedule = useCallback((postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, scheduledDate: undefined, scheduled_time: undefined, status: 'Edited' as PostStatus }
        : p
    ));
  }, []);

  // ── Drag and Drop ──────────────────────────────────────────
  const customCollision: CollisionDetection = (args) => {
    // Try rectIntersection first
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) return rectCollisions;
    // Fall back to closestCenter
    return closestCenter(args);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const rawId = event.active.id as string;
    // Extract post ID from cal-post-{postId} format
    const postId = rawId.startsWith('cal-post-') ? rawId.replace('cal-post-', '') : rawId;
    setActiveId(postId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const draggedId = activeId;
    setActiveId(null);
    if (!event.over || !draggedId) return;

    const overId = event.over.id as string;

    // Drop on grid cell (from Ready via external drop zone)
    if (overId.startsWith('grid-ext-')) {
      const cellIndex = parseInt(overId.replace('grid-ext-', ''), 10);
      if (!isNaN(cellIndex)) {
        setGridOrder(prev => {
          const next = [...prev];
          // Place in target cell if empty, otherwise insert and shift
          if (next[cellIndex] === null) {
            next[cellIndex] = draggedId;
          } else {
            next.splice(cellIndex, 0, draggedId);
            while (next.length > GRID_SLOTS) {
              const lastNull = next.lastIndexOf(null);
              if (lastNull !== -1) next.splice(lastNull, 1);
              else { next.pop(); break; }
            }
          }
          return next;
        });
        return;
      }
    }

    // Drop on calendar date — keep existing time, just change date
    if (overId.startsWith('cal-')) {
      const date = overId.replace('cal-', '');
      const post = posts.find(p => p.id === draggedId);
      if (post?.scheduled_time) {
        handleScheduleOnDate(draggedId, date, post.scheduled_time);
      } else {
        setTimePicker({ open: true, postId: draggedId, date });
      }
      return;
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activePost = activeId ? postsMap.get(activeId) : null;

  // ── Click empty calendar date ──────────────────────────────
  const [datePickerState, setDatePickerState] = useState<{ open: boolean; date: string }>({ open: false, date: '' });

  const handleClickEmptyDate = useCallback((date: string) => {
    // If there are ready posts not yet on calendar, open picker
    const unscheduled = posts.filter(p => p.sent_to_schedule && !p.scheduledDate && p.status !== 'Posted');
    if (unscheduled.length > 0) {
      setDatePickerState({ open: true, date });
    }
  }, [posts]);

  // ── Render ─────────────────────────────────────────────────
  const detailPanel = (
    <PostDetailPanel
      post={selectedPost}
      pillars={pillars}
      formats={formats}
      onClose={() => setSelectedPost(null)}
      onUpdate={handleUpdatePost}
      onDelete={handleDeletePost}
      onAddFormat={() => {}}
      onDeleteFormat={() => {}}
      onDeletePillar={() => {}}
    />
  );

  if (isMobile) {
    return (
      <div className="h-full flex flex-col">
        {/* Tab bar */}
        <div className="flex border-b border-gray-100 bg-white">
          {(['Ready', 'Grid', 'Calendar'] as MobileTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                mobileTab === tab
                  ? 'text-[#612A4F] border-b-2 border-[#612A4F]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <DndContext sensors={sensors} collisionDetection={customCollision} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
          <div className="flex-1 overflow-y-auto">
            {mobileTab === 'Ready' && (
              <ReadySidebar
                posts={readyPosts}
                gridPostIds={gridPostIds}
                onClickPost={setSelectedPost}
                onRemove={handleRemoveFromSchedule}
                onHover={setHoveredPostId}
                hoveredId={hoveredPostId}
                draggingId={activeId}
              />
            )}
            {mobileTab === 'Grid' && (
              <ScheduleGrid
                gridOrder={gridOrder}
                postsMap={postsMap}
                onClickPost={setSelectedPost}
                onRemoveFromGrid={handleRemoveFromGrid}
                onUploadThumbnail={handleUploadThumbnail}
                onUploadToEmptyCell={handleUploadToEmptyCell}
                onHover={setHoveredPostId}
                hoveredId={hoveredPostId}
                draggingId={activeId}
              />
            )}
            {mobileTab === 'Calendar' && (
              <div className="relative h-full">
                <ScheduleCalendar
                  posts={scheduledPosts}
                  onClickPost={setSelectedPost}
                  onClickEmptyDate={handleClickEmptyDate}
                  onEditTime={handleEditTime}
                  onHover={setHoveredPostId}
                  hoveredId={hoveredPostId}
                  draggingId={activeId}
                />
              </div>
            )}
          </div>
          <DragOverlay dropAnimation={null}>
            {activePost && <DragPreview post={activePost} />}
          </DragOverlay>
        </DndContext>
        {detailPanel}
        <TimePickerPopover
          open={timePicker.open}
          date={timePicker.date}
          defaultTime={timePicker.defaultTime}
          onConfirm={time => {
            handleScheduleOnDate(timePicker.postId, timePicker.date, time);
            setTimePicker({ open: false, postId: '', date: '' });
          }}
          onCancel={() => setTimePicker({ open: false, postId: '', date: '' })}
        />
        <PostPickerDialog
          open={datePickerState.open}
          posts={posts.filter(p => p.sent_to_schedule && !p.scheduledDate && p.status !== 'Posted')}
          onSelect={(postId) => {
            setDatePickerState(prev => ({ ...prev, open: false }));
            setTimePicker({ open: true, postId, date: datePickerState.date });
          }}
          onClose={() => setDatePickerState({ open: false, date: '' })}
        />
      </div>
    );
  }

  // ── Desktop ────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={customCollision} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
          <div className="h-full grid gap-0" style={{ gridTemplateColumns: leftColumnCollapsed ? '0px 28px 1fr' : '430px 28px 1fr', transition: 'grid-template-columns 0.3s ease-out' }}>
            {/* Left column: Ready (collapsible top) + Grid (always visible bottom) */}
            <div className="h-full flex flex-col bg-gray-50/30 overflow-hidden">
              {!readyCollapsed && !leftColumnCollapsed && (
                <div className="overflow-y-auto flex-shrink-0" style={{ maxHeight: '45%' }}>
                  <DraggableReadyList
                    posts={readyPosts}
                    gridPostIds={gridPostIds}
                    onClickPost={setSelectedPost}
                    onRemove={handleRemoveFromSchedule}
                    onHover={setHoveredPostId}
                    hoveredId={hoveredPostId}
                    draggingId={activeId}
                    onToggleCollapse={() => setReadyCollapsed(true)}
                  />
                </div>
              )}
              {readyCollapsed && (
                <button
                  onClick={() => setReadyCollapsed(false)}
                  className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100 bg-gray-50/30 hover:bg-gray-100/50 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider">Ready to be scheduled</span>
                  <span className="text-[11px] text-gray-500 ml-auto">{readyPosts.length}</span>
                </button>
              )}
              <div className="flex-1 min-h-0 overflow-y-auto">
                <ScheduleGrid
                  gridOrder={gridOrder}
                  postsMap={postsMap}
                  expanded={readyCollapsed}
                  onReorder={setGridOrder}
                  onClickPost={setSelectedPost}
                  onRemoveFromGrid={handleRemoveFromGrid}
                  onUploadThumbnail={handleUploadThumbnail}
                  onUploadToEmptyCell={handleUploadToEmptyCell}
                  onHover={setHoveredPostId}
                  hoveredId={hoveredPostId}
                  externalDraggingId={activeId}
                />
              </div>
            </div>

            {/* Toggle button — centered vertically on the divider */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => setLeftColumnCollapsed(prev => !prev)}
                className="w-[24px] h-[24px] flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 shadow-sm transition-colors"
                title={leftColumnCollapsed ? 'Show sidebar' : 'Hide sidebar'}
              >
                {leftColumnCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 -rotate-90" />}
              </button>
            </div>

            {/* Right column: Calendar */}
            <div className="h-full overflow-hidden relative">
              <ScheduleCalendar
                posts={scheduledPosts}
                onClickPost={setSelectedPost}
                onClickEmptyDate={handleClickEmptyDate}
                onEditTime={handleEditTime}
                onHover={setHoveredPostId}
                hoveredId={hoveredPostId}
                draggingId={activeId}
              />
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {activePost && <DragPreview post={activePost} />}
          </DragOverlay>
        </DndContext>
      </div>

      {detailPanel}

      <TimePickerPopover
        open={timePicker.open}
        date={timePicker.date}
        onConfirm={time => {
          handleScheduleOnDate(timePicker.postId, timePicker.date, time);
          setTimePicker({ open: false, postId: '', date: '' });
        }}
        onCancel={() => setTimePicker({ open: false, postId: '', date: '' })}
      />

      <PostPickerDialog
        open={datePickerState.open}
        posts={posts.filter(p => p.sent_to_schedule && !p.scheduledDate && p.status !== 'Posted')}
        onSelect={(postId) => {
          setDatePickerState(prev => ({ ...prev, open: false }));
          setTimePicker({ open: true, postId, date: datePickerState.date });
        }}
        onClose={() => setDatePickerState({ open: false, date: '' })}
      />
    </div>
  );
};

// ── Draggable Ready List (wraps ReadySidebar with draggable cards) ──

const DraggableReadyList: React.FC<{
  posts: Post[];
  gridPostIds: Set<string>;
  onClickPost: (post: Post) => void;
  onRemove: (id: string) => void;
  onHover: (id: string | null) => void;
  hoveredId: string | null;
  draggingId: string | null;
  onToggleCollapse?: () => void;
}> = (props) => {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100 bg-gray-50/30">
        {props.onToggleCollapse && (
          <button onClick={props.onToggleCollapse} className="p-0.5 rounded hover:bg-gray-200/50 transition-colors">
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>
        )}
        <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider">Ready to be scheduled</span>
        <span className="text-[11px] text-gray-500 ml-auto">{props.posts.length}</span>
      </div>
      {props.posts.length === 0 ? (
        <div className="flex items-center justify-center px-3 py-6">
          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            No posts ready yet. Mark posts as Edited in Posts and click the arrow to send them here.
          </p>
        </div>
      ) : (
        <div className="px-1 py-1 space-y-0.5">
          <AnimatePresence initial={false}>
            {props.posts.map(post => (
              <DraggableReadyCard
                key={post.id}
                post={post}
                gridPostIds={props.gridPostIds}
                onClickPost={props.onClickPost}
                onRemove={props.onRemove}
                onHover={props.onHover}
                isHovered={props.hoveredId === post.id}
                isDragging={props.draggingId === post.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// ── Individual Draggable Ready Card ──

const DraggableReadyCard: React.FC<{
  post: Post;
  gridPostIds: Set<string>;
  onClickPost: (post: Post) => void;
  onRemove: (id: string) => void;
  onHover: (id: string | null) => void;
  isHovered: boolean;
  isDragging: boolean;
}> = ({ post, gridPostIds, onClickPost, onRemove, onHover, isHovered, isDragging }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: post.id });
  const inGrid = gridPostIds.has(post.id);
  const inCalendar = !!post.scheduledDate;

  return (
    <motion.div
      ref={setNodeRef}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDragging ? 0.3 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{ transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined }}
      {...attributes}
      {...listeners}
      onClick={() => onClickPost(post)}
      onMouseEnter={() => onHover(post.id)}
      onMouseLeave={() => onHover(null)}
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 cursor-grab active:cursor-grabbing transition-all duration-150 group ${
        isHovered ? 'bg-[#612A4F]/[0.04]' : 'hover:bg-gray-50'
      }`}
    >
      <GripVertical className="w-3 h-3 text-gray-300 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
      {post.thumbnail_url ? (
        <img src={post.thumbnail_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
          <ImageIcon className="w-3.5 h-3.5 text-gray-300" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-gray-900 truncate">{post.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${inGrid ? 'bg-[#612A4F]' : 'border border-gray-400'}`} />
            <span className="text-[9px] text-gray-500">Grid</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${inCalendar ? 'bg-[#612A4F]' : 'border border-gray-400'}`} />
            <span className="text-[9px] text-gray-500">Date</span>
          </div>
        </div>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onRemove(post.id); }}
        className="flex-shrink-0 p-0.5 rounded text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-150"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
};

// ── Drag Preview ─────────────────────────────────────────────

const DragPreview: React.FC<{ post: Post }> = ({ post }) => (
  <div className="w-[120px] rounded-lg shadow-2xl border border-gray-200 bg-white p-1.5 opacity-90 rotate-2">
    {post.thumbnail_url ? (
      <img src={post.thumbnail_url} alt="" className="w-full aspect-square object-cover rounded-md" />
    ) : (
      <div className="w-full aspect-square rounded-md bg-gray-50 flex items-center justify-center">
        <ImageIcon className="w-4 h-4 text-gray-300" />
      </div>
    )}
    <p className="text-[10px] font-medium text-gray-700 truncate mt-1">{post.title}</p>
  </div>
);

// ── Post Picker Dialog (click empty calendar date) ───────────

const PostPickerDialog: React.FC<{
  open: boolean;
  posts: Post[];
  onSelect: (postId: string) => void;
  onClose: () => void;
}> = ({ open, posts, onSelect, onClose }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] bg-black/10"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 4 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[75] bg-white rounded-xl shadow-2xl border border-gray-200 w-[280px] max-h-[360px] overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800">Schedule a post</p>
            <p className="text-[11px] text-gray-400">Choose a post to schedule on this date</p>
          </div>
          <div className="overflow-y-auto max-h-[280px] p-2 space-y-1">
            {posts.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-6">No unscheduled posts available</p>
            ) : (
              posts.map(post => (
                <button
                  key={post.id}
                  onClick={() => onSelect(post.id)}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  {post.thumbnail_url ? (
                    <img src={post.thumbnail_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-3.5 h-3.5 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-gray-800 truncate">{post.title}</p>
                    <p className="text-[10px] text-gray-400">{post.pillar} · {post.format}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default Schedule;
