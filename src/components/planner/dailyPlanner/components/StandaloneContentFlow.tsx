import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ProductionCard, KanbanColumn } from "@/pages/production/types";
import { StorageKeys, getString, setString } from "@/lib/storage";
import { EVENTS, emit } from "@/lib/events";
import BrainDumpGuidanceDialog from "@/pages/production/components/BrainDumpGuidanceDialog";
import ScriptEditorDialog from "@/pages/production/components/ScriptEditorDialog";
import StoryboardEditorDialog from "@/pages/production/components/StoryboardEditorDialog";
import EditChecklistDialog from "@/pages/production/components/EditChecklistDialog";
import ExpandedScheduleView from "@/pages/production/components/ExpandedScheduleView";

interface StandaloneContentFlowProps {
  cardId: string;
  onClose: () => void;
  initialStep?: number;
}

// Helper to determine completed steps
const getCompletedSteps = (card: ProductionCard): number[] => {
  const completed: number[] = [];

  // Step 1: Ideate - has title or description
  if (card.title || card.hook || card.description) {
    completed.push(1);
  }

  // Step 2: Script - has script content
  if (card.script && card.script.trim().length > 0) {
    completed.push(2);
  }

  // Step 3: Film/Storyboard - has storyboard data
  if (card.storyboardData && card.storyboardData.length > 0) {
    completed.push(3);
  }

  // Step 4: Edit - has edit checklist items checked
  if (card.editChecklist && card.editChecklist.some(item => item.checked)) {
    completed.push(4);
  }

  // Step 5: Schedule - has scheduled date
  if (card.scheduledDate || card.schedulingStatus === 'scheduled') {
    completed.push(5);
  }

  return completed;
};

