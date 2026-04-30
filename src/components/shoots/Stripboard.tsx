import React, { useState, useMemo, useRef, useCallback } from 'react';
import { X, Search, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '@/types/posts';
import StripCard from './StripCard';

interface StripboardProps {
  posts: Post[];
  onClose: () => void;
  onCreateShoot: (selectedPostIds: string[]) => void;
}

const Stripboard: React.FC<StripboardProps> = ({ posts, onClose, onCreateShoot }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const lastClickedIndexRef = useRef<number | null>(null);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.notes && p.notes.toLowerCase().includes(q))
    );
  }, [posts, searchQuery]);

  const handleToggleSelect = useCallback(
    (id: string, event?: React.MouseEvent) => {
      const currentIndex = filteredPosts.findIndex((p) => p.id === id);

      setSelectedIds((prev) => {
        const next = new Set(prev);

        if (event?.shiftKey && lastClickedIndexRef.current !== null) {
          const start = Math.min(lastClickedIndexRef.current, currentIndex);
          const end = Math.max(lastClickedIndexRef.current, currentIndex);
          for (let i = start; i <= end; i++) {
            next.add(filteredPosts[i].id);
          }
        } else {
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
        }

        return next;
      });

      lastClickedIndexRef.current = currentIndex;
    },
    [filteredPosts]
  );

  const selectedCount = selectedIds.size;

  return (
    <div className="h-full bg-white flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Top bar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-800 tracking-[-0.02em]">Plan a Shoot</h1>
          <span className="text-sm text-gray-400">
            {selectedCount} selected
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Sort controls row */}
      <div className="flex items-center gap-3 px-6 py-2 border-b border-gray-50 text-xs">
        <span className="text-gray-400">Sort by:</span>

        {/* Placeholder dropdowns */}
        {['Location', 'Outfit', 'Vibe'].map((label) => (
          <select
            key={label}
            disabled
            className="text-xs px-2 py-1 rounded border border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed appearance-none"
          >
            <option>{label}</option>
          </select>
        ))}

        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            placeholder="Search strips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs pl-7 pr-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#8B7082] focus:ring-1 focus:ring-[#8B7082]/20 w-48"
          />
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 overflow-y-auto py-2 px-6 space-y-1">
        {searchQuery.trim() && filteredPosts.length > 0 && (
          <p className="text-xs text-gray-400 py-1">{filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''}</p>
        )}

        {filteredPosts.length === 0 && posts.length === 0 ? (
          /* Empty state — no unassigned posts at all */
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <Link size={24} className="text-gray-300" />
            <p className="text-sm text-gray-400">No posts sent to Shoots yet</p>
            <p className="text-xs text-gray-300">Use the menu on any post in the Posts page to send it here</p>
          </div>
        ) : filteredPosts.length === 0 && searchQuery.trim() ? (
          /* No results for search */
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <Search size={24} className="text-gray-300" />
            <p className="text-sm text-gray-400">No strips match your search</p>
          </div>
        ) : (
          filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleSelect(post.id, e);
              }}
            >
              <StripCard
                post={post}
                isSelected={selectedIds.has(post.id)}
                onToggleSelect={() => {
                  /* handled by parent onClick for shift-click support */
                }}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Floating action bar */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-6 mb-6 rounded-xl bg-gray-900 text-white px-5 py-3 shadow-2xl flex items-center justify-between"
          >
            <span className="text-sm">
              {selectedCount} strip{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => onCreateShoot(Array.from(selectedIds))}
              className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Create shoot from selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Stripboard;
