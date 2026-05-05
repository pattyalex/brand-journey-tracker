import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Shoot, SHOOT_STATUS_COLORS } from '@/types/shoots';

interface ShootRowProps {
  shoot: Shoot;
  postCount: number;
  onClick: () => void;
}

const ShootRow: React.FC<ShootRowProps> = ({ shoot, postCount, onClick }) => {
  const shootDate = new Date(shoot.date + 'T00:00:00');
  const statusColor = SHOOT_STATUS_COLORS[shoot.status] || { dot: '#9CA3AF', bg: '#F3F4F6', text: '#6B7280' };
  const primaryLocation = shoot.locations?.[0]?.name;

  return (
    <motion.div
      onClick={onClick}
      className="rounded-xl border border-gray-100 bg-white px-4 py-3 cursor-pointer transition-all duration-200 hover:shadow-[0_4px_12px_rgba(93,63,90,0.08)] hover:border-gray-200"
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-center gap-4 flex-wrap">
        {/* Date block */}
        <div className="flex-shrink-0 min-w-[44px] text-center">
          <p className="text-[10px] uppercase tracking-wider text-gray-400">
            {format(shootDate, 'EEE')}
          </p>
          <p className="text-sm font-semibold text-gray-800">
            {format(shootDate, 'MMM d')}
          </p>
        </div>

        {/* Shoot name */}
        <p className="text-sm font-medium text-gray-800 truncate flex-1 min-w-0">
          {shoot.name}
        </p>

        {/* Primary location */}
        {primaryLocation && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <MapPin size={13} className="text-gray-400" />
            <span className="text-sm text-gray-500 truncate max-w-[140px]">
              {primaryLocation}
            </span>
          </div>
        )}

        {/* Post count pill */}
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
          {postCount} {postCount === 1 ? 'post' : 'posts'}
        </span>

        {/* Status pill */}
        <span
          className="text-[11px] px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5 flex-shrink-0"
          style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ backgroundColor: statusColor.dot }}
          />
          {shoot.status}
        </span>
      </div>
    </motion.div>
  );
};

export default ShootRow;
