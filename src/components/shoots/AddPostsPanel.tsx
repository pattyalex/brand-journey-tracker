import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check } from 'lucide-react';
import { Post, getPillarStyle } from '@/types/posts';

interface AddPostsPanelProps {
  open: boolean;
  onClose: () => void;
  unassignedPosts: Post[];
  onAddPosts: (postIds: string[]) => void;
}

const AddPostsPanel: React.FC<AddPostsPanelProps> = ({
  open,
  onClose,
  unassignedPosts,
  onAddPosts,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  // Reset state when panel opens
  useEffect(() => {
    if (open) {
      setSelectedIds(new Set());
      setSearch('');
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return unassignedPosts;
    const q = search.toLowerCase();
    return unassignedPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.pillar.toLowerCase().includes(q) ||
        p.format.toLowerCase().includes(q)
    );
  }, [unassignedPosts, search]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    if (selectedIds.size === 0) return;
    onAddPosts(Array.from(selectedIds));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/15 backdrop-blur-[3px] z-[50]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-[55] flex flex-col"
          >
            {/* Sticky header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2
                    className="text-lg font-semibold text-gray-900"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Add Posts
                  </h2>
                  {selectedIds.size > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#612A4F]/10 text-[#612A4F] font-medium">
                      {selectedIds.size} selected
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-300 transition-colors duration-150"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>

            {/* Post list */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {filteredPosts.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {filteredPosts.map((post) => {
                    const isSelected = selectedIds.has(post.id);
                    const pillarStyle = getPillarStyle(post.pillar);

                    return (
                      <div
                        key={post.id}
                        onClick={() => toggleSelect(post.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'border-[#612A4F]/20 bg-[#612A4F]/[0.03]'
                            : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                        }`}
                      >
                        {/* Checkbox */}
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${
                            isSelected
                              ? 'bg-[#612A4F] border-[#612A4F]'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <Check size={10} className="text-white" strokeWidth={3} />
                          )}
                        </div>

                        {/* Title */}
                        <span
                          className="text-sm font-medium text-gray-800 flex-1 truncate"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {post.title}
                        </span>

                        {/* Pillar pill */}
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: pillarStyle.bg,
                            color: pillarStyle.text,
                            border: `1px solid ${pillarStyle.border}`,
                          }}
                        >
                          {post.pillar}
                        </span>

                        {/* Format */}
                        {post.format && (
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {post.format}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <p
                    className="text-sm text-gray-400"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {search.trim()
                      ? 'No matching posts found'
                      : 'No unassigned posts available'}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom sticky bar */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4">
              <button
                onClick={handleAdd}
                disabled={selectedIds.size === 0}
                className="w-full bg-[#612A4F] text-white rounded-xl py-2.5 text-sm font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#4e2140]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {selectedIds.size === 0
                  ? 'Add posts'
                  : `Add ${selectedIds.size} post${selectedIds.size === 1 ? '' : 's'}`}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddPostsPanel;
