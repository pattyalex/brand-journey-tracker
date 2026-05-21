import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, GripVertical, ChevronRight, ChevronLeft, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDraggable,
  useDroppable,
  closestCenter,
  rectIntersection,
  CollisionDetection,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { Post, PostStatus, DEFAULT_PILLARS, DEFAULT_FORMATS } from '@/types/posts';
import { getJSON, setJSON } from '@/lib/storage';
import { seedPosts } from '@/data/postsSeedData';
import { uploadPostThumbnail } from '@/lib/postImageUpload';
import { useAuth } from '@/contexts/AuthContext';
import * as postsApi from '@/services/postsService';
import * as scheduleApi from '@/services/scheduleService';
import PostDetailPanel from '@/components/posts/PostDetailPanel';
import { PlatformIconsDisplay } from '@/components/posts/PlatformSelector';
import ReadySidebar from '@/components/schedule/ReadySidebar';
import ScheduleGrid from '@/components/schedule/ScheduleGrid';
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar';
import TimePickerPopover from '@/components/schedule/TimePickerPopover';

type MobileTab = 'Ready' | 'Grid' | 'Calendar';

const GRID_STORAGE_KEY = 'meg_schedule_grid';
const GRID_SLOTS = 12;

// ── Initial grid ──
function getInitialGrid(): (string | null)[] {
  const saved = getJSON<(string | null)[] | null>(GRID_STORAGE_KEY, null);
  if (saved && saved.length === GRID_SLOTS) return saved;
  return new Array(GRID_SLOTS).fill(null);
}

