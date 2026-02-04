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
  Circle,
  PlayCircle,
  Wrench,
  CheckCircle2,
  SquarePen,
  ArrowRight,
} from "lucide-react";
import { ProductionCard, StoryboardScene } from "../types";
import { shotTemplates, getShotTemplateById, ShotTemplate } from "../utils/shotTemplates";
import { SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import { suggestShotsForScene, ShotSuggestion } from "../utils/shotSuggestionService";
import { generateStoryboardFromScript, convertToStoryboardScenes } from "../utils/storyboardGenerationService";
import { toast } from "sonner";
import ShotLibraryDialog, { variantImages } from "./ShotLibraryDialog";
import ContentFlowProgress from "./ContentFlowProgress";

// Shot illustrations - import all 10 images for each shot type
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

// Map shot IDs to their matching illustrations
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

// Color palette for scenes - alternating light and medium (warm brown/mauve) with max contrast
const sceneColors = {
  // LIGHT COLORS (black text)
  amber: { bg: 'bg-[#F2F0F5]', border: 'border-[#D8D6DC]', highlight: 'bg-[#eae8ed]', text: 'text-gray-800', dot: 'bg-gradient-to-br from-[#DCDAE0] to-[#D0CED4]' },
  rose: { bg: 'bg-[#F5EAF8]', border: 'border-[#DCD0E0]', highlight: 'bg-[#ede1f0]', text: 'text-gray-800', dot: 'bg-gradient-to-br from-[#E0D4E8] to-[#D4C8DC]' },
  sky: { bg: 'bg-[#D0D9EB]', border: 'border-[#B0BCCC]', highlight: 'bg-[#c8d1e3]', text: 'text-gray-800', dot: 'bg-gradient-to-br from-[#BCC8D8] to-[#ACB8C8]' },
  lime: { bg: 'bg-[#E2E5EB]', border: 'border-[#C0C4CC]', highlight: 'bg-[#dadde3]', text: 'text-gray-800', dot: 'bg-gradient-to-br from-[#CED2D8] to-[#C0C4CC]' },
  fuchsia: { bg: 'bg-[#F2F0F5]', border: 'border-[#D8D6DC]', highlight: 'bg-[#eae8ed]', text: 'text-gray-800', dot: 'bg-gradient-to-br from-[#DCDAE0] to-[#D0CED4]' },
  cyan: { bg: 'bg-[#F8F3F8]', border: 'border-[#E0D8E0]', highlight: 'bg-[#f0ebf0]', text: 'text-gray-800', dot: 'bg-gradient-to-br from-[#E4DCE4] to-[#D8D0D8]' },
  // MEDIUM COLORS (white text) - warm brown/mauve tones, each distinct
  teal: { bg: 'bg-[#B8A8A8]', border: 'border-[#988890]', highlight: 'bg-[#A89898]', text: 'text-white', dot: 'bg-gradient-to-br from-[#A09090] to-[#988888]' },
  violet: { bg: 'bg-[#C0A8B0]', border: 'border-[#A08890]', highlight: 'bg-[#B098A4]', text: 'text-white', dot: 'bg-gradient-to-br from-[#A89098] to-[#988088]' },
  silver: { bg: 'bg-[#A8A098]', border: 'border-[#888078]', highlight: 'bg-[#989088]', text: 'text-white', dot: 'bg-gradient-to-br from-[#908880] to-[#807870]' },
  slate: { bg: 'bg-[#B0A0A8]', border: 'border-[#908088]', highlight: 'bg-[#A09098]', text: 'text-white', dot: 'bg-gradient-to-br from-[#988890] to-[#887880]' },
  pearl: { bg: 'bg-[#A89890]', border: 'border-[#887870]', highlight: 'bg-[#988880]', text: 'text-white', dot: 'bg-gradient-to-br from-[#908078] to-[#807068]' },
  plum: { bg: 'bg-[#B8A0A0]', border: 'border-[#988080]', highlight: 'bg-[#A89090]', text: 'text-white', dot: 'bg-gradient-to-br from-[#A08888] to-[#907878]' },
};

// Order: 7 colors that repeat - light/medium alternating
const colorOrder: (keyof typeof sceneColors)[] = ['amber', 'teal', 'cyan', 'violet', 'sky', 'silver', 'fuchsia'];

interface StoryboardEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: ProductionCard | null;
  onSave: (storyboard: StoryboardScene[], title?: string, script?: string, hook?: string, status?: "to-start" | "needs-work" | "ready" | null) => void;
  onNavigateToStep?: (step: number, savedCardData?: Partial<ProductionCard>) => void;
  slideDirection?: 'left' | 'right';
  embedded?: boolean;
  completedSteps?: number[];
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
        isDragging ? "shadow-2xl border-[#8B7082] ring-2 ring-[#8B7082] z-50" : "border-gray-200"
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
            className="w-full h-full max-h-[90px] rounded-lg bg-white/80 border border-gray-200 overflow-hidden shadow-sm flex items-center justify-center hover:border-[#8B7082] transition-colors"
          >
            <img
              src={
                (scene.selectedVariantId && variantImages[selectedTemplate.id]?.[scene.selectedVariantId])
                || shotIllustrations[selectedTemplate.id]
              }
              alt={selectedTemplate.user_facing_name}
              className="h-full object-contain scale-[1.2]"
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
          className="mt-1 text-xs bg-white/60 border border-gray-200 rounded-lg w-full resize-none focus:outline-none focus:ring-1 focus:ring-[#8B7082] text-gray-700 placeholder:text-gray-400 p-2 h-[55px]"
          placeholder="Describe your visual..."
        />
        <textarea
          value={scene.scriptExcerpt || ''}
          onChange={(e) => onUpdate(scene.id, { scriptExcerpt: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className={cn(
            "text-xs px-2 py-1.5 rounded-lg border h-[50px] w-full resize-none italic focus:outline-none focus:ring-1 focus:ring-[#8B7082]",
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
  onNavigateToStep,
  slideDirection = 'right',
  embedded = false,
  completedSteps = [],
}) => {
  const [shakeButton, setShakeButton] = useState(false);

  const handleInteractOutside = (e: Event) => {
    e.preventDefault();
    setShakeButton(true);
    setTimeout(() => setShakeButton(false), 600);
  };

  const slideVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? -300 : 300,
      opacity: 0,
    }),
  };

  const [scenes, setScenes] = useState<StoryboardScene[]>([]);
  const [cardTitle, setCardTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [hookContent, setHookContent] = useState("");
  const [scriptContent, setScriptContent] = useState("");
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [filmingStatus, setFilmingStatus] = useState<"to-start" | "needs-work" | "ready">("to-start");

  // Shot suggestion state
  const [suggestingSceneId, setSuggestingSceneId] = useState<string | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<(ShotSuggestion & { template: ShotTemplate })[]>([]);

  // Shot library state
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [librarySceneId, setLibrarySceneId] = useState<string | null>(null);
  const librarySceneIdRef = useRef<string | null>(null);

  // AI generation state
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);

  const scriptRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);


  // Initialize scenes, title, and script from card
  useEffect(() => {
    if (card?.storyboard) {
      setScenes(card.storyboard);
    } else {
      setScenes([]);
    }
    setCardTitle(card?.hook || card?.title || "");
    setHookContent(card?.hook || card?.title || "");
    setScriptContent(card?.script || "");
    setFilmingStatus(card?.status || "to-start");
    setIsEditingTitle(false);
    setIsEditingScript(false);
    setSuggestingSceneId(null);
    setSuggestions([]);
  }, [card]);

  // Save on close
  const handleClose = useCallback((open: boolean) => {
    if (!open && card) {
      onSave(scenes, cardTitle, scriptContent, hookContent, filmingStatus);
    }
    onOpenChange(open);
  }, [card, scenes, cardTitle, scriptContent, hookContent, filmingStatus, onSave, onOpenChange]);

  // Auto-save and navigate to another step
  const handleNavigateWithSave = useCallback((step: number) => {
    // Pass saved data directly to navigation handler to avoid async state timing issues
    const savedData: Partial<ProductionCard> = {
      storyboard: scenes,
      title: cardTitle,
      script: scriptContent,
      hook: hookContent,
      status: filmingStatus || undefined,
    };
    onNavigateToStep?.(step, savedData);
  }, [scenes, cardTitle, scriptContent, hookContent, filmingStatus, onNavigateToStep]);

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
    librarySceneIdRef.current = sceneId;
    setIsLibraryOpen(true);
  }, []);

  // Handle shot selection from library
  const handleLibrarySelect = useCallback((templateId: string, variantId?: string) => {
    const sceneId = librarySceneIdRef.current;
    if (sceneId) {
      updateScene(sceneId, {
        selectedShotTemplateId: templateId,
        selectedVariantId: variantId
      });
      toast.success("Shot type selected!");
    }
    setLibrarySceneId(null);
    librarySceneIdRef.current = null;
  }, [updateScene]);

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

  const dialogContent = (
    <>
      {/* Close Button */}
      <button
        onClick={() => onOpenChange(false)}
        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Step Progress Row - Centered */}
      <div className="flex justify-center pt-4 pb-2 bg-transparent">
        <ContentFlowProgress currentStep={3} className="w-[550px]" onStepClick={handleNavigateWithSave} completedSteps={completedSteps} />
      </div>
        {/* Main content - side by side layout */}
        <div
          ref={leftPanelRef}
          className="flex-1 overflow-y-auto"
        >
          {/* Headers row - both headers scroll together */}
          <div className="flex border-b border-[#8B7082]/30">
            {/* Script Header */}
            <div className="w-[320px] flex-shrink-0 px-4 py-3 bg-transparent flex items-center relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-6 bg-[#8B7082]/30"></div>
              <h3 className="font-semibold text-[#612A4F] flex items-center gap-2 text-base">
                <FileText className="w-5 h-5" />
                Content Overview
              </h3>
            </div>
            {/* Storyboard Header */}
            <div className="flex-1 px-4 py-3 bg-transparent flex items-center justify-between">
              <h3 className="font-semibold text-[#612A4F] flex items-center gap-2 text-base">
                <Clapperboard className="w-5 h-5" />
                Create Your Storyboard
                <span className="text-[10px] text-[#612A4F]/70 font-normal ml-1">
                  ({scenes.length} scene{scenes.length !== 1 ? 's' : ''})
                </span>
              </h3>
              <div className="flex items-center gap-2">
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
                <Button
                  size="sm"
                  onClick={() => handleNavigateWithSave(4)}
                  className="bg-[#612A4F] hover:bg-[#4A1F3D] text-white text-sm"
                >
                  Save & Move to Edit <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content row */}
          <div className="flex" style={{ height: 'calc(100vh - 230px)' }}>
            {/* Script Section - Left side */}
            <div className="w-[320px] flex-shrink-0 bg-white/40 relative">
              <div className="absolute right-0 top-0 bottom-0 w-px bg-[#8B7082]/30"></div>
              {/* Script Content */}
              <div
                className="h-full overflow-y-auto p-4"
                ref={scriptRef}
              >
              {/* Hook section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-semibold text-[#612A4F] uppercase tracking-wider">Hook</p>
                  {!isEditingScript ? (
                    <button
                      onClick={() => setIsEditingScript(true)}
                      className="p-1 text-[#8B7082] hover:text-[#612A4F] transition-all duration-200 hover:scale-110 hover:-rotate-12"
                    >
                      <SquarePen className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditingScript(false)}
                      className="p-1.5 rounded-lg bg-[#A89098] hover:bg-[#8B7082] text-white transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
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
              <div className="mt-6">
                <p className="text-[11px] font-semibold text-[#612A4F] uppercase tracking-wider mb-1">Script</p>
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

              {/* Card details - Formats, Platform, Shooting Plan */}
              <div className="mt-4 pt-2 space-y-6">
                {/* Formats (How it's shot) */}
                {card?.formats && card.formats.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-[#612A4F] uppercase tracking-wider mb-2">How it's shot</h4>
                    <div className="space-y-1">
                      {card.formats.map((format, idx) => {
                        const isPhoto = ['photo post', 'carousel', 'text post', 'photo', 'static'].some(
                          p => format.toLowerCase().includes(p)
                        );
                        return (
                          <div key={idx} className="flex items-center gap-2 text-[13px] text-gray-600">
                            {isPhoto ? (
                              <Camera className="w-4 h-4 text-[#8B7082]" />
                            ) : (
                              <Video className="w-4 h-4 text-[#8B7082]" />
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
                  <div className="pt-2">
                    <h4 className="text-[11px] font-semibold text-[#612A4F] uppercase tracking-wider mb-2">Platform</h4>
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
                          <Icon key={idx} className="w-4 h-4 text-[#8B7082]" title={platform} />
                        ) : (
                          <span key={idx} className="text-[13px] text-[#8B7082]">{platform}</span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Shooting Plan */}
                {(card?.locationText || card?.outfitText || card?.propsText || card?.filmingNotes) && (
                  <div className="pt-2">
                    <h4 className="text-[11px] font-semibold text-[#612A4F] uppercase tracking-wider mb-2">Shooting Plan</h4>
                    <div className="space-y-1 text-[13px] text-gray-600">
                      {card?.locationText && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#8B7082] flex-shrink-0" />
                          <span>{card.locationText}</span>
                        </div>
                      )}
                      {card?.outfitText && (
                        <div className="flex items-center gap-2">
                          <Shirt className="w-4 h-4 text-[#8B7082] flex-shrink-0" />
                          <span>{card.outfitText}</span>
                        </div>
                      )}
                      {card?.propsText && (
                        <div className="flex items-center gap-2">
                          <Boxes className="w-4 h-4 text-[#8B7082] flex-shrink-0" />
                          <span>{card.propsText}</span>
                        </div>
                      )}
                      {card?.filmingNotes && (
                        <div className="flex items-center gap-2">
                          <NotebookPen className="w-4 h-4 text-[#8B7082] flex-shrink-0" />
                          <span>{card.filmingNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              </div>
            </div>

            {/* Storyboard Section - Right side (scenes only, header is above) */}
            <div
              ref={rightPanelRef}
              className="flex-1 bg-white/30 h-full overflow-y-auto p-4"
              onWheel={(e) => e.stopPropagation()}
            >
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
                  <h4 className="text-[#612A4F] font-semibold text-sm mb-1">Start Your Storyboard</h4>
                  <p className="text-xs text-[#8B7082] max-w-[220px] mb-4">
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
                      className="border-2 border-dashed border-amber-300 text-[#612A4F] hover:bg-amber-50 hover:border-amber-400 rounded-lg text-xs"
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
                        className="h-[258px] border-2 border-dashed border-[#8B7082] rounded-xl text-[#8B7082] bg-[#FDFCFD] hover:border-[#7A6073] hover:bg-[#F8F5F7] transition-all flex flex-col items-center justify-center gap-1 group"
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
    </>
  );

  if (embedded) {
    return (
      <>
        {dialogContent}
        {/* Shot Library Dialog */}
        <ShotLibraryDialog
          open={isLibraryOpen}
          onOpenChange={setIsLibraryOpen}
          onSelectShot={handleLibrarySelect}
          currentShotId={librarySceneId ? scenes.find(s => s.id === librarySceneId)?.selectedShotTemplateId : undefined}
          currentVariantId={librarySceneId ? scenes.find(s => s.id === librarySceneId)?.selectedVariantId : undefined}
        />
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent hideCloseButton onInteractOutside={handleInteractOutside} onEscapeKeyDown={handleInteractOutside} className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[1100px] border-0 shadow-2xl p-0 overflow-hidden flex flex-col bg-gradient-to-br from-[#FFF9EE] via-white to-[#FFF9EE]/30">
          <AnimatePresence mode="wait" custom={slideDirection}>
            <motion.div
              key="storyboard-content"
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {dialogContent}
            </motion.div>
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Shot Library Dialog */}
      <ShotLibraryDialog
        open={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
        onSelectShot={handleLibrarySelect}
        currentShotId={librarySceneId ? scenes.find(s => s.id === librarySceneId)?.selectedShotTemplateId : undefined}
        currentVariantId={librarySceneId ? scenes.find(s => s.id === librarySceneId)?.selectedVariantId : undefined}
      />
    </>
  );
};

export default StoryboardEditorDialog;
