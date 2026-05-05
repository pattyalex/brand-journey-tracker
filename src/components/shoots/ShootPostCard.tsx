import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, X, Camera, ExternalLink } from 'lucide-react';
import { Post, getPillarStyle, STATUS_COLORS, PostStatus } from '@/types/posts';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface ShootPostCardProps {
  post: Post;
  onRemoveFromShoot: () => void;
  onMarkAsShot: () => void;
  onClickPost: () => void;
}

const SHOT_OR_LATER: PostStatus[] = ['Shot', 'Edited', 'Scheduled', 'Posted'];

const ShootPostCard: React.FC<ShootPostCardProps> = ({
  post,
  onRemoveFromShoot,
  onMarkAsShot,
  onClickPost,
}) => {
  const pillarStyle = getPillarStyle(post.pillar);
  const statusColor = STATUS_COLORS[post.status];
  const canMarkAsShot = !SHOT_OR_LATER.includes(post.status);

  return (
    <motion.div
      onClick={onClickPost}
      className="group rounded-lg border border-gray-100 bg-white p-3 cursor-pointer transition-all duration-150 hover:shadow-[0_4px_12px_rgba(93,63,90,0.08)] hover:border-gray-200"
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-gray-800 line-clamp-2 flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
          {post.title}
        </p>

        <Popover>
          <PopoverTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-gray-600 transition-all duration-150 flex-shrink-0"
            >
              <MoreHorizontal size={14} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={4}
            className="w-48 p-1.5 rounded-lg border border-gray-100 bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onRemoveFromShoot()}
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer w-full"
            >
              <X size={13} />
              Remove from shoot
            </button>
            {canMarkAsShot && (
              <button
                onClick={() => onMarkAsShot()}
                className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer w-full"
              >
                <Camera size={13} />
                Mark as shot
              </button>
            )}
            <button
              onClick={() => onClickPost()}
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer w-full"
            >
              <ExternalLink size={13} />
              Open in Posts
            </button>
          </PopoverContent>
        </Popover>
      </div>

      {/* Bottom row */}
      <div className="flex items-center gap-2">
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
        {post.format && (
          <span className="text-[10px] text-gray-400">{post.format}</span>
        )}
        <span className="ml-auto flex-shrink-0">
          <span
            className="block w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColor.dot }}
          />
        </span>
      </div>
    </motion.div>
  );
};

export default ShootPostCard;