const Schedule: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [swooshPostId, setSwooshPostId] = useState<string | null>(() => {
    const id = sessionStorage.getItem('schedule_swoosh_post_id');
    if (id) sessionStorage.removeItem('schedule_swoosh_post_id');
    return id;
  });

  // Auto-clear swoosh state after animation completes
  useEffect(() => {
    if (swooshPostId) {
      const timer = setTimeout(() => setSwooshPostId(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [swooshPostId]);

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

  // ── Load from Supabase ─────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    postsApi.fetchPosts(userId).then(remote => {
      if (remote.length > 0) {
        // Merge: keep local status updates that may not have synced to Supabase yet
        setPosts(prev => {
          const localMap = new Map(prev.map(p => [p.id, p]));
          const merged = remote.map(p => {
            const local = localMap.get(p.id);
            // If local has a different status, keep the full local version (more recent user action)
            if (local && local.status !== p.status) return local;
            return p;
          });
          // Include any local-only posts not yet in Supabase
          const remoteIds = new Set(remote.map(p => p.id));
          const localOnly = prev.filter(p => !remoteIds.has(p.id));
          return [...merged, ...localOnly];
        });
      }
    }).catch(console.error);
    scheduleApi.fetchScheduleGrid(userId).then(remote => {
      if (remote.some(s => s !== null)) setGridOrder(remote);
    }).catch(console.error);
  }, [userId]);

  // ── Persist to localStorage (cache) ───────────────────────
  useEffect(() => { setJSON('meg_posts', posts); }, [posts]);
  useEffect(() => { setJSON(GRID_STORAGE_KEY, gridOrder); }, [gridOrder]);

  // ── Sync grid to Supabase (debounced) ─────────────────────
  const gridSyncTimer = React.useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!userId) return;
    clearTimeout(gridSyncTimer.current);
    gridSyncTimer.current = setTimeout(() => {
      scheduleApi.saveScheduleGrid(gridOrder, userId).catch(console.error);
    }, 1500);
    return () => clearTimeout(gridSyncTimer.current);
  }, [gridOrder, userId]);

  // ── Derived data ───────────────────────────────────────────
  const postsMap = useMemo(() => {
    const map = new Map<string, Post>();
    posts.forEach(p => map.set(p.id, p));
    return map;
  }, [posts]);

  const gridPostIds = useMemo(() => new Set(gridOrder.filter(Boolean) as string[]), [gridOrder]);

  const readyPosts = useMemo(() => {
    return posts.filter(p => p.status === 'Ready to Schedule');
  }, [posts]);

  const scheduledPosts = useMemo(() => {
    return posts.filter(p => p.status === 'Scheduled' && p.scheduledDate);
  }, [posts]);

  // ── Handlers ───────────────────────────────────────────────
  const handleUpdatePost = useCallback((id: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    setSelectedPost(prev => prev && prev.id === id ? { ...prev, ...updates } : prev);
    postsApi.updatePost(id, updates).catch(console.error);
  }, []);

  const handleDeletePost = useCallback((id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    setGridOrder(prev => prev.filter(pid => pid !== id));
    setSelectedPost(prev => prev?.id === id ? null : prev);
    postsApi.deletePost(id).catch(console.error);
  }, []);

  const handleRemoveFromSchedule = useCallback((id: string) => {
    const updates = { scheduledDate: undefined, scheduled_time: undefined, status: 'Edited' as PostStatus };
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    setGridOrder(prev => prev.map(pid => pid === id ? null : pid));
    setSelectedPost(null);
    postsApi.updatePost(id, updates).catch(console.error);
    toast.success('Removed from Schedule');
  }, []);

  const handleRemoveFromGrid = useCallback((id: string) => {
    setGridOrder(prev => prev.map(pid => pid === id ? null : pid));
  }, []);

  const handleUploadThumbnail = useCallback(async (postId: string, file: File) => {
    try {
      const url = await uploadPostThumbnail(file, postId);
      handleUpdatePost(postId, { thumbnail_url: url });
    } catch {
      toast.error('Image upload failed. Please try again.');
    }
  }, [handleUpdatePost]);

  const handleUploadToEmptyCell = useCallback(async (cellIndex: number, file: File) => {
    const newId = Date.now().toString();
    let url: string;
    try {
      url = await uploadPostThumbnail(file, newId);
    } catch {
      toast.error('Image upload failed. Please try again.');
      return;
    }
    const newPost: Post = {
      id: newId,
      title: 'Untitled post',
      pillar: '',
      format: '',
      status: 'Ready to Schedule',
      thumbnail_url: url,
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
    if (userId) postsApi.createPost(newPost, userId).catch(console.error);
  }, [posts.length, userId]);

  const handleScheduleOnDate = useCallback((postId: string, date: string, time: string) => {
    const updates = { scheduledDate: date, scheduled_time: time, status: 'Scheduled' as PostStatus };
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));
    setSelectedPost(prev => prev && prev.id === postId ? { ...prev, ...updates } : prev);
    postsApi.updatePost(postId, updates).catch(console.error);
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
    const updates = { scheduledDate: undefined, scheduled_time: undefined, status: 'Ready to Schedule' as PostStatus };
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, ...updates } : p
    ));
    setSelectedPost(prev => prev && prev.id === postId ? { ...prev, ...updates } : prev);
    postsApi.updatePost(postId, updates).catch(console.error);
    toast.success('Post unscheduled');
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

    // Drop on Ready sidebar — unschedule the post
    if (overId === 'ready-drop-zone') {
      const post = posts.find(p => p.id === draggedId);
      if (post?.scheduledDate) {
        handleUnschedule(draggedId);
      }
      return;
    }

    // Drop on grid cell from Ready sidebar (external drop)
    if (overId.startsWith('grid-ext-')) {
      const cellIndex = parseInt(overId.replace('grid-ext-', ''), 10);
      if (!isNaN(cellIndex)) {
        setGridOrder(prev => {
          const next = [...prev];
          // Remove from old position if already in grid
          const oldIndex = next.indexOf(draggedId);
          if (oldIndex !== -1) {
            next[oldIndex] = null;
          }
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

    // Grid internal reorder — insert+shift (Planoly-style)
    const fromIndex = gridOrder.indexOf(draggedId);
    if (fromIndex !== -1) {
      // Determine target index from the sortable cell ID
      let toIndex = -1;
      const overPostIndex = gridOrder.indexOf(overId);
      if (overPostIndex !== -1) {
        toIndex = overPostIndex;
      } else if (overId.startsWith('empty-')) {
        toIndex = parseInt(overId.replace('empty-', ''), 10);
      }
      if (toIndex !== -1 && toIndex !== fromIndex) {
        setGridOrder(prev => arrayMove(prev, fromIndex, toIndex));
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
    const unscheduled = posts.filter(p => p.status === 'Ready to Schedule' && !p.scheduledDate);
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
                onReorder={setGridOrder}
                onClickPost={setSelectedPost}
                onRemoveFromGrid={handleRemoveFromGrid}
                onUploadThumbnail={handleUploadThumbnail}
                onUploadToEmptyCell={handleUploadToEmptyCell}
                onHover={setHoveredPostId}
                hoveredId={hoveredPostId}
                externalDraggingId={activeId && !gridPostIds.has(activeId) ? activeId : null}
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
          posts={posts.filter(p => p.status === 'Ready to Schedule' && !p.scheduledDate)}
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
          <div className="h-full grid gap-0" style={{ gridTemplateColumns: leftColumnCollapsed ? '0px 28px 1fr' : '450px 8px 1fr', transition: 'grid-template-columns 0.3s ease-out' }}>
            {/* Left column: Ready (collapsible top) + Grid (always visible bottom) */}
            <div
              className="h-full bg-white overflow-y-auto"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent' }}
              onMouseEnter={e => { e.currentTarget.style.scrollbarColor = 'rgba(0,0,0,0.2) transparent'; }}
              onMouseLeave={e => { e.currentTarget.style.scrollbarColor = 'transparent transparent'; }}
            >
              {!readyCollapsed && !leftColumnCollapsed && (
                <DraggableReadyList
                  posts={readyPosts}
                  gridPostIds={gridPostIds}
                  onClickPost={setSelectedPost}
                  onRemove={handleRemoveFromSchedule}
                  onHover={setHoveredPostId}
                  hoveredId={hoveredPostId}
                  draggingId={activeId}
                  swooshPostId={swooshPostId}
                />
              )}
              {readyCollapsed && (
                <CollapsedReadyDropZone
                  count={readyPosts.length}
                  onExpand={() => setReadyCollapsed(false)}
                />
              )}
              <div className={`border-t border-gray-100 pt-4 ${readyCollapsed ? 'mt-2' : 'mt-4'}`}>
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
                  externalDraggingId={activeId && !gridPostIds.has(activeId) ? activeId : null}
                  onExpand={() => setReadyCollapsed(true)}
                  onCollapse={() => setReadyCollapsed(false)}
                />
              </div>
            </div>

            {/* Toggle button — centered vertically on the divider */}
            <div className="relative z-10 flex items-center justify-center">
              <button
                onClick={() => setLeftColumnCollapsed(prev => !prev)}
                className="w-6 h-6 min-w-6 min-h-6 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-600 hover:border-gray-300 shadow-sm transition-colors"
                title={leftColumnCollapsed ? 'Show sidebar' : 'Hide sidebar'}
              >
                {leftColumnCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
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
        posts={posts.filter(p => p.status === 'Ready to Schedule' && !p.scheduledDate)}
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
  swooshPostId?: string | null;
}> = (props) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'ready-drop-zone' });

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors duration-200 ${isOver ? 'bg-[#612A4F]/[0.04]' : ''}`}
      style={{
        outline: isOver ? '2px dashed rgba(97, 42, 79, 0.3)' : 'none',
        outlineOffset: '-2px',
        borderRadius: isOver ? '12px' : '0',
        minHeight: '80px',
      }}
    >
      {props.posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 pt-10 pb-4">
          {isOver ? (
            <p className="text-[13px] text-[#612A4F] font-medium">Drop here to unschedule</p>
          ) : (
            <>
              {/* Illustration — stacked cards with calendar badge */}
              <div className="relative w-[80px] h-[68px] mb-2">
                {/* Back card — image placeholder */}
                <div className="absolute top-0 left-[7px] w-[48px] h-[36px] rounded-md bg-gray-100 border border-gray-200/60 rotate-[-8deg] shadow-sm overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                </div>
                {/* Middle card — image placeholder */}
                <div className="absolute top-[6px] left-[19px] w-[48px] h-[36px] rounded-md bg-gray-50 border border-gray-200/60 rotate-[3deg] shadow-sm overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-150" />
                </div>
                {/* Front card — image with mountain/sun icon */}
                <div className="absolute top-[12px] left-[12px] w-[48px] h-[36px] rounded-md bg-white border border-gray-200 shadow-md flex items-center justify-center overflow-hidden">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-gray-300">
                    <rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor" opacity="0.15" />
                    <circle cx="8.5" cy="8.5" r="2" fill="currentColor" opacity="0.4" />
                    <path d="M2 17l5-5 3 3 4-4 8 8v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-3z" fill="currentColor" opacity="0.3" />
                  </svg>
                </div>
                {/* Calendar badge */}
                <div className="absolute bottom-[4px] right-[5px] w-[23px] h-[23px] rounded-full bg-[#612A4F]/10 flex items-center justify-center">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#612A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
              </div>
              <p className="text-[15px] font-semibold text-gray-800 mb-1.5">No posts ready to schedule yet</p>
              <p className="text-[12px] text-gray-400 text-center mb-5 leading-relaxed max-w-[260px]">
                Add posts here by changing their status to "Ready to Schedule"
              </p>
              <a
                href="/posts"
                className="px-5 py-2 text-[12px] font-medium text-white bg-[#612A4F] rounded-full hover:bg-[#612A4F]/85 transition-colors shadow-sm"
              >
                Add Posts
              </a>
            </>
          )}
        </div>
      ) : (
        <>
          <div
            className="px-2 pt-4 pb-0 space-y-0.5 overflow-y-auto"
            style={{ maxHeight: 240, scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent' }}
            onMouseEnter={e => { e.currentTarget.style.scrollbarColor = 'rgba(0,0,0,0.2) transparent'; }}
            onMouseLeave={e => { e.currentTarget.style.scrollbarColor = 'transparent transparent'; }}
          >
            <AnimatePresence>
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
                  isSwoosh={props.swooshPostId === post.id}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
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
  isSwoosh?: boolean;
}> = ({ post, gridPostIds, onClickPost, onRemove, onHover, isHovered, isDragging, isSwoosh }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: post.id });
  const swooshDone = useRef(false);
  const shouldSwoosh = isSwoosh && !swooshDone.current;

  useEffect(() => {
    if (isSwoosh) {
      swooshDone.current = true;
    }
  }, [isSwoosh]);

  return (
    <motion.div
      ref={setNodeRef}
      layout={!shouldSwoosh}
      initial={shouldSwoosh ? { x: -300, opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: isDragging ? 0.3 : 1, x: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={shouldSwoosh
        ? { type: 'spring', stiffness: 200, damping: 20, mass: 0.6, delay: 0.1 }
        : { duration: 0.25, ease: 'easeOut' }
      }
      style={{ transform: !isSwoosh && transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined }}
      {...attributes}
      {...listeners}
      onClick={() => onClickPost(post)}
      onMouseEnter={() => onHover(post.id)}
      onMouseLeave={() => onHover(null)}
      className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 cursor-grab active:cursor-grabbing transition-all duration-200 group ${
        isHovered ? 'bg-[#612A4F]/[0.04] shadow-sm' : 'hover:bg-gray-50'
      }`}
    >
      <GripVertical className="w-3 h-3 text-gray-300 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
      {post.thumbnail_url ? (
        <img src={post.thumbnail_url} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <ImageIcon className="w-3.5 h-3.5 text-gray-300" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-gray-800 truncate">{post.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {post.format && (
            <span className="text-[9px] text-gray-400">{post.format}</span>
          )}
          <PlatformIconsDisplay platforms={post.platforms} size={9} />
        </div>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onRemove(post.id); }}
        className="flex-shrink-0 p-1 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
};

