import React from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Trash2, ImageIcon, ArrowRight, MoreVertical, Maximize2, Copy, Plus } from 'lucide-react';
import { Post, STATUS_COLORS, PostStatus, getPillarStyle } from '@/types/posts';
import { StatusIcon } from './StatusDropdown';
import PlatformSelector, { PlatformIconsDisplay } from './PlatformSelector';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface PostCardProps {
  post: Post;
  variant: 'pillar' | 'calendar';
  onClick: (post: Post) => void;
  allPosts?: Post[];
  onUpdatePost?: (id: string, updates: Partial<Post>) => void;
  onClickPost?: (post: Post) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onSendToShoots?: (id: string) => void;
  onSendToSchedule?: (id: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, variant, onClick, allPosts = [], onUpdatePost, onClickPost, onDelete, onDuplicate, onSendToShoots, onSendToSchedule }) => {
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
        <div className="flex items-center gap-1.5">
          {post.thumbnail_url ? (
            <motion.img
              key={post.thumbnail_url}
              src={post.thumbnail_url}
              alt=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-6 h-6 rounded-sm object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-6 h-6 rounded-sm bg-gray-100/50 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-2.5 h-2.5 text-gray-300" />
            </div>
          )}
          <p className="text-[11px] font-medium text-gray-800 truncate flex-1">{post.title}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {post.format ? <span className="text-[9px] text-gray-500">{post.format}</span> : <span />}
            <PlatformIconsDisplay platforms={post.platforms} size={9} />
          </div>
          <span className="flex items-center gap-0.5 text-[9px] text-gray-400">
            <StatusIcon status={post.status} className="w-2 h-2" style={{ color: statusColor.dot }} />
            {post.status}
            {post.status === 'Edited' && onSendToSchedule && !post.sent_to_schedule && (
              <div className="relative group/sched ml-0.5">
                <button
                  onClick={e => { e.stopPropagation(); onSendToSchedule(post.id); }}
                  className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#612A4F]/8 hover:bg-[#612A4F]/20 transition-colors"
                >
                  <ArrowRight size={7} className="text-[#612A4F]" />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded bg-gray-500 text-white text-[10px] font-medium whitespace-nowrap opacity-0 group-hover/sched:opacity-100 transition-opacity duration-100 pointer-events-none">
                  Schedule this post
                </div>
              </div>
            )}
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
      className="rounded-lg bg-white border border-gray-200 shadow-sm p-3 cursor-pointer hover:shadow-[0_4px_12px_rgba(93,63,90,0.08)] transition-shadow duration-200 group/card"
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-start gap-1.5 mb-2">
        <GripVertical className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5" />
        {post.thumbnail_url ? (
          <motion.img
            key={post.thumbnail_url}
            src={post.thumbnail_url}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-8 h-8 rounded object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-3.5 h-3.5 text-gray-300" />
          </div>
        )}
        <p className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">{post.title}</p>
        <Popover>
          <PopoverTrigger asChild>
            <button
              onClick={e => e.stopPropagation()}
              className="opacity-0 group-hover/card:opacity-100 p-0.5 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all duration-150 flex-shrink-0"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="p-1 bg-white rounded-lg border border-gray-200 shadow-lg w-[140px] z-[60]"
            align="end"
            sideOffset={4}
            onOpenAutoFocus={e => e.preventDefault()}
          >
            <button
              onClick={e => { e.stopPropagation(); onClick(post); }}
              className="w-full text-left px-2.5 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2 transition-colors duration-100"
            >
              <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
              Expand
            </button>
            {onDuplicate && (
              <button
                onClick={e => { e.stopPropagation(); onDuplicate(post.id); }}
                className="w-full text-left px-2.5 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2 transition-colors duration-100"
              >
                <Copy className="w-3.5 h-3.5 text-gray-400" />
                Duplicate
              </button>
            )}
            {onDelete && (
              <button
                onClick={e => { e.stopPropagation(); onDelete(post.id); }}
                className="w-full text-left px-2.5 py-1.5 text-[13px] text-red-500 hover:bg-red-50 rounded flex items-center gap-2 transition-colors duration-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {post.format ? (
            <span className="text-[10px] text-gray-500">{post.format}</span>
          ) : (
            <span />
          )}
          <div onClick={e => e.stopPropagation()}>
            <PlatformSelector
              value={post.platforms}
              onChange={platforms => onUpdatePost?.(post.id, { platforms })}
              size={10}
              compact
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <StatusIcon status={post.status} className="w-2.5 h-2.5" style={{ color: statusColor.dot }} />
          <span className="text-[10px] text-gray-400">{post.status}</span>
          {post.status === 'Edited' && onSendToSchedule && !post.sent_to_schedule && (
            <button
              onClick={e => { e.stopPropagation(); onSendToSchedule(post.id); }}
              className="flex items-center justify-center w-4 h-4 rounded-full bg-[#612A4F]/8 hover:bg-[#612A4F]/20 transition-colors"
              title="Schedule this post"
            >
              <ArrowRight size={9} className="text-[#612A4F]" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
