import React from 'react';
import { motion } from 'framer-motion';
import { GripVertical, ImageIcon, ArrowRight, Plus } from 'lucide-react';
import { Post, STATUS_COLORS, PostStatus, getPillarStyle } from '@/types/posts';
import { StatusIcon } from './StatusDropdown';
import PlatformSelector, { PlatformIconsDisplay } from './PlatformSelector';
import PostContextMenu from './PostContextMenu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  onCommitToDate?: (id: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, variant, onClick, allPosts = [], onUpdatePost, onClickPost, onDelete, onDuplicate, onSendToShoots, onSendToSchedule, onCommitToDate }) => {
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
        <div className="absolute top-1 right-1 z-10">
          <PostContextMenu
            onExpand={() => onClick(post)}
            onDuplicate={() => onDuplicate?.(post.id)}
            onDelete={() => onDelete?.(post.id)}
            onCommitToDate={onCommitToDate ? () => onCommitToDate(post.id) : undefined}
            iconSize="w-3 h-3"
            triggerClass="opacity-0 group-hover/card:opacity-100 p-0.5 text-gray-300 hover:text-[#612A4F] transition-all duration-150"
          />
        </div>
        <div className="flex items-start gap-1.5">
          {post.thumbnail_url ? (
            <motion.img
              key={post.thumbnail_url}
              src={post.thumbnail_url}
              alt=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-4 h-4 rounded-sm object-cover flex-shrink-0 mt-0.5"
            />
          ) : null}
          <p className="text-[11px] font-medium text-gray-800 line-clamp-2 flex-1 pr-4">{post.title}</p>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[9px] text-gray-500">{post.format || ''}</span>
          <PlatformIconsDisplay platforms={post.platforms} size={9} />
        </div>
        <div className="flex items-center justify-end mt-0.5">
          <span className="flex items-center gap-0.5 text-[9px] text-gray-400">
            <StatusIcon status={post.status} className="w-2 h-2" style={{ color: statusColor.dot }} />
            {post.status === 'Ready to shoot' && post.sentToShoots ? 'Shoot in progress' : post.status === 'Edited' && post.sent_to_schedule ? 'Sent to schedule' : post.status}
            {post.status === 'Ready to shoot' && onSendToShoots && !post.sentToShoots && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={e => { e.stopPropagation(); onSendToShoots(post.id); }}
                      className="ml-0.5 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#7B3F8F] hover:bg-[#6A3580] transition-colors"
                    >
                      <ArrowRight size={7} className="text-white" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-700 text-white text-[10px] font-medium px-1.5 py-0.5 z-[9999]">Plan the shoot</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {post.status === 'Edited' && onSendToSchedule && !post.sent_to_schedule && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={e => { e.stopPropagation(); onSendToSchedule(post.id); }}
                      onPointerDown={e => e.stopPropagation()}
                      onMouseDown={e => e.stopPropagation()}
                      className="ml-0.5 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#5B8EC9] hover:bg-[#4A7DB8] transition-colors"
                    >
                      <ArrowRight size={7} className="text-white" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-700 text-white text-[10px] font-medium px-1.5 py-0.5 z-[9999]">Schedule this post</TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
        <PostContextMenu
          onExpand={() => onClick(post)}
          onDuplicate={() => onDuplicate?.(post.id)}
          onDelete={() => onDelete?.(post.id)}
          triggerClass="opacity-0 group-hover/card:opacity-100 p-0.5 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all duration-150 flex-shrink-0"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {post.format ? (
            <span className="text-[10px] text-gray-500">{post.format}</span>
          ) : (
            <span />
          )}
          <PlatformIconsDisplay platforms={post.platforms} size={10} />
        </div>
        <div className="flex items-center gap-1">
          <StatusIcon status={post.status} className="w-2.5 h-2.5" style={{ color: statusColor.dot }} />
          <span className="text-[10px] text-gray-400">{post.status === 'Ready to shoot' && post.sentToShoots ? 'Shoot in progress' : post.status === 'Edited' && post.sent_to_schedule ? 'Sent to schedule' : post.status}</span>
          {post.status === 'Ready to shoot' && onSendToShoots && !post.sentToShoots && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={e => { e.stopPropagation(); onSendToShoots(post.id); }}
                    className="flex items-center justify-center w-4 h-4 rounded-full bg-[#7B3F8F] hover:bg-[#6A3580] transition-colors"
                  >
                    <ArrowRight size={8} className="text-white" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-700 text-white text-[10px] font-medium px-1.5 py-0.5 z-[9999]">Plan the shoot</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {post.status === 'Edited' && onSendToSchedule && !post.sent_to_schedule && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={e => { e.stopPropagation(); onSendToSchedule(post.id); }}
                    className="flex items-center justify-center w-4 h-4 rounded-full bg-[#5B8EC9] hover:bg-[#4A7DB8] transition-colors"
                  >
                    <ArrowRight size={8} className="text-white" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-700 text-white text-[10px] font-medium px-1.5 py-0.5 z-[9999]">Schedule this post</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
