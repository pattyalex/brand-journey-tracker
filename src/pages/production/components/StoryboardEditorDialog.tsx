import React, { useState, useRef, useCallback, useEffect } from "react";
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
} from "lucide-react";
import { ProductionCard, StoryboardScene } from "../types";
import { shotTemplates, getShotTemplateById, ShotTemplate } from "../utils/shotTemplates";
import { suggestShotsForScene, ShotSuggestion } from "../utils/shotSuggestionService";
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

// Color palette for scenes
const sceneColors = {
  amber: { bg: 'bg-amber-100', border: 'border-amber-400', highlight: 'bg-amber-200/70', text: 'text-amber-700', dot: 'bg-gradient-to-br from-amber-400 to-amber-600' },
  teal: { bg: 'bg-teal-100', border: 'border-teal-400', highlight: 'bg-teal-200/70', text: 'text-teal-700', dot: 'bg-gradient-to-br from-teal-400 to-teal-600' },
  rose: { bg: 'bg-rose-100', border: 'border-rose-400', highlight: 'bg-rose-200/70', text: 'text-rose-700', dot: 'bg-gradient-to-br from-rose-400 to-rose-600' },
  violet: { bg: 'bg-violet-100', border: 'border-violet-400', highlight: 'bg-violet-200/70', text: 'text-violet-700', dot: 'bg-gradient-to-br from-violet-400 to-violet-600' },
  sky: { bg: 'bg-sky-100', border: 'border-sky-400', highlight: 'bg-sky-200/70', text: 'text-sky-700', dot: 'bg-gradient-to-br from-sky-400 to-sky-600' },
  lime: { bg: 'bg-lime-100', border: 'border-lime-400', highlight: 'bg-lime-200/70', text: 'text-lime-700', dot: 'bg-gradient-to-br from-lime-400 to-lime-600' },
  fuchsia: { bg: 'bg-fuchsia-100', border: 'border-fuchsia-400', highlight: 'bg-fuchsia-200/70', text: 'text-fuchsia-700', dot: 'bg-gradient-to-br from-fuchsia-400 to-fuchsia-600' },
  cyan: { bg: 'bg-cyan-100', border: 'border-cyan-400', highlight: 'bg-cyan-200/70', text: 'text-cyan-700', dot: 'bg-gradient-to-br from-cyan-400 to-cyan-600' },
};

const colorOrder: (keyof typeof sceneColors)[] = ['amber', 'teal', 'rose', 'violet', 'sky', 'lime', 'fuchsia', 'cyan'];

interface StoryboardEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: ProductionCard | null;
  onSave: (storyboard: StoryboardScene[], title?: string, script?: string) => void;
}

