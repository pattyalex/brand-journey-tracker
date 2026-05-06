import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, MapPin, Camera, ChevronDown, ArrowRight, Check, X, MoreHorizontal, Copy, Trash2 } from 'lucide-react';
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
import { format } from 'date-fns';

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
  const handleUpdatePost = useCallback((postId: string, updates: Partial<Post>) => updatePost(postId, updates), [updatePost]);
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
            <div className="max-w-5xl mx-auto px-6 md:px-8 py-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Plan your capture days</h1>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 bg-[#612A4F] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#4e2140] transition-colors shadow-sm"
                >
                  <Plus size={16} />
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
                  <div className="w-16 h-16 bg-[#612a4f]/[0.04] rounded-2xl flex items-center justify-center mb-5">
                    <Camera size={24} className="text-[#612a4f]/20" />
                  </div>
                  <p className="text-[15px] font-medium text-gray-600 mb-1">Plan your first shoot</p>
                  <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                    Group your content ideas into a shoot day — pick a location, set a date, and see everything you need to capture.
                  </p>
                </motion.div>
              )}

              {/* Two-column layout: Unassigned posts (left) + Upcoming shoots (right) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left column: Unassigned posts */}
                <div>
                  <p className="text-[13px] text-gray-900 font-semibold mb-4">Content to shoot</p>
                  {unassignedPosts.length > 0 ? (
                    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden divide-y divide-gray-50">
                      {unassignedPosts.map((post) => {
                        const isChecked = selectedPostIds.has(post.id);
                        return (
                          <div
                            key={post.id}
                            onClick={() => togglePostSelection(post.id)}
                            className={`group flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150 ${
                              isChecked ? 'bg-[#612A4F]/[0.03]' : 'hover:bg-gray-50/60'
                            }`}
                          >
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                                    isChecked ? 'bg-[#612A4F] border-[#612A4F]' : 'border-gray-300 group-hover:border-gray-400'
                                  }`}>
                                    {isChecked && <Check size={10} className="text-white" strokeWidth={3} />}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-[11px] bg-gray-500 text-white">
                                  Select to group into a shoot
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <span className="text-sm text-gray-800 flex-1 truncate">{post.title}</span>
                            {post.pillar && (
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                                style={{
                                  backgroundColor: getPillarStyle(post.pillar).bg,
                                  color: getPillarStyle(post.pillar).text,
                                  border: `1px solid ${getPillarStyle(post.pillar).border}`,
                                }}
                              >
                                {post.pillar}
                              </span>
                            )}
                            {post.format && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium bg-gray-100 text-gray-500">
                                {post.format}
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updatePost(post.id, { sentToShoots: false });
                                const stored = getJSON<Post[]>('meg_shoots_posts', []);
                                setJSON('meg_shoots_posts', stored.map(p => p.id === post.id ? { ...p, sentToShoots: false } : p));
                              }}
                              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all duration-150 flex-shrink-0 ml-1"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
                      <p className="text-[13px] text-gray-400">No content waiting to be grouped into a shoot</p>
                    </div>
                  )}

                  {/* Plan a shoot bar */}
                  <AnimatePresence>
                    {selectedPostIds.size > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="mt-3 rounded-xl bg-[#612A4F] text-white px-5 py-3 shadow-lg flex items-center justify-between"
                      >
                        <span className="text-[13px] font-medium">
                          {selectedPostIds.size} selected
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-1.5 bg-white text-[#612A4F] px-4 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-white/90 transition-colors"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            Plan a shoot
                          </button>
                          <button
                            onClick={() => setSelectedPostIds(new Set())}
                            className="text-white/40 hover:text-white/70 text-[13px] transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right column: Upcoming shoots */}
                <div>
                  <p className="text-[13px] text-gray-900 font-semibold mb-4">Upcoming</p>
                  {upcomingShoots.length > 0 ? (
                    <div className="space-y-3">
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
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
                      <p className="text-[13px] text-gray-400">No upcoming shoots planned</p>
                    </div>
                  )}

                  {/* Past shoots — collapsible, under upcoming */}
                  {pastShoots.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setPastExpanded(p => !p)}
                        className="flex items-center gap-1.5 mb-3"
                      >
                        <p className="text-[12px] text-gray-400 font-medium">
                          Past
                        </p>
                        <motion.span animate={{ rotate: pastExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={12} className="text-gray-400" />
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
                            <div className="space-y-2 pt-1">
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
              </div>
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

  return (
    <motion.div
      onClick={onClick}
      className={`rounded-xl border bg-white cursor-pointer transition-all duration-200 hover:shadow-[0_4px_16px_rgba(93,63,90,0.1)] hover:border-gray-200 overflow-hidden group/card ${
        isPast ? 'border-gray-100/80 opacity-75 hover:opacity-100' : 'border-gray-100'
      }`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isPast ? 0.75 : 1, y: 0 }}
      whileHover={{ opacity: 1, y: -1 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <div className="flex">
        {!isPast && (
          <div className="w-[3px] flex-shrink-0 bg-gradient-to-b from-[#612A4F] to-[#612A4F]/30" />
        )}
        <div className="flex-1 p-4">
          {/* Top row: date + name + location */}
          <div className="flex items-start gap-3 mb-2">
            <div className="flex-shrink-0 text-center min-w-[40px]">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 leading-tight">
                {format(shootDate, 'EEE')}
              </p>
              <p className={`text-sm font-semibold leading-tight ${isPast ? 'text-gray-500' : 'text-gray-800'}`}>
                {format(shootDate, 'MMM d')}
              </p>
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-[14px] font-semibold truncate ${isPast ? 'text-gray-600' : 'text-gray-800'}`}>{shoot.name}</p>
              {primaryLocation && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                  <span className="text-[11px] text-gray-400 truncate">{primaryLocation}</span>
                </div>
              )}
            </div>

            {posts.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </span>
            )}

            {isPast && onDelete && onDuplicate && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    onClick={e => e.stopPropagation()}
                    className="p-1 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 opacity-0 group-hover/card:opacity-100 transition-all duration-150 flex-shrink-0"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" sideOffset={4} className="w-40 p-1 rounded-lg border border-gray-100 bg-white shadow-lg" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onDuplicate(shoot.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer w-full"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => onDelete(shoot.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-red-500 hover:bg-red-50 rounded-md cursor-pointer w-full"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Content ideas */}
          {posts.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pl-[52px]">
              {posts.map(post => {
                const sc = STATUS_COLORS[post.status] || { dot: '#9CA3AF' };
                return (
                  <span
                    key={post.id}
                    className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-100"
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc.dot }} />
                    <span className="truncate max-w-[160px]">{post.title}</span>
                  </span>
                );
              })}
            </div>
          ) : !isPast ? (
            <div className="flex items-center gap-1.5 pl-[52px]">
              <div className="w-4 h-4 rounded-full border border-dashed border-gray-300 flex items-center justify-center">
                <Plus size={8} className="text-gray-300" />
              </div>
              <span className="text-[11px] text-gray-400">Add content ideas</span>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

export default Shoots;
