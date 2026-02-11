import React, { useState, useEffect } from 'react';
import { Plus, Lightbulb, PenLine, Clapperboard, Scissors, CalendarDays, Archive, ChevronDown, Video, Play } from 'lucide-react';
import { KanbanColumn, ProductionCard } from '../types';

interface MobileContentViewProps {
  columns: KanbanColumn[];
  onAddIdea: () => void;
  onCardClick: (card: ProductionCard) => void;
  onOpenStoryboard?: (card: ProductionCard) => void;
}

const columnConfig: Record<string, { icon: React.ElementType; color: string; gradient: string; label: string }> = {
  'ideate': { icon: Lightbulb, color: '#612a4f', gradient: 'linear-gradient(135deg, rgba(97, 42, 79, 0.1) 0%, rgba(139, 112, 130, 0.05) 100%)', label: 'Ideate' },
  'shape-ideas': { icon: PenLine, color: '#612a4f', gradient: 'linear-gradient(135deg, rgba(97, 42, 79, 0.1) 0%, rgba(139, 112, 130, 0.05) 100%)', label: 'Script Ideas' },
  'to-film': { icon: Clapperboard, color: '#612a4f', gradient: 'linear-gradient(135deg, rgba(97, 42, 79, 0.1) 0%, rgba(139, 112, 130, 0.05) 100%)', label: 'To Film' },
  'to-edit': { icon: Scissors, color: '#612a4f', gradient: 'linear-gradient(135deg, rgba(97, 42, 79, 0.1) 0%, rgba(139, 112, 130, 0.05) 100%)', label: 'To Edit' },
  'to-schedule': { icon: CalendarDays, color: '#612a4f', gradient: 'linear-gradient(135deg, rgba(97, 42, 79, 0.1) 0%, rgba(139, 112, 130, 0.05) 100%)', label: 'To Schedule' },
  'posted': { icon: Archive, color: '#8B7082', gradient: 'linear-gradient(135deg, rgba(139, 112, 130, 0.08) 0%, rgba(139, 112, 130, 0.03) 100%)', label: 'Posted' },
};

const STORAGE_KEY = 'heymeg_mobile_content_expanded';

const MobileContentView: React.FC<MobileContentViewProps> = ({ columns, onAddIdea, onCardClick, onOpenStoryboard }) => {
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...expandedColumns]));
  }, [expandedColumns]);

  const toggleColumn = (columnId: string) => {
    setExpandedColumns(prev => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  };

  const activeColumns = columns.filter(col => col.id !== 'posted' || col.cards.length > 0);
  const totalIdeas = columns.reduce((acc, col) => acc + col.cards.length, 0);

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F8F6F4' }}>
      {/* Modern gradient background */}
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
        className="fixed top-32 -right-16 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 112, 130, 0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        className="fixed bottom-60 -left-16 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(97, 42, 79, 0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Glass Header */}
      <div
        className="sticky top-0 z-10 px-5 py-5"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 4px 30px rgba(97, 42, 79, 0.05)',
        }}
      >
        <h1
          className="text-2xl"
          style={{ color: '#612a4f', fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
        >
          Content Hub
        </h1>
        <p className="text-sm mt-1" style={{ color: '#8B7082' }}>
          {totalIdeas} {totalIdeas === 1 ? 'idea' : 'ideas'} in your pipeline
        </p>
      </div>

      {/* Columns as collapsible glass sections */}
      <div className="relative z-10 px-4 py-5 space-y-4">
        {activeColumns.map(column => {
          const config = columnConfig[column.id] || columnConfig['ideate'];
          const Icon = config.icon;
          const isExpanded = expandedColumns.has(column.id);
          const cardCount = column.cards.length;

          return (
            <div
              key={column.id}
              className="rounded-3xl overflow-hidden transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
              }}
            >
              {/* Column header */}
              <button
                onClick={() => toggleColumn(column.id)}
                className="w-full flex items-center justify-between p-4 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{
                      background: config.gradient,
                      boxShadow: '0 2px 8px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                  </div>
                  <span
                    className="font-semibold text-base"
                    style={{ color: '#1a1523', fontFamily: "'Playfair Display', serif" }}
                  >
                    {config.label}
                  </span>
                </div>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    background: isExpanded ? 'linear-gradient(135deg, #612a4f 0%, #8B7082 100%)' : 'rgba(139, 112, 130, 0.1)',
                  }}
                >
                  <ChevronDown
                    className="w-4 h-4 transition-transform duration-300"
                    style={{
                      color: isExpanded ? 'white' : '#8B7082',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </div>
              </button>

              {/* Cards */}
              {isExpanded && cardCount > 0 && (
                <div className="px-4 pb-4 space-y-2">
                  {column.cards.map((card) => {
                    const hasStoryboard = card.storyboard && card.storyboard.length > 0;
                    const isToFilm = column.id === 'to-film';
                    const sceneCount = card.storyboard?.length || 0;


                    // Default card layout for other columns
                    return (
                      <div
                        key={card.id}
                        className="rounded-2xl overflow-hidden transition-all"
                        style={{
                          background: 'rgba(255, 255, 255, 0.6)',
                          border: isToFilm && hasStoryboard
                            ? '2px solid rgba(97, 42, 79, 0.2)'
                            : '1px solid rgba(139, 112, 130, 0.1)',
                        }}
                      >
                        <button
                          onClick={() => onCardClick(card)}
                          className="w-full text-left p-4 flex items-center gap-3 transition-all active:scale-[0.98]"
                        >
                          {/* Title */}
                          <span
                            className="flex-1 text-sm"
                            style={{ color: '#1a1523', fontFamily: "'Inter', sans-serif" }}
                          >
                            {card.title}
                          </span>

                          {/* Storyboard indicator for to-film cards */}
                          {isToFilm && hasStoryboard && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(97, 42, 79, 0.1)', color: '#612a4f' }}
                            >
                              {sceneCount} shots
                            </span>
                          )}

                          {/* Arrow indicator */}
                          <ChevronDown
                            className="w-4 h-4 flex-shrink-0"
                            style={{ color: '#8B7082', transform: 'rotate(-90deg)' }}
                          />
                        </button>

                        {/* Open Storyboard button for to-film cards with storyboard */}
                        {isToFilm && hasStoryboard && onOpenStoryboard && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenStoryboard(card);
                            }}
                            className="w-full py-3 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            style={{
                              background: 'linear-gradient(135deg, #612a4f 0%, #8B7082 100%)',
                              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                            }}
                          >
                            <Play className="w-4 h-4 text-white" />
                            <span className="text-sm font-medium text-white">
                              Open Storyboard
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty state */}
              {isExpanded && cardCount === 0 && (
                <div className="px-4 pb-6 text-center">
                  <p className="text-sm" style={{ color: '#8B7082' }}>No items yet</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Add Button with glass effect */}
      <button
        onClick={onAddIdea}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 z-20"
        style={{
          background: 'linear-gradient(135deg, #612a4f 0%, #8B7082 100%)',
          boxShadow: '0 8px 32px rgba(97, 42, 79, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      >
        <Plus className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};

export default MobileContentView;
