import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';

interface PostQuickAddProps {
  onAdd: (title: string) => void;
  prominent?: boolean;
}

const PostQuickAdd: React.FC<PostQuickAddProps> = ({ onAdd, prominent }) => {
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
    if (prominent) {
      return (
        <div className="flex justify-center py-2">
          <button
            onClick={() => {
              setIsActive(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="group text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-[0_2px_8px_rgba(97,42,79,0.3)] hover:shadow-[0_4px_16px_rgba(97,42,79,0.4)] hover:scale-[1.03] flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #612A4F 0%, #8B3A6B 100%)' }}
          >
            <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            Add a post
          </button>
        </div>
      );
    }

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
