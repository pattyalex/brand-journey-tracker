import React, { useState, useRef } from 'react';
import { ChevronLeft, MoreHorizontal, Copy, Archive, Trash2 } from 'lucide-react';
import { Shoot } from '@/types/shoots';
import ShootStatusPill from './ShootStatusPill';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface ShootHeaderProps {
  shoot: Shoot;
  onUpdate: (updates: Partial<Shoot>) => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onBack: () => void;
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const ShootHeader: React.FC<ShootHeaderProps> = ({
  shoot,
  onUpdate,
  onDuplicate,
  onArchive,
  onDelete,
  onBack,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(shoot.name);
  const [editingDate, setEditingDate] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleNameSave = () => {
    setEditingName(false);
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== shoot.name) {
      onUpdate({ name: trimmed });
    } else {
      setNameValue(shoot.name);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setNameValue(shoot.name);
      setEditingName(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setEditingDate(false);
    if (newDate && newDate !== shoot.date) {
      onUpdate({ date: newDate });
    }
  };

  return (
    <div>
      {/* Back button */}
      <div
        className="flex items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer mb-4"
        onClick={onBack}
      >
        <ChevronLeft size={16} />
        <span className="text-sm">Shoots</span>
      </div>

      {/* Header row: name + status + menu */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Name */}
          {editingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleNameKeyDown}
              autoFocus
              className="text-xl font-semibold text-gray-800 tracking-[-0.02em] border-b-2 border-[#612A4F]/30 bg-transparent outline-none w-full"
            />
          ) : (
            <h1
              className="text-xl font-semibold text-gray-800 tracking-[-0.02em] cursor-pointer"
              onClick={() => {
                setEditingName(true);
                setNameValue(shoot.name);
              }}
            >
              {shoot.name}
            </h1>
          )}

          {/* Date */}
          {editingDate ? (
            <input
              type="date"
              defaultValue={shoot.date}
              onChange={handleDateChange}
              onBlur={() => setEditingDate(false)}
              autoFocus
              className="text-sm text-gray-500 mt-1 bg-transparent outline-none"
            />
          ) : (
            <p
              className="text-sm text-gray-500 mt-1 cursor-pointer"
              onClick={() => setEditingDate(true)}
            >
              {formatDate(shoot.date)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          {/* Three-dot menu */}
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <button className="p-1 rounded-md hover:bg-gray-100 transition-colors">
                <MoreHorizontal size={18} className="text-gray-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-1 bg-white">
              <div
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer"
                onClick={() => {
                  setMenuOpen(false);
                  onDuplicate();
                }}
              >
                <Copy size={14} />
                Duplicate shoot
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-gray-50 rounded-md cursor-pointer"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
              >
                <Trash2 size={14} />
                Delete shoot
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default ShootHeader;
