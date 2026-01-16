import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  Clapperboard,
  FileText,
  Film,
  Plus,
  Trash2,
  Sparkles,
  Video,
  Loader2,
  Check,
  Camera,
  X,
  BookOpen,
  MapPin,
  Shirt,
  Boxes,
  NotebookPen,
} from "lucide-react";
import { ProductionCard, StoryboardScene } from "../types";
import { shotTemplates, getShotTemplateById, ShotTemplate } from "../utils/shotTemplates";
import { SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import { suggestShotsForScene, ShotSuggestion } from "../utils/shotSuggestionService";
import { generateStoryboardFromScript, convertToStoryboardScenes } from "../utils/storyboardGenerationService";
import { toast } from "sonner";
import ShotLibraryDialog from "./ShotLibraryDialog";

// Shot illustrations
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

// Map shot IDs to illustrations
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

// Color palette for scenes - softer, less intense
const sceneColors = {
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', highlight: 'bg-amber-100/50', text: 'text-amber-600', dot: 'bg-gradient-to-br from-amber-300 to-amber-400' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', highlight: 'bg-teal-100/50', text: 'text-teal-600', dot: 'bg-gradient-to-br from-teal-300 to-teal-400' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', highlight: 'bg-rose-100/50', text: 'text-rose-600', dot: 'bg-gradient-to-br from-rose-300 to-rose-400' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', highlight: 'bg-violet-100/50', text: 'text-violet-600', dot: 'bg-gradient-to-br from-violet-300 to-violet-400' },
  sky: { bg: 'bg-sky-50', border: 'border-sky-200', highlight: 'bg-sky-100/50', text: 'text-sky-600', dot: 'bg-gradient-to-br from-sky-300 to-sky-400' },
  lime: { bg: 'bg-lime-50', border: 'border-lime-200', highlight: 'bg-lime-100/50', text: 'text-lime-600', dot: 'bg-gradient-to-br from-lime-300 to-lime-400' },
  fuchsia: { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', highlight: 'bg-fuchsia-100/50', text: 'text-fuchsia-600', dot: 'bg-gradient-to-br from-fuchsia-300 to-fuchsia-400' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', highlight: 'bg-cyan-100/50', text: 'text-cyan-600', dot: 'bg-gradient-to-br from-cyan-300 to-cyan-400' },
};

const colorOrder: (keyof typeof sceneColors)[] = ['amber', 'teal', 'rose', 'violet', 'sky', 'lime', 'fuchsia', 'cyan'];

interface StoryboardEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: ProductionCard | null;
  onSave: (storyboard: StoryboardScene[], title?: string, script?: string, hook?: string) => void;
}

// Sortable Scene Card Component
interface SortableSceneCardProps {
  scene: StoryboardScene;
  sceneNumber: number;
  colors: typeof sceneColors[keyof typeof sceneColors];
  selectedTemplate: ShotTemplate | null;
  isSuggesting: boolean;
  isLoadingSuggestions: boolean;
  suggestions: ShotSuggestion[];
  onUpdate: (id: string, updates: Partial<StoryboardScene>) => void;
  onDelete: (id: string) => void;
  onOpenLibrary: (id: string) => void;
  onCloseSuggestions: () => void;
  onSelectShot: (sceneId: string, templateId: string) => void;
}

