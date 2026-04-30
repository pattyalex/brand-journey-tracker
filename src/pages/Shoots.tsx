import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, MapPin, Camera, ChevronDown, ArrowRight, Check, X } from 'lucide-react';
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
            <div className="max-w-3xl mx-auto px-6 md:px-8 py-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-800 tracking-[-0.02em]">Plan your capture days</h1>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 bg-[#612A4F] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#4e2140] transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  Plan a shoot
                </button>
              </div>

              {/* Incoming content ideas — select to group into a shoot */}
              {unassignedPosts.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                        Select content to group into a shoot
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                    {unassignedPosts.map((post, i) => {
                      const isChecked = selectedPostIds.has(post.id);
                      const sc = STATUS_COLORS[post.status] || { dot: '#9CA3AF' };
                      return (
                        <div
                          key={post.id}
                          onClick={() => togglePostSelection(post.id)}
                          className={`group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 ${
                            i > 0 ? 'border-t border-gray-50' : ''
                          } ${isChecked ? 'bg-[#612A4F]/[0.03]' : 'hover:bg-gray-50/60'}`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${
                            isChecked ? 'bg-[#612A4F] border-[#612A4F]' : 'border-gray-300'
                          }`}>
                            {isChecked && <Check size={10} className="text-white" strokeWidth={3} />}
                          </div>
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
                            <span className="text-[10px] text-gray-400 flex-shrink-0">{post.format}</span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updatePost(post.id, { sentToShoots: false });
                              // Also update in localStorage
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

                  {/* Plan a shoot bar — appears when posts are selected */}
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
                            onClick={() => {
                              setShowCreateModal(true);
                            }}
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
              )}

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

              {/* Upcoming shoots */}
              {upcomingShoots.length > 0 && (
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-4">Upcoming</p>
                  <div className="space-y-4">
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

              {/* Past shoots */}
              {pastShoots.length > 0 && (
                <div>
                  <button
                    onClick={() => setPastExpanded(p => !p)}
                    className="flex items-center gap-1.5 mb-4 group"
                  >
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                      Past ({pastShoots.length})
                    </p>
                    <motion.span animate={{ rotate: pastExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={14} className="text-gray-400" />
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
                        <div className="space-y-4">
                          {pastShoots.map((shoot, i) => (
                            <ShootCard
                              key={shoot.id}
                              shoot={shoot}
                              posts={getPostsForShoot(shoot.id)}
                              onClick={() => handleSelectShoot(shoot.id)}
                              index={i}
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
    </div>
  );
};

// ── Shoot Card ──────────────────────────────────────────────────

interface ShootCardProps {
  shoot: Shoot;
  posts: Post[];
  onClick: () => void;
  index: number;
}

function ShootCard({ shoot, posts, onClick, index }: ShootCardProps) {
  const shootDate = new Date(shoot.date + 'T00:00:00');
  const statusColor = SHOOT_STATUS_COLORS[shoot.status] || { dot: '#9CA3AF', bg: '#F3F4F6', text: '#6B7280' };
  const primaryLocation = shoot.locations?.[0]?.name;

  return (
    <motion.div
      onClick={onClick}
      className="rounded-xl border border-gray-100 bg-white p-5 cursor-pointer transition-all duration-200 hover:shadow-[0_4px_16px_rgba(93,63,90,0.1)] hover:border-gray-200"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      whileHover={{ y: -1 }}
    >
      {/* Top row: date + name + location + status */}
      <div className="flex items-start gap-4 mb-3">
        {/* Date block */}
        <div className="flex-shrink-0 text-center min-w-[44px]">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 leading-tight">
            {format(shootDate, 'EEE')}
          </p>
          <p className="text-base font-semibold text-gray-800 leading-tight">
            {format(shootDate, 'MMM d')}
          </p>
        </div>

        {/* Name + location */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-gray-800 truncate">{shoot.name}</p>
          {primaryLocation && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={12} className="text-gray-400 flex-shrink-0" />
              <span className="text-[12px] text-gray-400 truncate">{primaryLocation}</span>
            </div>
          )}
        </div>

        {/* Post count */}
        {posts.length > 0 && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </span>
        )}

      </div>

      {/* Content ideas in this shoot */}
      {posts.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pl-[60px]">
          {posts.map(post => {
            const pillarStyle = getPillarStyle(post.pillar);
            const sc = STATUS_COLORS[post.status] || { dot: '#9CA3AF' };
            return (
              <span
                key={post.id}
                className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-100"
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc.dot }} />
                <span className="truncate max-w-[180px]">{post.title}</span>
              </span>
            );
          })}
        </div>
      ) : (
        <p className="text-[11px] text-gray-300 italic pl-[60px]">No content ideas linked yet</p>
      )}
    </motion.div>
  );
}

export default Shoots;
