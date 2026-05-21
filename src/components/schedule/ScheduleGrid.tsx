import React, { useRef, useMemo, useState } from 'react';
import { Plus, ImagePlus, Trash2, PanelRight, Maximize2, Minimize2, LayoutGrid } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Post } from '@/types/posts';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

interface ScheduleGridProps {
  gridOrder: (string | null)[];
  postsMap: Map<string, Post>;
  expanded?: boolean;
  onReorder: (newOrder: (string | null)[]) => void;
  onClickPost: (post: Post) => void;
  onRemoveFromGrid: (postId: string) => void;
  onUploadThumbnail: (postId: string, file: File) => void;
  onUploadToEmptyCell: (index: number, file: File) => void;
  onHover: (id: string | null) => void;
  hoveredId: string | null;
  externalDraggingId: string | null;
  onExpand?: () => void;
  onCollapse?: () => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  gridOrder,
  postsMap,
  onClickPost,
  expanded,
  onReorder,
  onRemoveFromGrid,
  onUploadThumbnail,
  onUploadToEmptyCell,
  onHover,
  hoveredId,
  externalDraggingId,
  onExpand,
  onCollapse,
}) => {
  const filledCount = gridOrder.filter(Boolean).length;
  const cellW = expanded ? 127 : 108;
  const cellH = expanded ? 163 : 138;

  // Stable IDs for SortableContext
  const cellIds = useMemo(() =>
    gridOrder.map((postId, i) => postId || `empty-${i}`),
    [gridOrder]
  );

  return (
    <div className="h-full flex flex-col">
      {filledCount === 0 && (
        <div className="px-5 pt-4 pb-2">
          <h2 className="text-[15px] font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Visual Plan</h2>
          <p className="text-[12px] text-gray-400 mt-1 leading-relaxed">
            Arrange your content visually before scheduling it to the calendar.
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex justify-end items-start">
        {filledCount === 0 && !externalDraggingId ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-10 px-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-4 shadow-sm">
              <LayoutGrid className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-[13px] font-medium text-gray-500 text-center mb-1">Plan your feed</p>
            <p className="text-[12px] text-gray-400 text-center leading-relaxed max-w-[240px]">
              Drag posts from above or click the + cells to upload images and preview how your feed will look.
            </p>
          </div>
        ) : (
          <div className={`flex items-start gap-2 ${expanded ? 'mr-[-12px] mt-[13px]' : 'mr-1 mt-2'}`}>
            <div className="relative">
              {/* External drop zones — for Ready → Grid drops */}
              {externalDraggingId && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 15,
                  display: 'grid',
                  gridTemplateColumns: `repeat(3, ${cellW}px)`,
                  gridAutoRows: `${cellH}px`,
                  gap: '2px',
                  pointerEvents: 'auto',
                }}>
                  {gridOrder.map((_, idx) => (
                    <ExternalDropZone key={`ext-${idx}`} index={idx} />
                  ))}
                </div>
              )}

              <SortableContext items={cellIds} strategy={rectSortingStrategy}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(3, ${cellW}px)`,
                  gridAutoRows: `${cellH}px`,
                  gap: '2px',
                  transition: 'all 0.25s ease-out',
                }}>
                  {gridOrder.map((postId, idx) => {
                    const post = postId ? postsMap.get(postId) || null : null;
                    return (
                      <SortableGridCell
                        key={cellIds[idx]}
                        id={cellIds[idx]}
                        index={idx}
                        postId={postId}
                        post={post}
                        onClickPost={onClickPost}
                        onRemoveFromGrid={onRemoveFromGrid}
                        onUploadThumbnail={onUploadThumbnail}
                        onUploadToEmptyCell={onUploadToEmptyCell}
                        onHover={onHover}
                        isHovered={postId ? hoveredId === postId : false}
                        isExternallyDragged={postId ? externalDraggingId === postId : false}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </div>
            {/* Expand/Collapse button beside grid */}
            <div className="flex-shrink-0 pt-1">
              {!expanded && onExpand && (
                <button onClick={onExpand} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Expand">
                  <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
              {expanded && onCollapse && (
                <button onClick={onCollapse} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Collapse">
                  <Minimize2 className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── External Drop Zone (registers with parent DndContext) ────

const ExternalDropZone: React.FC<{ index: number }> = ({ index }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `grid-ext-${index}` });

  return (
    <div
      ref={setNodeRef}
      className="w-full h-full rounded-lg transition-all duration-150"
      style={{
        outline: isOver ? '2px dashed rgba(97,42,79,0.4)' : 'none',
        outlineOffset: '-2px',
        background: isOver ? 'rgba(97,42,79,0.06)' : 'transparent',
      }}
    />
  );
};

// ── Draggable Grid Cell ────────────────────────────────────────────

const SortableGridCell: React.FC<{
  id: string;
  index: number;
  postId: string | null;
  post: Post | null;
  onClickPost: (post: Post) => void;
  onRemoveFromGrid: (postId: string) => void;
  onUploadThumbnail: (postId: string, file: File) => void;
  onUploadToEmptyCell: (index: number, file: File) => void;
  onHover: (id: string | null) => void;
  isHovered: boolean;
  isExternallyDragged: boolean;
}> = ({
  id,
  index,
  postId,
  post,
  onClickPost,
  onRemoveFromGrid,
  onUploadThumbnail,
  onUploadToEmptyCell,
  onHover,
  isHovered,
  isExternallyDragged,
}) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: !post,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgError, setImgError] = useState(false);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : isExternallyDragged ? 0 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { e.target.value = ''; return; }
    if (postId) {
      onUploadThumbnail(postId, file);
    } else {
      onUploadToEmptyCell(index, file);
    }
    e.target.value = '';
  };

  // Empty cell
  if (!post) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-full rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 group/empty bg-gray-50/60 hover:bg-gray-100/80 border border-dashed border-gray-200 hover:border-gray-300"
      >
        <Plus className="w-4 h-4 text-gray-300 group-hover/empty:text-[#612A4F] group-hover/empty:scale-110 transition-all duration-200" />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      </div>
    );
  }

  // Post with no thumbnail (or broken URL)
  if (!post.thumbnail_url || imgError) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onMouseEnter={() => onHover(post.id)}
        onMouseLeave={() => onHover(null)}
        className="w-full h-full rounded-lg cursor-grab active:cursor-grabbing"
        onClick={() => onClickPost(post)}
      >
        <Popover>
          <div
            className={`w-full h-full rounded-lg flex flex-col items-center justify-center transition-all duration-200 relative group/cell border border-dashed ${
              isHovered ? 'border-[#612A4F]/30 bg-[#612A4F]/[0.03]' : 'border-gray-200 bg-gray-50/40'
            }`}
          >
            <ImagePlus
              className="w-4 h-4 text-gray-300 mb-1 cursor-pointer hover:text-[#612A4F] transition-colors"
              onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
            />
            <span className="text-[9px] text-gray-400">Add cover</span>
            <PopoverTrigger asChild>
              <button
                onClick={e => e.stopPropagation()}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/20 text-white flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity duration-150"
              >
                <span className="text-[10px] leading-none">···</span>
              </button>
            </PopoverTrigger>
          </div>
          <PopoverContent align="end" sideOffset={4} className="w-44 p-1 rounded-lg border border-gray-100 bg-white shadow-lg" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => onClickPost(post)}
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer w-full"
            >
              <PanelRight className="w-3.5 h-3.5" />
              Open detail panel
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer w-full"
            >
              <ImagePlus className="w-3.5 h-3.5" />
              Add cover image
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </button>
            <button
              onClick={() => onRemoveFromGrid(post.id)}
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-red-500 hover:bg-gray-50 rounded-md cursor-pointer w-full"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove from grid
            </button>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Post with thumbnail
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => onHover(post.id)}
      onMouseLeave={() => onHover(null)}
    >
      <Popover>
        <div
          className={`w-full h-full rounded-lg overflow-hidden cursor-grab active:cursor-grabbing relative group/cell transition-all duration-200 ${
            isHovered ? 'ring-2 ring-[#612A4F]/20 shadow-md' : ''
          } ${isDragging ? 'shadow-lg' : ''}`}
          onClick={() => onClickPost(post)}
        >
          <img
            src={post.thumbnail_url}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
          <PopoverTrigger asChild>
            <button
              onClick={e => e.stopPropagation()}
              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity duration-150"
            >
              <span className="text-[10px] leading-none">···</span>
            </button>
          </PopoverTrigger>
        </div>
        <PopoverContent align="end" sideOffset={4} className="w-44 p-1 rounded-lg border border-gray-100 bg-white shadow-lg" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onClickPost(post)}
            className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer w-full"
          >
            <PanelRight className="w-3.5 h-3.5" />
            Open detail panel
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer w-full"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            Replace cover image
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          </button>
          <button
            onClick={() => onRemoveFromGrid(post.id)}
            className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-red-500 hover:bg-gray-50 rounded-md cursor-pointer w-full"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove from grid
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ScheduleGrid;
