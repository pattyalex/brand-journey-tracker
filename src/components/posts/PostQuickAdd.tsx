import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';

interface PostQuickAddProps {
  onAdd: (title: string) => void;
}

const PostQuickAdd: React.FC<PostQuickAddProps> = ({ onAdd }) => {
  const [isActive, setIsActive] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setTitle('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setIsActive(false);
      setTitle('');
    }
  };

  if (!isActive) {
    return (
      <button
        onClick={() => {
          setIsActive(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50/50 transition-colors duration-200 rounded-b-lg"
      >
        <Plus className="w-4 h-4" />
        <span>Add a post</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50/50 rounded-b-lg border-t border-gray-100">
      <Plus className="w-4 h-4 text-gray-300 flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!title.trim()) setIsActive(false);
        }}
        placeholder="Post title..."
        className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-300 outline-none"
      />
      <span className="text-xs text-gray-300">Enter to add</span>
    </div>
  );
};

export default PostQuickAdd;
