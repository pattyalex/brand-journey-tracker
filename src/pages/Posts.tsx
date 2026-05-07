import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Camera, Bookmark, TrendingUp, Sparkles } from 'lucide-react';
import InspirationPanel from '@/components/posts/InspirationPanel';
import TitleHookSuggestions from '@/components/content/TitleHookSuggestions';
import ThemeBrainstormDialog from '@/components/content/ThemeBrainstormDialog';
import { Shoot } from '@/types/shoots';
import CreateShootModal from '@/components/shoots/CreateShootModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Post, PostStatus, DEFAULT_PILLARS, DEFAULT_FORMATS, POST_STATUSES, STATUS_COLORS } from '@/types/posts';
import { StatusIcon } from '@/components/posts/StatusDropdown';
import { seedPosts } from '@/data/postsSeedData';
import { getJSON, setJSON } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import * as postsApi from '@/services/postsService';
import * as contentApi from '@/services/contentService';
import PostsPipeline from '@/components/posts/PostsPipeline';
import PostsTable from '@/components/posts/PostsTable';
import PostDetailPanel from '@/components/posts/PostDetailPanel';
import PostQuickAdd from '@/components/posts/PostQuickAdd';
import PostsFilterBar from '@/components/posts/PostsFilterBar';
import PostsPillarsView from '@/components/posts/PostsPillarsView';
import PostsCalendarView from '@/components/posts/PostsCalendarView';

type ViewMode = 'List' | 'Pillars' | 'Timeline';
const VIEW_MODES: ViewMode[] = ['List', 'Pillars', 'Timeline'];

const STORAGE_KEY = 'heymeg-posts-active-view';

function loadView(): ViewMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && VIEW_MODES.includes(saved as ViewMode)) return saved as ViewMode;
  } catch {}
  return 'List';
}

function cleanBlobUrls(posts: Post[]): Post[] {
  return posts.map(p => {
    if (!p.attachedFiles) return p;
    const cleaned = p.attachedFiles.filter(f => {
      const url = f.includes('||') ? f.split('||')[1] : f;
      return !url.startsWith('blob:');
    });
    return cleaned.length !== p.attachedFiles.length
      ? { ...p, attachedFiles: cleaned }
      : p;
  });
}

