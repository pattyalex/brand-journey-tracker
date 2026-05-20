import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, MapPin, Camera, ChevronDown, ArrowRight, Check, X, MoreHorizontal, Copy, Trash2, ImageIcon, Calendar, Aperture } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useShootsStore } from '@/hooks/useShootsStore';
import { getJSON, setJSON } from '@/lib/storage';
import { Shoot } from '@/types/shoots';
import { SHOOT_STATUS_COLORS } from '@/types/shoots';
import { Post, DEFAULT_PILLARS, DEFAULT_FORMATS, getPillarStyle, STATUS_COLORS } from '@/types/posts';
import { StatusIcon } from '@/components/posts/StatusDropdown';
import ShootDetail from '@/components/shoots/ShootDetail';
import CreateShootModal from '@/components/shoots/CreateShootModal';
import MobileExecutionView from '@/components/shoots/MobileExecutionView';
import PostDetailPanel from '@/components/posts/PostDetailPanel';
import { format, formatDistanceToNow, isAfter } from 'date-fns';

type Screen = 'list' | 'detail';

const Shoots: React.FC = () => {
  const {
    shoots,
    posts,
    upcomingShoots,
    pastShoots,
    addShoot,
    updateShoot,
    deleteShoot,
    duplicateShoot,
    getPostsForShoot,
    getUnassignedPosts,
    assignPostsToShoot,
    removePostFromShoot,
    updatePost,
    getShootById,
  } = useShootsStore();

  const [screen, setScreen] = useState<Screen>('list');
  const [selectedShootId, setSelectedShootId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pastExpanded, setPastExpanded] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());
  const [detailPost, setDetailPost] = useState<Post | null>(null);

  const togglePostSelection = useCallback((id: string) => {
    setSelectedPostIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectedShoot = selectedShootId ? getShootById(selectedShootId) : null;
  const selectedShootPosts = selectedShootId ? getPostsForShoot(selectedShootId) : [];
  const unassignedPosts = getUnassignedPosts();
  const nonArchivedShoots = shoots.filter(s => s.status !== 'Archived');

  // ── Navigation ──

  const handleSelectShoot = useCallback((id: string) => {
    setSelectedShootId(id);
    setScreen('detail');
  }, []);

  const handleBackToList = useCallback(() => {
    setScreen('list');
    setSelectedShootId(null);
  }, []);

  // ── Create shoot ──

  const handleSaveNewShoot = useCallback(
    (data: { name: string; mainLocation: string; date: string; outfits: string[]; gear: string[]; notes: string; postIds: string[] }) => {
      const mainLoc = data.mainLocation
        ? [{ id: crypto.randomUUID(), name: data.mainLocation, address: '', lat: 0, lng: 0, place_id: '' }]
        : [];
      const newShoot: Shoot = {
        id: crypto.randomUUID(),
        name: data.name,
        date: data.date,
        status: 'Planned',
        locations: mainLoc,
        outfits: data.outfits,
        gear: data.gear,
        notes: data.notes,
        optimized_route_order: [],
        ai_plan: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      addShoot(newShoot);

      if (data.postIds.length > 0) {
        assignPostsToShoot(data.postIds, newShoot.id);
      }

      setShowCreateModal(false);
      setSelectedShootId(newShoot.id);
      setScreen('detail');
    },
    [addShoot, assignPostsToShoot]
  );

  // ── Detail handlers ──

  const handleUpdateShoot = useCallback(
    (updates: Partial<Shoot>) => { if (selectedShootId) updateShoot(selectedShootId, updates); },
    [selectedShootId, updateShoot]
  );
  const handleDuplicateShoot = useCallback(() => {
    if (selectedShootId) duplicateShoot(selectedShootId);
    handleBackToList();
  }, [selectedShootId, duplicateShoot, handleBackToList]);
  const handleDeleteShoot = useCallback(() => {
    if (selectedShootId) deleteShoot(selectedShootId);
    handleBackToList();
  }, [selectedShootId, deleteShoot, handleBackToList]);
  const handleAssignPosts = useCallback(
    (postIds: string[]) => { if (selectedShootId) assignPostsToShoot(postIds, selectedShootId); },
    [selectedShootId, assignPostsToShoot]
  );
  const handleRemovePost = useCallback((postId: string) => removePostFromShoot(postId), [removePostFromShoot]);
  const handleUpdatePost = useCallback((postId: string, updates: Partial<Post>) => {
    updatePost(postId, updates);
    setDetailPost(prev => prev && prev.id === postId ? { ...prev, ...updates } : prev);
  }, [updatePost]);
  const handleMarkAsShot = useCallback((postId: string) => updatePost(postId, { status: 'Shot' }), [updatePost]);

  const today = new Date().toISOString().split('T')[0];
  const showMobileExecution = isMobile && selectedShoot && (selectedShoot.date === today || selectedShoot.status === 'In Progress');

  // ── Render ──

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {screen === 'list' && (
          <motion.div
            key="list"
            className="h-full overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Shoots</h1>
                  <p className="text-[13px] text-gray-400 mt-0.5">Plan, organize, and execute your content capture days</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-[0_2px_10px_rgba(97,42,79,0.3)] hover:shadow-[0_4px_20px_rgba(97,42,79,0.4)] hover:scale-[1.03] active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #612A4F 0%, #8B3A6B 100%)' }}
                >
                  <Plus size={16} strokeWidth={2.5} />
                  Plan a shoot
                </button>
              </div>

              {/* Empty state */}
              {nonArchivedShoots.length === 0 && unassignedPosts.length === 0 && (
                <motion.div
                  className="flex flex-col items-center justify-center py-24 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(97,42,79,0.06) 0%, rgba(139,58,107,0.08) 100%)' }}>
                    <Aperture size={28} className="text-[#612a4f]/25" />
                  </div>
                  <p className="text-[16px] font-semibold text-gray-700 mb-2">Plan your first shoot</p>
                  <p className="text-[13px] text-gray-400 max-w-sm leading-relaxed">
                    Group your content ideas into a shoot day — pick a location, set a date, and see everything you need to capture.
                  </p>
                </motion.div>
              )}

              {/* Upcoming shoots — full width hero section */}
              {upcomingShoots.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#612A4F]" />
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Upcoming shoots</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {upcomingShoots.map((shoot, i) => (
                      <ShootCard
                        key={shoot.id}
                        shoot={shoot}
                        posts={getPostsForShoot(shoot.id)}
                        onClick={() => handleSelectShoot(shoot.id)}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Content to shoot */}
              {(unassignedPosts.length > 0 || nonArchivedShoots.length > 0) && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Content to shoot</p>
                    {unassignedPosts.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-semibold">{unassignedPosts.length}</span>
                    )}
                  </div>
                  {unassignedPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {unassignedPosts.map((post, i) => {
                        const isChecked = selectedPostIds.has(post.id);
                        const pillarStyle = post.pillar ? getPillarStyle(post.pillar) : null;
                        return (
                          <motion.div
                            key={post.id}
                            onClick={() => setDetailPost(post)}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.03 }}
                            className={`group relative rounded-2xl border bg-white cursor-pointer transition-all duration-200 overflow-hidden ${
                              isChecked
                                ? 'border-[#612A4F]/30 shadow-[0_0_0_1px_rgba(97,42,79,0.15),0_4px_12px_rgba(97,42,79,0.08)]'
                                : 'border-gray-100 hover:border-gray-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
                            }`}
                          >
                            {/* Selection indicator */}
                            <div
                              onClick={(e) => { e.stopPropagation(); togglePostSelection(post.id); }}
                              className={`absolute top-3 right-3 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 z-10 cursor-pointer ${
                              isChecked ? 'bg-[#612A4F] border-[#612A4F] scale-100' : 'border-gray-200 bg-white opacity-0 group-hover:opacity-100 hover:border-gray-400'
                            }`}>
                              {isChecked && <Check size={10} className="text-white" strokeWidth={3} />}
                            </div>

                            <div className="p-4">
                              {/* Title with thumbnail */}
                              <div className="flex items-start gap-2.5 mb-2.5 pr-6">
                                {post.thumbnail_url && (
                                  <img src={post.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                )}
                                <p className="text-[13px] font-semibold text-gray-800 leading-snug">{post.title}</p>
                              </div>

                              {/* Tags row */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {pillarStyle && (
                                  <span
                                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                    style={{
                                      backgroundColor: pillarStyle.bg,
                                      color: pillarStyle.text,
                                      border: `1px solid ${pillarStyle.border}`,
                                    }}
                                  >
                                    {post.pillar}
                                  </span>
                                )}
                                {post.format && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-50 text-gray-500 border border-gray-100">
                                    {post.format}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updatePost(post.id, { sentToShoots: false });
                                const stored = getJSON<Post[]>('meg_shoots_posts', []);
                                setJSON('meg_shoots_posts', stored.map(p => p.id === post.id ? { ...p, sentToShoots: false } : p));
                              }}
                              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50/80 transition-all duration-150"
                            >
                              <X size={12} />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                      <p className="text-[13px] text-gray-400">No content waiting to be grouped into a shoot</p>
                      <p className="text-[11px] text-gray-300 mt-1">Mark posts as "Ready to shoot" and send them here from the Posts page</p>
                    </div>
                  )}

                  {/* Plan a shoot bar */}
                  <AnimatePresence>
                    {selectedPostIds.size > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 rounded-2xl text-white px-6 py-3.5 shadow-[0_8px_32px_rgba(97,42,79,0.35)] flex items-center gap-5 backdrop-blur-sm"
                        style={{ background: 'linear-gradient(135deg, #612A4F 0%, #7B3461 100%)' }}
                      >
                        <span className="text-[13px] font-semibold tabular-nums">
                          {selectedPostIds.size} selected
                        </span>
                        <div className="w-px h-5 bg-white/20" />
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="flex items-center gap-1.5 bg-white text-[#612A4F] px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-white/90 transition-all duration-150 shadow-sm"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          Plan a shoot
                        </button>
                        <button
                          onClick={() => setSelectedPostIds(new Set())}
                          className="text-white/40 hover:text-white/80 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Past shoots — collapsible */}
              {pastShoots.length > 0 && (
                <div className="pt-2">
                  <button
                    onClick={() => setPastExpanded(p => !p)}
                    className="flex items-center gap-2 mb-4 group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider group-hover:text-gray-500 transition-colors">
                      Past shoots
                    </p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium">{pastShoots.length}</span>
                    <motion.span animate={{ rotate: pastExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={12} className="text-gray-300" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {pastExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                          {pastShoots.map((shoot, i) => (
                            <ShootCard
                              key={shoot.id}
                              shoot={shoot}
                              posts={getPostsForShoot(shoot.id)}
                              onClick={() => handleSelectShoot(shoot.id)}
                              index={i}
                              isPast
                              onDelete={deleteShoot}
                              onDuplicate={duplicateShoot}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {screen === 'detail' && selectedShoot && (
          <motion.div
            key="detail"
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {showMobileExecution ? (
              <MobileExecutionView
                shoot={selectedShoot}
                posts={selectedShootPosts}
                onMarkAsShot={handleMarkAsShot}
                onBack={handleBackToList}
              />
            ) : (
              <ShootDetail
                shoot={selectedShoot}
                posts={selectedShootPosts}
                allPosts={posts}
                onUpdate={handleUpdateShoot}
                onDuplicate={handleDuplicateShoot}
                onDelete={handleDeleteShoot}
                onBack={handleBackToList}
                onAssignPosts={handleAssignPosts}
                onRemovePost={handleRemovePost}
                onUpdatePost={handleUpdatePost}
                getUnassignedPosts={getUnassignedPosts}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <CreateShootModal
        open={showCreateModal}
        onOpenChange={(open) => { setShowCreateModal(open); if (!open) setSelectedPostIds(new Set()); }}
        selectedPostCount={selectedPostIds.size}
        availablePosts={unassignedPosts}
        preSelectedPostIds={Array.from(selectedPostIds)}
        onSave={(data) => {
          handleSaveNewShoot({ ...data, postIds: data.postIds.length > 0 ? data.postIds : Array.from(selectedPostIds) });
          setSelectedPostIds(new Set());
        }}
      />

      <PostDetailPanel
        post={detailPost}
        pillars={DEFAULT_PILLARS}
        formats={DEFAULT_FORMATS}
        onClose={() => setDetailPost(null)}
        onUpdate={handleUpdatePost}
        onDelete={(id) => { handleDeletePost(id); setDetailPost(null); }}
        onAddFormat={() => {}}
        onDeleteFormat={() => {}}
        onDeletePillar={() => {}}
      />
    </div>
  );
};

// ── Shoot Card ──────────────────────────────────────────────────

interface ShootCardProps {
  shoot: Shoot;
  posts: Post[];
  onClick: () => void;
  index: number;
  isPast?: boolean;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

function ShootCard({ shoot, posts, onClick, index, isPast, onDelete, onDuplicate }: ShootCardProps) {
  const shootDate = new Date(shoot.date + 'T00:00:00');
  const primaryLocation = shoot.locations?.[0]?.name;
  const isFuture = isAfter(shootDate, new Date());
  const timeLabel = isPast
    ? formatDistanceToNow(shootDate, { addSuffix: true })
    : isFuture
    ? formatDistanceToNow(shootDate, { addSuffix: true })
    : 'Today';
  const thumbnails = posts.filter(p => p.thumbnail_url).slice(0, 4);

  return (
    <motion.div
      onClick={onClick}
      className={`group/card relative rounded-2xl border bg-white cursor-pointer transition-all duration-200 overflow-hidden ${
        isPast ? 'border-gray-100 opacity-70 hover:opacity-100' : 'border-gray-100 hover:border-gray-200'
      }`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isPast ? 0.7 : 1, y: 0 }}
      whileHover={{ opacity: 1, y: -2, boxShadow: '0 8px 30px rgba(97, 42, 79, 0.1)' }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      {/* Thumbnail mosaic */}
      {thumbnails.length > 0 && (
        <div className={`grid gap-[1px] bg-gray-100 ${thumbnails.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`} style={{ height: thumbnails.length > 2 ? 140 : 100 }}>
          {thumbnails.map((post, i) => (
            <img key={post.id} src={post.thumbnail_url} alt="" className="w-full h-full object-cover" />
          ))}
          {thumbnails.length === 3 && <div className="bg-gray-50" />}
        </div>
      )}

      {/* Card body */}
      <div className="p-4">
        {/* Date badge + time label */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
            isPast ? 'bg-gray-50 text-gray-400' : 'bg-[#612A4F]/[0.06] text-[#612A4F]'
          }`}>
            <Calendar size={11} />
            {format(shootDate, 'EEE, MMM d')}
          </div>
          <span className="text-[10px] text-gray-400">{timeLabel}</span>
        </div>

        {/* Shoot name — full, no truncation */}
        <p className={`text-[15px] font-semibold leading-snug mb-1.5 ${isPast ? 'text-gray-500' : 'text-gray-900'}`}>
          {shoot.name}
        </p>

        {/* Location */}
        {primaryLocation && (
          <div className="flex items-center gap-1 mb-3">
            <MapPin size={11} className="text-gray-300 flex-shrink-0" />
            <span className="text-[11px] text-gray-400">{primaryLocation}</span>
          </div>
        )}

        {/* Posts list */}
        {posts.length > 0 ? (
          <div className="space-y-1">
            {posts.slice(0, 3).map(post => {
              const sc = STATUS_COLORS[post.status] || { dot: '#9CA3AF' };
              return (
                <div key={post.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc.dot }} />
                  <span className="text-[11px] text-gray-600 leading-tight">{post.title}</span>
                </div>
              );
            })}
            {posts.length > 3 && (
              <p className="text-[10px] text-gray-400 pl-3.5">+{posts.length - 3} more</p>
            )}
          </div>
        ) : !isPast ? (
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-4 h-4 rounded-full border border-dashed border-gray-200 flex items-center justify-center">
              <Plus size={8} className="text-gray-300" />
            </div>
            <span className="text-[11px] text-gray-400">Add content ideas</span>
          </div>
        ) : null}
      </div>

      {/* Post count badge */}
      {posts.length > 0 && (
        <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-white/80 backdrop-blur-sm text-gray-500 shadow-sm border border-white/50">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </div>
      )}

      {/* Past shoot actions */}
      {isPast && onDelete && onDuplicate && (
        <div className="absolute top-3 right-3">
          <Popover>
            <PopoverTrigger asChild>
              <button
                onClick={e => e.stopPropagation()}
                className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm text-gray-300 hover:text-gray-500 hover:bg-white border border-white/50 shadow-sm opacity-0 group-hover/card:opacity-100 transition-all duration-150"
              >
                <MoreHorizontal size={14} />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={4} className="w-40 p-1 rounded-xl border border-gray-100 bg-white shadow-xl" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => onDuplicate(shoot.id)}
                className="flex items-center gap-2 px-3 py-2 text-[12px] text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer w-full"
              >
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </button>
              <button
                onClick={() => onDelete(shoot.id)}
                className="flex items-center gap-2 px-3 py-2 text-[12px] text-red-500 hover:bg-red-50 rounded-lg cursor-pointer w-full"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Hover arrow indicator */}
      {!isPast && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover/card:opacity-100 transition-all duration-200 translate-x-1 group-hover/card:translate-x-0">
          <ArrowRight size={14} className="text-[#612A4F]/40" />
        </div>
      )}
    </motion.div>
  );
}

export default Shoots;
