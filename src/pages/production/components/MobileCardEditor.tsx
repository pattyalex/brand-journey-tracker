import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Trash2 } from 'lucide-react';
import { ProductionCard, KanbanColumn } from '../types';

interface MobileCardEditorProps {
  card: ProductionCard;
  columns: KanbanColumn[];
  onSave: (updatedCard: ProductionCard) => void;
  onMove: (cardId: string, targetColumnId: string) => void;
  onDelete: (cardId: string) => void;
  onClose: () => void;
}

const columnLabels: Record<string, string> = {
  'ideate': 'Ideate',
  'shape-ideas': 'Script Ideas',
  'to-film': 'To Film',
  'to-edit': 'To Edit',
  'to-schedule': 'To Schedule',
  'posted': 'Posted',
};

const MobileCardEditor: React.FC<MobileCardEditorProps> = ({
  card,
  columns,
  onSave,
  onMove,
  onDelete,
  onClose,
}) => {
  const [title, setTitle] = useState(card.title);
  const [notes, setNotes] = useState(card.description || card.script || '');
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Auto-save on changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (title !== card.title || notes !== (card.description || card.script || '')) {
        onSave({
          ...card,
          title,
          description: notes,
          script: card.columnId !== 'ideate' ? notes : card.script,
        });
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [title, notes]);

  const handleMove = (targetColumnId: string) => {
    onMove(card.id, targetColumnId);
    setShowMoveMenu(false);
    onClose();
  };

  const handleDelete = () => {
    onDelete(card.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto" style={{ background: '#F8F6F4' }}>
      {/* Modern gradient background with brand colors */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(135deg, rgba(97, 42, 79, 0.03) 0%, transparent 50%),
            linear-gradient(225deg, rgba(139, 112, 130, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 0% 0%, rgba(97, 42, 79, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 100% 100%, rgba(139, 112, 130, 0.06) 0%, transparent 40%)
          `
        }}
      />

      {/* Floating glass orb decorations */}
      <div
        className="fixed top-20 -right-10 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 112, 130, 0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="fixed bottom-40 -left-10 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(97, 42, 79, 0.08) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Glass Header */}
      <div
        className="sticky top-0 z-20 px-4 py-4 flex items-center justify-between"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 4px 30px rgba(97, 42, 79, 0.05)',
        }}
      >
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 2px 8px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          <X className="w-5 h-5" style={{ color: '#612a4f' }} />
        </button>

        <span
          className="text-lg"
          style={{ color: '#612a4f', fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
        >
          {columnLabels[card.columnId] || card.columnId}
        </span>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 2px 8px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          <Trash2 className="w-5 h-5" style={{ color: '#8B7082' }} />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 p-5 space-y-5 pb-32">
        {/* Glass Card for Title */}
        <div
          className="rounded-3xl p-5"
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <label
            className="block text-xs font-semibold mb-3 uppercase tracking-wider"
            style={{ color: '#8B7082' }}
          >
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your idea?"
            className="w-full px-0 py-2 text-base focus:outline-none bg-transparent transition-all placeholder:text-gray-400 placeholder:font-normal"
            style={{
              color: '#1a1523',
              fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>

        {/* Glass Card for Notes */}
        <div
          className="rounded-3xl p-5"
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <label
            className="block text-xs font-semibold mb-3 uppercase tracking-wider"
            style={{ color: '#8B7082' }}
          >
            Notes & Ideas
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Dump your thoughts here... script ideas, talking points, visual concepts, anything!"
            rows={8}
            className="w-full px-0 py-2 text-sm leading-relaxed focus:outline-none bg-transparent resize-none placeholder:text-gray-400"
            style={{
              color: '#1a1523',
              fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>

        {/* Glass Card for Stage/Move */}
        <div
          className="rounded-3xl p-5"
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <label
            className="block text-xs font-semibold mb-3 uppercase tracking-wider"
            style={{ color: '#8B7082' }}
          >
            Move to
          </label>
          <button
            onClick={() => setShowMoveMenu(!showMoveMenu)}
            className="w-full py-3 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, rgba(97, 42, 79, 0.08) 0%, rgba(139, 112, 130, 0.06) 100%)',
              border: '1px solid rgba(139, 112, 130, 0.15)',
              padding: '12px 16px',
            }}
          >
            <span style={{ color: '#612a4f', fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              {columnLabels[card.columnId] || card.columnId}
            </span>
            <ChevronDown
              className="w-5 h-5 transition-transform duration-300"
              style={{
                color: '#612a4f',
                transform: showMoveMenu ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            />
          </button>

          {showMoveMenu && (
            <div className="mt-4 space-y-2">
              {columns.map((col) => (
                <button
                  key={col.id}
                  onClick={() => handleMove(col.id)}
                  disabled={col.id === card.columnId}
                  className="w-full py-3 px-4 rounded-xl text-left transition-all flex items-center justify-between active:scale-[0.98]"
                  style={{
                    background: col.id === card.columnId
                      ? 'linear-gradient(135deg, #612a4f 0%, #8B7082 100%)'
                      : 'rgba(255, 255, 255, 0.6)',
                    color: col.id === card.columnId ? 'white' : '#1a1523',
                    border: col.id === card.columnId ? 'none' : '1px solid rgba(139, 112, 130, 0.1)',
                  }}
                >
                  <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: col.id === card.columnId ? 500 : 400 }}>
                    {columnLabels[col.id] || col.id}
                  </span>
                  {col.id === card.columnId && (
                    <span className="text-xs opacity-80">Current</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(97, 42, 79, 0.4)', backdropFilter: 'blur(4px)' }}>
          <div
            className="w-full max-w-sm rounded-3xl p-6"
            style={{
              background: 'white',
              boxShadow: '0 25px 60px rgba(97, 42, 79, 0.25)',
            }}
          >
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: '#1a1523', fontFamily: "'Playfair Display', serif" }}
            >
              Delete this idea?
            </h3>
            <p className="text-sm mb-6" style={{ color: '#6b6478' }}>
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3.5 rounded-xl font-medium transition-all"
                style={{
                  background: 'rgba(139, 112, 130, 0.1)',
                  color: '#612a4f',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3.5 rounded-xl font-medium transition-all hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileCardEditor;
