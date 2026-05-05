import React from 'react';
import { Check, Calendar } from 'lucide-react';
import { Post, STATUS_COLORS } from '@/types/posts';
import { StatusIcon } from '@/components/posts/StatusDropdown';

interface StripCardProps {
  post: Post;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onClickPost?: (post: Post) => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const StripCard: React.FC<StripCardProps> = ({ post, isSelected, onToggleSelect, onClickPost }) => {
  const statusColor = STATUS_COLORS[post.status] || { dot: '#9CA3AF', bg: '#F3F4F6', text: '#6B7280' };

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking the checkbox area, don't open detail
    if ((e.target as HTMLElement).closest('[data-checkbox]')) return;
    onClickPost?.(post);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group rounded-lg border p-3 cursor-pointer transition-all duration-200 relative ${
        isSelected
          ? 'border-[#612A4F]/30 bg-[#612A4F]/[0.03] shadow-[0_0_0_1px_rgba(97,42,79,0.12)]'
          : 'border-gray-100 bg-white hover:shadow-[0_4px_12px_rgba(93,63,90,0.08)]'
      }`}
    >
      {/* Selection checkbox — top right */}
      <div
        data-checkbox
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(post.id);
        }}
        className={`absolute top-2.5 right-2.5 w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 ${
          isSelected
            ? 'bg-[#612A4F] border-[#612A4F]'
            : 'border-gray-200 bg-white opacity-0 group-hover:opacity-100'
        }`}
      >
        {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-gray-900 line-clamp-2 pr-6 mb-2 leading-snug">
        {post.title}
      </p>

      {/* Bottom row — matches PostCard pillar variant */}
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
          {post.scheduledDate && (
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Calendar className="w-3 h-3" />
              {formatDate(post.scheduledDate)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StripCard;
