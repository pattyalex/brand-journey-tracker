import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, MoreHorizontal, Trash2, Camera, ArrowRight } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import PostsDatePicker from './PostsDatePicker';
import FormatDropdown from './FormatDropdown';
import PillarDropdown from './PillarDropdown';
import StatusDropdown from './StatusDropdown';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Post,
  PostStatus,
  POST_STATUSES,
  STATUS_COLORS,
  getPillarStyle,
} from '@/types/posts';
import { StatusIcon } from './StatusDropdown';

interface PostsTableProps {
  posts: Post[];
  allPosts: Post[];
  pillars: string[];
  formats: string[];
  detailPanelOpen: boolean;
  onRowClick: (post: Post) => void;
  onUpdatePost: (id: string, updates: Partial<Post>) => void;
  onDeletePost: (id: string) => void;
  onSendToShoots?: (id: string) => void;
  onAddFormat: (name: string) => void;
  onDeleteFormat: (name: string) => void;
  onDeletePillar: (name: string) => void;
  onReorder: (posts: Post[]) => void;
  selectedIds: Set<string>;
  onSelectToggle: (id: string, shiftKey: boolean) => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '\u2014';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const PostsTable: React.FC<PostsTableProps> = ({
  posts,
  allPosts,
  pillars,
  formats,
  detailPanelOpen,
  onRowClick,
  onUpdatePost,
  onDeletePost,
  onSendToShoots,
  onAddFormat,
  onDeleteFormat,
  onDeletePillar,
  onReorder,
  selectedIds,
  onSelectToggle,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activePost = activeId ? posts.find(p => p.id === activeId) : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = posts.findIndex(p => p.id === active.id);
    const newIndex = posts.findIndex(p => p.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(arrayMove(posts, oldIndex, newIndex));
    }
  };

  return (
    <div className="overflow-visible">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="w-8 px-2 py-3" />
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Pillar</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Format</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Aim for</th>
            <th className="w-10 px-2 py-3" />
          </tr>
        </thead>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveId(null)}>
          <SortableContext items={posts.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <tbody>
              <AnimatePresence initial={false}>
                {posts.map(post => (
                  <SortableRow
                    key={post.id}
                    post={post}
                    allPosts={allPosts}
                    detailPanelOpen={detailPanelOpen}
                    pillars={pillars}
                    formats={formats}
                    onAddFormat={onAddFormat}
                    onDeleteFormat={onDeleteFormat}
                    onDeletePillar={onDeletePillar}
                    isSelected={selectedIds.has(post.id)}
                    onSelect={onSelectToggle}
                    onClick={onRowClick}
                    onUpdate={onUpdatePost}
                    onDelete={onDeletePost}
                    onSendToShoots={onSendToShoots}
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </SortableContext>
          <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
            {activePost && (
              <table className="w-full text-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderRadius: '0.5rem', background: 'white' }}>
                <tbody>
                  <tr className="border-b border-gray-50 bg-white">
                    <td className="px-2 py-3 w-8"><GripVertical className="w-3.5 h-3.5 text-gray-400" /></td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{activePost.title}</td>
                    <td className="px-4 py-3">
                      {activePost.pillar && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                          style={{ backgroundColor: getPillarStyle(activePost.pillar).bg, color: getPillarStyle(activePost.pillar).text, borderColor: getPillarStyle(activePost.pillar).border }}>
                          {activePost.pillar}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{activePost.format}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusIcon status={activePost.status} className="w-3.5 h-3.5" style={{ color: STATUS_COLORS[activePost.status].dot }} />
                        <span className="text-sm font-medium text-gray-700">{activePost.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{activePost.scheduledDate ? formatDate(activePost.scheduledDate) : 'Set date'}</td>
                    <td className="w-10 px-2 py-3" />
                  </tr>
                </tbody>
              </table>
            )}
          </DragOverlay>
        </DndContext>
      </table>
    </div>
  );
};

// ── Sortable Row ─────────────────────────────────────────────

interface SortableRowProps {
  post: Post;
  allPosts: Post[];
  detailPanelOpen: boolean;
  pillars: string[];
  formats: string[];
  onAddFormat: (name: string) => void;
  onDeleteFormat: (name: string) => void;
  onDeletePillar: (name: string) => void;
  isSelected: boolean;
  onSelect: (id: string, shiftKey: boolean) => void;
  onClick: (post: Post) => void;
  onUpdate: (id: string, updates: Partial<Post>) => void;
  onDelete: (id: string) => void;
  onSendToShoots?: (id: string) => void;
}

const SortableRow: React.FC<SortableRowProps> = ({
  post,
  allPosts,
  detailPanelOpen,
  pillars,
  formats,
  onAddFormat,
  onDeleteFormat,
  onDeletePillar,
  isSelected,
  onSelect,
  onClick,
  onUpdate,
  onDelete,
  onSendToShoots,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: post.id,
    transition: { duration: 250, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' },
  });

  const showInsertLine = isOver && !isDragging;

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(post.title);
  const [recentStatusChange, setRecentStatusChange] = useState(false);
  const [addingCustomFormat, setAddingCustomFormat] = useState(false);
  const [customFormatDraft, setCustomFormatDraft] = useState('');
  const [formatDropdownOpen, setFormatDropdownOpen] = useState(false);
  const formatDropdownRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const rowStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.2 : 1,
    zIndex: isDragging ? 100 : 'auto',
    position: 'relative' as const,
  };

  const handleStatusChange = (newStatus: PostStatus) => {
    onUpdate(post.id, { status: newStatus });
    setRecentStatusChange(true);
    setTimeout(() => setRecentStatusChange(false), 600);
  };

  const handleTitleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTitleDraft(post.title);
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.select(), 30);
  };

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== post.title) {
      onUpdate(post.id, { title: trimmed });
    }
    setEditingTitle(false);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onUpdate(post.id, { scheduledDate: e.target.value || undefined });
  };

  const pillarStyle = getPillarStyle(post.pillar);
  const statusColor = STATUS_COLORS[post.status];

  return (
    <motion.tr
      ref={setNodeRef}
      style={rowStyle}
      layout={false}
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: 1,
        y: 0,
        backgroundColor: recentStatusChange
          ? 'rgba(139, 112, 130, 0.06)'
          : isSelected
          ? 'rgba(97, 42, 79, 0.04)'
          : 'transparent',
      }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`border-b cursor-pointer group hover:bg-gray-50/60 border-gray-50`} style={{ borderTop: showInsertLine ? '1.5px solid #9CA3AF' : undefined }}
      onClick={() => onClick(post)}
    >
      {/* Drag handle */}
      <td className="px-2 py-3">
        <button
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-grab active:cursor-grabbing p-0.5 rounded text-gray-300 hover:text-gray-500"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
      </td>

