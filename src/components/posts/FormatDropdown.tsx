import React, { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';

interface FormatDropdownProps {
  value: string;
  formats: string[];
  onChange: (val: string) => void;
  onAdd: (name: string) => void;
  onDelete: (name: string) => void;
}

const FormatDropdown: React.FC<FormatDropdownProps> = ({ value, formats, onChange, onAdd, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setAdding(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleAdd = () => {
    const name = draft.trim();
    if (name && !formats.some(f => f.toLowerCase() === name.toLowerCase())) {
      onAdd(name);
      onChange(name);
    }
    setAdding(false);
    setDraft('');
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`text-sm transition-colors duration-150 flex items-center gap-1 ${value ? 'text-gray-600 hover:text-gray-800' : 'text-gray-300 hover:text-gray-400'}`}
      >
        {value || 'Set format'}
        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-[60] bg-white rounded-lg border border-gray-200 shadow-lg py-1 min-w-[160px]">
          {formats.map(f => (
            <div
              key={f}
              className="flex items-center group/item hover:bg-gray-50 transition-colors duration-100"
            >
              <button
                onClick={() => { onChange(f); setOpen(false); }}
                className="flex-1 text-left px-3 py-1.5 text-sm text-gray-700"
              >
                {f}
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  if (f !== value) onDelete(f);
                }}
                className="px-2 py-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all duration-150"
                title={f === value ? "Can't delete active format" : 'Delete format'}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          <div className="border-t border-gray-100 mt-1 pt-1">
            {adding ? (
              <div className="px-2 py-1">
                <input
                  type="text"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') { setAdding(false); setDraft(''); }
                  }}
                  onBlur={handleAdd}
                  autoFocus
                  placeholder="Format name..."
                  className="w-full text-sm text-gray-800 outline-none border border-gray-200 rounded px-2 py-1 focus:border-gray-300 transition-colors duration-150"
                />
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors duration-150"
              >
                + Custom...
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormatDropdown;