const SortableSceneCard: React.FC<SortableSceneCardProps> = ({
  scene,
  sceneNumber,
  colors,
  selectedTemplate,
  isSuggesting,
  isLoadingSuggestions,
  suggestions,
  onUpdate,
  onDelete,
  onOpenLibrary,
  onCloseSuggestions,
  onSelectShot,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative rounded-xl p-2 border-2 bg-white hover:shadow-md group flex flex-col overflow-hidden h-[258px] cursor-grab active:cursor-grabbing",
        isDragging ? "shadow-2xl border-amber-400 ring-2 ring-amber-300 z-50" : "border-gray-200"
      )}
    >
      {/* Scene header */}
      <div className="flex items-center justify-between relative z-10">
        <span className="font-bold text-xs text-gray-800">Scene {sceneNumber}</span>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0 hover:bg-red-50 hover:text-red-600 rounded flex-shrink-0"
          onClick={(e) => { e.stopPropagation(); onDelete(scene.id); }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {/* Shot name */}
      {selectedTemplate && (
        <div className="flex items-center justify-center gap-1 -mt-2 relative z-10">
          <Video className="w-3 h-3 text-purple-500" />
          <span className="text-xs font-medium text-gray-600">{selectedTemplate.user_facing_name}</span>
        </div>
      )}

      {/* Shot image */}
      <div className="h-[100px] flex items-center justify-center relative z-10">
        {selectedTemplate && shotIllustrations[selectedTemplate.id] ? (
          <button
            onClick={(e) => { e.stopPropagation(); onOpenLibrary(scene.id); }}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full h-full max-h-[90px] rounded-lg bg-white/80 border border-gray-200 overflow-hidden shadow-sm flex items-center justify-center hover:border-amber-400 transition-colors"
          >
            <img
              src={shotIllustrations[selectedTemplate.id]}
              alt={selectedTemplate.user_facing_name}
              className="h-full object-contain"
            />
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onOpenLibrary(scene.id); }}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-amber-400 hover:bg-amber-50 transition-all group/add"
          >
            <Plus className="w-6 h-6 text-gray-400 group-hover/add:text-amber-500 transition-colors" />
          </button>
        )}
      </div>

      {/* Visual notes and script */}
      <div className="relative z-10 mt-auto">
        <textarea
          value={scene.visualNotes}
          onChange={(e) => onUpdate(scene.id, { visualNotes: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="mt-1 text-xs bg-white/60 border border-gray-200 rounded-lg w-full resize-none focus:outline-none focus:ring-1 focus:ring-amber-300 text-gray-700 placeholder:text-gray-400 p-2 h-[55px]"
          placeholder="Describe your visual..."
        />
        <textarea
          value={scene.scriptExcerpt || ''}
          onChange={(e) => onUpdate(scene.id, { scriptExcerpt: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className={cn(
            "text-xs px-2 py-1.5 rounded-lg border h-[50px] w-full resize-none italic focus:outline-none focus:ring-1 focus:ring-amber-300",
            colors.bg,
            colors.border,
            colors.text
          )}
          placeholder="What you'll say..."
        />
      </div>

      {/* Shot Suggestions Panel */}
      <AnimatePresence>
        {isSuggesting && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl p-3 z-20 flex flex-col"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-500" />
                Suggested shots
              </h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 hover:bg-gray-100 rounded"
                onClick={(e) => { e.stopPropagation(); onCloseSuggestions(); }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.template_id}
                  className="w-full text-left p-2 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all group/item"
                  onClick={(e) => { e.stopPropagation(); onSelectShot(scene.id, suggestion.template_id); }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover/item:bg-purple-200 transition-colors">
                      <Camera className="w-3 h-3 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-gray-800">
                        {suggestion.template.user_facing_name}
                      </p>
                      <p className="text-[10px] text-gray-500 leading-snug">
                        {suggestion.reason}
                      </p>
                    </div>
                    <Check className="w-4 h-4 text-purple-500 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StoryboardEditorDialog: React.FC<StoryboardEditorDialogProps> = ({
  open,
  onOpenChange,
  card,
  onSave,
}) => {
  const [scenes, setScenes] = useState<StoryboardScene[]>([]);
  const [cardTitle, setCardTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [hookContent, setHookContent] = useState("");
  const [scriptContent, setScriptContent] = useState("");
  const [isEditingScript, setIsEditingScript] = useState(false);

  // Shot suggestion state
  const [suggestingSceneId, setSuggestingSceneId] = useState<string | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<(ShotSuggestion & { template: ShotTemplate })[]>([]);

  // Shot library state
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [librarySceneId, setLibrarySceneId] = useState<string | null>(null);

  // AI generation state
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);

  const scriptRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Initialize scenes, title, and script from card
  useEffect(() => {
    if (card?.storyboard) {
      setScenes(card.storyboard);
    } else {
      setScenes([]);
    }
    if (card?.title) {
      setCardTitle(card.title);
    }
    setHookContent(card?.hook || card?.title || "");
    setScriptContent(card?.script || "");
    setIsEditingTitle(false);
    setIsEditingScript(false);
    setSuggestingSceneId(null);
    setSuggestions([]);
  }, [card]);

  // Save on close
  const handleClose = useCallback((open: boolean) => {
    if (!open && card) {
      onSave(scenes, cardTitle, scriptContent, hookContent);
    }
    onOpenChange(open);
  }, [card, scenes, cardTitle, scriptContent, hookContent, onSave, onOpenChange]);

  // Focus title input when editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Get next available color
  const getNextColor = useCallback(() => {
    const usedColors = scenes.map(s => s.color);
    for (const color of colorOrder) {
      if (!usedColors.includes(color)) {
        return color;
      }
    }
    return colorOrder[scenes.length % colorOrder.length];
  }, [scenes]);

  // Add scene
  const handleAddScene = useCallback(() => {
    const newScene: StoryboardScene = {
      id: `scene-${Date.now()}`,
      order: scenes.length,
      title: `Scene ${scenes.length + 1}`,
      visualNotes: '',
      color: getNextColor(),
      highlightStart: -1,
      highlightEnd: -1,
      scriptExcerpt: '',
    };
    setScenes(prev => [...prev, newScene]);
  }, [scenes.length, getNextColor]);

  // Update scene
  const updateScene = useCallback((id: string, updates: Partial<StoryboardScene>) => {
    setScenes(prev => prev.map(scene =>
      scene.id === id ? { ...scene, ...updates } : scene
    ));
  }, []);

  // Delete scene
  const deleteScene = useCallback((id: string) => {
    setScenes(prev => prev.filter(scene => scene.id !== id));
  }, []);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    })
  );

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setScenes(prev => {
        const oldIndex = prev.findIndex(s => s.id === active.id);
        const newIndex = prev.findIndex(s => s.id === over.id);
        const newScenes = arrayMove(prev, oldIndex, newIndex);
        return newScenes.map((scene, idx) => ({ ...scene, order: idx }));
      });
    }
  }, []);

  // Handle suggest shots
  const handleSuggestShots = useCallback(async (scene: StoryboardScene) => {
    setSuggestingSceneId(scene.id);
    setIsLoadingSuggestions(true);
    setSuggestions([]);

    const scriptExcerpt = scene.highlightStart >= 0 && card?.script
      ? scriptContent.slice(scene.highlightStart, scene.highlightEnd)
      : '';

    const result = await suggestShotsForScene(
      scene.title,
      scene.visualNotes,
      scriptExcerpt,
      card?.formats?.[0],
      card?.platforms?.[0]
    );

    setIsLoadingSuggestions(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Enrich suggestions with full template data
    const enrichedSuggestions = result.suggestions
      .map(s => {
        const template = getShotTemplateById(s.template_id);
        if (!template) return null;
        return { ...s, template };
      })
      .filter((s): s is ShotSuggestion & { template: ShotTemplate } => s !== null);

    setSuggestions(enrichedSuggestions);
  }, [card]);

  // Handle shot selection
  const handleSelectShot = useCallback((sceneId: string, templateId: string) => {
    updateScene(sceneId, { selectedShotTemplateId: templateId });
    setSuggestingSceneId(null);
    setSuggestions([]);
    toast.success("Shot type selected!");
  }, [updateScene]);

  // Handle opening shot library
  const handleOpenLibrary = useCallback((sceneId: string) => {
    setLibrarySceneId(sceneId);
    setIsLibraryOpen(true);
  }, []);

  // Handle shot selection from library
  const handleLibrarySelect = useCallback((templateId: string) => {
    if (librarySceneId) {
      updateScene(librarySceneId, { selectedShotTemplateId: templateId });
      toast.success("Shot type selected!");
    }
    setLibrarySceneId(null);
  }, [librarySceneId, updateScene]);

  // Close suggestions panel
  const handleCloseSuggestions = useCallback(() => {
    setSuggestingSceneId(null);
    setSuggestions([]);
  }, []);

  // AI-powered storyboard generation
  const handleGenerateStoryboard = useCallback(async () => {
    if (!scriptContent || scriptContent.trim().length < 10) {
      toast.error("Please add a script first before generating a storyboard.");
      return;
    }

    setIsGeneratingStoryboard(true);
    toast.loading("AI is analyzing your script...", { id: "generating-storyboard" });

    const result = await generateStoryboardFromScript(
      scriptContent,
      card?.formats?.[0],
      card?.platforms?.[0]
    );

    setIsGeneratingStoryboard(false);
    toast.dismiss("generating-storyboard");

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.scenes.length === 0) {
      toast.error("No scenes were generated. Please try again.");
      return;
    }

    // Convert to StoryboardScene format and set
    const storyboardScenes = convertToStoryboardScenes(result.scenes);
    setScenes(storyboardScenes);

    toast.success(`Generated ${storyboardScenes.length} scenes from your script!`);
  }, [scriptContent, card]);

  // Normalize apostrophes and quotes for matching
  const normalize = (text: string) => text
    .replace(/[\u0027\u0060\u2018\u2019\u02BC\u2032]/g, "'")  // All apostrophe variants → '
    .replace(/[\u0022\u201C\u201D\u201E]/g, '"')  // All quote variants → "
    .toLowerCase();

  // Render script with highlights based on scene scriptExcerpts
  const renderScript = () => {
    if (!scriptContent) return null;

    const script = scriptContent;
    const normalizedScript = normalize(script);

    // Build a map of positions to highlight with their colors
    const positionColors: Map<number, { end: number; color: keyof typeof sceneColors; title: string }> = new Map();

    // Process each scene
    for (const scene of scenes) {
      const textToFind = scene.scriptExcerpt?.trim();
      if (!textToFind || textToFind.length < 3) continue;

      const normalizedSearch = normalize(textToFind);

      // Find in script (normalized search)
      const foundIndex = normalizedScript.indexOf(normalizedSearch);
      if (foundIndex !== -1) {
        // Only add if this position isn't already taken
        let overlaps = false;
        for (const [pos, data] of positionColors) {
          if ((foundIndex >= pos && foundIndex < data.end) ||
              (foundIndex + textToFind.length > pos && foundIndex + textToFind.length <= data.end)) {
            overlaps = true;
            break;
          }
        }
        if (!overlaps) {
          positionColors.set(foundIndex, {
            end: foundIndex + textToFind.length,
            color: scene.color,
            title: scene.title
          });
        }
      }
    }

    if (positionColors.size === 0) {
      return <span className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{script}</span>;
    }

    // Sort positions
    const sortedPositions = Array.from(positionColors.entries()).sort((a, b) => a[0] - b[0]);

    const elements: React.ReactNode[] = [];
    let lastEnd = 0;

    sortedPositions.forEach(([start, data], idx) => {
      // Text before highlight
      if (start > lastEnd) {
        elements.push(
          <span key={`text-${idx}`} className="text-gray-700">
            {script.slice(lastEnd, start)}
          </span>
        );
      }

      // Highlighted text
      const colors = sceneColors[data.color];
      elements.push(
        <mark
          key={`highlight-${idx}`}
          className={cn(
            "px-1 py-0.5 rounded",
            colors.highlight,
            colors.text
          )}
          title={data.title}
        >
          {script.slice(start, data.end)}
        </mark>
      );

      lastEnd = data.end;
    });

    // Text after last highlight
    if (lastEnd < script.length) {
      elements.push(
        <span key="text-end" className="text-gray-700">
          {script.slice(lastEnd)}
        </span>
      );
    }

    return <div className="text-[13px] leading-relaxed whitespace-pre-wrap">{elements}</div>;
  };

  // Render hook with highlights based on scene scriptExcerpts
  const renderHook = () => {
    if (!hookContent) return null;

    const hook = hookContent;
    const normalizedHook = normalize(hook);

    // Build a map of positions to highlight with their colors
    const positionColors: Map<number, { end: number; color: keyof typeof sceneColors; title: string }> = new Map();

    // Process each scene
    for (const scene of scenes) {
      const textToFind = scene.scriptExcerpt?.trim();
      if (!textToFind || textToFind.length < 3) continue;

      const normalizedSearch = normalize(textToFind);

      // Find in hook (normalized search)
      const foundIndex = normalizedHook.indexOf(normalizedSearch);
      if (foundIndex !== -1) {
        // Only add if this position isn't already taken
        let overlaps = false;
        for (const [pos, data] of positionColors) {
          if ((foundIndex >= pos && foundIndex < data.end) ||
              (foundIndex + textToFind.length > pos && foundIndex + textToFind.length <= data.end)) {
            overlaps = true;
            break;
          }
        }
        if (!overlaps) {
          positionColors.set(foundIndex, {
            end: foundIndex + textToFind.length,
            color: scene.color,
            title: scene.title
          });
        }
      }
    }

    if (positionColors.size === 0) {
      return <span className="text-[13px] text-gray-700 leading-relaxed">{hook}</span>;
    }

    // Sort positions
    const sortedPositions = Array.from(positionColors.entries()).sort((a, b) => a[0] - b[0]);

    const elements: React.ReactNode[] = [];
    let lastEnd = 0;

    sortedPositions.forEach(([start, data], idx) => {
      // Text before highlight
      if (start > lastEnd) {
        elements.push(
          <span key={`hook-text-${idx}`} className="text-gray-700">
            {hook.slice(lastEnd, start)}
          </span>
        );
      }

      // Highlighted text
      const colors = sceneColors[data.color];
      elements.push(
        <mark
          key={`hook-highlight-${idx}`}
          className={cn(
            "px-1 py-0.5 rounded",
            colors.highlight,
            colors.text
          )}
          title={data.title}
        >
          {hook.slice(start, data.end)}
        </mark>
      );

      lastEnd = data.end;
    });

    // Text after last highlight
    if (lastEnd < hook.length) {
      elements.push(
        <span key="hook-text-end" className="text-gray-700">
          {hook.slice(lastEnd)}
        </span>
      );
    }

    return <span className="text-[13px] leading-relaxed">{elements}</span>;
  };

  if (!card) return null;

  return (
    <>
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[1100px] border-0 shadow-2xl p-0 overflow-hidden flex flex-col bg-gradient-to-br from-amber-50 via-white to-orange-50">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-amber-100/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/50">
                <Clapperboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Storyboard Editor
                </DialogTitle>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Main content - side by side layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Script Section - Left side */}
          <div className="w-[320px] flex-shrink-0 border-r border-amber-100 bg-white/40 flex flex-col">
            <div className="px-4 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/80 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-amber-800 flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4" />
                  Script
                </h3>
              </div>
              {!isEditingScript ? (
                <Button
                  size="sm"
                  onClick={() => setIsEditingScript(true)}
                  className="h-7 px-3 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm"
                >
                  Edit
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsEditingScript(false)}
                  className="h-7 px-3 text-xs font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-sm"
                >
                  Done
                </Button>
              )}
            </div>
            <div
              className="p-4 relative flex-1 overflow-y-auto"
              ref={scriptRef}
            >
              {/* Hook section */}
              <div className="mb-4">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Hook</p>
                {isEditingScript ? (
                  <input
                    type="text"
                    value={hookContent}
                    onChange={(e) => setHookContent(e.target.value)}
                    className="w-full text-[13px] text-gray-700 leading-relaxed bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                    placeholder="Enter your hook..."
                  />
                ) : (
                  <p className="text-[13px] leading-relaxed">
                    {hookContent ? renderHook() : <span className="text-gray-400 italic">No hook added</span>}
                  </p>
                )}
              </div>

              {/* Script section */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Script</p>
                {isEditingScript ? (
                  <textarea
                    autoFocus
                    value={scriptContent}
                    onChange={(e) => setScriptContent(e.target.value)}
                    className="w-full h-full min-h-[200px] text-[13px] text-gray-700 leading-relaxed bg-transparent border-none p-0 resize-none focus:outline-none focus:ring-0"
                    placeholder="Write your script here..."
                  />
                ) : scriptContent ? (
                  <div className="-mx-2 px-2">
                    {renderScript()}
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingScript(true)}
                    className="flex items-center gap-4 py-4 text-center cursor-pointer hover:bg-amber-50/50 rounded-lg transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs text-gray-600 font-medium">Click to add script</h4>
                      <p className="text-xs text-gray-400">
                        Add a script to start creating your storyboard
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card details - Formats, Platform, Filming Plan */}
              <div className="mt-4 pt-4 border-t border-amber-100/60 space-y-3">
                {/* Formats (How it's shot) */}
                {card?.formats && card.formats.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">How it's shot</h4>
                    <div className="space-y-1">
                      {card.formats.map((format, idx) => {
                        const isPhoto = ['photo post', 'carousel', 'text post', 'photo', 'static'].some(
                          p => format.toLowerCase().includes(p)
                        );
                        return (
                          <div key={idx} className="flex items-center gap-2 text-[13px] text-gray-600">
                            {isPhoto ? (
                              <Camera className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Video className="w-4 h-4 text-gray-400" />
                            )}
                            <span>{format}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Platforms */}
                {card?.platforms && card.platforms.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Platform</h4>
                    <div className="flex items-center gap-3">
                      {card.platforms.map((platform, idx) => {
                        const lowercased = platform.toLowerCase();
                        let Icon = null;
                        if (lowercased.includes("youtube")) Icon = SiYoutube;
                        else if (lowercased.includes("tiktok") || lowercased === "tt") Icon = SiTiktok;
                        else if (lowercased.includes("instagram") || lowercased === "ig") Icon = SiInstagram;
                        else if (lowercased.includes("facebook")) Icon = SiFacebook;
                        else if (lowercased.includes("linkedin")) Icon = SiLinkedin;
                        else if (lowercased.includes("twitter") || lowercased.includes("x.com") || lowercased.includes("x /")) Icon = RiTwitterXLine;
                        else if (lowercased.includes("threads")) Icon = RiThreadsLine;

                        return Icon ? (
                          <Icon key={idx} className="w-4 h-4 text-gray-500" title={platform} />
                        ) : (
                          <span key={idx} className="text-[13px] text-gray-500">{platform}</span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Filming Plan */}
                {(card?.locationText || card?.outfitText || card?.propsText || card?.filmingNotes) && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Filming Plan</h4>
                    <div className="space-y-1 text-[13px] text-gray-600">
                      {card?.locationText && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{card.locationText}</span>
                        </div>
                      )}
                      {card?.outfitText && (
                        <div className="flex items-center gap-2">
                          <Shirt className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{card.outfitText}</span>
                        </div>
                      )}
                      {card?.propsText && (
                        <div className="flex items-center gap-2">
                          <Boxes className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{card.propsText}</span>
                        </div>
                      )}
                      {card?.filmingNotes && (
                        <div className="flex items-center gap-2">
                          <NotebookPen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{card.filmingNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Storyboard Section - Right side */}
          <div className="flex-1 bg-white/30 flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/80 flex-shrink-0 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-amber-800 flex items-center gap-2 text-sm">
                  <Film className="w-4 h-4" />
                  Storyboard
                </h3>
                <p className="text-[10px] text-amber-600/80 mt-0.5">
                  {scenes.length} scene{scenes.length !== 1 ? 's' : ''}
                </p>
              </div>
              {/* Regenerate button - only visible when user already has scenes */}
              {scenes.length > 0 && scriptContent && (
                <Button
                  onClick={handleGenerateStoryboard}
                  disabled={isGeneratingStoryboard}
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-xs shadow-sm"
                >
                  {isGeneratingStoryboard ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3 mr-1" />
                  )}
                  Regenerate
                </Button>
              )}
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {scenes.length === 0 ? (
                <div className="flex flex-col items-center text-center pt-24 h-full">
                  {/* AI Generate Button */}
                  <button
                    onClick={handleGenerateStoryboard}
                    disabled={isGeneratingStoryboard || !scriptContent}
                    className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg transition-all",
                      scriptContent
                        ? "bg-gradient-to-br from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 cursor-pointer hover:scale-105"
                        : "bg-gray-100 cursor-not-allowed opacity-50"
                    )}
                  >
                    {isGeneratingStoryboard ? (
                      <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
                    ) : (
                      <Sparkles className="w-7 h-7 text-amber-500" />
                    )}
                  </button>
                  <h4 className="text-gray-700 font-semibold text-sm mb-1">Start Your Storyboard</h4>
                  <p className="text-xs text-gray-400 max-w-[220px] mb-4">
                    {scriptContent
                      ? "Auto-generate scenes from your script, or add them manually"
                      : "Add a script first to auto-generate, or create scenes manually"}
                  </p>
                  <div className="flex items-center gap-2">
                    {scriptContent && (
                      <Button
                        onClick={handleGenerateStoryboard}
                        disabled={isGeneratingStoryboard}
                        size="sm"
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-xs shadow-md"
                      >
                        {isGeneratingStoryboard ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 mr-1" />
                            Auto-Generate
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      onClick={handleAddScene}
                      variant="outline"
                      size="sm"
                      className="border-2 border-dashed border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 rounded-lg text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Manually
                    </Button>
                  </div>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={scenes.map(s => s.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {scenes.map((scene, index) => {
                        const colors = sceneColors[scene.color];
                        const selectedTemplate = scene.selectedShotTemplateId
                          ? getShotTemplateById(scene.selectedShotTemplateId)
                          : null;
                        const isSuggesting = suggestingSceneId === scene.id;

                        return (
                          <SortableSceneCard
                            key={scene.id}
                            scene={scene}
                            sceneNumber={index + 1}
                            colors={colors}
                            selectedTemplate={selectedTemplate}
                            isSuggesting={isSuggesting}
                            isLoadingSuggestions={isLoadingSuggestions}
                            suggestions={suggestions}
                            onUpdate={updateScene}
                            onDelete={deleteScene}
                            onOpenLibrary={handleOpenLibrary}
                            onCloseSuggestions={handleCloseSuggestions}
                            onSelectShot={handleSelectShot}
                          />
                        );
                      })}

                      {/* Add Scene Card */}
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={handleAddScene}
                        className="h-[258px] border-2 border-dashed border-amber-300 rounded-xl text-amber-600 hover:border-amber-400 hover:bg-amber-50/50 transition-all flex flex-col items-center justify-center gap-1 group"
                      >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        <span className="font-medium text-[10px]">Add Scene</span>
                      </motion.button>
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

      {/* Shot Library Dialog */}
      <ShotLibraryDialog
        open={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
        onSelectShot={handleLibrarySelect}
        currentShotId={librarySceneId ? scenes.find(s => s.id === librarySceneId)?.selectedShotTemplateId : undefined}
      />
    </>
  );
};

export default StoryboardEditorDialog;
