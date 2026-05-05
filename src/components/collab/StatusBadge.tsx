
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  onChange: (status: string) => void;
}

const STATUS_STYLES: Record<string, { dot: string; bg: string; text: string; border: string }> = {
  'pitched':          { dot: '#7C8DB5', bg: 'rgba(124,141,181,0.08)', text: '#5A6A8A', border: 'rgba(124,141,181,0.18)' },
  'inbound':          { dot: '#D4915E', bg: 'rgba(212,145,94,0.08)',  text: '#9A6534', border: 'rgba(212,145,94,0.18)' },
  'in negotiation':   { dot: '#C9A84C', bg: 'rgba(201,168,76,0.08)', text: '#8A7230', border: 'rgba(201,168,76,0.18)' },
  'contract signed':  { dot: '#5BA67A', bg: 'rgba(91,166,122,0.08)', text: '#3D7A54', border: 'rgba(91,166,122,0.18)' },
  'content submitted':{ dot: '#9B6FA8', bg: 'rgba(155,111,168,0.08)',text: '#724580', border: 'rgba(155,111,168,0.18)' },
  'posted':           { dot: '#612A4F', bg: 'rgba(97,42,79,0.06)',   text: '#612A4F', border: 'rgba(97,42,79,0.15)' },
};

const getStatusStyle = (status: string) => {
  return STATUS_STYLES[status.toLowerCase()] || { dot: '#9CA3AF', bg: 'rgba(156,163,175,0.08)', text: '#6B7280', border: 'rgba(156,163,175,0.18)' };
};

const StatusBadge = ({ status, onChange }: StatusBadgeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus();
      // Use showPicker if available (modern browsers)
      if ('showPicker' in selectRef.current) {
        try {
          (selectRef.current as any).showPicker();
        } catch (e) {
          // Fallback if showPicker fails
        }
      }
    }
  }, [isEditing]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
    setIsEditing(false);
  };

  const style = getStatusStyle(status);

  return isEditing ? (
    <select
      ref={selectRef}
      value={status}
      onChange={handleStatusChange}
      onBlur={() => setIsEditing(false)}
      className="text-xs p-1 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#612A4F]/30 focus:border-[#612A4F]/30 bg-white transition-colors duration-150"
      autoFocus
    >
      <option value="Inbound">Inbound</option>
      <option value="Pitched">Pitched</option>
      <option value="In Negotiation">In Negotiation</option>
      <option value="Contract Signed">Contract Signed</option>
      <option value="Content Submitted">Content Submitted</option>
      <option value="Posted">Posted</option>
    </select>
  ) : (
    <span
      onClick={() => setIsEditing(true)}
      className="cursor-pointer inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border transition-colors duration-150 hover:opacity-80"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: style.dot }}
      />
      {status}
    </span>
  );
};

export default StatusBadge;
