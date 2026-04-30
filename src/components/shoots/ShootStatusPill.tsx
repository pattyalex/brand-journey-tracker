import React from 'react';
import { ShootStatus, SHOOT_STATUS_COLORS } from '@/types/shoots';

interface ShootStatusPillProps {
  status: ShootStatus;
  size?: 'sm' | 'md';
}

const ShootStatusPill: React.FC<ShootStatusPillProps> = ({ status, size = 'sm' }) => {
  const colors = SHOOT_STATUS_COLORS[status] || { dot: '#9CA3AF', bg: '#F3F4F6', text: '#6B7280' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap ${
        size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1'
      }`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: colors.dot }}
      />
      {status}
    </span>
  );
};

export default ShootStatusPill;
