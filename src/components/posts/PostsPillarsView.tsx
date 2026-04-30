import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Post, getPillarStyle } from '@/types/posts';
import PostCard from './PostCard';

interface PostsPillarsViewProps {
  posts: Post[];
  pillars: string[];
  onClickPost: (post: Post) => void;
  onUpdatePost: (id: string, updates: Partial<Post>) => void;
  onDeletePost: (id: string) => void;
  onSendToShoots?: (id: string) => void;
  onAddPost: (title: string, pillar: string) => void;
  onReorder: (posts: Post[]) => void;
}

const PostsPillarsView: React.FC<PostsPillarsViewProps> = ({
  posts,
  pillars,
  onClickPost,
  onUpdatePost,
  onDeletePost,
  onSendToShoots,
  onAddPost,
  onReorder,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [overCardId, setOverCardId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activePost = activeId ? posts.find(p => p.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverColumnId(null);
      setOverCardId(null);
      return;
    }
    const overId = over.id as string;
    if (pillars.includes(overId)) {
      setOverColumnId(overId);
      setOverCardId(null);
    } else {
      const overPost = posts.find(p => p.id === overId);
      if (overPost) {
        setOverColumnId(overPost.pillar);
        setOverCardId(overId);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setOverColumnId(null);
    setOverCardId(null);
    const { active, over } = event;
    if (!over) return;

    const postId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column header (pillar droppable)
    if (pillars.includes(overId)) {
      const post = posts.find(p => p.id === postId);
      if (post && post.pillar !== overId) {
        onUpdatePost(postId, { pillar: overId });
      }
      return;
    }

    // Dropped on another card — check if same or different column
    const draggedPost = posts.find(p => p.id === postId);
    const overPost = posts.find(p => p.id === overId);
    if (!draggedPost || !overPost) return;

    if (draggedPost.pillar !== overPost.pillar) {
      // Cross-column: update pillar and insert at position
      onUpdatePost(postId, { pillar: overPost.pillar });
    } else {
      // Same column: reorder
      const columnPosts = posts.filter(p => p.pillar === draggedPost.pillar);
      const oldIndex = columnPosts.findIndex(p => p.id === postId);
      const newIndex = columnPosts.findIndex(p => p.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(columnPosts, oldIndex, newIndex);
        const otherPosts = posts.filter(p => p.pillar !== draggedPost.pillar);
        onReorder([...otherPosts, ...reordered]);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverColumnId(null);
    setOverCardId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[400px]">
        {pillars.map(pillar => {
          const columnPosts = posts.filter(p => p.pillar === pillar);
          return (
            <PillarColumn
              key={pillar}
              pillar={pillar}
              posts={columnPosts}
              allPosts={posts}
              onClickPost={onClickPost}
              onUpdatePost={onUpdatePost}
              onDeletePost={onDeletePost}
              onSendToShoots={onSendToShoots}
              onAddPost={onAddPost}
              isOverColumn={overColumnId === pillar && activeId !== null}
              overCardId={overColumnId === pillar ? overCardId : null}
              activeId={activeId}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
        {activePost && (
          <div
            className="rounded-lg scale-[1.02] cursor-grabbing"
            style={{
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
              borderRadius: '0.5rem',
            }}
          >
            <PostCard post={activePost} variant="pillar" onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

// ── Pillar Column ────────────────────────────────────────────

interface PillarColumnProps {
  pillar: string;
  posts: Post[];
  allPosts: Post[];
  onClickPost: (post: Post) => void;
  onUpdatePost: (id: string, updates: Partial<Post>) => void;
  onDeletePost: (id: string) => void;
  onSendToShoots?: (id: string) => void;
  onAddPost: (title: string, pillar: string) => void;
  isOverColumn: boolean;
  overCardId: string | null;
  activeId: string | null;
}

const PillarColumn: React.FC<PillarColumnProps> = ({ pillar, posts, allPosts, onClickPost, onUpdatePost, onDeletePost, onSendToShoots, onAddPost, isOverColumn, overCardId, activeId }) => {
  const style = getPillarStyle(pillar);
  const { setNodeRef, isOver } = useDroppable({ id: pillar });
  const [addingIdea, setAddingIdea] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmitIdea = () => {
    const trimmed = ideaTitle.trim();
    if (trimmed) {
      onAddPost(trimmed, pillar);
    }
    setIdeaTitle('');
    setAddingIdea(false);
  };

  const showColumnHighlight = isOverColumn || isOver;

  return (
    <div
      ref={setNodeRef}
      className="flex-1 min-w-[240px] flex flex-col rounded-lg transition-all duration-200"
      style={{
        backgroundColor: showColumnHighlight ? style.bg : '#FAFAFA',
        border: showColumnHighlight ? `1px solid ${style.border}` : '1px solid transparent',
      }}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <span className="text-sm font-semibold text-gray-800">{pillar}</span>
      </div>

      {/* Cards */}
      <SortableContext items={posts.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 px-2 pb-2 min-h-[60px]">
          {posts.length === 0 && !addingIdea && (
            <p className="text-xs text-gray-300 text-center py-6 italic">Nothing here yet</p>
          )}
          {posts.map(post => (
            <SortableCard
              key={post.id}
              post={post}
              allPosts={allPosts}
              onClick={onClickPost}
              onUpdatePost={onUpdatePost}
              onDeletePost={onDeletePost}
              onSendToShoots={onSendToShoots}
              showInsertBefore={overCardId === post.id && activeId !== post.id}
              pillarStyle={style}
            />
          ))}
        </div>
      </SortableContext>

      {/* Add idea */}
      <div className="px-2 pb-2">
        {addingIdea ? (
          <div className="rounded-lg border border-gray-200 bg-white p-2">
            <input
              ref={inputRef}
              type="text"
              value={ideaTitle}
              onChange={e => setIdeaTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSubmitIdea();
                if (e.key === 'Escape') { setAddingIdea(false); setIdeaTitle(''); }
              }}
              onBlur={handleSubmitIdea}
              placeholder="Post title..."
              autoFocus
              className="w-full text-sm text-gray-800 placeholder:text-gray-300 outline-none"
            />
          </div>
        ) : (
          <button
            onClick={() => { setAddingIdea(true); setTimeout(() => inputRef.current?.focus(), 50); }}
            className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100/60 rounded-md transition-colors duration-150"
          >
            <Plus className="w-3 h-3" />
            Add idea
          </button>
        )}
      </div>
    </div>
  );
};

// ── Sortable Card Wrapper ────────────────────────────────────

const SortableCard: React.FC<{
  post: Post;
  allPosts: Post[];
  onClick: (post: Post) => void;
  onUpdatePost: (id: string, updates: Partial<Post>) => void;
  onDeletePost: (id: string) => void;
  onSendToShoots?: (id: string) => void;
  showInsertBefore: boolean;
  pillarStyle: { bg: string; text: string; border: string };
}> = ({ post, allPosts, onClick, onUpdatePost, onDeletePost, onSendToShoots, showInsertBefore, pillarStyle }) => {
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

  const showLine = isOver && !isDragging;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      {showLine && (
        <div className="flex items-center gap-1 my-1 animate-pulse">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pillarStyle.border }} />
          <div className="flex-1 h-[2px] rounded-full" style={{ backgroundColor: pillarStyle.border }} />
        </div>
      )}
      <div
        className="mb-2 transition-opacity duration-150"
        style={{ opacity: isDragging ? 0.2 : 1 }}
      >
        <PostCard
          post={post}
          variant="pillar"
          onClick={onClick}
          allPosts={allPosts}
          onUpdatePost={onUpdatePost}
          onClickPost={onClick}
          onDelete={onDeletePost}
          onSendToShoots={onSendToShoots}
        />
      </div>
    </div>
  );
};

export default PostsPillarsView;
