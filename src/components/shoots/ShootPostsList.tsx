import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Post } from '@/types/posts';
import ShootPostCard from './ShootPostCard';

interface ShootPostsListProps {
  posts: Post[];
  onRemovePost: (postId: string) => void;
  onMarkAsShot: (postId: string) => void;
  onClickPost: (post: Post) => void;
  onAddPosts: () => void;
}

const ShootPostsList: React.FC<ShootPostsListProps> = ({
  posts,
  onRemovePost,
  onMarkAsShot,
  onClickPost,
  onAddPosts,
}) => {
  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="text-xs uppercase tracking-wider text-gray-400 font-medium"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Posts in this shoot
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            {posts.length}
          </span>
        </div>
        <button
          onClick={onAddPosts}
          className="text-sm text-[#612A4F] hover:text-[#4e2140] font-medium flex items-center gap-1 transition-colors duration-150"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <Plus size={14} />
          Add posts
        </button>
      </div>

      {/* Post cards */}
      {posts.length > 0 ? (
        <div className="flex flex-col gap-2">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
            >
              <ShootPostCard
                post={post}
                onRemoveFromShoot={() => onRemovePost(post.id)}
                onMarkAsShot={() => onMarkAsShot(post.id)}
                onClickPost={() => onClickPost(post)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16">
          <p
            className="text-sm text-gray-400 mb-3"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            No posts in this shoot yet
          </p>
          <button
            onClick={onAddPosts}
            className="text-sm text-[#612A4F] hover:text-[#4e2140] font-medium flex items-center gap-1 transition-colors duration-150"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Plus size={14} />
            Add posts
          </button>
        </div>
      )}
    </div>
  );
};

export default ShootPostsList;