const StandaloneContentFlow: React.FC<StandaloneContentFlowProps> = ({
  cardId,
  onClose,
  initialStep,
}) => {
  // Card state
  const [card, setCard] = useState<ProductionCard | null>(null);
  const [activeStep, setActiveStep] = useState<number>(initialStep || 1);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  // Refs for shooting plan navigation
  const titleInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLTextAreaElement>(null);
  const outfitInputRef = useRef<HTMLTextAreaElement>(null);
  const propsInputRef = useRef<HTMLTextAreaElement>(null);
  const notesInputRef = useRef<HTMLTextAreaElement>(null);

  // Step 1: Ideate state
  const [ideateTitle, setIdeateTitle] = useState("");
  const [ideateNotes, setIdeateNotes] = useState("");

  // Step 2: Script state
  const [cardTitle, setCardTitle] = useState("");
  const [cardHook, setCardHook] = useState("");
  const [scriptContent, setScriptContent] = useState("");
  const [showBrainDumpSuggestion, setShowBrainDumpSuggestion] = useState(false);
  const [brainDumpSuggestion, setBrainDumpSuggestion] = useState("");
  const [platformTags, setPlatformTags] = useState<string[]>([]);
  const [formatTags, setFormatTags] = useState<string[]>([]);
  const [platformInput, setPlatformInput] = useState("");
  const [formatInput, setFormatInput] = useState("");
  const [showCustomFormatInput, setShowCustomFormatInput] = useState(false);
  const [customFormatInput, setCustomFormatInput] = useState("");
  const [showCustomPlatformInput, setShowCustomPlatformInput] = useState(false);
  const [customPlatformInput, setCustomPlatformInput] = useState("");
  const [locationChecked, setLocationChecked] = useState(false);
  const [locationText, setLocationText] = useState("");
  const [outfitChecked, setOutfitChecked] = useState(false);
  const [outfitText, setOutfitText] = useState("");
  const [propsChecked, setPropsChecked] = useState(false);
  const [propsText, setPropsText] = useState("");
  const [filmingNotes, setFilmingNotes] = useState("");
  const [cardStatus, setCardStatus] = useState<string>("to-start");
  const [customVideoFormats, setCustomVideoFormats] = useState<string[]>([]);
  const [customPhotoFormats, setCustomPhotoFormats] = useState<string[]>([]);

  // Load card from localStorage
  useEffect(() => {
    const savedData = getString(StorageKeys.productionKanban);
    if (savedData) {
      try {
        const columns: KanbanColumn[] = JSON.parse(savedData);
        let foundCard: ProductionCard | undefined;
        for (const column of columns) {
          foundCard = column.cards.find(c => c.id === cardId);
          if (foundCard) break;
        }
        if (foundCard) {
          setCard(foundCard);
          initializeState(foundCard);
        }
      } catch (err) {
        console.error('Error loading card:', err);
      }
    }
  }, [cardId]);

  // Initialize state from card
  const initializeState = (card: ProductionCard) => {
    // Ideate
    setIdeateTitle(card.hook || card.title || "");
    setIdeateNotes(card.description || "");

    // Script
    setCardTitle(card.title || "");
    setCardHook(card.hook || card.title || "");
    setScriptContent(card.script || "");
    setPlatformTags(card.platforms || []);
    setFormatTags(card.formats || []);
    setLocationChecked(card.locationChecked || false);
    setLocationText(card.locationText || "");
    setOutfitChecked(card.outfitChecked || false);
    setOutfitText(card.outfitText || "");
    setPropsChecked(card.propsChecked || false);
    setPropsText(card.propsText || "");
    setFilmingNotes(card.filmingNotes || "");
    setCardStatus(card.status || 'to-start');
    setCustomVideoFormats(card.customVideoFormats || []);
    setCustomPhotoFormats(card.customPhotoFormats || []);

    // Check for brain dump suggestion
    const notesText = card.description?.trim() || "";
    const scriptText = card.script?.trim() || "";
    const notesAlreadyInScript = notesText && scriptText.includes(notesText);
    if (notesText && !notesAlreadyInScript) {
      setBrainDumpSuggestion(card.description!);
      setShowBrainDumpSuggestion(true);
    }

    // Determine initial step based on completion
    if (!initialStep) {
      const completedSteps = getCompletedSteps(card);
      if (!completedSteps.includes(1)) setActiveStep(1);
      else if (!completedSteps.includes(2)) setActiveStep(2);
      else if (!completedSteps.includes(3)) setActiveStep(3);
      else if (!completedSteps.includes(4)) setActiveStep(4);
      else setActiveStep(5);
    }
  };

  // Save card to localStorage
  const saveCard = useCallback((updates: Partial<ProductionCard>) => {
    const savedData = getString(StorageKeys.productionKanban);
    if (savedData && card) {
      try {
        const columns: KanbanColumn[] = JSON.parse(savedData);
        let updated = false;
        const newColumns = columns.map(column => ({
          ...column,
          cards: column.cards.map(c => {
            if (c.id === card.id) {
              updated = true;
              return { ...c, ...updates };
            }
            return c;
          })
        }));

        if (updated) {
          setString(StorageKeys.productionKanban, JSON.stringify(newColumns));
          emit(window, EVENTS.productionKanbanUpdated);
          emit(window, EVENTS.scheduledContentUpdated);
          // Update local card state
          setCard(prev => prev ? { ...prev, ...updates } : null);
        }
      } catch (err) {
        console.error('Error saving card:', err);
      }
    }
  }, [card]);

  // Navigation between steps
  const handleNavigateToStep = (step: number) => {
    setSlideDirection(step > activeStep ? 'right' : 'left');
    setActiveStep(step);
  };

  // Step 1: Ideate handlers
  const handleSaveIdeate = () => {
    saveCard({
      title: ideateTitle,
      hook: ideateTitle,
      description: ideateNotes,
    });
  };

  const handleMoveToScript = () => {
    handleSaveIdeate();
    handleNavigateToStep(2);
  };

  // Step 2: Script handler
  const handleSaveScript = () => {
    saveCard({
      title: cardTitle,
      hook: cardHook,
      script: scriptContent,
      platforms: platformTags,
      formats: formatTags,
      locationChecked,
      locationText,
      outfitChecked,
      outfitText,
      propsChecked,
      propsText,
      filmingNotes,
      status: cardStatus,
      customVideoFormats,
      customPhotoFormats,
    });
  };

  // Step 3: Storyboard handler
  const handleSaveStoryboard = (storyboardData: any[]) => {
    saveCard({ storyboardData });
  };

  // Step 4: Edit checklist handler
  const handleSaveEditChecklist = (editChecklist: any[]) => {
    saveCard({ editChecklist });
  };

  // Step 5: Schedule handlers
  const handleSchedule = (cardId: string, date: Date) => {
    saveCard({
      scheduledDate: date.toISOString().split('T')[0],
      schedulingStatus: 'scheduled',
    });
  };

  const handleUnschedule = (cardId: string) => {
    saveCard({
      scheduledDate: undefined,
      schedulingStatus: undefined,
    });
  };

  const handleUpdateColor = (cardId: string, color: string) => {
    saveCard({ scheduledColor: color });
  };

  // Tag removal handlers
  const handleRemoveFormatTag = (tag: string) => {
    setFormatTags(formatTags.filter(t => t !== tag));
  };

  const handleRemovePlatformTag = (tag: string) => {
    setPlatformTags(platformTags.filter(t => t !== tag));
  };

  // Close handler - save current step data
  const handleClose = () => {
    // Save any pending changes based on current step
    if (activeStep === 1) handleSaveIdeate();
    else if (activeStep === 2) handleSaveScript();
    onClose();
  };

  // Background colors for each step
  const stepBackgrounds: Record<number, string> = {
    1: "bg-gradient-to-b from-[#8B7082]/10 via-white to-white",
    2: "bg-gradient-to-br from-[#f0f7fa] via-white to-[#f0f7fa]/30",
    3: "bg-gradient-to-br from-[#FFF9EE] via-white to-[#FFF9EE]/30",
    4: "bg-gradient-to-br from-[#F5EEF2] via-white to-[#F5EEF2]/30",
    5: "bg-gradient-to-br from-[#E5E8F4] via-white to-[#E5E8F4]",
  };

  const stepMaxWidths: Record<number, string> = {
    1: "sm:max-w-[900px]",
    2: "sm:max-w-[900px]",
    3: "sm:max-w-[1100px]",
    4: "sm:max-w-[950px]",
    5: "sm:max-w-[1200px]",
  };

  const slideVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? 150 : -150,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? -150 : 150,
      opacity: 0,
    }),
  };

  if (!card) return null;

  const completedSteps = getCompletedSteps(card);

  return (
    <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        hideCloseButton
        className={cn(
          "!top-6 !translate-y-0 h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] overflow-hidden border-0 shadow-2xl p-0 flex flex-col transition-all duration-300",
          stepBackgrounds[activeStep] || 'bg-white',
          stepMaxWidths[activeStep] || 'sm:max-w-[900px]'
        )}
      >
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={activeStep}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {activeStep === 1 && (
              <BrainDumpGuidanceDialog
                isOpen={true}
                onOpenChange={(open) => !open && handleClose()}
                onCancel={handleClose}
                onSave={handleSaveIdeate}
                onMoveToScript={handleMoveToScript}
                title={ideateTitle}
                setTitle={setIdeateTitle}
                notes={ideateNotes}
                setNotes={setIdeateNotes}
                onNavigateToStep={handleNavigateToStep}
                slideDirection={slideDirection}
                embedded={true}
                completedSteps={completedSteps}
              />
            )}
            {activeStep === 2 && (
              <ScriptEditorDialog
                isOpen={true}
                onOpenChange={(open) => !open && handleClose()}
                onCancel={handleClose}
                card={card}
                onSave={handleSaveScript}
                titleInputRef={titleInputRef}
                locationInputRef={locationInputRef}
                outfitInputRef={outfitInputRef}
                propsInputRef={propsInputRef}
                notesInputRef={notesInputRef}
                cardTitle={cardTitle}
                setCardTitle={setCardTitle}
                cardHook={cardHook}
                setCardHook={setCardHook}
                scriptContent={scriptContent}
                setScriptContent={setScriptContent}
                showBrainDumpSuggestion={showBrainDumpSuggestion}
                brainDumpSuggestion={brainDumpSuggestion}
                setShowBrainDumpSuggestion={setShowBrainDumpSuggestion}
                platformTags={platformTags}
                setPlatformTags={setPlatformTags}
                formatTags={formatTags}
                setFormatTags={setFormatTags}
                showCustomFormatInput={showCustomFormatInput}
                setShowCustomFormatInput={setShowCustomFormatInput}
                customFormatInput={customFormatInput}
                setCustomFormatInput={setCustomFormatInput}
                showCustomPlatformInput={showCustomPlatformInput}
                setShowCustomPlatformInput={setShowCustomPlatformInput}
                customPlatformInput={customPlatformInput}
                setCustomPlatformInput={setCustomPlatformInput}
                onRemoveFormatTag={handleRemoveFormatTag}
                onRemovePlatformTag={handleRemovePlatformTag}
                locationText={locationText}
                setLocationText={setLocationText}
                outfitText={outfitText}
                setOutfitText={setOutfitText}
                propsText={propsText}
                setPropsText={setPropsText}
                filmingNotes={filmingNotes}
                setFilmingNotes={setFilmingNotes}
                cardStatus={cardStatus}
                setCardStatus={setCardStatus}
                customVideoFormats={customVideoFormats}
                setCustomVideoFormats={setCustomVideoFormats}
                customPhotoFormats={customPhotoFormats}
                setCustomPhotoFormats={setCustomPhotoFormats}
                onNavigateToStep={handleNavigateToStep}
                slideDirection={slideDirection}
                embedded={true}
                completedSteps={completedSteps}
              />
            )}
            {activeStep === 3 && (
              <StoryboardEditorDialog
                open={true}
                onOpenChange={(open) => !open && handleClose()}
                card={card}
                onSave={handleSaveStoryboard}
                onNavigateToStep={handleNavigateToStep}
                slideDirection={slideDirection}
                embedded={true}
                completedSteps={completedSteps}
              />
            )}
            {activeStep === 4 && (
              <EditChecklistDialog
                isOpen={true}
                onOpenChange={(open) => !open && handleClose()}
                card={card}
                onSave={handleSaveEditChecklist}
                onNavigateToStep={handleNavigateToStep}
                slideDirection={slideDirection}
                embedded={true}
                completedSteps={completedSteps}
              />
            )}
            {activeStep === 5 && (
              <ExpandedScheduleView
                embedded={true}
                singleCard={card}
                onClose={handleClose}
                onSchedule={handleSchedule}
                onUnschedule={handleUnschedule}
                onUpdateColor={handleUpdateColor}
                onNavigateToStep={handleNavigateToStep}
                slideDirection={slideDirection}
                completedSteps={completedSteps}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default StandaloneContentFlow;