      {/* Title */}
      <td className="px-4 py-3 min-w-[300px]">
        {editingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={titleDraft}
            onChange={e => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={e => {
              if (e.key === 'Enter') commitTitle();
              if (e.key === 'Escape') setEditingTitle(false);
            }}
            onClick={e => e.stopPropagation()}
            className="text-sm font-medium text-gray-900 bg-white outline-none border border-gray-200 rounded px-1.5 py-0.5 w-full focus:border-gray-300 transition-colors duration-150"
          />
        ) : (
          <span
            onDoubleClick={handleTitleDoubleClick}
            className="text-sm font-medium text-gray-900"
          >
            {post.title}
          </span>
        )}
      </td>

      {/* Pillar pill */}
      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
        <PillarDropdown
          value={post.pillar}
          pillars={pillars}
          onChange={val => onUpdate(post.id, { pillar: val })}
          onDelete={onDeletePillar}
        />
      </td>

      {/* Format */}
      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
        <FormatDropdown
          value={post.format}
          formats={formats}
          onChange={val => onUpdate(post.id, { format: val })}
          onAdd={onAddFormat}
          onDelete={onDeleteFormat}
        />
      </td>

      {/* Status + shoot action */}
      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2.5">
          <StatusDropdown
            value={post.status}
            onChange={handleStatusChange}
          />
          {post.status === 'Ready to shoot' && onSendToShoots && !post.sentToShoots && (
            <div className="relative group/arrow flex-shrink-0">
              <button
                onClick={() => onSendToShoots(post.id)}
                className="flex items-center justify-center w-5 h-5 rounded-full bg-[#612A4F]/8 hover:bg-[#612A4F]/20 transition-colors"
              >
                <ArrowRight size={11} className="text-[#612A4F]" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-gray-800 text-white text-[10px] font-medium whitespace-nowrap opacity-0 group-hover/arrow:opacity-100 transition-opacity duration-100 pointer-events-none">
                Plan the shoot
              </div>
            </div>
          )}
          {post.sentToShoots && (
            <span className="text-[10px] text-[#612A4F]/60 font-medium whitespace-nowrap">
              Shoot in progress
            </span>
          )}
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-3 text-sm" onClick={e => e.stopPropagation()}>
        <PostsDatePicker
          value={post.scheduledDate}
          allPosts={allPosts}
          onChange={date => onUpdate(post.id, { scheduledDate: date })}
          onClickPost={onClick}
          detailPanelOpen={detailPanelOpen}
        />
      </td>

      {/* Actions menu */}
      <td className="px-2 py-3">
        <Popover>
          <PopoverTrigger asChild>
            <button
              onClick={e => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-300 hover:text-gray-500 transition-all duration-150"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={4} className="w-44 p-1 rounded-lg border border-gray-100 bg-white shadow-lg" onClick={e => e.stopPropagation()}>
            {onSendToShoots && (
              <button
                onClick={() => onSendToShoots(post.id)}
                className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer w-full"
              >
                <Camera className="w-3.5 h-3.5" />
                Plan a shoot
              </button>
            )}
            <button
              onClick={() => onDelete(post.id)}
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-red-500 hover:bg-gray-50 rounded-md cursor-pointer w-full"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </PopoverContent>
        </Popover>
      </td>
    </motion.tr>
  );
};

export default PostsTable;