const StoryboardEditorDialog: React.FC<StoryboardEditorDialogProps> = ({
  open,
  onOpenChange,
  card,
  onSave,
}) => {
  const [scenes, setScenes] = useState<StoryboardScene[]>([]);
  const [selectedText, setSelectedText] = useState<{ start: number; end: number; text: string } | null>(null);
  const [showCreateScene, setShowCreateScene] = useState(false);
  const [createScenePosition, setCreateScenePosition] = useState({ x: 0, y: 0 });
  const [cardTitle, setCardTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [scriptContent, setScriptContent] = useState("");
  const [isEditingScript, setIsEditingScript] = useState(false);

  // Shot suggestion state
  const [suggestingSceneId, setSuggestingSceneId] = useState<string | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<(ShotSuggestion & { template: ShotTemplate })[]>([]);

  // Shot library state
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [librarySceneId, setLibrarySceneId] = useState<string | null>(null);

  // Highlight editing state
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null);
  const [highlightMenuPosition, setHighlightMenuPosition] = useState({ x: 0, y: 0 });

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
    setScriptContent(card?.script || "");
    setIsEditingTitle(false);
    setIsEditingScript(false);
    setSuggestingSceneId(null);
    setSuggestions([]);
  }, [card]);

  // Save on close
  const handleClose = useCallback((open: boolean) => {
    if (!open && card) {
      onSave(scenes, cardTitle, scriptContent);
    }
    onOpenChange(open);
  }, [card, scenes, cardTitle, scriptContent, onSave, onOpenChange]);

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

  // Handle text selection in script
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !scriptRef.current) {
      setShowCreateScene(false);
      setSelectedText(null);
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      setShowCreateScene(false);
      setSelectedText(null);
      return;
    }

    // Get selection range relative to script content
    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(scriptRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + text.length;

    // Check if selection overlaps with existing scenes
    const overlaps = scenes.some(scene =>
      (start < scene.highlightEnd && end > scene.highlightStart)
    );

    if (overlaps) {
      setShowCreateScene(false);
      setSelectedText(null);
      return;
    }

    setSelectedText({ start, end, text });

    // Position the create scene button near the selection
    const rect = range.getBoundingClientRect();
    const containerRect = scriptRef.current.getBoundingClientRect();
    setCreateScenePosition({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.bottom - containerRect.top + 8,
    });
    setShowCreateScene(true);
  }, [scenes]);

  // Create new scene from selection
  const handleCreateScene = useCallback(() => {
    if (!selectedText) return;

    const newScene: StoryboardScene = {
      id: `scene-${Date.now()}`,
      order: scenes.length,
      title: `Scene ${scenes.length + 1}`,
      visualNotes: '',
      color: getNextColor(),
      highlightStart: selectedText.start,
      highlightEnd: selectedText.end,
    };

    setScenes(prev => [...prev, newScene].sort((a, b) => a.highlightStart - b.highlightStart));
    setShowCreateScene(false);
    setSelectedText(null);
    window.getSelection()?.removeAllRanges();
  }, [selectedText, scenes.length, getNextColor]);

  // Add scene without highlight
  const handleAddEmptyScene = useCallback(() => {
    const newScene: StoryboardScene = {
      id: `scene-${Date.now()}`,
      order: scenes.length,
      title: `Scene ${scenes.length + 1}`,
      visualNotes: '',
      color: getNextColor(),
      highlightStart: -1,
      highlightEnd: -1,
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

  // Handle highlight click
  const handleHighlightClick = useCallback((sceneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const containerRect = scriptRef.current?.getBoundingClientRect();
    if (containerRect) {
      setHighlightMenuPosition({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.bottom - containerRect.top + 5,
      });
    }
    setSelectedHighlight(sceneId);
  }, []);

  // Expand highlight by word
  const expandHighlight = useCallback((direction: 'left' | 'right') => {
    if (!selectedHighlight) return;
    const scene = scenes.find(s => s.id === selectedHighlight);
    if (!scene) return;

    const script = scriptContent;

    if (direction === 'left' && scene.highlightStart > 0) {
      // Find previous word boundary
      let newStart = scene.highlightStart - 1;
      while (newStart > 0 && script[newStart - 1] !== ' ' && script[newStart - 1] !== '\n') {
        newStart--;
      }
      updateScene(scene.id, { highlightStart: newStart });
    } else if (direction === 'right' && scene.highlightEnd < script.length) {
      // Find next word boundary
      let newEnd = scene.highlightEnd + 1;
      while (newEnd < script.length && script[newEnd] !== ' ' && script[newEnd] !== '\n') {
        newEnd++;
      }
      updateScene(scene.id, { highlightEnd: newEnd });
    }
  }, [selectedHighlight, scenes, scriptContent, updateScene]);

  // Shrink highlight by word
  const shrinkHighlight = useCallback((direction: 'left' | 'right') => {
    if (!selectedHighlight) return;
    const scene = scenes.find(s => s.id === selectedHighlight);
    if (!scene) return;

    const script = scriptContent;
    const highlightedText = script.slice(scene.highlightStart, scene.highlightEnd);

    if (direction === 'left') {
      // Find next word boundary from start
      let newStart = scene.highlightStart + 1;
      while (newStart < scene.highlightEnd && script[newStart - 1] !== ' ' && script[newStart - 1] !== '\n') {
        newStart++;
      }
      // Skip the space
      while (newStart < scene.highlightEnd && (script[newStart] === ' ' || script[newStart] === '\n')) {
        newStart++;
      }
      if (newStart < scene.highlightEnd) {
        updateScene(scene.id, { highlightStart: newStart });
      }
    } else if (direction === 'right') {
      // Find previous word boundary from end
      let newEnd = scene.highlightEnd - 1;
      while (newEnd > scene.highlightStart && script[newEnd] !== ' ' && script[newEnd] !== '\n') {
        newEnd--;
      }
      if (newEnd > scene.highlightStart) {
        updateScene(scene.id, { highlightEnd: newEnd });
      }
    }
  }, [selectedHighlight, scenes, scriptContent, updateScene]);

  // Render script with highlights
  const renderScript = useCallback(() => {
    if (!scriptContent) return null;

    const script = scriptContent;
    const sortedScenes = [...scenes]
      .filter(s => s.highlightStart >= 0)
      .sort((a, b) => a.highlightStart - b.highlightStart);

    if (sortedScenes.length === 0) {
      return <span className="text-gray-700 leading-relaxed whitespace-pre-wrap">{script}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastEnd = 0;

    sortedScenes.forEach((scene, idx) => {
      // Text before highlight
      if (scene.highlightStart > lastEnd) {
        elements.push(
          <span key={`text-${idx}`} className="text-gray-700">
            {script.slice(lastEnd, scene.highlightStart)}
          </span>
        );
      }

      // Highlighted text
      const colors = sceneColors[scene.color];
      elements.push(
        <mark
          key={`highlight-${scene.id}`}
          className={cn(
            "px-1 py-0.5 rounded transition-all cursor-pointer",
            colors.highlight,
            colors.text,
            selectedHighlight === scene.id && "ring-2 ring-offset-1 ring-gray-400"
          )}
          title={`${scene.title} - Click to edit`}
          onClick={(e) => handleHighlightClick(scene.id, e)}
        >
          {script.slice(scene.highlightStart, scene.highlightEnd)}
        </mark>
      );

      lastEnd = scene.highlightEnd;
    });

    // Text after last highlight
    if (lastEnd < script.length) {
      elements.push(
        <span key="text-end" className="text-gray-700">
          {script.slice(lastEnd)}
        </span>
      );
    }

    return <div className="leading-relaxed whitespace-pre-wrap">{elements}</div>;
  }, [scriptContent, scenes, selectedHighlight, handleHighlightClick]);

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
            <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/80 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-amber-800 flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4" />
                  Script
                </h3>
                <p className="text-[10px] text-amber-600/80 mt-0.5">
                  Select text to create a scene
                </p>
              </div>
              {!isEditingScript ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingScript(true)}
                  className="h-7 px-2 text-[10px] text-amber-700 hover:bg-amber-100 border border-amber-200"
                >
                  Edit
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingScript(false)}
                  className="h-7 px-2 text-[10px] text-amber-700 hover:bg-amber-100 border border-amber-200"
                >
                  Done
                </Button>
              )}
            </div>
            {/* Title at top of script section */}
            <div className="px-4 pt-3 pb-2 border-b border-amber-100/60">
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') {
                      setIsEditingTitle(false);
                    }
                  }}
                  className="text-base font-semibold text-amber-800 w-full bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                />
              ) : (
                <h2
                  className="text-base font-semibold text-amber-800 cursor-pointer hover:text-amber-900 transition-colors"
                  onClick={() => setIsEditingTitle(true)}
                  title="Click to edit title"
                >
                  {cardTitle}
                </h2>
              )}
            </div>

            <div
              className="p-4 relative flex-1 overflow-y-auto"
              ref={scriptRef}
              onMouseUp={!isEditingScript ? handleTextSelection : undefined}
            >
              {isEditingScript ? (
                <textarea
                  autoFocus
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  onBlur={() => setIsEditingScript(false)}
                  className="w-full h-full text-sm text-gray-700 leading-relaxed bg-transparent border-none p-0 resize-none focus:outline-none focus:ring-0"
                  placeholder="Write your script here..."
                />
              ) : scriptContent ? (
                <div className="-m-2 p-2" onClick={() => setSelectedHighlight(null)}>
                  {renderScript()}

                  {/* Create Scene Popup */}
                  <AnimatePresence>
                    {showCreateScene && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        className="absolute z-10"
                        style={{
                          left: createScenePosition.x,
                          top: createScenePosition.y,
                          transform: 'translateX(-50%)',
                        }}
                      >
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateScene();
                          }}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-200/50 rounded-full px-4"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Create Scene
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Highlight Edit Menu */}
                  <AnimatePresence>
                    {selectedHighlight && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        className="absolute z-20 bg-white rounded-xl shadow-xl border border-gray-200 p-2"
                        style={{
                          left: highlightMenuPosition.x,
                          top: highlightMenuPosition.y,
                          transform: 'translateX(-50%)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => expandHighlight('left')}
                            className="h-7 px-2 text-xs hover:bg-gray-100"
                            title="Expand left"
                          >
                            ← Expand
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => shrinkHighlight('left')}
                            className="h-7 px-2 text-xs hover:bg-gray-100"
                            title="Shrink from left"
                          >
                            Shrink →
                          </Button>
                          <div className="w-px h-5 bg-gray-200" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => shrinkHighlight('right')}
                            className="h-7 px-2 text-xs hover:bg-gray-100"
                            title="Shrink from right"
                          >
                            ← Shrink
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => expandHighlight('right')}
                            className="h-7 px-2 text-xs hover:bg-gray-100"
                            title="Expand right"
                          >
                            Expand →
                          </Button>
                          <div className="w-px h-5 bg-gray-200" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              deleteScene(selectedHighlight);
                              setSelectedHighlight(null);
                            }}
                            className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                            title="Delete selection"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                    <h4 className="text-gray-600 font-medium">Click to add script</h4>
                    <p className="text-sm text-gray-400">
                      Add a script to start creating your storyboard
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Storyboard Section - Right side */}
          <div className="flex-1 bg-white/30 flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/80 flex-shrink-0">
              <h3 className="font-semibold text-amber-800 flex items-center gap-2 text-sm">
                <Film className="w-4 h-4" />
                Storyboard
              </h3>
              <p className="text-[10px] text-amber-600/80 mt-0.5">
                {scenes.length} scene{scenes.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {scenes.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-8 h-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-3 shadow-inner">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </div>
                  <h4 className="text-gray-700 font-semibold text-sm mb-1">Start Your Storyboard</h4>
                  <p className="text-xs text-gray-400 max-w-[200px] mb-4">
                    Select text from your script to create scenes
                  </p>
                  <Button
                    onClick={handleAddEmptyScene}
                    variant="outline"
                    size="sm"
                    className="border-2 border-dashed border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 rounded-lg text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Scene
                  </Button>
                </div>
              ) : (
                <div>
                  {/* Grid of scene cards - 3 per row, smaller */}
                  <div className="grid grid-cols-3 gap-2">
                    {scenes.map((scene, idx) => {
                      const colors = sceneColors[scene.color];
                      const selectedTemplate = scene.selectedShotTemplateId
                        ? getShotTemplateById(scene.selectedShotTemplateId)
                        : null;
                      const isSuggesting = suggestingSceneId === scene.id;

                      return (
                        <motion.div
                          key={scene.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: idx * 0.05 }}
                          className={cn(
                            "relative rounded-xl p-2 border-2 transition-all hover:shadow-md group flex flex-col overflow-hidden h-[258px]",
                            colors.bg,
                            colors.border
                          )}
                        >
                          {/* Scene header - title on left, delete on right */}
                          <div className="flex items-center justify-between relative z-10">
                            {/* Scene title */}
                            <input
                              type="text"
                              value={scene.title}
                              onChange={(e) => updateScene(scene.id, { title: e.target.value })}
                              className={cn(
                                "font-bold bg-transparent border-none w-20 focus:outline-none focus:ring-0 placeholder:text-gray-400 text-xs",
                                colors.text
                              )}
                              placeholder="Scene..."
                            />

                            {/* Delete button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0 hover:bg-red-50 hover:text-red-600 rounded flex-shrink-0"
                              onClick={() => deleteScene(scene.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Shot name - centered */}
                          {selectedTemplate && (
                            <div className="flex items-center justify-center gap-1 -mt-2 relative z-10">
                              <Video className="w-3 h-3 text-purple-500" />
                              <span className="text-xs font-medium text-gray-600">{selectedTemplate.user_facing_name}</span>
                            </div>
                          )}

                          {/* Top half - Shot image */}
                          <div className="h-[100px] flex items-center justify-center relative z-10">
                            {selectedTemplate && shotIllustrations[selectedTemplate.id] ? (
                              <button
                                onClick={() => handleOpenLibrary(scene.id)}
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
                                onClick={() => handleOpenLibrary(scene.id)}
                                className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-amber-400 hover:bg-amber-50 transition-all group/add"
                              >
                                <Plus className="w-6 h-6 text-gray-400 group-hover/add:text-amber-500 transition-colors" />
                              </button>
                            )}
                          </div>

                          {/* Bottom half - Visual notes and script */}
                          <div className="relative z-10 mt-auto">
                            {/* Visual notes */}
                            <textarea
                              value={scene.visualNotes}
                              onChange={(e) => updateScene(scene.id, { visualNotes: e.target.value })}
                              className="mt-1 text-xs bg-white/60 border border-gray-200 rounded-lg w-full resize-none focus:outline-none focus:ring-1 focus:ring-amber-300 text-gray-700 placeholder:text-gray-400 p-2 h-[55px]"
                              placeholder="Describe your visual..."
                            />

                            {/* Script excerpt - editable */}
                            {scene.highlightStart >= 0 && scriptContent ? (
                              <textarea
                                value={scriptContent.slice(scene.highlightStart, scene.highlightEnd)}
                                onChange={(e) => {
                                  const newText = e.target.value;
                                  const oldText = scriptContent.slice(scene.highlightStart, scene.highlightEnd);
                                  const lengthDiff = newText.length - oldText.length;

                                  // Update the script content
                                  const newScript =
                                    scriptContent.slice(0, scene.highlightStart) +
                                    newText +
                                    scriptContent.slice(scene.highlightEnd);
                                  setScriptContent(newScript);

                                  // Update this scene's highlight end
                                  updateScene(scene.id, { highlightEnd: scene.highlightStart + newText.length });

                                  // Update all scenes that come after this one
                                  setScenes(prev => prev.map(s => {
                                    if (s.id === scene.id) return s;
                                    if (s.highlightStart > scene.highlightEnd) {
                                      return {
                                        ...s,
                                        highlightStart: s.highlightStart + lengthDiff,
                                        highlightEnd: s.highlightEnd + lengthDiff
                                      };
                                    }
                                    return s;
                                  }));
                                }}
                                className={cn(
                                  "text-xs px-2 py-1.5 rounded-lg border h-[50px] w-full resize-none italic focus:outline-none focus:ring-1 focus:ring-amber-300",
                                  colors.bg,
                                  colors.border,
                                  colors.text
                                )}
                              />
                            ) : (
                              <textarea
                                value={scene.scriptExcerpt || ''}
                                onChange={(e) => updateScene(scene.id, { scriptExcerpt: e.target.value })}
                                className={cn(
                                  "text-xs px-2 py-1.5 rounded-lg border h-[50px] w-full resize-none italic focus:outline-none focus:ring-1 focus:ring-amber-300",
                                  colors.bg,
                                  colors.border,
                                  colors.text
                                )}
                                placeholder="What you'll say in this scene..."
                              />
                            )}
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
                                    onClick={handleCloseSuggestions}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-2">
                                  {suggestions.map((suggestion) => (
                                    <button
                                      key={suggestion.template_id}
                                      className="w-full text-left p-2 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all group/item"
                                      onClick={() => handleSelectShot(scene.id, suggestion.template_id)}
                                    >
                                      <div className="flex items-start gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover/item:bg-purple-200 transition-colors">
                                          <Camera className="w-3 h-3 text-purple-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[11px] font-semibold text-gray-800">
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
                        </motion.div>
                      );
                    })}

                    {/* Add Scene Card */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={handleAddEmptyScene}
                      className="h-[258px] border-2 border-dashed border-amber-300 rounded-xl text-amber-600 hover:border-amber-400 hover:bg-amber-50/50 transition-all flex flex-col items-center justify-center gap-1 group"
                    >
                      <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                      <span className="font-medium text-[10px]">Add Scene</span>
                    </motion.button>
                  </div>
                </div>
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
