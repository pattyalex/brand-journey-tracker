import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Trash2 } from 'lucide-react';
import PostsDatePicker from './PostsDatePicker';
import FormatDropdown from './FormatDropdown';
import PillarDropdown from './PillarDropdown';
import StatusDropdown from './StatusDropdown';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
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

interface PostsTableProps {
  posts: Post[];
  allPosts: Post[];
  pillars: string[];
  formats: string[];
  detailPanelOpen: boolean;
  onRowClick: (post: Post) => void;
  onUpdatePost: (id: string, updates: Partial<Post>) => void;
  onDeletePost: (id: string) => void;
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
  onAddFormat,
  onDeleteFormat,
  onDeletePillar,
  onReorder,
  selectedIds,
  onSelectToggle,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
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
            <th className="w-8 px-1 py-3" />
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Pillar</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Format</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
            <th className="w-10 px-2 py-3" />
          </tr>
        </thead>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </SortableContext>
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
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: post.id,
    transition: { duration: 250, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' },
  });

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(post.title);
  const [recentStatusChange, setRecentStatusChange] = useState(false);
  const [addingCustomFormat, setAddingCustomFormat] = useState(false);
  const [customFormatDraft, setCustomFormatDraft] = useState('');
  const [formatDropdownOpen, setFormatDropdownOpen] = useState(false);
  const formatDropdownRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
      style={style}
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
      className="border-b border-gray-50 cursor-pointer group hover:bg-gray-50/60"
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

      {/* Checkbox */}
      <td className="px-1 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          onClick={e => {
            e.stopPropagation();
            onSelect(post.id, e.shiftKey);
          }}
          className="w-3.5 h-3.5 rounded border-gray-300 text-[#612a4f] focus:ring-[#612a4f]/30 cursor-pointer opacity-0 group-hover:opacity-100 data-[checked]:opacity-100 transition-opacity duration-150"
          data-checked={isSelected || undefined}
          style={{ opacity: isSelected ? 1 : undefined }}
        />
      </td>

      {/* Title */}
      <td className="px-4 py-3 min-w-[200px]">
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

      {/* Status */}
      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
        <StatusDropdown
          value={post.status}
          onChange={handleStatusChange}
        />
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

      {/* Delete */}
      <td className="px-2 py-3">
        <button
          onClick={e => { e.stopPropagation(); onDelete(post.id); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-300 hover:text-red-500 transition-all duration-150"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </motion.tr>
  );
};

export default PostsTable;
