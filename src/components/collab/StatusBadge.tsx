
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  onChange: (status: string) => void;
}

const StatusBadge = ({ status, onChange }: StatusBadgeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const getStatusColorClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pitched':
        return 'bg-blue-100 text-blue-800';
      case 'in negotiation':
        return 'bg-yellow-100 text-yellow-800';
      case 'contract signed':
        return 'bg-green-100 text-green-800';
      case 'content submitted':
        return 'bg-purple-100 text-purple-800';
      case 'posted':
        return 'bg-cyan-100 text-cyan-800';
      case 'paid':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
    setIsEditing(false);
  };
  
  return isEditing ? (
    <select
      value={status}
      onChange={handleStatusChange}
      onBlur={() => setIsEditing(false)}
      className="text-xs p-1 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
      autoFocus
    >
      <option value="Pitched">Pitched</option>
      <option value="In Negotiation">In Negotiation</option>
      <option value="Contract Signed">Contract Signed</option>
      <option value="Content Submitted">Content Submitted</option>
      <option value="Posted">Posted</option>
      <option value="Paid">Paid</option>
    </select>
  ) : (
    <span 
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        getStatusColorClasses(status)
      )}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
