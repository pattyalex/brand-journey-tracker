import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Post, PostStatus, DEFAULT_PILLARS, DEFAULT_FORMATS, POST_STATUSES, STATUS_COLORS } from '@/types/posts';
import { seedPosts } from '@/data/postsSeedData';
import PostsPipeline from '@/components/posts/PostsPipeline';
import PostsTable from '@/components/posts/PostsTable';
import PostDetailPanel from '@/components/posts/PostDetailPanel';
import PostQuickAdd from '@/components/posts/PostQuickAdd';
import PostsFilterBar from '@/components/posts/PostsFilterBar';
import PostsPillarsView from '@/components/posts/PostsPillarsView';
import PostsCalendarView from '@/components/posts/PostsCalendarView';

type ViewMode = 'List' | 'Pillars' | 'Calendar';
const VIEW_MODES: ViewMode[] = ['List', 'Pillars', 'Calendar'];

const STORAGE_KEY = 'heymeg-posts-active-view';

function loadView(): ViewMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && VIEW_MODES.includes(saved as ViewMode)) return saved as ViewMode;
  } catch {}
  return 'List';
}

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(seedPosts);
  const [pillars, setPillars] = useState<string[]>(DEFAULT_PILLARS);
  const [formats, setFormats] = useState<string[]>(DEFAULT_FORMATS);
  const [activeView, setActiveView] = useState<ViewMode>(loadView);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastSelectedId = useRef<string | null>(null);

  // Filters
  const [filterPillars, setFilterPillars] = useState<Set<string>>(new Set());
  const [filterStatuses, setFilterStatuses] = useState<Set<PostStatus>>(new Set());
  const [filterFormats, setFilterFormats] = useState<Set<string>>(new Set());
  const [activePreset, setActivePreset] = useState<'bank' | 'scheduled' | null>(null);

  // Persist view
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, activeView);
  }, [activeView]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) return;
      if (e.key === '1') setActiveView('List');
      if (e.key === '2') setActiveView('Pillars');
      if (e.key === '3') setActiveView('Calendar');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Filtering ──────────────────────────────────────────────

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (filterPillars.size > 0) result = result.filter(p => filterPillars.has(p.pillar));
    if (filterStatuses.size > 0) result = result.filter(p => filterStatuses.has(p.status));
    if (filterFormats.size > 0) result = result.filter(p => filterFormats.has(p.format));
    return result;
  }, [posts, filterPillars, filterStatuses, filterFormats]);

  // ── Filter handlers ────────────────────────────────────────

  const toggleFilter = <T,>(setter: React.Dispatch<React.SetStateAction<Set<T>>>, value: T) => {
    setter(prev => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
    setActivePreset(null);
  };

  const handleTogglePillar = (p: string) => toggleFilter(setFilterPillars, p);
  const handleToggleStatus = (s: PostStatus) => toggleFilter(setFilterStatuses, s);
  const handleToggleFormat = (f: string) => toggleFilter(setFilterFormats, f);

  const handleClearAllFilters = () => {
    setFilterPillars(new Set());
    setFilterStatuses(new Set());
    setFilterFormats(new Set());
    setActivePreset(null);
  };

  const handleApplyPreset = (preset: 'bank' | 'scheduled') => {
    if (activePreset === preset) {
      setFilterStatuses(new Set());
      setActivePreset(null);
      return;
    }
    setActivePreset(preset);
    setFilterFormats(new Set());
    setFilterPillars(new Set());
    if (preset === 'bank') {
      setFilterStatuses(new Set<PostStatus>(['Shot', 'Edited']));
    } else {
      setFilterStatuses(new Set<PostStatus>(['Scheduled']));
    }
  };

  // ── Post handlers ──────────────────────────────────────────

  const handleUpdatePost = useCallback((id: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    setSelectedPost(prev => prev && prev.id === id ? { ...prev, ...updates } : prev);
  }, []);

  const handleReorder = useCallback((reordered: Post[]) => {
    setPosts(prev => {
      const reorderedIds = new Set(reordered.map(p => p.id));
      const rest = prev.filter(p => !reorderedIds.has(p.id));
      return [...reordered, ...rest];
    });
  }, []);

  const handleAddPost = useCallback((title: string, pillar?: string, scheduledDate?: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      title,
      pillar: pillar || '',
      format: '',
      status: 'Idea',
      scheduledDate,
      order: posts.length,
      createdAt: new Date().toISOString(),
    };
    setPosts(prev => [...prev, newPost]);
    return newPost;
  }, [posts.length]);

  const handleDeletePost = useCallback((id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    setSelectedPost(prev => prev?.id === id ? null : prev);
  }, []);

  const handleSelectToggle = useCallback((id: string, shiftKey: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (shiftKey && lastSelectedId.current) {
        const ids = filteredPosts.map(p => p.id);
        const start = ids.indexOf(lastSelectedId.current);
        const end = ids.indexOf(id);
        if (start !== -1 && end !== -1) {
          const [from, to] = start < end ? [start, end] : [end, start];
          for (let i = from; i <= to; i++) next.add(ids[i]);
        }
      } else {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      }
      lastSelectedId.current = id;
      return next;
    });
  }, [filteredPosts]);

  const handleBulkStatusChange = useCallback((status: PostStatus) => {
    setPosts(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, status } : p));
    setSelectedIds(new Set());
  }, [selectedIds]);

  const handleBulkDelete = useCallback(() => {
    setPosts(prev => prev.filter(p => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
  }, [selectedIds]);

  // ── Pillar management ──────────────────────────────────────

  const handleAddPillar = (name: string) => {
    setPillars(prev => [...prev, name]);
  };

  const handleDeletePillar = (pillar: string) => {
    setPillars(prev => prev.filter(p => p !== pillar));
    setFilterPillars(prev => { const n = new Set(prev); n.delete(pillar); return n; });
  };

  const handleRenamePillar = (oldName: string, newName: string) => {
    setPillars(prev => prev.map(p => p === oldName ? newName : p));
    setPosts(prev => prev.map(p => p.pillar === oldName ? { ...p, pillar: newName } : p));
    setFilterPillars(prev => {
      if (!prev.has(oldName)) return prev;
      const n = new Set(prev);
      n.delete(oldName);
      n.add(newName);
      return n;
    });
  };

  // ── Format management ───────────────────────────────────────

  const handleAddFormat = (name: string) => {
    setFormats(prev => [...prev, name]);
  };

  const handleDeleteFormat = (name: string) => {
    setFormats(prev => prev.filter(f => f !== name));
    setFilterFormats(prev => { const n = new Set(prev); n.delete(name); return n; });
  };

  const handleRenameFormat = (oldName: string, newName: string) => {
    setFormats(prev => prev.map(f => f === oldName ? newName : f));
    setPosts(prev => prev.map(p => p.format === oldName ? { ...p, format: newName } : p));
    setFilterFormats(prev => {
      if (!prev.has(oldName)) return prev;
      const n = new Set(prev);
      n.delete(oldName);
      n.add(newName);
      return n;
    });
  };

  // ── Calendar: create post on date ──────────────────────────

  const handleCreateOnDate = useCallback((date: string) => {
    const newPost = handleAddPost('Untitled post', pillars[0] || 'General', date);
    setSelectedPost(newPost);
  }, [handleAddPost, pillars]);

  const handleSwitchToListBank = useCallback(() => {
    setActiveView('List');
    setFilterStatuses(new Set());
    setActivePreset(null);
    setFilterPillars(new Set());
    setFilterFormats(new Set());
  }, []);

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 lg:px-10">
        {/* Header: View Switcher */}
        <div className="flex items-center justify-end mb-4">
          <ViewSwitcher active={activeView} onChange={setActiveView} />
        </div>

        {/* Filter Bar */}
        <PostsFilterBar
          pillars={pillars}
          filterPillars={filterPillars}
          filterStatuses={filterStatuses}
          filterFormats={filterFormats}
          onTogglePillar={handleTogglePillar}
          onToggleStatus={handleToggleStatus}
          onToggleFormat={handleToggleFormat}
          onClearAll={handleClearAllFilters}
          onApplyPreset={handleApplyPreset}
          activePreset={activePreset}
          onClearPillars={() => setFilterPillars(new Set())}
          onClearStatuses={() => { setFilterStatuses(new Set()); setActivePreset(null); }}
          onClearFormats={() => setFilterFormats(new Set())}
          onAddPillar={handleAddPillar}
          onDeletePillar={handleDeletePillar}
          onRenamePillar={handleRenamePillar}
          formats={formats}
          onAddFormat={handleAddFormat}
          onDeleteFormat={handleDeleteFormat}
          onRenameFormat={handleRenameFormat}
        />

        {/* Bulk actions bar (List view only) */}
        <AnimatePresence>
          {selectedIds.size > 0 && activeView === 'List' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-2.5 mb-3 bg-[#612a4f]/5 rounded-lg border border-[#612a4f]/10">
                <span className="text-xs font-medium text-[#612a4f]">
                  {selectedIds.size} selected
                </span>
                <div className="h-3 w-px bg-[#612a4f]/20" />
                <span className="text-xs text-gray-500">Move to:</span>
                {POST_STATUSES.map(status => (
                  <button
                    key={status}
                    onClick={() => handleBulkStatusChange(status)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium hover:bg-white/60 transition-colors duration-150"
                    style={{ color: STATUS_COLORS[status].text }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[status].dot }}
                    />
                    {status}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-red-500 hover:bg-red-50 transition-colors duration-150"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-150"
                  >
                    Deselect
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View body with crossfade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activeView === 'List' && (
              <div className="bg-white rounded-lg border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.03)] overflow-visible">
                {filteredPosts.length === 0 ? (
                  <ListEmptyState />
                ) : (
                  <PostsTable
                    posts={filteredPosts}
                    allPosts={posts}
                    pillars={pillars}
                    formats={formats}
                    detailPanelOpen={!!selectedPost}
                    onRowClick={setSelectedPost}
                    onUpdatePost={handleUpdatePost}
                    onDeletePost={handleDeletePost}
                    onAddFormat={handleAddFormat}
                    onDeleteFormat={handleDeleteFormat}
                    onDeletePillar={handleDeletePillar}
                    onReorder={handleReorder}
                    selectedIds={selectedIds}
                    onSelectToggle={handleSelectToggle}
                  />
                )}
                <PostQuickAdd onAdd={handleAddPost} />
              </div>
            )}

            {activeView === 'Pillars' && (
              <PostsPillarsView
                posts={filteredPosts}
                pillars={pillars}
                onClickPost={setSelectedPost}
                onUpdatePost={handleUpdatePost}
                onDeletePost={handleDeletePost}
                onAddPost={handleAddPost}
                onReorder={handleReorder}
              />
            )}

            {activeView === 'Calendar' && (
              <PostsCalendarView
                posts={filteredPosts}
                allPosts={posts}
                pillars={pillars}
                onClickPost={setSelectedPost}
                onUpdatePost={handleUpdatePost}
                onCreateOnDate={handleCreateOnDate}
                onSwitchToList={handleSwitchToListBank}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Detail Panel */}
      <PostDetailPanel
        post={selectedPost}
        pillars={pillars}
        formats={formats}
        onClose={() => setSelectedPost(null)}
        onUpdate={handleUpdatePost}
        onDelete={handleDeletePost}
        onAddFormat={handleAddFormat}
        onDeleteFormat={handleDeleteFormat}
        onDeletePillar={handleDeletePillar}
      />
    </div>
  );
};

// ── List Empty State ─────────────────────────────────────────

const ListEmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div className="w-12 h-12 rounded-full bg-[#612a4f]/6 flex items-center justify-center mb-4">
      <svg className="w-6 h-6 text-[#612a4f]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    </div>
    <h3 className="text-sm font-semibold text-gray-700 mb-1">Start creating</h3>
    <p className="text-xs text-gray-400 max-w-xs leading-relaxed">Add your first post idea to get started</p>
  </div>
);

// ── View Switcher ────────────────────────────────────────────

const ViewSwitcher: React.FC<{
  active: ViewMode;
  onChange: (view: ViewMode) => void;
}> = ({ active, onChange }) => {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-xs text-gray-400">View as</span>
      <div className="inline-flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100">
      {VIEW_MODES.map(view => (
        <button
          key={view}
          onClick={() => onChange(view)}
          className="relative px-4 py-1.5 text-xs font-medium rounded-md transition-colors duration-200"
          style={{ color: active === view ? '#1F2937' : '#9CA3AF' }}
        >
          {active === view && (
            <motion.div
              layoutId="activeView"
              className="absolute inset-0 bg-white rounded-md shadow-sm border border-gray-200/60"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{view}</span>
        </button>
      ))}
      </div>
    </div>
  );
};

export default Posts;
