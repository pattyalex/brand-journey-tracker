import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, X, ArrowDownToLine } from 'lucide-react';
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
      <div className="flex flex-col px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Ready to Schedule</h2>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <ArrowDownToLine className="w-4 h-4 text-gray-300" />
          </div>
          <p className="text-[13px] text-gray-400 text-center leading-relaxed">
            Posts marked as <span className="font-medium text-gray-500">Edited</span> will appear here when you send them to Schedule.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-3 py-4">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Ready to Schedule</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5">
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
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={() => onClickPost(post)}
                onMouseEnter={() => onHover(post.id)}
                onMouseLeave={() => onHover(null)}
                className={`flex items-center gap-3 rounded-xl px-2.5 py-2 cursor-pointer transition-all duration-150 group ${
                  isHovered
                    ? 'bg-[#F9F5F7] shadow-[0_1px_4px_rgba(97,42,79,0.06)]'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Thumbnail */}
                {post.thumbnail_url ? (
                  <img
                    src={post.thumbnail_url}
                    alt=""
                    className="w-11 h-11 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-4 h-4 text-gray-300" />
                  </div>
                )}
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-800 truncate">{post.title || 'Untitled'}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${inGrid ? 'bg-[#612A4F]' : 'bg-gray-200'}`} />
                      <span className="text-[10px] text-gray-400">Visual</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${inCalendar ? 'bg-[#612A4F]' : 'bg-gray-200'}`} />
                      <span className="text-[10px] text-gray-400">Scheduled</span>
                    </div>
                  </div>
                </div>
                {/* Remove */}
                {onRemove && (
                  <button
                    onClick={e => { e.stopPropagation(); onRemove(post.id); }}
                    className="flex-shrink-0 p-1 rounded-md text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-150"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReadySidebar;
