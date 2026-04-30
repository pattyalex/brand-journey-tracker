import React from 'react';
import { motion } from 'framer-motion';
import { Post, STATUS_COLORS, PostStatus, getPillarStyle } from '@/types/posts';

interface PostCardProps {
  post: Post;
  variant: 'pillar' | 'calendar';
  onClick: (post: Post) => void;
}

const PIPELINE_STAGES: PostStatus[] = ['Scripted', 'Ready to shoot', 'Shot', 'Edited', 'Scheduled', 'Posted'];
const STATUS_INDEX: Record<PostStatus, number> = {
  Idea: 0, Scripted: 1, 'Ready to shoot': 2, Shot: 3, Edited: 4, Scheduled: 5, Posted: 6,
};

const PostCard: React.FC<PostCardProps> = ({ post, variant, onClick }) => {
  const pillarStyle = getPillarStyle(post.pillar);
  const statusColor = STATUS_COLORS[post.status];
  const stageIndex = STATUS_INDEX[post.status];

  if (variant === 'calendar') {
    return (
      <motion.div
        layout={false}
        onClick={e => { e.stopPropagation(); onClick(post); }}
        className="relative rounded px-2 py-1 cursor-pointer hover:shadow-sm transition-shadow duration-150 text-left group/card"
        style={{ backgroundColor: pillarStyle.bg, borderLeft: `3px solid ${pillarStyle.border}` }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        <div
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: statusColor.dot }}
        />
        <p className="text-[11px] font-medium text-gray-800 truncate pr-3">{post.title}</p>
        <span className="text-[9px] text-gray-500">{post.format}</span>
      </motion.div>
    );
  }

  // pillar variant
  return (
    <motion.div
      layout={false}
      onClick={() => onClick(post)}
      className="rounded-lg bg-white border border-gray-100 p-3 cursor-pointer hover:shadow-[0_4px_12px_rgba(93,63,90,0.08)] transition-shadow duration-200 group/card"
      style={{ borderLeftWidth: 3, borderLeftColor: pillarStyle.border }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">{post.title}</p>
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border"
          style={{
            backgroundColor: pillarStyle.bg,
            color: pillarStyle.text,
            borderColor: pillarStyle.border,
          }}
        >
          {post.format}
        </span>
        {/* 4-dot pipeline */}
        <div className="flex items-center gap-1">
          {PIPELINE_STAGES.map((stage, i) => {
            const filled = stageIndex >= STATUS_INDEX[stage];
            const dotColor = STATUS_COLORS[stage].dot;
            return (
              <motion.div
                key={stage}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: filled ? dotColor : 'transparent',
                  border: `1.5px solid ${filled ? dotColor : '#D1D5DB'}`,
                }}
                animate={{ backgroundColor: filled ? dotColor : 'transparent' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
