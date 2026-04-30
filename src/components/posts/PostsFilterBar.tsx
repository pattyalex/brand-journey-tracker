import React, { useState, useRef } from 'react';
import { Plus, X, SlidersHorizontal } from 'lucide-react';
import { PostStatus, POST_STATUSES, STATUS_COLORS, getPillarStyle } from '@/types/posts';

interface PostsFilterBarProps {
  pillars: string[];
  filterPillars: Set<string>;
  filterStatuses: Set<PostStatus>;
  filterFormats: Set<string>;
  onTogglePillar: (p: string) => void;
  onToggleStatus: (s: PostStatus) => void;
  onToggleFormat: (f: string) => void;
  onClearAll: () => void;
  onApplyPreset: (preset: 'bank' | 'scheduled') => void;
  activePreset: 'bank' | 'scheduled' | null;
  onClearPillars: () => void;
  onClearStatuses: () => void;
  onClearFormats: () => void;
  onAddPillar: (name: string) => void;
  onDeletePillar: (name: string) => void;
  onRenamePillar: (oldName: string, newName: string) => void;
  formats: string[];
  onAddFormat: (name: string) => void;
  onDeleteFormat: (name: string) => void;
  onRenameFormat: (oldName: string, newName: string) => void;
}

const PostsFilterBar: React.FC<PostsFilterBarProps> = ({
  pillars,
  filterPillars,
  filterStatuses,
  filterFormats,
  onTogglePillar,
  onToggleStatus,
  onToggleFormat,
  onClearAll,
  onApplyPreset,
  activePreset,
  onClearPillars,
  onClearStatuses,
  onClearFormats,
  onAddPillar,
  onDeletePillar,
  onRenamePillar,
  formats,
  onAddFormat,
  onDeleteFormat,
  onRenameFormat,
}) => {
  const [addingPillar, setAddingPillar] = useState(false);
  const [newPillarName, setNewPillarName] = useState('');
  const [editingPillar, setEditingPillar] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [addingFormat, setAddingFormat] = useState(false);
  const [newFormatName, setNewFormatName] = useState('');
  const [editingFormat, setEditingFormat] = useState<string | null>(null);
  const [editFormatDraft, setEditFormatDraft] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const pillarInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const hasFilters = filterPillars.size > 0 || filterStatuses.size > 0 || filterFormats.size > 0;
  const extraFilterCount = filterStatuses.size + filterFormats.size;

  const handleAddPillar = () => {
    const name = newPillarName.trim();
    if (name && !pillars.some(p => p.toLowerCase() === name.toLowerCase())) {
      onAddPillar(name);
    }
    setAddingPillar(false);
    setNewPillarName('');
  };

  // Close popover on outside click
  React.useEffect(() => {
    if (!showFilters) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showFilters]);

  return (
    <div className="flex items-center gap-2 py-3 flex-wrap">
      {/* Pillar pills */}
      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Pillars</span>
      <button
        onClick={() => onClearPillars()}
        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all duration-200"
        style={{
          backgroundColor: filterPillars.size === 0 ? '#F3F4F6' : 'transparent',
          color: filterPillars.size === 0 ? '#374151' : '#9CA3AF',
          borderColor: filterPillars.size === 0 ? '#D1D5DB' : '#E5E7EB',
        }}
      >
        All
      </button>
      {pillars.map(pillar => {
        const isActive = filterPillars.has(pillar);
        const style = getPillarStyle(pillar);
        const isEditing = editingPillar === pillar;

        if (isEditing) {
          return (
            <input
              key={pillar}
              type="text"
              value={editDraft}
              onChange={e => setEditDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const trimmed = editDraft.trim();
                  if (trimmed && trimmed !== pillar && !pillars.some(p => p !== pillar && p.toLowerCase() === trimmed.toLowerCase())) {
                    onRenamePillar(pillar, trimmed);
                  }
                  setEditingPillar(null);
                }
                if (e.key === 'Escape') setEditingPillar(null);
              }}
              onBlur={() => {
                const trimmed = editDraft.trim();
                if (trimmed && trimmed !== pillar && !pillars.some(p => p !== pillar && p.toLowerCase() === trimmed.toLowerCase())) {
                  onRenamePillar(pillar, trimmed);
                }
                setEditingPillar(null);
              }}
              autoFocus
              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border outline-none w-28 transition-colors duration-150"
              style={{
                backgroundColor: style.bg,
                color: style.text,
                borderColor: style.border,
              }}
            />
          );
        }

        return (
          <div key={pillar} className="relative group/pill inline-flex">
            <button
              onClick={() => onTogglePillar(pillar)}
              onDoubleClick={e => {
                e.stopPropagation();
                setEditingPillar(pillar);
                setEditDraft(pillar);
              }}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all duration-200"
              style={{
                backgroundColor: isActive ? style.bg : 'transparent',
                color: isActive ? style.text : '#9CA3AF',
                borderColor: isActive ? style.border : '#E5E7EB',
              }}
            >
              {pillar}
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDeletePillar(pillar); }}
              className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 hover:text-gray-700 flex items-center justify-center opacity-0 group-hover/pill:opacity-100 transition-opacity duration-150"
            >
              <X className="w-2 h-2" />
            </button>
          </div>
        );
      })}
      {addingPillar ? (
        <input
          ref={pillarInputRef}
          type="text"
          value={newPillarName}
          onChange={e => setNewPillarName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleAddPillar();
            if (e.key === 'Escape') { setAddingPillar(false); setNewPillarName(''); }
          }}
          onBlur={handleAddPillar}
          placeholder="Name..."
          autoFocus
          className="text-[11px] px-2 py-0.5 rounded-full border border-gray-300 bg-white outline-none w-24 focus:border-gray-400 transition-colors duration-150"
        />
      ) : (
        <button
          onClick={() => { setAddingPillar(true); setTimeout(() => pillarInputRef.current?.focus(), 50); }}
          className="w-5 h-5 rounded-full border border-dashed border-gray-300 hover:border-gray-400 text-gray-400 hover:text-gray-500 flex items-center justify-center transition-colors duration-200"
        >
          <Plus className="w-2.5 h-2.5" />
        </button>
      )}

      {/* Filter button + popover */}
      <div className="relative ml-auto" ref={popoverRef}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all duration-200"
          style={{
            backgroundColor: extraFilterCount > 0 ? '#F3F4F6' : 'transparent',
            color: extraFilterCount > 0 ? '#374151' : '#9CA3AF',
            borderColor: extraFilterCount > 0 ? '#D1D5DB' : '#E5E7EB',
          }}
        >
          <SlidersHorizontal className="w-3 h-3" />
          Filter
          {extraFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#612a4f] text-white text-[9px] flex items-center justify-center font-semibold">
              {extraFilterCount}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="absolute top-full right-0 mt-1.5 z-30 bg-white rounded-lg border border-gray-200 shadow-lg py-1 w-48">
            {/* Status section */}
            <div className="px-3 py-1.5">
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Status</span>
            </div>
            <button
              onClick={() => onClearStatuses()}
              className={`w-full text-left px-3 py-1.5 text-sm transition-colors duration-100 ${filterStatuses.size === 0 ? 'text-gray-900 bg-gray-50 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              All statuses
            </button>
            {POST_STATUSES.map(status => {
              const isActive = filterStatuses.has(status);
              const colors = STATUS_COLORS[status];
              return (
                <button
                  key={status}
                  onClick={() => onToggleStatus(status)}
                  className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors duration-100 ${isActive ? 'text-gray-900 bg-gray-50 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors.dot }} />
                  {status}
                </button>
              );
            })}

            <div className="border-t border-gray-100 my-1" />

            {/* Format section */}
            <div className="px-3 py-1.5">
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Format</span>
            </div>
            <button
              onClick={() => onClearFormats()}
              className={`w-full text-left px-3 py-1.5 text-sm transition-colors duration-100 ${filterFormats.size === 0 ? 'text-gray-900 bg-gray-50 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              All formats
            </button>
            {formats.map(format => {
              const isActive = filterFormats.has(format);
              return (
                <button
                  key={format}
                  onClick={() => onToggleFormat(format)}
                  className={`w-full text-left px-3 py-1.5 text-sm transition-colors duration-100 ${isActive ? 'text-gray-900 bg-gray-50 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {format}
                </button>
              );
            })}

            <div className="border-t border-gray-100 my-1" />

            {/* Quick filters */}
            <div className="px-3 py-1.5">
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Quick filters</span>
            </div>
            <button
              onClick={() => { onApplyPreset('bank'); setShowFilters(false); }}
              className={`w-full text-left px-3 py-1.5 text-sm transition-colors duration-100 ${activePreset === 'bank' ? 'text-gray-900 bg-gray-50 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Bank
            </button>
            <button
              onClick={() => { onApplyPreset('scheduled'); setShowFilters(false); }}
              className={`w-full text-left px-3 py-1.5 text-sm transition-colors duration-100 ${activePreset === 'scheduled' ? 'text-gray-900 bg-gray-50 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Scheduled
            </button>

            {/* Clear all */}
            {hasFilters && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { onClearAll(); setShowFilters(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors duration-100"
                >
                  Clear all filters
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Clear all */}
      {hasFilters && (
        <button
          onClick={onClearAll}
          className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors duration-150 ml-auto"
        >
          Clear all
        </button>
      )}
    </div>
  );
};

export default PostsFilterBar;
