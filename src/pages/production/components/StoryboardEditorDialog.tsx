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
  X,
  GripVertical,
} from "lucide-react";
import { ProductionCard, StoryboardScene } from "../types";

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
  onSave: (storyboard: StoryboardScene[], title?: string) => void;
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
  const scriptRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Initialize scenes and title from card
  useEffect(() => {
    if (card?.storyboard) {
      setScenes(card.storyboard);
    } else {
      setScenes([]);
    }
    if (card?.title) {
      setCardTitle(card.title);
    }
    setIsEditingTitle(false);
  }, [card]);

  // Save on close
  const handleClose = useCallback((open: boolean) => {
    if (!open && card) {
      onSave(scenes, cardTitle);
    }
    onOpenChange(open);
  }, [card, scenes, cardTitle, onSave, onOpenChange]);

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

  // Render script with highlights
  const renderScript = useCallback(() => {
    if (!card?.script) return null;

    const script = card.script;
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
            "hover:ring-2 hover:ring-offset-1",
            `hover:ring-${scene.color}-400`
          )}
          title={scene.title}
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
  }, [card?.script, scenes]);

  if (!card) return null;

  return (
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
                    className="text-sm text-gray-700 mt-0.5 max-w-md bg-white/80 border border-amber-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                ) : (
                  <p
                    className="text-sm text-gray-500 mt-0.5 max-w-md truncate cursor-pointer hover:text-gray-700 hover:bg-amber-50 rounded px-1 -mx-1 transition-colors"
                    onClick={() => setIsEditingTitle(true)}
                    title="Click to edit title"
                  >
                    {cardTitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Main content - stacked layout */}
        <div className="flex-1 overflow-y-auto">
          {/* Script Section */}
          <div className="border-b border-amber-100 bg-white/40">
            <div className="px-6 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/80">
              <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Script
              </h3>
              <p className="text-xs text-amber-600/80 mt-1">
                Select text to create a scene
              </p>
            </div>
            <div
              className="p-6 relative max-h-[200px] overflow-y-auto"
              ref={scriptRef}
              onMouseUp={handleTextSelection}
            >
              {card.script ? (
                <>
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
                          onClick={handleCreateScene}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-200/50 rounded-full px-4"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Create Scene
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="flex items-center gap-4 py-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-gray-600 font-medium">No Script Yet</h4>
                    <p className="text-sm text-gray-400">
                      Add a script in the Shape Ideas column to start creating your storyboard
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Storyboard Section */}
          <div className="bg-white/30">
            <div className="px-6 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Storyboard
                  </h3>
                  <p className="text-xs text-amber-600/80 mt-1">
                    {scenes.length} scene{scenes.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {scenes.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-4 shadow-inner">
                    <Sparkles className="w-10 h-10 text-amber-400" />
                  </div>
                  <h4 className="text-gray-700 font-semibold mb-2">Start Your Storyboard</h4>
                  <p className="text-sm text-gray-400 max-w-xs mb-6">
                    Select text from your script to create scenes, or add an empty scene to begin
                  </p>
                  <Button
                    onClick={handleAddEmptyScene}
                    variant="outline"
                    className="border-2 border-dashed border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Scene
                  </Button>
                </div>
              ) : (
                <div>
                  {/* Horizontal grid of square scene cards - 3 per row */}
                  <div className="grid grid-cols-3 gap-4">
                    {scenes.map((scene, idx) => {
                      const colors = sceneColors[scene.color];
                      return (
                        <motion.div
                          key={scene.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: idx * 0.05 }}
                          className={cn(
                            "relative rounded-2xl p-4 border-2 transition-all hover:shadow-lg group aspect-square flex flex-col",
                            colors.bg,
                            colors.border
                          )}
                        >
                          {/* Scene number badge */}
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0 mb-2",
                            colors.dot
                          )}>
                            {idx + 1}
                          </div>

                          {/* Scene content */}
                          <div className="flex-1 flex flex-col min-h-0">
                            <input
                              type="text"
                              value={scene.title}
                              onChange={(e) => updateScene(scene.id, { title: e.target.value })}
                              className={cn(
                                "font-semibold bg-transparent border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 text-sm",
                                colors.text
                              )}
                              placeholder="Scene title..."
                            />
                            <textarea
                              value={scene.visualNotes}
                              onChange={(e) => updateScene(scene.id, { visualNotes: e.target.value })}
                              className="text-xs mt-1 bg-transparent border-none w-full resize-none focus:outline-none focus:ring-0 text-gray-600 placeholder:text-gray-400 flex-1"
                              placeholder="Describe the visual..."
                            />

                            {/* Show linked script excerpt */}
                            {scene.highlightStart >= 0 && card.script && (
                              <div className={cn(
                                "mt-auto text-[10px] px-2 py-1.5 rounded-lg border overflow-y-auto max-h-[60px]",
                                colors.bg,
                                colors.border,
                                "opacity-70"
                              )}>
                                <span className="italic leading-relaxed">
                                  "{card.script.slice(scene.highlightStart, scene.highlightEnd)}"
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Delete button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg"
                            onClick={() => deleteScene(scene.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </motion.div>
                      );
                    })}

                    {/* Add Scene Card */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={handleAddEmptyScene}
                      className="aspect-square border-2 border-dashed border-amber-300 rounded-2xl text-amber-600 hover:border-amber-400 hover:bg-amber-50/50 transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                      <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                      <span className="font-medium text-sm">Add Scene</span>
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoryboardEditorDialog;
