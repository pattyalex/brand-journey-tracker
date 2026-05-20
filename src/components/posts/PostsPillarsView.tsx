import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Columns3 } from 'lucide-react';
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
  onDuplicatePost: (id: string) => void;
  onSendToShoots?: (id: string) => void;
  onSendToSchedule?: (id: string) => void;
  onAddPost: (title: string, pillar: string) => void;
  onReorder: (posts: Post[]) => void;
  onAddPillar?: (name: string) => void;
  onSwitchView?: (view: string) => void;
}

const PostsPillarsView: React.FC<PostsPillarsViewProps> = ({
  posts,
  pillars,
  onClickPost,
  onUpdatePost,
  onDeletePost,
  onDuplicatePost,
  onSendToShoots,
  onSendToSchedule,
  onAddPost,
  onReorder,
  onAddPillar,
  onSwitchView,
}) => {
  // Only show columns for defined pillars — don't create ghost columns
  // from stale pillar values on old posts
  const allPillars = pillars;

  const [ghostHidden, setGhostHidden] = useState(() => localStorage.getItem('meg_hide_pillar_ghost') === 'true');
  const [addingPillar, setAddingPillar] = useState(false);
  const [newPillarName, setNewPillarName] = useState('');
  const pillarInputRef = useRef<HTMLInputElement>(null);

  const handleSubmitPillar = () => {
    const trimmed = newPillarName.trim();
    if (trimmed && onAddPillar) {
      onAddPillar(trimmed);
    }
    setNewPillarName('');
    setAddingPillar(false);
  };

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
    if (allPillars.includes(overId)) {
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
    if (allPillars.includes(overId)) {
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

  const unsortedPosts = posts.filter(p => !p.pillar || !allPillars.includes(p.pillar));

  if (allPillars.length === 0 && unsortedPosts.length === 0) {
    const examples = [
      { name: 'Wellness', color: '#60A5FA' },
      { name: 'Fitness', color: '#4ADE80' },
      { name: 'Products', color: '#F87171' },
    ];
    return (
      <div className="flex flex-col items-center justify-center px-6 text-center" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Mini column preview */}
        <div className="flex gap-3 mb-6">
          {examples.map((ex) => (
            <div key={ex.name} className="w-28 rounded-lg overflow-hidden" style={{ backgroundColor: `${ex.color}08`, border: `1.5px solid ${ex.color}25` }}>
              <div className="px-2.5 py-2 border-b" style={{ borderColor: `${ex.color}20` }}>
                <div className="text-[11px] font-medium text-gray-500">{ex.name}</div>
              </div>
              <div className="px-2 py-2 space-y-1.5">
                <div className="h-6 rounded-md" style={{ backgroundColor: `${ex.color}12` }} />
                <div className="h-6 rounded-md" style={{ backgroundColor: `${ex.color}08` }} />
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-base font-semibold text-gray-800 mb-1.5">
          Start with your pillars
        </h3>
        <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-3">
          Create your content themes first, then fill each one with ideas. A more strategic way to plan what you post.
        </p>
        <p className="text-xs text-gray-400 mb-5">
          You can also start with a{' '}
          <button onClick={() => onSwitchView?.('List')} className="font-semibold text-gray-600 hover:text-[#612A4F] transition-colors">List</button>
          {' '}or plan on a{' '}
          <button onClick={() => onSwitchView?.('Timeline')} className="font-semibold text-gray-600 hover:text-[#612A4F] transition-colors">Timeline</button>
        </p>

        {addingPillar ? (
          <div className="flex items-center gap-2 bg-white rounded-full border border-gray-200 shadow-sm px-4 py-2 w-64">
            <input
              ref={pillarInputRef}
              type="text"
              value={newPillarName}
              onChange={e => setNewPillarName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSubmitPillar();
                if (e.key === 'Escape') { setAddingPillar(false); setNewPillarName(''); }
              }}
              onBlur={() => { if (!newPillarName.trim()) { setAddingPillar(false); setNewPillarName(''); } }}
              placeholder="e.g. Education, Lifestyle..."
              autoFocus
              className="flex-1 text-sm text-gray-800 placeholder:text-gray-300 outline-none bg-transparent"
            />
            <button onClick={handleSubmitPillar} className="text-xs font-medium text-[#612A4F] hover:text-[#4e2140] transition-colors">Add</button>
          </div>
        ) : (
          <button
            onClick={() => { setAddingPillar(true); setTimeout(() => pillarInputRef.current?.focus(), 50); }}
            className="group text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-[0_2px_8px_rgba(97,42,79,0.3)] hover:shadow-[0_4px_16px_rgba(97,42,79,0.4)] hover:scale-[1.03]"
            style={{ background: 'linear-gradient(135deg, #612A4F 0%, #8B3A6B 100%)' }}
          >
            <Plus className="w-4 h-4 inline-block mr-1.5 -mt-0.5 transition-transform duration-300 group-hover:rotate-90" />
            Add a pillar
          </button>
        )}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ height: 'calc(100vh - 132px)' }}>
        {unsortedPosts.length > 0 && (
          <PillarColumn
            key="__unsorted__"
            pillar="__unsorted__"
            posts={unsortedPosts}
            allPosts={posts}
            onClickPost={onClickPost}
            onUpdatePost={onUpdatePost}
            onDeletePost={onDeletePost}
            onDuplicatePost={onDuplicatePost}
            onSendToShoots={onSendToShoots}
            onSendToSchedule={onSendToSchedule}
            onAddPost={onAddPost}
            isOverColumn={overColumnId === '__unsorted__' && activeId !== null}
            overCardId={overColumnId === '__unsorted__' ? overCardId : null}
            activeId={activeId}
            isUnsorted
          />
        )}

        {/* Encourage pillar creation when none exist */}
        {allPillars.length === 0 && unsortedPosts.length > 0 && (
          <div className="flex-1 min-w-[300px] flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/30 px-6 text-center">
            <div className="flex gap-3 mb-5">
              {[
                { name: 'Wellness', color: '#60A5FA' },
                { name: 'Fitness', color: '#4ADE80' },
                { name: 'Products', color: '#F87171' },
              ].map((ex) => (
                <div key={ex.name} className="w-24 rounded-lg overflow-hidden" style={{ backgroundColor: `${ex.color}08`, border: `1.5px solid ${ex.color}25` }}>
                  <div className="px-2 py-1.5 border-b" style={{ borderColor: `${ex.color}20` }}>
                    <div className="text-[10px] font-medium text-gray-500">{ex.name}</div>
                  </div>
                  <div className="px-1.5 py-1.5 space-y-1">
                    <div className="h-5 rounded" style={{ backgroundColor: `${ex.color}12` }} />
                    <div className="h-5 rounded" style={{ backgroundColor: `${ex.color}08` }} />
                  </div>
                </div>
              ))}
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Create your pillars</h3>
            <p className="text-xs text-gray-400 max-w-[240px] leading-relaxed mb-4">
              Add pillars to organize your ideas by theme. Then drag them from Unassigned into the right column.
            </p>
            {addingPillar ? (
              <div className="flex items-center gap-2 bg-white rounded-full border border-gray-200 shadow-sm px-3 py-1.5 w-56">
                <input
                  ref={pillarInputRef}
                  type="text"
                  value={newPillarName}
                  onChange={e => setNewPillarName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSubmitPillar();
                    if (e.key === 'Escape') { setAddingPillar(false); setNewPillarName(''); }
                  }}
                  onBlur={() => { if (!newPillarName.trim()) { setAddingPillar(false); setNewPillarName(''); } }}
                  placeholder="e.g. Education, Lifestyle..."
                  autoFocus
                  className="flex-1 text-xs text-gray-800 placeholder:text-gray-300 outline-none bg-transparent"
                />
                <button onClick={handleSubmitPillar} className="text-xs font-medium text-[#612A4F] hover:text-[#4e2140] transition-colors">Add</button>
              </div>
            ) : (
              <button
                onClick={() => { setAddingPillar(true); setTimeout(() => pillarInputRef.current?.focus(), 50); }}
                className="group text-white px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 shadow-[0_2px_8px_rgba(97,42,79,0.3)] hover:shadow-[0_4px_16px_rgba(97,42,79,0.4)] hover:scale-[1.03]"
                style={{ background: 'linear-gradient(135deg, #612A4F 0%, #8B3A6B 100%)' }}
              >
                <Plus className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5 transition-transform duration-300 group-hover:rotate-90" />
                Add a pillar
              </button>
            )}
          </div>
        )}

        {allPillars.map(pillar => {
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
              onDuplicatePost={onDuplicatePost}
              onSendToShoots={onSendToShoots}
              onSendToSchedule={onSendToSchedule}
              onAddPost={onAddPost}
              isOverColumn={overColumnId === pillar && activeId !== null}
              overCardId={overColumnId === pillar ? overCardId : null}
              activeId={activeId}
            />
          );
        })}

        {/* Ghost column to encourage adding more pillars */}
        {allPillars.length > 0 && allPillars.length < 3 && !ghostHidden && (
          <div className="relative flex-1 min-w-[240px] flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 max-h-full">
            <button
              onClick={() => { setGhostHidden(true); localStorage.setItem('meg_hide_pillar_ghost', 'true'); }}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {addingPillar ? (
              <div className="flex items-center gap-2 bg-white rounded-full border border-gray-200 shadow-sm px-3 py-1.5 w-48">
                <input
                  ref={pillarInputRef}
                  type="text"
                  value={newPillarName}
                  onChange={e => setNewPillarName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSubmitPillar();
                    if (e.key === 'Escape') { setAddingPillar(false); setNewPillarName(''); }
                  }}
                  onBlur={() => { if (!newPillarName.trim()) { setAddingPillar(false); setNewPillarName(''); } }}
                  placeholder="e.g. Lifestyle, Tips..."
                  autoFocus
                  className="flex-1 text-xs text-gray-800 placeholder:text-gray-300 outline-none bg-transparent"
                />
                <button onClick={handleSubmitPillar} className="text-xs font-medium text-[#612A4F] hover:text-[#4e2140] transition-colors">Add</button>
              </div>
            ) : (
              <button
                onClick={() => { setAddingPillar(true); setTimeout(() => pillarInputRef.current?.focus(), 50); }}
                className="flex flex-col items-center gap-2 text-gray-400 hover:text-[#612A4F] transition-colors duration-200"
              >
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-[#612A4F]/40 transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">Add another pillar</span>
                <span className="text-[11px] text-gray-400">Most creators use 3–5 pillars</span>
              </button>
            )}
          </div>
        )}
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
  onDuplicatePost: (id: string) => void;
  onSendToShoots?: (id: string) => void;
  onSendToSchedule?: (id: string) => void;
  onAddPost: (title: string, pillar: string) => void;
  isOverColumn: boolean;
  overCardId: string | null;
  activeId: string | null;
  isUnsorted?: boolean;
}

const PillarColumn: React.FC<PillarColumnProps> = ({ pillar, posts, allPosts, onClickPost, onUpdatePost, onDeletePost, onDuplicatePost, onSendToShoots, onSendToSchedule, onAddPost, isOverColumn, overCardId, activeId, isUnsorted }) => {
  const style = isUnsorted
    ? { bg: '#F9FAFB', text: '#6B7280', border: '#D1D5DB' }
    : getPillarStyle(pillar);
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
      className="flex-1 min-w-[240px] flex flex-col rounded-lg transition-all duration-200 max-h-full"
      style={{
        backgroundColor: showColumnHighlight ? style.bg : `${style.bg}60`,
        border: showColumnHighlight ? `1px solid ${style.border}` : `1px solid ${style.border}40`,
      }}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3 flex-shrink-0">
        <span className={`text-sm font-semibold ${isUnsorted ? 'text-gray-400 italic' : 'text-gray-800'}`}>{isUnsorted ? 'Unassigned pillar' : pillar}</span>
      </div>

      {/* Cards — scrollable */}
      <SortableContext items={posts.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div className="px-2 pb-2 min-h-[40px] flex-1 overflow-y-auto scrollbar-thin">
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
              onDuplicatePost={onDuplicatePost}
              onSendToShoots={onSendToShoots}
              onSendToSchedule={onSendToSchedule}
              showInsertBefore={overCardId === post.id && activeId !== post.id}
              pillarStyle={style}
            />
          ))}
        </div>
      </SortableContext>

      {/* Add idea */}
      {!isUnsorted && <div className="px-2 pb-2 flex-shrink-0">
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
            className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-white rounded-md transition-colors duration-150"
          >
            <Plus className="w-3 h-3" />
            Add idea
          </button>
        )}
      </div>}
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
  onDuplicatePost: (id: string) => void;
  onSendToShoots?: (id: string) => void;
  onSendToSchedule?: (id: string) => void;
  showInsertBefore: boolean;
  pillarStyle: { bg: string; text: string; border: string };
}> = ({ post, allPosts, onClick, onUpdatePost, onDeletePost, onDuplicatePost, onSendToShoots, onSendToSchedule, showInsertBefore, pillarStyle }) => {
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
          onDuplicate={onDuplicatePost}
          onSendToShoots={onSendToShoots}
          onSendToSchedule={onSendToSchedule}
        />
      </div>
    </div>
  );
};

export default PostsPillarsView;
