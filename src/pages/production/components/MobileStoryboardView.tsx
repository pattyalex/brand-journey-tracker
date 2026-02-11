import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Shirt, Boxes, NotebookPen, Check, Video, Camera, Clapperboard } from 'lucide-react';
import { ProductionCard, StoryboardScene } from '../types';
import { getShotTemplateById } from '../utils/shotTemplates';
import { variantImages } from './ShotLibraryDialog';

// Import default shot illustrations
import wideShotIllustration from "@/assets/shot-illustrations/wide-shot.png";
import mediumShotIllustration from "@/assets/shot-illustrations/medium-shot.png";
import closeUpShotIllustration from "@/assets/shot-illustrations/close-up-shot.png";
import handsDoingIllustration from "@/assets/shot-illustrations/hands-doing.png";
import closeDetailIllustration from "@/assets/shot-illustrations/close-detail.png";
import atDeskIllustration from "@/assets/shot-illustrations/at-desk.png";
import neutralVisualIllustration from "@/assets/shot-illustrations/neutral-visual.png";
import movingThroughIllustration from "@/assets/shot-illustrations/moving-through.png";
import quietCutawayIllustration from "@/assets/shot-illustrations/quiet-cutaway.png";
import reactionMomentIllustration from "@/assets/shot-illustrations/reaction-moment.png";

// Map shot IDs to their default illustrations
const shotIllustrations: Record<string, string> = {
  'wide-shot': wideShotIllustration,
  'medium-shot': mediumShotIllustration,
  'close-up-shot': closeUpShotIllustration,
  'hands-doing': handsDoingIllustration,
  'close-detail': closeDetailIllustration,
  'at-desk': atDeskIllustration,
  'neutral-visual': neutralVisualIllustration,
  'moving-through': movingThroughIllustration,
  'quiet-cutaway': quietCutawayIllustration,
  'reaction-moment': reactionMomentIllustration,
};

interface MobileStoryboardViewProps {
  card: ProductionCard;
  onClose: () => void;
  onUpdateCard?: (updatedCard: ProductionCard) => void;
}