const Posts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = getJSON<Post[] | null>('meg_posts', null);
    const raw = saved && saved.length > 0 ? saved : seedPosts;
    return cleanBlobUrls(raw);
  });
  const [pillars, setPillars] = useState<string[]>(() => {
    const saved = getJSON<string[] | null>('meg_pillars', null);
    return saved || [];
  });
  const [pillarIdMap, setPillarIdMap] = useState<Record<string, string>>({});
  const [formats, setFormats] = useState<string[]>(() => {
    const saved = getJSON<string[] | null>('meg_formats', null);
    return saved && saved.length > 0 ? saved : DEFAULT_FORMATS;
  });
  const [, setPillarColorVersion] = useState(0);
  const handleChangePillarColor = useCallback(() => {
    setPillarColorVersion(v => v + 1);
  }, []);

  // Load posts from Supabase on mount, merging with local cache to avoid losing unsynced posts
  useEffect(() => {
    if (!userId) return;
    postsApi.fetchPosts(userId).then(remote => {
      if (remote.length > 0) {
        const cleanedRemote = cleanBlobUrls(remote);
        // Merge: keep any local posts not yet in Supabase (unsynced optimistic adds)
        const cached = getJSON<Post[] | null>('meg_posts', null);
        if (cached && cached.length > 0) {
          const remoteIds = new Set(cleanedRemote.map(p => p.id));
          const unsyncedLocal = cleanBlobUrls(cached).filter(p => !remoteIds.has(p.id));
          if (unsyncedLocal.length > 0) {
            // Re-sync unsynced posts to Supabase
            unsyncedLocal.forEach(p => postsApi.createPost(p, userId).catch(console.error));
            setPosts([...cleanedRemote, ...unsyncedLocal]);
          } else {
            setPosts(cleanedRemote);
          }
        } else {
          setPosts(cleanedRemote);
        }
      } else {
        // First time: migrate localStorage posts to Supabase
        const local = getJSON<Post[] | null>('meg_posts', null);
        if (local && local.length > 0) {
          postsApi.upsertPosts(cleanBlobUrls(local), userId).catch(console.error);
        }
      }
    }).catch(err => {
      console.error('[Posts] Failed to load from Supabase, using localStorage:', err);
    });
  }, [userId]);

  // Persist posts to localStorage (cache)
  useEffect(() => {
    setJSON('meg_posts', posts);
  }, [posts]);
  // Load pillars from Supabase on mount
  useEffect(() => {
    if (!userId) return;
    contentApi.getUserContentPillars(userId).then(remote => {
      if (remote.length > 0) {
        const names = remote.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)).map(p => p.name);
        const idMap: Record<string, string> = {};
        remote.forEach(p => { idMap[p.name] = p.id; });
        setPillars(names);
        setPillarIdMap(idMap);
        setJSON('meg_pillars', names);
      }
    }).catch(err => {
      console.error('[Posts] Failed to load pillars from Supabase:', err);
    });
  }, [userId]);

  // Persist pillars to localStorage
  useEffect(() => {
    setJSON('meg_pillars', pillars);
  }, [pillars]);

  // Persist formats to localStorage
  useEffect(() => {
    setJSON('meg_formats', formats);
  }, [formats]);

  // On mount, ensure any custom formats used on posts are included in the formats list
  useEffect(() => {
    const formatsFromPosts = posts.map(p => p.format).filter(f => f && f.trim() !== '');
    const missing = [...new Set(formatsFromPosts)].filter(f => !formats.includes(f));
    if (missing.length > 0) {
      setFormats(prev => [...prev, ...missing.filter(f => !prev.includes(f))]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [activeView, setActiveView] = useState<ViewMode>(loadView);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastSelectedId = useRef<string | null>(null);
  const [showInspiration, setShowInspiration] = useState(false);
  const [showHooksDialog, setShowHooksDialog] = useState(false);
  const [showBrainstormDialog, setShowBrainstormDialog] = useState(false);

  const handleCreateFromInspiration = useCallback((url: string, notes?: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      title: '',
      pillar: '',
      format: '',
      status: 'Idea',
      attachedFiles: [url],
      notes: notes || '',
      order: posts.length,
      createdAt: new Date().toISOString(),
    };
    setPosts(prev => [...prev, newPost]);
    setSelectedPost(newPost);
    if (userId) postsApi.createPost(newPost, userId).catch(console.error);
  }, [posts.length, userId]);

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
      if (e.key === '3') setActiveView('Timeline');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Filtering ──────────────────────────────────────────────

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (filterPillars.size > 0) result = result.filter(p => filterPillars.has(p.pillar));
    if (filterStatuses.size > 0) result = result.filter(p => {
      if (filterStatuses.has(p.status as any)) return true;
      if (filterStatuses.has('Shoot in progress' as any) && p.status === 'Ready to shoot' && p.sentToShoots) return true;
      if (filterStatuses.has('Sent to schedule' as any) && p.status === 'Edited' && p.sent_to_schedule) return true;
      return false;
    });
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
    // Sync to Supabase in background
    postsApi.updatePost(id, updates).catch(console.error);
  }, []);

  const handleReplaceAttachment = useCallback((id: string, blobUrl: string, newEntry: string) => {
    const replace = (files: string[] | undefined) =>
      files?.map(f => f.includes(blobUrl) ? newEntry : f);
    setPosts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, attachedFiles: replace(p.attachedFiles) } : p);
      const post = updated.find(p => p.id === id);
      if (post) postsApi.updatePost(id, { attachedFiles: post.attachedFiles }).catch(console.error);
      return updated;
    });
    setSelectedPost(prev => prev && prev.id === id ? { ...prev, attachedFiles: replace(prev.attachedFiles) } : prev);
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
    // Sync to Supabase in background
    if (userId) postsApi.createPost(newPost, userId).catch(console.error);
    return newPost;
  }, [posts.length, userId]);

  const handleDeletePost = useCallback((id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    setSelectedPost(prev => prev?.id === id ? null : prev);
    // Sync to Supabase in background
    postsApi.deletePost(id).catch(console.error);
  }, []);

  const handleDuplicatePost = useCallback((id: string) => {
    setPosts(prev => {
      const original = prev.find(p => p.id === id);
      if (!original) return prev;
      const duplicate: Post = {
        ...original,
        id: Date.now().toString(),
        title: `${original.title} (copy)`,
        order: prev.length,
        createdAt: new Date().toISOString(),
      };
      if (userId) postsApi.createPost(duplicate, userId).catch(console.error);
      return [...prev, duplicate];
    });
  }, [userId]);

  const handleSendToShoots = useCallback((id: string) => {
    // Mark post as sent to shoots and copy to shoots store
    setPosts(prev => {
      const post = prev.find(p => p.id === id);
      if (post) {
        const updated = { ...post, sentToShoots: true };
        const shootsPosts = getJSON<Post[]>('meg_shoots_posts', []);
        if (!shootsPosts.find(p => p.id === id)) {
          setJSON('meg_shoots_posts', [...shootsPosts, updated]);
        } else {
          setJSON('meg_shoots_posts', shootsPosts.map(p => p.id === id ? updated : p));
        }
      }
      return prev.map(p => p.id === id ? { ...p, sentToShoots: true } : p);
    });
    setSelectedPost(prev => prev && prev.id === id ? { ...prev, sentToShoots: true } : prev);
    postsApi.updatePost(id, { sentToShoots: true }).catch(console.error);

    toast.success('Added to Shoots', {
      description: 'Plan your shoot day on the Shoots page.',
      action: {
        label: 'Go to Shoots',
        onClick: () => navigate('/shoots'),
      },
    });
  }, [navigate]);

  const handleSendToSchedule = useCallback((id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post || post.sent_to_schedule) return;
    setPosts(prev => prev.map(p => p.id === id ? { ...p, sent_to_schedule: true } : p));
    setSelectedPost(prev => prev && prev.id === id ? { ...prev, sent_to_schedule: true } : prev);
    postsApi.updatePost(id, { sent_to_schedule: true }).catch(console.error);
    toast.success('Sent to Schedule');
  }, [posts]);

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
    // Sync each to Supabase
    selectedIds.forEach(id => postsApi.updatePost(id, { status }).catch(console.error));
    setSelectedIds(new Set());
  }, [selectedIds]);

  const handleBulkDelete = useCallback(() => {
    setPosts(prev => prev.filter(p => !selectedIds.has(p.id)));
    // Sync each to Supabase
    selectedIds.forEach(id => postsApi.deletePost(id).catch(console.error));
    setSelectedIds(new Set());
  }, [selectedIds]);

  // ── Plan a shoot from selection ──
  const [showShootModal, setShowShootModal] = useState(false);
  const handlePlanShoot = useCallback((data: {
    name: string;
    mainLocation: string;
    date: string;
    outfits: string[];
    gear: string[];
    notes: string;
    postIds: string[];
  }) => {
    const mainLoc = data.mainLocation
      ? [{ id: crypto.randomUUID(), name: data.mainLocation, address: '', lat: 0, lng: 0, place_id: '' }]
      : [];
    const newShoot: Shoot = {
      id: crypto.randomUUID(),
      name: data.name,
      date: data.date,
      status: 'Planned' as const,
      locations: mainLoc,
      outfits: data.outfits,
      gear: data.gear,
      notes: data.notes,
      optimized_route_order: [],
      ai_plan: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save shoot to shoots localStorage
    const existingShoots = getJSON<Shoot[]>('meg_shoots', []);
    setJSON('meg_shoots', [newShoot, ...existingShoots]);

    // Copy selected posts to shoots_posts and link them
    const selectedPosts = posts.filter(p => selectedIds.has(p.id));
    const shootsPosts = getJSON<Post[]>('meg_shoots_posts', []);
    const linkedPosts = selectedPosts.map(p => ({ ...p, shoot_id: newShoot.id, sentToShoots: true }));
    // Add linked posts, avoid duplicates
    const existingIds = new Set(shootsPosts.map(p => p.id));
    const newShootsPosts = [
      ...shootsPosts.map(p => linkedPosts.find(lp => lp.id === p.id) || p),
      ...linkedPosts.filter(p => !existingIds.has(p.id)),
    ];
    setJSON('meg_shoots_posts', newShootsPosts);

    setSelectedIds(new Set());
    setShowShootModal(false);
    navigate('/shoots');
  }, [posts, selectedIds, navigate]);

  // ── Pillar management ──────────────────────────────────────

  const handleAddPillar = (name: string) => {
    setPillars(prev => [...prev, name]);
    if (userId) {
      contentApi.createContentPillar(userId, { name, position: pillars.length }).then(created => {
        if (created) setPillarIdMap(prev => ({ ...prev, [name]: created.id }));
      }).catch(console.error);
    }
  };

  const handleDeletePillar = (pillar: string) => {
    setPillars(prev => prev.filter(p => p !== pillar));
    setFilterPillars(prev => { const n = new Set(prev); n.delete(pillar); return n; });
    const pillarId = pillarIdMap[pillar];
    if (pillarId) {
      contentApi.deleteContentPillar(pillarId).catch(console.error);
      setPillarIdMap(prev => { const n = { ...prev }; delete n[pillar]; return n; });
    }
  };

  const handleRenamePillar = (oldName: string, newName: string) => {
    setPillars(prev => prev.map(p => p === oldName ? newName : p));
    setPosts(prev => {
      const updated = prev.map(p => p.pillar === oldName ? { ...p, pillar: newName } : p);
      updated.filter(p => p.pillar === newName).forEach(p =>
        postsApi.updatePost(p.id, { pillar: newName }).catch(console.error)
      );
      return updated;
    });
    setFilterPillars(prev => {
      if (!prev.has(oldName)) return prev;
      const n = new Set(prev);
      n.delete(oldName);
      n.add(newName);
      return n;
    });
    const pillarId = pillarIdMap[oldName];
    if (pillarId) {
      contentApi.updateContentPillar(pillarId, { name: newName }).catch(console.error);
      setPillarIdMap(prev => { const n = { ...prev }; delete n[oldName]; n[newName] = pillarId; return n; });
    }
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
    setPosts(prev => {
      const updated = prev.map(p => p.format === oldName ? { ...p, format: newName } : p);
      updated.filter(p => p.format === newName).forEach(p =>
        postsApi.updatePost(p.id, { format: newName }).catch(console.error)
      );
      return updated;
    });
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
        {/* Header: View Switcher + Inspiration */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHooksDialog(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-gray-500 hover:text-[#E07A5F] hover:bg-[#E07A5F]/5 transition-colors"
            >
              <TrendingUp size={14} />
              Trending Hooks
            </button>
            <button
              onClick={() => setShowInspiration(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-gray-500 hover:text-[#612A4F] hover:bg-[#612A4F]/5 transition-colors"
            >
              <Bookmark size={14} />
              Inspiration
            </button>
            <button
              onClick={() => setShowBrainstormDialog(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-gray-500 hover:text-[#2D9D70] hover:bg-[#2D9D70]/5 transition-colors"
            >
              <Sparkles size={14} />
              Brainstorm with MegAI
            </button>
          </div>
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
          onChangePillarColor={handleChangePillarColor}
          formats={formats}
          onAddFormat={handleAddFormat}
          onDeleteFormat={handleDeleteFormat}
          onRenameFormat={handleRenameFormat}
        />

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
                    onDuplicatePost={handleDuplicatePost}
                    onSendToShoots={handleSendToShoots}
                    onSendToSchedule={handleSendToSchedule}
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
                onDuplicatePost={handleDuplicatePost}
                onSendToShoots={handleSendToShoots}
                onSendToSchedule={handleSendToSchedule}
                onAddPost={handleAddPost}
                onReorder={handleReorder}
              />
            )}

            {activeView === 'Timeline' && (
              <PostsCalendarView
                posts={filteredPosts}
                allPosts={posts}
                pillars={pillars}
                onClickPost={setSelectedPost}
                onUpdatePost={handleUpdatePost}
                onDeletePost={handleDeletePost}
                onDuplicatePost={handleDuplicatePost}
                onSendToShoots={handleSendToShoots}
                onSendToSchedule={handleSendToSchedule}
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
        onReplaceAttachment={handleReplaceAttachment}
        onSendToShoots={handleSendToShoots}
        onSendToSchedule={handleSendToSchedule}
      />

      <InspirationPanel
        open={showInspiration}
        onClose={() => setShowInspiration(false)}
        onCreatePost={handleCreateFromInspiration}
      />

      <TitleHookSuggestions
        onSelectHook={() => {}}
        externalOpen={showHooksDialog}
        onExternalOpenChange={setShowHooksDialog}
      />

      <ThemeBrainstormDialog
        open={showBrainstormDialog}
        onOpenChange={setShowBrainstormDialog}
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

// ── Selection Bar ────────────────────────────────────────────

const PRE_PRODUCTION: PostStatus[] = ['Idea', 'Scripted', 'Ready to shoot'];

const SelectionBar: React.FC<{
  selectedIds: Set<string>;
  posts: Post[];
  onPlanShoot: () => void;
  onBulkStatusChange: (status: PostStatus) => void;
  onBulkDelete: () => void;
  onClear: () => void;
}> = ({ selectedIds, posts, onPlanShoot, onBulkStatusChange, onBulkDelete, onClear }) => {
  if (selectedIds.size === 0) return null;

  const selectedPosts = posts.filter(p => selectedIds.has(p.id));
  const allPreProduction = selectedPosts.every(p => PRE_PRODUCTION.includes(p.status));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.15 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 rounded-xl bg-[#612A4F] text-white pl-5 pr-4 py-3 shadow-xl flex items-center gap-4"
      >
        <span className="text-[13px] font-medium whitespace-nowrap">
          {selectedIds.size} selected
        </span>

        <div className="h-4 w-px bg-white/20" />

        {/* Plan a shoot — only when all selected are pre-production */}
        {allPreProduction && (
          <button
            onClick={onPlanShoot}
            className="flex items-center gap-1.5 bg-white text-[#612A4F] px-3.5 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-white/90 transition-colors whitespace-nowrap"
          >
            <Camera className="w-3.5 h-3.5" />
            Plan a shoot
          </button>
        )}

        {/* Bulk status change */}
        <div className="flex items-center gap-1">
          {POST_STATUSES.map(status => (
            <button
              key={status}
              onClick={() => onBulkStatusChange(status)}
              title={status}
              className="w-2.5 h-2.5 rounded-full transition-transform hover:scale-150"
              style={{ backgroundColor: STATUS_COLORS[status].dot }}
            />
          ))}
        </div>

        <button
          onClick={onBulkDelete}
          className="flex items-center gap-1 text-white/50 hover:text-white/90 text-[13px] transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onClear}
          className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
        >
          &times;
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default Posts;
