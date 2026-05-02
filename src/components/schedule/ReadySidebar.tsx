import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, ImageIcon, X } from 'lucide-react';
import { Post } from '@/types/posts';

interface ReadySidebarProps {
  posts: Post[];
  gridPostIds: Set<string>;
  onClickPost: (post: Post) => void;
  onRemove?: (id: string) => void;
  onHover: (id: string | null) => void;
  hoveredId: string | null;
  draggingId: string | null;
}

const ReadySidebar: React.FC<ReadySidebarProps> = ({ posts, gridPostIds, onClickPost, onRemove, onHover, hoveredId, draggingId }) => {
  if (posts.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-1.5 px-3 py-3 border-b border-gray-100">
          <Pin className="w-3 h-3 text-gray-400" />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Ready</span>
        </div>
        <div className="flex-1 flex items-center justify-center px-3">
          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            No posts ready yet. Mark posts as Edited in Posts and click the arrow to send them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-1.5 px-3 py-3 border-b border-gray-100">
        <Pin className="w-3 h-3 text-gray-400" />
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Ready</span>
        <span className="text-[10px] text-gray-400 ml-auto">{posts.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        <AnimatePresence initial={false}>
          {posts.map(post => {
            const inGrid = gridPostIds.has(post.id);
            const inCalendar = !!post.scheduledDate;
            const isHovered = hoveredId === post.id;
            const isDragging = draggingId === post.id;

            return (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: isDragging ? 0.3 : 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                onClick={() => onClickPost(post)}
                onMouseEnter={() => onHover(post.id)}
                onMouseLeave={() => onHover(null)}
                className={`rounded-lg border bg-white p-2 cursor-pointer transition-all duration-150 group ${
                  isHovered ? 'border-[#612A4F]/25 shadow-[0_2px_8px_rgba(97,42,79,0.08)]' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                {/* Thumbnail */}
                {post.thumbnail_url ? (
                  <img
                    src={post.thumbnail_url}
                    alt=""
                    className="w-full aspect-square object-cover rounded-md mb-1.5"
                  />
                ) : (
                  <div className="w-full aspect-square rounded-md bg-gray-50 flex items-center justify-center mb-1.5">
                    <ImageIcon className="w-4 h-4 text-gray-300" />
                  </div>
                )}
                {/* Title + remove */}
                <div className="flex items-center gap-1 mb-1.5">
                  <p className="text-[11px] font-medium text-gray-800 truncate flex-1">{post.title}</p>
                  {onRemove && (
                    <button
                      onClick={e => { e.stopPropagation(); onRemove(post.id); }}
                      className="flex-shrink-0 p-0.5 rounded text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-150"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {/* Progress dots */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${inGrid ? 'bg-[#612A4F]' : 'border border-gray-300'}`} />
                    <span className="text-[9px] text-gray-400">Grid</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${inCalendar ? 'bg-[#612A4F]' : 'border border-gray-300'}`} />
                    <span className="text-[9px] text-gray-400">Date</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReadySidebar;