const MobileStoryboardView: React.FC<MobileStoryboardViewProps> = ({
  card,
  onClose,
  onUpdateCard,
}) => {
  const scenes = card.storyboard || [];
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [filmedScenes, setFilmedScenes] = useState<Set<string>>(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem(`heymeg_filmed_${card.id}`);
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        return new Set();
      }
    }
    return new Set();
  });
  const [showChecklist, setShowChecklist] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Save filmed scenes to localStorage
  useEffect(() => {
    localStorage.setItem(`heymeg_filmed_${card.id}`, JSON.stringify([...filmedScenes]));
  }, [filmedScenes, card.id]);

  // Handle scroll to update current scene index
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      if (newIndex !== currentSceneIndex && newIndex >= 0 && newIndex < scenes.length) {
        setCurrentSceneIndex(newIndex);
      }
    }
  };

  // Scroll to specific scene
  const scrollToScene = (index: number) => {
    if (scrollContainerRef.current && index >= 0 && index < scenes.length) {
      const container = scrollContainerRef.current;
      const cardWidth = container.offsetWidth;
      container.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
      setCurrentSceneIndex(index);
    }
  };

  // Toggle filmed status
  const toggleFilmed = (sceneId: string) => {
    setFilmedScenes(prev => {
      const next = new Set(prev);
      if (next.has(sceneId)) {
        next.delete(sceneId);
      } else {
        next.add(sceneId);
      }
      return next;
    });
  };

  // Get shot illustration for a scene
  const getSceneIllustration = (scene: StoryboardScene): string | null => {
    if (!scene.selectedShotTemplateId) return null;

    // Check for variant first
    if (scene.selectedVariantId && variantImages[scene.selectedShotTemplateId]?.[scene.selectedVariantId]) {
      return variantImages[scene.selectedShotTemplateId][scene.selectedVariantId];
    }

    // Fall back to default illustration
    return shotIllustrations[scene.selectedShotTemplateId] || null;
  };

  // Check if there's prep info
  const hasPrep = card.locationText || card.outfitText || card.propsText || card.filmingNotes;

  if (scenes.length === 0) {
    return (
      <div className="fixed inset-0 z-50" style={{ background: '#F8F6F4' }}>
        {/* Header */}
        <div
          className="sticky top-0 z-20 px-4 py-4 flex items-center justify-between"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(240, 232, 237, 0.8)',
          }}
        >
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 2px 8px rgba(97, 42, 79, 0.08)',
            }}
          >
            <X className="w-5 h-5" style={{ color: '#612a4f' }} />
          </button>
          <span
            className="text-lg font-medium"
            style={{ color: '#612a4f', fontFamily: "'Playfair Display', serif" }}
          >
            Storyboard
          </span>
          <div className="w-10" />
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(97, 42, 79, 0.1) 0%, rgba(139, 112, 130, 0.05) 100%)',
            }}
          >
            <Clapperboard className="w-10 h-10" style={{ color: '#8B7082' }} />
          </div>
          <h2
            className="text-xl mb-2"
            style={{ color: '#612a4f', fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            No Storyboard Yet
          </h2>
          <p className="text-sm" style={{ color: '#8B7082' }}>
            Create a storyboard on desktop to see your shot list here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#F8F6F4' }}>
      {/* Gradient background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(135deg, rgba(97, 42, 79, 0.03) 0%, transparent 50%),
            linear-gradient(225deg, rgba(139, 112, 130, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 0% 0%, rgba(97, 42, 79, 0.08) 0%, transparent 40%)
          `
        }}
      />

      {/* Header */}
      <div
        className="relative z-20 px-4 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(240, 232, 237, 0.8)',
        }}
      >
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 2px 8px rgba(97, 42, 79, 0.08)',
          }}
        >
          <X className="w-5 h-5" style={{ color: '#612a4f' }} />
        </button>

        {/* Title and progress */}
        <div className="flex flex-col items-center">
          <span
            className="text-sm font-medium"
            style={{ color: '#612a4f', fontFamily: "'Playfair Display', serif" }}
          >
            {card.title}
          </span>
          <span className="text-xs" style={{ color: '#8B7082' }}>
            Scene {currentSceneIndex + 1} of {scenes.length}
          </span>
        </div>

        {/* Filmed counter */}
        <div
          className="px-3 py-1.5 rounded-xl text-xs font-medium"
          style={{
            background: filmedScenes.size === scenes.length
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'rgba(139, 112, 130, 0.1)',
            color: filmedScenes.size === scenes.length ? 'white' : '#612a4f',
          }}
        >
          {filmedScenes.size}/{scenes.length}
        </div>
      </div>

      {/* Scene progress dots */}
      <div className="relative z-10 flex items-center justify-center gap-1.5 py-3 px-4">
        {scenes.map((scene, index) => (
          <button
            key={scene.id}
            onClick={() => scrollToScene(index)}
            className="transition-all"
            style={{
              width: index === currentSceneIndex ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: filmedScenes.has(scene.id)
                ? '#10b981'
                : index === currentSceneIndex
                  ? 'linear-gradient(135deg, #612a4f 0%, #8B7082 100%)'
                  : 'rgba(139, 112, 130, 0.2)',
            }}
          />
        ))}
      </div>

      {/* Swipeable scene cards */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {scenes.map((scene, index) => {
          const template = scene.selectedShotTemplateId
            ? getShotTemplateById(scene.selectedShotTemplateId)
            : null;
          const illustration = getSceneIllustration(scene);
          const isFilmed = filmedScenes.has(scene.id);

          return (
            <div
              key={scene.id}
              className="flex-shrink-0 w-full snap-center px-5 pb-4 flex flex-col"
            >
              {/* Scene card */}
              <div
                className="flex-1 rounded-3xl overflow-hidden flex flex-col"
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(97, 42, 79, 0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                }}
              >
                {/* Shot illustration */}
                <div
                  className="relative flex items-center justify-center py-6 px-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(97, 42, 79, 0.03) 0%, rgba(139, 112, 130, 0.02) 100%)',
                    minHeight: 200,
                  }}
                >
                  {illustration ? (
                    <img
                      src={illustration}
                      alt={template?.user_facing_name || 'Shot'}
                      className="max-h-[180px] object-contain"
                      style={{ filter: isFilmed ? 'grayscale(0.3)' : 'none' }}
                    />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-3xl flex items-center justify-center"
                      style={{ background: 'rgba(139, 112, 130, 0.1)' }}
                    >
                      <Video className="w-10 h-10" style={{ color: '#8B7082' }} />
                    </div>
                  )}

                  {/* Filmed badge */}
                  {isFilmed && (
                    <div
                      className="absolute top-4 right-4 px-3 py-1.5 rounded-full flex items-center gap-1.5"
                      style={{ background: '#10b981' }}
                    >
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span className="text-xs font-medium text-white">Filmed</span>
                    </div>
                  )}
                </div>

                {/* Shot info */}
                <div className="px-5 py-4 flex-1 flex flex-col">
                  {/* Shot type name */}
                  {template && (
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(97, 42, 79, 0.1) 0%, rgba(139, 112, 130, 0.05) 100%)',
                        }}
                      >
                        <Camera className="w-4 h-4" style={{ color: '#612a4f' }} />
                      </div>
                      <span
                        className="font-semibold"
                        style={{ color: '#612a4f', fontFamily: "'Playfair Display', serif" }}
                      >
                        {template.user_facing_name}
                      </span>
                    </div>
                  )}

                  {/* Script excerpt - what to say */}
                  {scene.scriptExcerpt && (
                    <div className="mb-4">
                      <p
                        className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                        style={{ color: '#8B7082' }}
                      >
                        What to say
                      </p>
                      <p
                        className="text-base leading-relaxed"
                        style={{ color: '#1a1523', fontFamily: "'Inter', sans-serif" }}
                      >
                        "{scene.scriptExcerpt}"
                      </p>
                    </div>
                  )}

                  {/* Visual notes - how to film */}
                  {scene.visualNotes && (
                    <div className="mb-4">
                      <p
                        className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                        style={{ color: '#8B7082' }}
                      >
                        Visual notes
                      </p>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: '#6b6478' }}
                      >
                        {scene.visualNotes}
                      </p>
                    </div>
                  )}

                  {/* Shot description from template */}
                  {template && !scene.visualNotes && (
                    <div className="mb-4">
                      <p
                        className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                        style={{ color: '#8B7082' }}
                      >
                        How to film this
                      </p>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: '#6b6478' }}
                      >
                        {template.description}
                      </p>
                    </div>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Mark as filmed button */}
                  <button
                    onClick={() => toggleFilmed(scene.id)}
                    className="w-full py-4 rounded-2xl font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    style={{
                      background: isFilmed
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'linear-gradient(135deg, #612a4f 0%, #8B7082 100%)',
                      color: isFilmed ? '#10b981' : 'white',
                      border: isFilmed ? '2px solid #10b981' : 'none',
                    }}
                  >
                    <Check className="w-5 h-5" />
                    {isFilmed ? 'Filmed' : 'Mark as Filmed'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prep checklist - collapsible */}
      {hasPrep && (
        <div
          className="relative z-10"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(240, 232, 237, 0.8)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Toggle header */}
          <button
            onClick={() => setShowChecklist(!showChecklist)}
            className="w-full px-5 py-3 flex items-center justify-between"
          >
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: '#612a4f' }}
            >
              Filming Prep
            </span>
            <ChevronRight
              className="w-4 h-4 transition-transform"
              style={{
                color: '#8B7082',
                transform: showChecklist ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            />
          </button>

          {/* Checklist items */}
          {showChecklist && (
            <div className="px-5 pb-4 space-y-2">
              {card.locationText && (
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(97, 42, 79, 0.08)' }}
                  >
                    <MapPin className="w-4 h-4" style={{ color: '#612a4f' }} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-xs font-medium" style={{ color: '#8B7082' }}>Location</p>
                    <p className="text-sm" style={{ color: '#1a1523' }}>{card.locationText}</p>
                  </div>
                </div>
              )}

              {card.outfitText && (
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(97, 42, 79, 0.08)' }}
                  >
                    <Shirt className="w-4 h-4" style={{ color: '#612a4f' }} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-xs font-medium" style={{ color: '#8B7082' }}>Outfit</p>
                    <p className="text-sm" style={{ color: '#1a1523' }}>{card.outfitText}</p>
                  </div>
                </div>
              )}

              {card.propsText && (
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(97, 42, 79, 0.08)' }}
                  >
                    <Boxes className="w-4 h-4" style={{ color: '#612a4f' }} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-xs font-medium" style={{ color: '#8B7082' }}>Props</p>
                    <p className="text-sm" style={{ color: '#1a1523' }}>{card.propsText}</p>
                  </div>
                </div>
              )}

              {card.filmingNotes && (
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(97, 42, 79, 0.08)' }}
                  >
                    <NotebookPen className="w-4 h-4" style={{ color: '#612a4f' }} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-xs font-medium" style={{ color: '#8B7082' }}>Notes</p>
                    <p className="text-sm" style={{ color: '#1a1523' }}>{card.filmingNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation arrows for larger phones */}
      {scenes.length > 1 && (
        <>
          {currentSceneIndex > 0 && (
            <button
              onClick={() => scrollToScene(currentSceneIndex - 1)}
              className="fixed left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-20 transition-all active:scale-95"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 4px 12px rgba(97, 42, 79, 0.15)',
              }}
            >
              <ChevronLeft className="w-5 h-5" style={{ color: '#612a4f' }} />
            </button>
          )}
          {currentSceneIndex < scenes.length - 1 && (
            <button
              onClick={() => scrollToScene(currentSceneIndex + 1)}
              className="fixed right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-20 transition-all active:scale-95"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 4px 12px rgba(97, 42, 79, 0.15)',
              }}
            >
              <ChevronRight className="w-5 h-5" style={{ color: '#612a4f' }} />
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default MobileStoryboardView;
