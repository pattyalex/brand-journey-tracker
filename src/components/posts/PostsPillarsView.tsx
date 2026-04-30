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
  onAddPost: (title: string, pillar: string) => void;
  onReorder: (posts: Post[]) => void;
}

const PostsPillarsView: React.FC<PostsPillarsViewProps> = ({
  posts,
  pillars,
  onClickPost,
  onUpdatePost,
  onAddPost,
  onReorder,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activePost = activeId ? posts.find(p => p.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
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
      // Cross-column: update pillar
      onUpdatePost(postId, { pillar: overPost.pillar });
    } else {
      // Same column: reorder
      const columnPosts = posts.filter(p => p.pillar === draggedPost.pillar);
      const oldIndex = columnPosts.findIndex(p => p.id === postId);
      const newIndex = columnPosts.findIndex(p => p.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(columnPosts, oldIndex, newIndex);
        // Merge back
        const otherPosts = posts.filter(p => p.pillar !== draggedPost.pillar);
        onReorder([...otherPosts, ...reordered]);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[400px]">
        {pillars.map(pillar => {
          const columnPosts = posts.filter(p => p.pillar === pillar);
          return (
            <PillarColumn
              key={pillar}
              pillar={pillar}
              posts={columnPosts}
              onClickPost={onClickPost}
              onAddPost={onAddPost}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
        {activePost && (
          <div className="opacity-80 rotate-[2deg] scale-105">
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
  onClickPost: (post: Post) => void;
  onAddPost: (title: string, pillar: string) => void;
}

const PillarColumn: React.FC<PillarColumnProps> = ({ pillar, posts, onClickPost, onAddPost }) => {
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

  return (
    <div
      ref={setNodeRef}
      className="flex-shrink-0 w-64 flex flex-col rounded-lg transition-colors duration-200"
      style={{
        backgroundColor: isOver ? `${style.bg}` : '#FAFAFA',
        border: isOver ? `1px dashed ${style.border}` : '1px solid transparent',
      }}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: style.text }} />
        <span className="text-sm font-semibold text-gray-800">{pillar}</span>
        <span className="text-xs text-gray-400 tabular-nums">{posts.length}</span>
      </div>

      {/* Cards */}
      <SortableContext items={posts.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 px-2 pb-2 space-y-2 min-h-[60px]">
          {posts.length === 0 && !addingIdea && (
            <p className="text-xs text-gray-300 text-center py-6 italic">Nothing here yet</p>
          )}
          {posts.map(post => (
            <SortableCard key={post.id} post={post} onClick={onClickPost} />
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

const SortableCard: React.FC<{ post: Post; onClick: (post: Post) => void }> = ({ post, onClick }) => {
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

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <PostCard post={post} variant="pillar" onClick={onClick} />
    </div>
  );
};

export default PostsPillarsView;
