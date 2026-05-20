import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, X, ChevronLeft, MapPin, Calendar, Camera, MoreHorizontal, Copy, Trash2 } from 'lucide-react';
import { format, formatDistanceToNow, isAfter } from 'date-fns';

import OutfitsGearNotes from './OutfitsGearNotes';
import LocationsBlock from './LocationsBlock';
import PostDetailPanel from '@/components/posts/PostDetailPanel';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

import { Shoot, ShootLocation } from '@/types/shoots';
import { Post, DEFAULT_PILLARS, DEFAULT_FORMATS, getPillarStyle, STATUS_COLORS } from '@/types/posts';

interface ShootDetailProps {
  shoot: Shoot;
  posts: Post[];
  allPosts: Post[];
  onUpdate: (updates: Partial<Shoot>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onBack: () => void;
  onAssignPosts: (postIds: string[]) => void;
  onRemovePost: (postId: string) => void;
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
  getUnassignedPosts: () => Post[];
}

export default function ShootDetail({
  shoot,
  posts,
  allPosts,
  onUpdate,
  onDuplicate,
  onDelete,
  onBack,
  onAssignPosts,
  onRemovePost,
  onUpdatePost,
  getUnassignedPosts,
}: ShootDetailProps) {
  const [detailPost, setDetailPost] = useState<Post | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleAddLocation = (location: ShootLocation) => {
    onUpdate({ locations: [...(shoot.locations || []), location] });
  };
  const handleRemoveLocation = (locationId: string) => {
    onUpdate({ locations: (shoot.locations || []).filter(l => l.id !== locationId) });
  };
  const handleReorderLocations = (reordered: ShootLocation[]) => {
    onUpdate({ locations: reordered });
  };
  const handleArchive = () => onUpdate({ status: 'Archived' });

  const handleMarkAsShot = (postId: string) => {
    onUpdatePost(postId, { status: 'Shot' });
  };


  const shotCount = posts.filter(p => p.status === 'Shot' || p.status === 'Edited' || p.status === 'Scheduled' || p.status === 'Posted').length;
  const totalCount = posts.length;

  const shootDate = new Date(shoot.date + 'T00:00:00');
  const now = new Date();
  const isFuture = isAfter(shootDate, now);
  const diffMs = shootDate.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const primaryLocation = shoot.locations?.[0]?.name;
  const progressPct = totalCount > 0 ? (shotCount / totalCount) * 100 : 0;

  return (
    <motion.div
      className="h-full overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="max-w-3xl mx-auto px-6 md:px-8 pt-5">
        {/* Back + menu */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronLeft size={16} />
            <span className="text-sm">Shoots</span>
          </button>
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <MoreHorizontal size={18} className="text-gray-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-1 bg-white rounded-xl border border-gray-100 shadow-xl">
              <div onClick={() => { setMenuOpen(false); onDuplicate(); }} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                <Copy size={14} /> Duplicate
              </div>
              <div onClick={() => { setMenuOpen(false); onDelete(); }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg cursor-pointer">
                <Trash2 size={14} /> Delete
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Shoot info */}
        <div className="flex items-start gap-5 mb-2 pb-6 border-b border-gray-100">
          {/* Date block */}
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #612A4F, #8B3A6B)' }}>
            <span className="text-[10px] text-white/70 uppercase tracking-wider font-medium leading-none">{format(shootDate, 'MMM')}</span>
            <span className="text-2xl font-bold text-white leading-none mt-0.5">{format(shootDate, 'd')}</span>
            <span className="text-[9px] text-white/60 uppercase tracking-wider font-medium leading-none mt-0.5">{format(shootDate, 'EEE')}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 truncate">{shoot.name}</h1>
            <div className="flex items-center gap-3 flex-wrap text-[13px] text-gray-500">
              {primaryLocation && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-gray-400" />
                  {primaryLocation}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Camera size={13} className="text-gray-400" />
                {totalCount} {totalCount === 1 ? 'post' : 'posts'}
              </div>
              {isFuture && (
                <span className="px-2 py-0.5 rounded-full bg-[#612A4F]/8 text-[#612A4F] text-[11px] font-semibold">
                  in {diffDays} {diffDays === 1 ? 'day' : 'days'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content to capture */}
        <div className="mt-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #612A4F, #8B3A6B)' }}>
              <Camera size={13} className="text-white" />
            </div>
            <span className="text-[13px] font-semibold text-gray-700">Content to Capture</span>
            {totalCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#612A4F]/10 text-[#612A4F] font-semibold">
                {shotCount}/{totalCount}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="h-1.5 rounded-full bg-gray-100 mb-5 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #612A4F, #c97ba8)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          )}

          {/* Post list */}
          {posts.length > 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
              {posts.map((post, i) => {
                const isDone = post.status === 'Shot' || post.status === 'Edited' || post.status === 'Scheduled' || post.status === 'Posted';
                const pillar = post.pillar || '';
                const fmt = post.format || '';
                const pillarStyle = getPillarStyle(pillar);
                return (
                  <div
                    key={post.id}
                    className={`group flex items-center gap-3 px-4 py-3.5 transition-colors duration-150 ${
                      i > 0 ? 'border-t border-gray-50' : ''
                    } ${isDone ? 'bg-emerald-50/30' : 'hover:bg-gray-50/50'}`}
                  >
                    <button
                      onClick={() => isDone ? onUpdatePost(post.id, { status: 'Ready to shoot' }) : handleMarkAsShot(post.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 cursor-pointer ${
                        isDone ? 'bg-emerald-500 border-emerald-500 hover:bg-emerald-400' : 'border-gray-300 hover:border-[#612A4F]'
                      }`}
                    >
                      {isDone && <Check size={12} className="text-white" strokeWidth={3} />}
                    </button>
                    <span
                      onClick={() => setDetailPost(post)}
                      className={`text-sm flex-1 truncate transition-colors cursor-pointer hover:text-[#612A4F] ${isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}
                    >
                      {post.title}
                    </span>
                    {pillar && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium" style={{ backgroundColor: pillarStyle.bg, color: pillarStyle.text, border: `1px solid ${pillarStyle.border}` }}>
                        {pillar}
                      </span>
                    )}
                    {fmt && <span className="text-[10px] text-gray-400 flex-shrink-0">{fmt}</span>}
                    <button onClick={() => onRemovePost(post.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all duration-150 flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 py-10 flex flex-col items-center gap-3 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                <Camera size={20} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">No content linked yet</p>
              <p className="text-[12px] text-gray-300 max-w-[260px] leading-relaxed">
                Go to the Posts page and set content to "Ready to shoot", then use the arrow to send it here.
              </p>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="mt-8">
          <LocationsBlock
            locations={shoot.locations || []}
            onAddLocation={handleAddLocation}
            onRemoveLocation={handleRemoveLocation}
            onReorderLocations={handleReorderLocations}
          />
        </div>

        {/* Outfits, Gear, Notes */}
        <div className="mt-6 mb-8">
          <OutfitsGearNotes
            outfits={shoot.outfits || []}
            gear={shoot.gear || []}
            notes={shoot.notes || ''}
            onUpdateOutfits={(outfits) => onUpdate({ outfits })}
            onUpdateGear={(gear) => onUpdate({ gear })}
            onUpdateNotes={(notes) => onUpdate({ notes })}
          />
        </div>
      </div>

      {/* Post detail panel */}
      <PostDetailPanel
        post={detailPost}
        pillars={DEFAULT_PILLARS}
        formats={DEFAULT_FORMATS}
        onClose={() => setDetailPost(null)}
        onUpdate={(id, updates) => {
          onUpdatePost(id, updates);
          setDetailPost(prev => prev && prev.id === id ? { ...prev, ...updates } : prev);
        }}
        onDelete={(id) => {
          onRemovePost(id);
          setDetailPost(null);
        }}
        onAddFormat={() => {}}
        onDeleteFormat={() => {}}
        onDeletePillar={() => {}}
      />

    </motion.div>
  );
}
