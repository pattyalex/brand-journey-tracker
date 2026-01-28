import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Hand,
  Layout,
  Sparkles,
  Check,
  ChevronRight,
  X,
  Camera,
} from "lucide-react";
import { shotTemplates, shotCategories, ShotTemplate } from "../utils/shotTemplates";

// PNG illustrations - all 10 shot types have their own unique image
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

interface ShotLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectShot: (templateId: string) => void;
  currentShotId?: string;
}

const categoryIcons = {
  talking: User,
  detail: Hand,
  context: Layout,
  'pattern-break': Sparkles,
};

const categoryColors = {
  talking: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: 'bg-blue-500' },
  detail: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', accent: 'bg-amber-500' },
  context: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', accent: 'bg-emerald-500' },
  'pattern-break': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', accent: 'bg-purple-500' },
};

// Cute stick figure illustrations for each shot type
const ShotIllustration: React.FC<{ shotId: string; className?: string }> = ({ shotId, className }) => {
  const baseClass = cn("text-gray-600", className);

  switch (shotId) {
    case 'wide-shot':
      // PNG illustration - full body in room
      return (
        <img src={wideShotIllustration} alt="Wide shot" className={cn("w-full h-full object-contain scale-[1.2]", className)} />
      );

    case 'medium-shot':
      // PNG illustration - chest up talking
      return (
        <img src={mediumShotIllustration} alt="Medium shot" className={cn("w-full h-full object-contain scale-[1.2]", className)} />
      );

    case 'close-up-shot':
      // PNG illustration - face close up
      return (
        <img src={closeUpShotIllustration} alt="Close-up shot" className={cn("w-full h-full object-contain scale-[1.2]", className)} />
      );

    case 'hands-doing':
      // PNG illustration - hands cooking
      return (
        <img src={handsDoingIllustration} alt="Hands doing something" className={cn("w-full h-full object-contain scale-[1.2]", className)} />
      );

    case 'close-detail':
      // PNG illustration - close-up of sneakers
      return (
        <img src={closeDetailIllustration} alt="Close detail shot" className={cn("w-full h-full object-contain", className)} />
      );

    case 'at-desk':
      // PNG illustration - in your environment
      return (
        <img src={atDeskIllustration} alt="In your environment" className={cn("w-full h-full object-contain scale-[1.2]", className)} />
      );

    case 'neutral-visual':
      // PNG illustration - city view
      return (
        <img src={neutralVisualIllustration} alt="Neutral visual" className={cn("w-full h-full object-contain scale-[1.2]", className)} />
      );

    case 'moving-through':
      // PNG illustration - walking with dog
      return (
        <img src={movingThroughIllustration} alt="Moving through space" className={cn("w-full h-full object-contain scale-[1.2]", className)} />
      );

    case 'quiet-cutaway':
      // PNG illustration - person adjusting shirt
      return (
        <img src={quietCutawayIllustration} alt="Quiet cutaway" className={cn("w-full h-full object-contain scale-[1.2]", className)} />
      );

    case 'reaction-moment':
      // PNG illustration - surprised reaction
      return (
        <img src={reactionMomentIllustration} alt="Reaction moment" className={cn("w-full h-full object-contain", className)} />
      );

    default:
      return null;
  }
};

const ShotLibraryDialog: React.FC<ShotLibraryDialogProps> = ({
  open,
  onOpenChange,
  onSelectShot,
  currentShotId,
}) => {
  const [selectedShot, setSelectedShot] = useState<ShotTemplate | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('talking');

  const handleSelectShot = (template: ShotTemplate) => {
    setSelectedShot(template);
  };

  const handleConfirmSelection = () => {
    if (selectedShot) {
      onSelectShot(selectedShot.id);
      onOpenChange(false);
      setSelectedShot(null);
    }
  };

  const filteredTemplates = shotTemplates.filter(t => t.category === activeCategory);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[calc(100vh-4rem)] max-h-[700px] sm:max-w-[900px] border-0 shadow-2xl p-0 overflow-hidden flex flex-col bg-white">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Shot Library
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-0.5">
                  Choose how to film this scene
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Category sidebar */}
          <div className="w-56 flex-shrink-0 border-r border-gray-100 bg-gray-50/50 p-3 overflow-y-auto">
            <div className="space-y-1">
              {shotCategories.map((category) => {
                const Icon = categoryIcons[category.id as keyof typeof categoryIcons];
                const isActive = activeCategory === category.id;
                const colors = categoryColors[category.id as keyof typeof categoryColors];

                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                      isActive
                        ? `${colors.bg} ${colors.border} border-2 ${colors.text}`
                        : "hover:bg-gray-100 text-gray-600 border-2 border-transparent"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      isActive ? colors.accent : "bg-gray-200"
                    )}>
                      <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-gray-500")} />
                    </div>
                    <span className="text-sm font-medium leading-tight">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shot list */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid gap-3">
              {filteredTemplates.map((template) => {
                const isSelected = selectedShot?.id === template.id;
                const isCurrent = currentShotId === template.id;
                const colors = categoryColors[template.category as keyof typeof categoryColors];

                return (
                  <motion.button
                    key={template.id}
                    onClick={() => handleSelectShot(template)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border-2 transition-all",
                      isSelected
                        ? `${colors.bg} ${colors.border} shadow-md`
                        : isCurrent
                          ? "bg-gray-50 border-gray-300"
                          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    )}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Shot illustration */}
                      <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                        <ShotIllustration shotId={template.id} className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={cn(
                            "font-semibold",
                            isSelected ? colors.text : "text-gray-900"
                          )}>
                            {template.user_facing_name}
                          </h3>
                          {isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {template.description}
                        </p>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                        isSelected ? colors.accent : "bg-gray-100"
                      )}>
                        {isSelected ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          <AnimatePresence mode="wait">
            {selectedShot && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-80 flex-shrink-0 border-l border-gray-100 bg-gray-50/30 p-5 overflow-y-auto"
              >
                <div className="space-y-5">
                  {/* Shot illustration - large */}
                  <div className="flex justify-center">
                    <div className="w-40 h-40 overflow-hidden rounded-xl">
                      <ShotIllustration shotId={selectedShot.id} className="w-full h-full" />
                    </div>
                  </div>

                  {/* Shot title */}
                  <div>
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-3",
                      categoryColors[selectedShot.category as keyof typeof categoryColors].bg,
                      categoryColors[selectedShot.category as keyof typeof categoryColors].text
                    )}>
                      {(() => {
                        const Icon = categoryIcons[selectedShot.category as keyof typeof categoryIcons];
                        return <Icon className="w-4 h-4" />;
                      })()}
                      {selectedShot.categoryLabel}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedShot.user_facing_name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {selectedShot.description}
                    </p>
                  </div>

                  {/* When to use */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      When to use
                    </h4>
                    <ul className="space-y-2">
                      {selectedShot.when_to_use.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Why it matters */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Why it matters
                    </h4>
                    <ul className="space-y-2">
                      {selectedShot.why_it_matters.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Select button */}
                  <Button
                    onClick={handleConfirmSelection}
                    className={cn(
                      "w-full h-11 rounded-xl font-medium text-white shadow-lg",
                      categoryColors[selectedShot.category as keyof typeof categoryColors].accent,
                      "hover:opacity-90 transition-opacity"
                    )}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Use this shot
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShotLibraryDialog;
