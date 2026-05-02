import React, { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, ImagePlus, Trash2, PanelRight } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Post } from '@/types/posts';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
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
}) => {
  const filledCount = gridOrder.filter(Boolean).length;
  const cellW = expanded ? 111 : 84;
  const cellH = expanded ? 139 : 105;

  // Stable IDs for SortableContext
  const cellIds = useMemo(() =>
    gridOrder.map((postId, i) => postId || `empty-${i}`),
    [gridOrder]
  );

  // Grid's own DndContext for internal reordering
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const [internalDragId, setInternalDragId] = React.useState<string | null>(null);
  const internalDragPost = internalDragId ? postsMap.get(internalDragId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    if (!id.startsWith('empty-')) {
      setInternalDragId(id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setInternalDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = cellIds.indexOf(active.id as string);
    const newIndex = cellIds.indexOf(over.id as string);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(arrayMove(gridOrder, oldIndex, newIndex));
    }
  };

  const handleDragCancel = () => {
    setInternalDragId(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider">Grid</span>
        <span className="text-[10px] text-gray-400">— Preview how your content looks before you schedule it</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex justify-center">
        <div className="relative">
          {/* External drop zones — register with PARENT DndContext (for Ready → Grid drops) */}
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

          {/* Grid's own DndContext for internal reordering */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
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
                  <SortableCell
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
          <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
            {internalDragPost?.thumbnail_url && (
              <div style={{ width: cellW, height: cellH }} className="rounded-md overflow-hidden shadow-xl opacity-90 rotate-1">
                <img src={internalDragPost.thumbnail_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </DragOverlay>
        </DndContext>
        </div>
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
      className="w-full h-full rounded-md transition-all duration-150"
      style={{
        outline: isOver ? '2px dashed rgba(97,42,79,0.5)' : 'none',
        outlineOffset: '-1px',
        background: isOver ? 'rgba(97,42,79,0.08)' : 'transparent',
      }}
    />
  );
};

// ── Sortable Cell ────────────────────────────────────────────

const SortableCell: React.FC<{
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
    transition: { duration: 200, easing: 'ease' },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        className="w-full h-full rounded-md flex items-center justify-center cursor-pointer transition-colors duration-150 group/empty"
      >
        <div
          className="w-full h-full rounded-md flex items-center justify-center"
          style={{
            outline: '1px dashed #d1d5db',
            outlineOffset: '-1px',
            background: 'rgba(250,250,250,1)',
          }}
        >
          <Plus className="w-4 h-4 text-gray-300 group-hover/empty:text-[#612A4F] group-hover/empty:scale-110 transition-all duration-150" />
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      </div>
    );
  }

  // Post with no thumbnail
  if (!post.thumbnail_url) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onMouseEnter={() => onHover(post.id)}
        onMouseLeave={() => onHover(null)}
        className="w-full h-full rounded-md flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
        onClick={() => fileInputRef.current?.click()}
      >
        <div
          className="w-full h-full rounded-md flex flex-col items-center justify-center transition-colors duration-150"
          style={{
            outline: isHovered ? '1px dashed rgba(97,42,79,0.3)' : '1px dashed #d1d5db',
            outlineOffset: '-1px',
            background: isHovered ? 'rgba(97,42,79,0.05)' : 'rgba(249,250,251,0.5)',
          }}
        >
          <ImagePlus className="w-4 h-4 text-gray-300 mb-1" />
          <span className="text-[9px] text-gray-400">Add cover</span>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
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
          className={`w-full h-full rounded-md overflow-hidden cursor-grab active:cursor-grabbing relative group/cell transition-shadow duration-150 ${
            isHovered ? 'ring-2 ring-[#612A4F]/20' : ''
          } ${isDragging ? 'shadow-lg' : ''}`}
          onClick={() => onClickPost(post)}
        >
          <img
            src={post.thumbnail_url}
            alt=""
            className="w-full h-full object-cover"
          />
          <PopoverTrigger asChild>
            <button
              onClick={e => e.stopPropagation()}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity duration-150"
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
