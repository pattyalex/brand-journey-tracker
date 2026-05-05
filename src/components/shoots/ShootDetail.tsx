import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, X } from 'lucide-react';

import ShootHeader from './ShootHeader';
import OutfitsGearNotes from './OutfitsGearNotes';
import LocationsBlock from './LocationsBlock';
import PostDetailPanel from '@/components/posts/PostDetailPanel';

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

  return (
    <motion.div
      className="h-full overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-6">
        {/* Header */}
        <ShootHeader
          shoot={shoot}
          onUpdate={onUpdate}
          onDuplicate={onDuplicate}
          onArchive={handleArchive}
          onDelete={onDelete}
          onBack={onBack}
        />

        {/* Content to capture */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                Content to capture
              </span>
              {totalCount > 0 && (
                <span className="text-[11px] text-gray-400">
                  {shotCount}/{totalCount} done
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="h-1 rounded-full bg-gray-100 mb-4 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#612A4F]"
                initial={{ width: 0 }}
                animate={{ width: `${(shotCount / totalCount) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          )}

          {/* Post list with checkmarks */}
          {posts.length > 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
              {posts.map((post, i) => {
                const isDone = post.status === 'Shot' || post.status === 'Edited' || post.status === 'Scheduled' || post.status === 'Posted';
                const pillar = post.pillar || '';
                const format = post.format || '';
                const pillarStyle = getPillarStyle(pillar);
                return (
                  <div
                    key={post.id}
                    className={`group flex items-center gap-3 px-4 py-3 transition-colors duration-150 ${
                      i > 0 ? 'border-t border-gray-50' : ''
                    } ${isDone ? 'bg-gray-50/50' : ''}`}
                  >
                    {/* Checkmark circle */}
                    <button
                      onClick={() => {
                        if (isDone) {
                          onUpdatePost(post.id, { status: 'Ready to shoot' });
                        } else {
                          handleMarkAsShot(post.id);
                        }
                      }}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 cursor-pointer ${
                        isDone
                          ? 'bg-[#059669] border-[#059669] hover:bg-[#059669]/80'
                          : 'border-gray-300 hover:border-[#612A4F]'
                      }`}
                    >
                      {isDone && <Check size={12} className="text-white" strokeWidth={3} />}
                    </button>

                    {/* Title */}
                    <span
                      onClick={() => setDetailPost(post)}
                      className={`text-sm flex-1 truncate transition-colors cursor-pointer hover:text-[#612A4F] ${
                        isDone ? 'text-gray-400 line-through' : 'text-gray-800'
                      }`}
                    >
                      {post.title}
                    </span>

                    {/* Pillar */}
                    {pillar && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                        style={{
                          backgroundColor: pillarStyle.bg,
                          color: pillarStyle.text,
                          border: `1px solid ${pillarStyle.border}`,
                        }}
                      >
                        {pillar}
                      </span>
                    )}

                    {/* Format */}
                    {format && (
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{format}</span>
                    )}

                    {/* Remove */}
                    <button
                      onClick={() => onRemovePost(post.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all duration-150 flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 py-10 flex flex-col items-center gap-3 text-center px-6">
              <p className="text-sm text-gray-400">No content linked yet</p>
              <p className="text-[12px] text-gray-300 max-w-[260px] leading-relaxed">
                Go to the Posts page and set content to "Ready to shoot", then use the arrow to send it here.
              </p>
            </div>
          )}
        </div>

        {/* Location, Outfits, Props, Notes */}
        <div className="mt-8">
          <LocationsBlock
            locations={shoot.locations || []}
            onAddLocation={handleAddLocation}
            onRemoveLocation={handleRemoveLocation}
            onReorderLocations={handleReorderLocations}
          />
        </div>

        <div className="mt-6">
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
