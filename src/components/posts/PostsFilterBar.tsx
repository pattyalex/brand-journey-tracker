import React, { useState, useRef } from 'react';
import { Plus, X, SlidersHorizontal, ChevronRight, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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

type FilterMenu = 'main' | 'status' | 'format' | 'pillar';

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
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterMenu, setFilterMenu] = useState<FilterMenu>('main');
  const pillarInputRef = useRef<HTMLInputElement>(null);

  const hasFilters = filterPillars.size > 0 || filterStatuses.size > 0 || filterFormats.size > 0;
  const totalFilterCount = filterStatuses.size + filterFormats.size + filterPillars.size;

  const handleAddPillar = () => {
    const name = newPillarName.trim();
    if (name && !pillars.some(p => p.toLowerCase() === name.toLowerCase())) {
      onAddPillar(name);
    }
    setAddingPillar(false);
    setNewPillarName('');
  };

  // Build active filter pills
  const activeFilterPills: { label: string; type: 'status' | 'format' | 'pillar'; value: string }[] = [];
  filterStatuses.forEach(s => activeFilterPills.push({ label: s, type: 'status', value: s }));
  filterFormats.forEach(f => activeFilterPills.push({ label: f, type: 'format', value: f }));
  filterPillars.forEach(p => activeFilterPills.push({ label: p, type: 'pillar', value: p }));

  const removeFilter = (pill: typeof activeFilterPills[0]) => {
    if (pill.type === 'status') onToggleStatus(pill.value as PostStatus);
    else if (pill.type === 'format') onToggleFormat(pill.value);
    else onTogglePillar(pill.value);
  };

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
                backgroundColor: isActive ? '#F3F4F6' : 'transparent',
                color: isActive ? '#374151' : '#9CA3AF',
                borderColor: isActive ? '#D1D5DB' : '#E5E7EB',
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

      {/* Active filter pills */}
      {activeFilterPills.map(pill => {
        const isStatus = pill.type === 'status';
        const statusColors = isStatus ? STATUS_COLORS[pill.value as PostStatus] : null;
        return (
          <div
            key={`${pill.type}-${pill.value}`}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200"
          >
            {isStatus && (
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusColors!.dot }} />
            )}
            <span className="text-[10px] text-gray-400 capitalize">{pill.type}:</span>
            {pill.label}
            <button
              onClick={() => removeFilter(pill)}
              className="ml-0.5 text-gray-400 hover:text-gray-600 transition-colors duration-150"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        );
      })}

      {/* Filter button + popover */}
      <div className="ml-auto">
        <Popover open={filterOpen} onOpenChange={(v) => { setFilterOpen(v); if (!v) setFilterMenu('main'); }}>
          <PopoverTrigger asChild>
            <button
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all duration-200"
              style={{
                backgroundColor: totalFilterCount > 0 ? '#F3F4F6' : 'transparent',
                color: totalFilterCount > 0 ? '#374151' : '#9CA3AF',
                borderColor: totalFilterCount > 0 ? '#D1D5DB' : '#E5E7EB',
              }}
            >
              <SlidersHorizontal className="w-3 h-3" />
              Filter
              {totalFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#612a4f] text-white text-[9px] flex items-center justify-center font-semibold">
                  {totalFilterCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="p-0 bg-white rounded-lg border border-gray-200 shadow-lg w-[200px] z-[60]"
            align="end"
            sideOffset={4}
            onOpenAutoFocus={e => e.preventDefault()}
          >
            {filterMenu === 'main' && (
              <div className="py-1">
                <div className="px-3 py-1.5">
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Add filter</span>
                </div>
                <button
                  onClick={() => setFilterMenu('pillar')}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100 flex items-center justify-between"
                >
                  <span>Pillar</span>
                  <div className="flex items-center gap-1">
                    {filterPillars.size > 0 && (
                      <span className="text-[10px] text-gray-400">{filterPillars.size}</span>
                    )}
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                  </div>
                </button>
                <button
                  onClick={() => setFilterMenu('format')}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100 flex items-center justify-between"
                >
                  <span>Format</span>
                  <div className="flex items-center gap-1">
                    {filterFormats.size > 0 && (
                      <span className="text-[10px] text-gray-400">{filterFormats.size}</span>
                    )}
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                  </div>
                </button>
                <button
                  onClick={() => setFilterMenu('status')}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100 flex items-center justify-between"
                >
                  <span>Status</span>
                  <div className="flex items-center gap-1">
                    {filterStatuses.size > 0 && (
                      <span className="text-[10px] text-gray-400">{filterStatuses.size}</span>
                    )}
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                  </div>
                </button>

                {hasFilters && (
                  <>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => { onClearAll(); setFilterOpen(false); setFilterMenu('main'); }}
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors duration-100"
                    >
                      Clear all filters
                    </button>
                  </>
                )}
              </div>
            )}

            {filterMenu === 'status' && (
              <div className="py-1">
                <button
                  onClick={() => setFilterMenu('main')}
                  className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors duration-100 flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3 rotate-180" />
                  Status
                </button>
                <div className="border-t border-gray-100 my-0.5" />
                {POST_STATUSES.map(status => {
                  const isActive = filterStatuses.has(status);
                  const colors = STATUS_COLORS[status];
                  return (
                    <button
                      key={status}
                      onClick={() => onToggleStatus(status)}
                      className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors duration-100 ${isActive ? 'text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors.dot }} />
                      <span className="flex-1">{status}</span>
                      {isActive && <Check className="w-3 h-3 text-[#612a4f]" />}
                    </button>
                  );
                })}
              </div>
            )}

            {filterMenu === 'format' && (
              <div className="py-1">
                <button
                  onClick={() => setFilterMenu('main')}
                  className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors duration-100 flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3 rotate-180" />
                  Format
                </button>
                <div className="border-t border-gray-100 my-0.5" />
                {formats.map(format => {
                  const isActive = filterFormats.has(format);
                  return (
                    <button
                      key={format}
                      onClick={() => onToggleFormat(format)}
                      className={`w-full text-left px-3 py-1.5 text-sm flex items-center justify-between transition-colors duration-100 ${isActive ? 'text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span>{format}</span>
                      {isActive && <Check className="w-3 h-3 text-[#612a4f]" />}
                    </button>
                  );
                })}
              </div>
            )}

            {filterMenu === 'pillar' && (
              <div className="py-1">
                <button
                  onClick={() => setFilterMenu('main')}
                  className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors duration-100 flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3 rotate-180" />
                  Pillar
                </button>
                <div className="border-t border-gray-100 my-0.5" />
                {pillars.map(pillar => {
                  const isActive = filterPillars.has(pillar);
                  const style = getPillarStyle(pillar);
                  return (
                    <button
                      key={pillar}
                      onClick={() => onTogglePillar(pillar)}
                      className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors duration-100 ${isActive ? 'text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="flex-1">{pillar}</span>
                      {isActive && <Check className="w-3 h-3 text-[#612a4f]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Clear all (outside popover) */}
      {hasFilters && (
        <button
          onClick={onClearAll}
          className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          Clear all
        </button>
      )}
    </div>
  );
};

export default PostsFilterBar;
