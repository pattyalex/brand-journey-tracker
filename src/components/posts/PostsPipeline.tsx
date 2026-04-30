import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post, POST_STATUSES, STATUS_COLORS, PostStatus } from '@/types/posts';
import { StatusIcon } from './StatusDropdown';

interface PostsPipelineProps {
  posts: Post[];
}

const PostsPipeline: React.FC<PostsPipelineProps> = ({ posts }) => {
  const counts = POST_STATUSES.map(status => ({
    status,
    count: posts.filter(p => p.status === status).length,
  }));

  return (
    <div className="flex items-center gap-1.5 py-3 px-1">
      {counts.map(({ status, count }, i) => (
        <React.Fragment key={status}>
          <PipelineStage status={status} count={count} />
          {i < counts.length - 1 && (
            <div className="flex-shrink-0 w-6 h-px bg-gray-200" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const PipelineStage: React.FC<{ status: PostStatus; count: number }> = ({ status, count }) => {
  const colors = STATUS_COLORS[status];

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: colors.bg }}>
      <motion.div className="flex-shrink-0" layout>
        <StatusIcon status={status} className="w-3.5 h-3.5" style={{ color: colors.dot }} />
      </motion.div>
      <span className="text-xs font-medium whitespace-nowrap" style={{ color: colors.text }}>
        {status}
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, scale: 0.8, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 4 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="text-xs font-semibold tabular-nums"
          style={{ color: colors.text }}
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default PostsPipeline;