// ── Collapsed Ready Drop Zone ─────────────────────────────────

const CollapsedReadyDropZone: React.FC<{ count: number; onExpand: () => void }> = ({ count, onExpand }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'ready-drop-zone' });

  return (
    <button
      ref={setNodeRef}
      onClick={onExpand}
      className={`w-full flex items-center gap-2 px-5 py-4 transition-colors ${
        isOver ? 'bg-[#612A4F]/[0.06]' : 'hover:bg-gray-50'
      }`}
      style={{
        outline: isOver ? '2px dashed rgba(97, 42, 79, 0.3)' : 'none',
        outlineOffset: '-2px',
        borderRadius: isOver ? '12px' : '0',
      }}
    >
      <span className="text-[15px] font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Ready to Schedule</span>
      <span className="text-[11px] text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5">{count}</span>
    </button>
  );
};

// ── Drag Preview ─────────────────────────────────────────────

const DragPreview: React.FC<{ post: Post }> = ({ post }) => (
  <div className="w-[120px] rounded-xl shadow-2xl border border-gray-100 bg-white p-2 opacity-95 rotate-2">
    {post.thumbnail_url ? (
      <img src={post.thumbnail_url} alt="" className="w-full aspect-square object-cover rounded-lg" />
    ) : (
      <div className="w-full aspect-square rounded-lg bg-gray-50 flex items-center justify-center">
        <ImageIcon className="w-4 h-4 text-gray-300" />
      </div>
    )}
    <p className="text-[10px] font-medium text-gray-700 truncate mt-1.5">{post.title}</p>
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
