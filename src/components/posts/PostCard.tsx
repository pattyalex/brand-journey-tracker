import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, GripVertical, Trash2 } from 'lucide-react';
import { Post, STATUS_COLORS, PostStatus, getPillarStyle } from '@/types/posts';
import { StatusIcon } from './StatusDropdown';
import PostsDatePicker from './PostsDatePicker';

interface PostCardProps {
  post: Post;
  variant: 'pillar' | 'calendar';
  onClick: (post: Post) => void;
  allPosts?: Post[];
  onUpdatePost?: (id: string, updates: Partial<Post>) => void;
  onClickPost?: (post: Post) => void;
  onDelete?: (id: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, variant, onClick, allPosts = [], onUpdatePost, onClickPost, onDelete }) => {
  const pillarStyle = getPillarStyle(post.pillar);
  const statusColor = STATUS_COLORS[post.status];

  if (variant === 'calendar') {
    return (
      <motion.div
        layout={false}
        onClick={e => { e.stopPropagation(); onClick(post); }}
        className="relative rounded px-2 py-1 cursor-pointer hover:shadow-sm transition-shadow duration-150 text-left group/card"
        style={{ backgroundColor: pillarStyle.bg }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        <p className="text-[11px] font-medium text-gray-800 truncate">{post.title}</p>
        <div className="flex items-center justify-between">
          {post.format ? <span className="text-[9px] text-gray-500">{post.format}</span> : <span />}
          <span className="flex items-center gap-0.5 text-[9px] text-gray-400">
            <StatusIcon status={post.status} className="w-2 h-2" style={{ color: statusColor.dot }} />
            {post.status}
          </span>
        </div>
      </motion.div>
    );
  }

  // pillar variant
  return (
    <motion.div
      layout={false}
      onClick={() => onClick(post)}
      className="rounded-lg bg-white border border-gray-100 p-3 cursor-pointer hover:shadow-[0_4px_12px_rgba(93,63,90,0.08)] transition-shadow duration-200 group/card"
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-start gap-1.5 mb-2">
        <GripVertical className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">{post.title}</p>
        {onDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(post.id); }}
            className="opacity-0 group-hover/card:opacity-100 p-0.5 rounded text-gray-300 hover:text-red-500 transition-all duration-150 flex-shrink-0"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between">
        {post.format ? (
          <span className="text-[10px] text-gray-500">{post.format}</span>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <StatusIcon status={post.status} className="w-2.5 h-2.5" style={{ color: statusColor.dot }} />
            <span className="text-[10px] text-gray-400">{post.status}</span>
          </div>
          <div onClick={e => e.stopPropagation()}>
            <PostsDatePicker
            value={post.scheduledDate}
            allPosts={allPosts}
            onChange={date => onUpdatePost?.(post.id, { scheduledDate: date })}
            onClickPost={onClickPost}
            triggerSlot={
              post.scheduledDate ? (
                <button className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition-colors duration-150">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.scheduledDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </button>
              ) : (
                <button className="text-gray-300 hover:text-gray-500 transition-colors duration-150">
                  <Calendar className="w-3 h-3" />
                </button>
              )
            }
          />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
