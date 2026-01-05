import React, { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreVertical, Trash2, Edit, Sparkles, Check, Plus, ArrowLeft, Lightbulb } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import TitleHookSuggestions from "@/components/content/TitleHookSuggestions";

export interface ProductionCard {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  isCompleted?: boolean;
  isNew?: boolean;
  platforms?: string[];
  formats?: string[];
  script?: string;
  hook?: string;
  locationChecked?: boolean;
  locationText?: string;
  outfitChecked?: boolean;
  outfitText?: string;
  propsChecked?: boolean;
  propsText?: string;
  filmingNotes?: string;
  status?: 'to-start' | 'needs-work' | 'ready' | null;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: ProductionCard[];
}

const columnColors: Record<string, { bg: string; border: string; badge: string; text: string; buttonBg: string; buttonText: string }> = {
  "ideate": { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-500", text: "text-purple-700", buttonBg: "bg-purple-100", buttonText: "text-purple-800" },
  "shape-ideas": { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-500", text: "text-blue-700", buttonBg: "bg-blue-100", buttonText: "text-blue-800" },
  "to-film": { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-500", text: "text-amber-700", buttonBg: "bg-amber-100", buttonText: "text-amber-800" },
  "to-edit": { bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-500", text: "text-rose-700", buttonBg: "bg-rose-100", buttonText: "text-rose-800" },
  "to-schedule": { bg: "bg-indigo-50", border: "border-indigo-200", badge: "bg-indigo-500", text: "text-indigo-700", buttonBg: "bg-indigo-100", buttonText: "text-indigo-800" },
  "posted": { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-500", text: "text-emerald-700", buttonBg: "bg-emerald-100", buttonText: "text-emerald-800" },
};

const defaultColumns: KanbanColumn[] = [
  { id: "ideate", title: "Ideate", cards: [] },
  { id: "shape-ideas", title: "Shape Ideas", cards: [] },
  { id: "to-film", title: "To Film", cards: [] },
  { id: "to-edit", title: "To Edit", cards: [] },
  { id: "to-schedule", title: "To Schedule", cards: [] },
  { id: "posted", title: "Posted 🎉", cards: [] },
];

const InlineCardInput: React.FC<{
  onSave: (title: string) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSave(value);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-blue-400 shadow-md">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onSave(value)}
        placeholder="Enter a title or paste a link"
        className="w-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400"
      />
    </div>
  );
};

const Production = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>(defaultColumns);
  const [draggedCard, setDraggedCard] = useState<ProductionCard | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ columnId: string; index: number } | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  const [draggedOverCardId, setDraggedOverCardId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<{ columnId: string; index: number } | null>(null);
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>("");
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [editingCard, setEditingCard] = useState<ProductionCard | null>(null);
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editTrigger, setEditTrigger] = useState<'click' | 'doubleclick' | null>(null);
  const [clickPosition, setClickPosition] = useState<number | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const textRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [isIdeateDialogOpen, setIsIdeateDialogOpen] = useState(false);
  const [selectedIdeateCard, setSelectedIdeateCard] = useState<ProductionCard | null>(null);
  const [ideateMode, setIdeateMode] = useState<'brainstorm' | 'guidance' | 'bankofideas' | 'pillarsformats' | null>(null);
  const [brainstormText, setBrainstormText] = useState("");
  const [showHooksDialog, setShowHooksDialog] = useState(false);
  const [isIdeaExpanderOpen, setIsIdeaExpanderOpen] = useState(false);
  const [ideaExpanderText, setIdeaExpanderText] = useState("");
  const [expandedAngles, setExpandedAngles] = useState<string[]>([]);
  const [isGeneratingAngles, setIsGeneratingAngles] = useState(false);

  // Script editor modal state
  const [isScriptEditorOpen, setIsScriptEditorOpen] = useState(false);
  const [editingScriptCard, setEditingScriptCard] = useState<ProductionCard | null>(null);
  const [cardTitle, setCardTitle] = useState("");
  const [cardHook, setCardHook] = useState("");
  const [scriptContent, setScriptContent] = useState("");
  const [platformTags, setPlatformTags] = useState<string[]>([]);
  const [formatTags, setFormatTags] = useState<string[]>([]);
  const [platformInput, setPlatformInput] = useState("");
  const [formatInput, setFormatInput] = useState("");
  // Filming checklist state
  const [locationChecked, setLocationChecked] = useState(false);
  const [locationText, setLocationText] = useState("");
  const [outfitChecked, setOutfitChecked] = useState(false);
  const [outfitText, setOutfitText] = useState("");
  const [propsChecked, setPropsChecked] = useState(false);
  const [propsText, setPropsText] = useState("");
  const [filmingNotes, setFilmingNotes] = useState("");
  const [cardStatus, setCardStatus] = useState<'to-start' | 'needs-work' | 'ready' | null>(null);
  // Refs for filming checklist navigation
  const titleInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const outfitInputRef = useRef<HTMLInputElement>(null);
  const propsInputRef = useRef<HTMLInputElement>(null);
  const notesInputRef = useRef<HTMLTextAreaElement>(null);
  const [addedAngleText, setAddedAngleText] = useState<string | null>(null);
  const [bankIdeas, setBankIdeas] = useState<Array<{ id: string; text: string; isPlaceholder?: boolean }>>([]);
  const [newBankIdeaText, setNewBankIdeaText] = useState("");
  const [addedBankIdeaId, setAddedBankIdeaId] = useState<string | null>(null);
  const [pillars, setPillars] = useState<string[]>(["Mental Health", "Nutrition", "Fitness", "Sleep & Recovery"]);
  const [formats, setFormats] = useState<string[]>(["Talking head", "Carousel", "B-roll", "Tutorial"]);
  const [isAngleDialogOpen, setIsAngleDialogOpen] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [selectedNarrative, setSelectedNarrative] = useState<string>("");
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [userExperience, setUserExperience] = useState<string>("");

  // Pillars × Formats new functionality
  const [isPillarsDialogOpen, setIsPillarsDialogOpen] = useState(false);
  const [userPillars, setUserPillars] = useState<string[]>(["Wellness"]);
  const [selectedUserPillar, setSelectedUserPillar] = useState<string>("");
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [isGeneratingSubCategories, setIsGeneratingSubCategories] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [cascadeIdeas, setCascadeIdeas] = useState<string[]>([]);
  const [isGeneratingCascadeIdeas, setIsGeneratingCascadeIdeas] = useState(false);

  // What Worked → What's Next functionality
  const [isWhatWorkedDialogOpen, setIsWhatWorkedDialogOpen] = useState(false);
  const [whatWorkedStep, setWhatWorkedStep] = useState<'input' | 'generate'>('input');
  const [wwContentLink, setWwContentLink] = useState('');
  const [wwVideoFile, setWwVideoFile] = useState<File | null>(null);
  const [wwPillar, setWwPillar] = useState('');
  const [wwFormat, setWwFormat] = useState('');
  const [wwDeliveryStyle, setWwDeliveryStyle] = useState('');
  const [wwHookType, setWwHookType] = useState('');
  const [wwComments, setWwComments] = useState('');
  const [wwSelectedSignals, setWwSelectedSignals] = useState<string[]>([]);
  const [wwTwist, setWwTwist] = useState('');
  const [wwContextSummary, setWwContextSummary] = useState('');
  const [wwRemixIdeas, setWwRemixIdeas] = useState<Array<{id: string, title: string, variation: string, description: string}>>([]);
  const [wwContentSubmitted, setWwContentSubmitted] = useState(false);
  const [wwThumbnailUrl, setWwThumbnailUrl] = useState<string>('');
  const [wwShowAudienceSignals, setWwShowAudienceSignals] = useState(false);
  const [wwShowFormat, setWwShowFormat] = useState(false);
  const [wwShowDelivery, setWwShowDelivery] = useState(false);
  const [wwShowHook, setWwShowHook] = useState(false);
  const [wwShowComments, setWwShowComments] = useState(false);
  const [wwAnalyzing, setWwAnalyzing] = useState(false);
  const [wwAnalysisComplete, setWwAnalysisComplete] = useState(false);
  const [isGeneratingMoreIdeas, setIsGeneratingMoreIdeas] = useState(false);
  const [addedIdeaText, setAddedIdeaText] = useState<string | null>(null);

  // Re-process embeds when content changes
  React.useEffect(() => {
    if (wwContentSubmitted && wwContentLink) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (wwContentLink.includes('instagram.com') && typeof window !== 'undefined' && (window as any).instgrm) {
          (window as any).instgrm.Embeds.process();
        }
        if (wwContentLink.includes('tiktok.com') && typeof window !== 'undefined' && (window as any).tiktok) {
          (window as any).tiktok.embed.process();
        }
      }, 100);
    }
  }, [wwContentSubmitted, wwContentLink]);

  const narrativeDirections = [
    { title: "Personal Experience", example: "My experience with…", why: "authenticity + relatability" },
    { title: "Before / After", example: "Before I did X vs after", why: "visual contrast + progress" },
    { title: "Mistakes / Lessons", example: "Mistakes I made when…", why: "humility + authority" },
    { title: "How-To / Process", example: "How I do X", why: "practical value" },
    { title: "My Opinion / Hot Take", example: "Unpopular opinion…", why: "stops the scroll" },
    { title: "Beginner Advice", example: "If you're new to X…", why: "clarity + trust-building" },
    { title: "Advanced / Insider Tips", example: "What no one tells you about…", why: "authority + curiosity" },
    { title: "Problem → Solution", example: "If you struggle with X, try this", why: "immediate relevance" },
    { title: "Comparison", example: "This vs that", why: "decision support" },
    { title: "Routine / Day-in-the-Life", example: "What my X routine looks like", why: "lifestyle aspiration" },
    { title: "Storytelling", example: "Let me tell you what happened…", why: "retention + emotion" },
    { title: "Social Proof / Validation", example: "This is why people love X", why: "credibility" },
    { title: "POV", example: "POV: you're trying to…", why: "native + viral" },
    { title: "Reaction", example: "Reacting to trends/comments/creators", why: "low friction + relevance" },
    { title: "Myth Busting", example: "This is false about X", why: "curiosity + authority" },
    { title: "List Format", example: "3 things that…", why: "scannability" },
    { title: "Question-Based", example: "Why does no one talk about…?", why: "engagement" },
  ];

  // Initialize drag states to null
  useEffect(() => {
    setDraggedCard(null);
    setDropPosition(null);
    setDraggedOverColumn(null);
  }, []);

  // Load Bank of Ideas from localStorage
  useEffect(() => {
    const savedBankIdeas = localStorage.getItem("bankOfIdeas");
    if (savedBankIdeas) {
      try {
        const parsed = JSON.parse(savedBankIdeas);
        const realIdeas = parsed.filter((idea: any) => !idea.isPlaceholder);
        setBankIdeas(realIdeas);
      } catch (error) {
        console.error("Failed to load bank ideas:", error);
        setBankIdeas([]);
      }
    } else {
      setBankIdeas([]);
    }
  }, []);


  // Save Bank of Ideas to localStorage
  useEffect(() => {
    if (bankIdeas.length > 0) {
      localStorage.setItem("bankOfIdeas", JSON.stringify(bankIdeas));
    }
  }, [bankIdeas]);

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("productionKanban");
    if (savedData) {
      try {
        setColumns(JSON.parse(savedData));
      } catch (error) {
        console.error("Failed to load production data:", error);
      }
    }
  }, []);

  // Save data to localStorage whenever columns change
  useEffect(() => {
    localStorage.setItem("productionKanban", JSON.stringify(columns));
  }, [columns]);

  // Clean up any cards with empty titles
  useEffect(() => {
    const hasEmptyCards = columns.some(col =>
      col.cards.some(card => !card.title || !card.title.trim())
    );

    if (hasEmptyCards) {
      setColumns(prev =>
        prev.map(col => ({
          ...col,
          cards: col.cards.filter(card => card.title && card.title.trim()),
        }))
      );
    }
  }, []);

  // Remove isNew flag after closing content ideation dialogs and viewing cards
  useEffect(() => {
    // Trigger when closing either the Pillars dialog or the Content Ideation dialog (Bank of Ideas)
    if (!isPillarsDialogOpen && !isIdeateDialogOpen) {
      const hasNewCards = columns.some(col =>
        col.cards.some(card => card.isNew)
      );

      if (hasNewCards) {
        // Wait 3 seconds after closing dialog to let user observe the new cards
        const timer = setTimeout(() => {
          setColumns(prev =>
            prev.map(col => ({
              ...col,
              cards: col.cards.map(card => ({ ...card, isNew: false })),
            }))
          );
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [isPillarsDialogOpen, isIdeateDialogOpen, columns]);

  // Handle cursor positioning and text selection in edit mode
  useEffect(() => {
    if (editingCardId && editInputRef.current) {
      if (editTrigger === 'doubleclick') {
        // Select all text on double click
        editInputRef.current.select();
      } else if (clickPosition !== null) {
        // Position cursor at click position on single click
        editInputRef.current.setSelectionRange(clickPosition, clickPosition);
      } else {
        // Fallback: position cursor at the end
        const length = editInputRef.current.value.length;
        editInputRef.current.setSelectionRange(length, length);
      }
    }
  }, [editingCardId, editTrigger, clickPosition]);


  // Handle content submission and automatic analysis
  const handleContentSubmit = async () => {
    if (!wwContentLink.trim() || wwAnalyzing) return;

    try {
      setWwAnalyzing(true);
      setWwContentSubmitted(true);
      toast.loading('Capturing and analyzing content with Claude AI...');

      // Determine content type
      let contentType = 'other';
      if (wwContentLink.includes('instagram.com')) {
        contentType = 'instagram';
      } else if (wwContentLink.includes('tiktok.com')) {
        contentType = 'tiktok';
      }

      // Call analyze-content API with direct URL for Puppeteer capture
      const analyzeResponse = await fetch('http://localhost:3001/api/analyze-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          directUrl: wwContentLink,
          contentType
        })
      });

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        throw new Error(errorData.error || 'Failed to analyze content');
      }

      const analysisData = await analyzeResponse.json();
      const content = analysisData.content[0].text;

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse analysis from response');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      // Populate state with analysis results
      setWwPillar(analysis.pillar || '');
      setWwFormat(analysis.format || '');
      setWwDeliveryStyle(analysis.deliveryStyle || '');
      setWwHookType(analysis.hook || '');
      setWwComments(analysis.comments || '');
      setWwContextSummary(analysis.summary || '');

      setWwContentSubmitted(true);
      setWwAnalysisComplete(true);
      setWwShowAudienceSignals(true); // Show the "Give it a twist" section

      toast.dismiss();
      toast.success('Content analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.dismiss();
      toast.error('Failed to analyze content. Please try again.');
    } finally {
      setWwAnalyzing(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, card: ProductionCard) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDraggedOverColumn(null);
    setDropPosition(null);
    setDropIndicator(null);
  };

  const handleCardDragOver = (e: React.DragEvent, columnId: string, cardIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedCard) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const insertIndex = e.clientY < midpoint ? cardIndex : cardIndex + 1;

    // Only update state if position actually changed
    if (dropPosition?.columnId !== columnId || dropPosition?.index !== insertIndex) {
      setDropPosition({ columnId, index: insertIndex });
      setDraggedOverColumn(columnId);
    }
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (!draggedCard) return;

    setDraggedOverColumn(columnId);

    // If dragging over empty space in column, set position to end
    const column = columns.find(col => col.id === columnId);
    if (column) {
      const validCards = column.cards.filter(c => c.title && c.title.trim());
      setDropPosition({ columnId, index: validCards.length });
    }
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedCard || !dropPosition) return;

    // Save the drop position before clearing state
    const savedDropPosition = { ...dropPosition };
    const actualTargetColumnId = savedDropPosition.columnId;

    // Clear drop indicators immediately
    setDropPosition(null);
    setDraggedOverColumn(null);
    const sourceColumn = columns.find((col) =>
      col.cards.some((card) => card.id === draggedCard.id)
    );
    const sourceColumnId = sourceColumn?.id;

    if (!sourceColumn) return;

    const isSameColumn = sourceColumnId === actualTargetColumnId;

    // Create updated columns
    const updatedColumns = columns.map((column) => {
      // Get filtered cards for this column
      const filterCard = (c: ProductionCard) =>
        c.title && c.title.trim() && !c.title.toLowerCase().includes('add quick idea');

      if (column.id === sourceColumnId && isSameColumn) {
        // Moving within the same column
        const filtered = column.cards.filter(filterCard);
        const draggedIndex = filtered.findIndex((c) => c.id === draggedCard.id);

        if (draggedIndex === -1) return column;

        // Remove dragged card from filtered array
        const withoutDragged = filtered.filter((c) => c.id !== draggedCard.id);

        // Calculate actual drop index (accounting for removed card)
        let actualDropIndex = savedDropPosition.index;
        if (actualDropIndex > draggedIndex) {
          actualDropIndex--;
        }

        // Insert at new position
        withoutDragged.splice(actualDropIndex, 0, { ...draggedCard, columnId: column.id });

        return { ...column, cards: withoutDragged };
      } else if (column.id === sourceColumnId) {
        // Removing from source column (moving to different column)
        return {
          ...column,
          cards: column.cards.filter((c) => c.id !== draggedCard.id),
        };
      } else if (column.id === actualTargetColumnId) {
        // Adding to target column (from different column)
        const filtered = column.cards.filter(filterCard);
        // Set status to 'to-start' if moving to shape-ideas column and card doesn't already have a status
        const cardToAdd = column.id === 'shape-ideas' && !draggedCard.status
          ? { ...draggedCard, columnId: column.id, status: 'to-start' as const }
          : { ...draggedCard, columnId: column.id };
        filtered.splice(savedDropPosition.index, 0, cardToAdd);
        return { ...column, cards: filtered };
      }

      return column;
    });

    setColumns(updatedColumns);
    setDraggedCard(null);
  };

  const handleAddCard = () => {
    if (!newCardTitle.trim() || !selectedColumnId) return;

    const newCard: ProductionCard = {
      id: `card-${Date.now()}`,
      title: newCardTitle,
      description: newCardDescription,
      columnId: selectedColumnId,
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === selectedColumnId
          ? { ...col, cards: [...col.cards, newCard] }
          : col
      )
    );

    // Reset form
    setNewCardTitle("");
    setNewCardDescription("");
    setIsAddCardDialogOpen(false);
    setSelectedColumnId("");
  };

  const handleEditCard = (card: ProductionCard) => {
    setEditingCard(card);
    setNewCardTitle(card.title);
    setNewCardDescription(card.description || "");
    setIsAddCardDialogOpen(true);
  };

  const handleUpdateCard = () => {
    if (!editingCard || !newCardTitle.trim()) return;

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === editingCard.id
            ? { ...card, title: newCardTitle, description: newCardDescription }
            : card
        ),
      }))
    );

    // Reset form
    setEditingCard(null);
    setNewCardTitle("");
    setNewCardDescription("");
    setIsAddCardDialogOpen(false);
  };

  const handleDeleteCard = (cardId: string) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.filter((card) => card.id !== cardId),
      }))
    );
  };

  const handleToggleComplete = (cardId: string) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === cardId ? { ...card, isCompleted: !card.isCompleted } : card
        ),
      }))
    );
  };

  const handleOpenScriptEditor = (card: ProductionCard) => {
    setEditingScriptCard(card);
    setCardTitle(card.title || "");
    setCardHook(card.hook || "");
    setScriptContent(card.script || "");
    setPlatformTags(card.platforms || []);
    setFormatTags(card.formats || []);
    setPlatformInput("");
    setFormatInput("");
    // Initialize filming checklist
    setLocationChecked(card.locationChecked || false);
    setLocationText(card.locationText || "");
    setOutfitChecked(card.outfitChecked || false);
    setOutfitText(card.outfitText || "");
    setPropsChecked(card.propsChecked || false);
    setPropsText(card.propsText || "");
    setFilmingNotes(card.filmingNotes || "");
    setCardStatus(card.status || null);
    setIsScriptEditorOpen(true);
  };

  const handleSaveScript = () => {
    if (!editingScriptCard) return;

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === editingScriptCard.id
            ? {
                ...card,
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
              }
            : card
        ),
      }))
    );

    setIsScriptEditorOpen(false);
    setEditingScriptCard(null);
    setCardTitle("");
    setCardHook("");
    setScriptContent("");
    setPlatformTags([]);
    setFormatTags([]);
    setPlatformInput("");
    setFormatInput("");
    setLocationChecked(false);
    setLocationText("");
    setOutfitChecked(false);
    setOutfitText("");
    setPropsChecked(false);
    setPropsText("");
    setFilmingNotes("");
    setCardStatus(null);
  };

  const handleAddPlatformTag = () => {
    if (platformInput.trim() && !platformTags.includes(platformInput.trim())) {
      setPlatformTags([...platformTags, platformInput.trim()]);
      setPlatformInput("");
    }
  };

  const handleAddFormatTag = () => {
    if (formatInput.trim() && !formatTags.includes(formatInput.trim())) {
      setFormatTags([...formatTags, formatInput.trim()]);
      setFormatInput("");
    }
  };

  const handleRemovePlatformTag = (tag: string) => {
    setPlatformTags(platformTags.filter(t => t !== tag));
  };

  const handleRemoveFormatTag = (tag: string) => {
    setFormatTags(formatTags.filter(t => t !== tag));
  };

  // Get color classes for platform tags
  const getPlatformColors = (platform: string): { bg: string; text: string; hover: string } => {
    const lowercased = platform.toLowerCase();
    if (lowercased.includes('instagram') || lowercased === 'ig') {
      return { bg: 'bg-pink-100', text: 'text-pink-700', hover: 'hover:bg-pink-200' };
    } else if (lowercased.includes('tiktok') || lowercased === 'tt') {
      return { bg: 'bg-gray-900', text: 'text-white', hover: 'hover:bg-gray-800' };
    } else if (lowercased.includes('youtube')) {
      return { bg: 'bg-red-100', text: 'text-red-700', hover: 'hover:bg-red-200' };
    } else if (lowercased.includes('facebook')) {
      return { bg: 'bg-blue-100', text: 'text-blue-700', hover: 'hover:bg-blue-200' };
    } else if (lowercased.includes('twitter') || lowercased.includes('x.com')) {
      return { bg: 'bg-sky-100', text: 'text-sky-700', hover: 'hover:bg-sky-200' };
    } else if (lowercased.includes('linkedin')) {
      return { bg: 'bg-indigo-100', text: 'text-indigo-700', hover: 'hover:bg-indigo-200' };
    }
    // Default color
    return { bg: 'bg-blue-100', text: 'text-blue-700', hover: 'hover:bg-blue-200' };
  };

  // Get color classes for format tags
  const getFormatColors = (format: string): { bg: string; text: string; hover: string } => {
    const lowercased = format.toLowerCase();
    if (lowercased.includes('carousel')) {
      return { bg: 'bg-purple-100', text: 'text-purple-700', hover: 'hover:bg-purple-200' };
    } else if (lowercased.includes('vlog')) {
      return { bg: 'bg-indigo-100', text: 'text-indigo-700', hover: 'hover:bg-indigo-200' };
    } else if (lowercased.includes('reel')) {
      return { bg: 'bg-orange-100', text: 'text-orange-700', hover: 'hover:bg-orange-200' };
    } else if (lowercased.includes('b-roll') || lowercased.includes('broll')) {
      return { bg: 'bg-amber-100', text: 'text-amber-700', hover: 'hover:bg-amber-200' };
    } else if (lowercased.includes('story') || lowercased.includes('stories')) {
      return { bg: 'bg-violet-100', text: 'text-violet-700', hover: 'hover:bg-violet-200' };
    } else if (lowercased.includes('short')) {
      return { bg: 'bg-cyan-100', text: 'text-cyan-700', hover: 'hover:bg-cyan-200' };
    }
    // Default color
    return { bg: 'bg-purple-100', text: 'text-purple-700', hover: 'hover:bg-purple-200' };
  };

  const handleStartAddingCard = (columnId: string) => {
    setAddingToColumn(columnId);
  };

  const handleCancelAddingCard = () => {
    setAddingToColumn(null);
  };

  const handleCreateInlineCard = (columnId: string, title: string) => {
    if (!title.trim()) {
      setAddingToColumn(null);
      return;
    }

    const newCard: ProductionCard = {
      id: `card-${Date.now()}`,
      title: title.trim(),
      columnId: columnId,
      isCompleted: false,
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col
      )
    );

    setAddingToColumn(null);
  };

  const handleStartEditingCard = (cardId: string, columnId: string, trigger: 'click' | 'doubleclick' = 'click', clickEvent?: React.MouseEvent) => {
    setEditingCardId(cardId);
    setEditTrigger(trigger);

    // Calculate cursor position from click for single clicks
    if (trigger === 'click' && clickEvent) {
      const textElement = textRefs.current.get(cardId);
      if (textElement) {
        const text = textElement.textContent || '';
        const rect = textElement.getBoundingClientRect();
        const clickX = clickEvent.clientX - rect.left;

        // Create a temporary span to measure character positions
        const tempSpan = document.createElement('span');
        tempSpan.style.font = window.getComputedStyle(textElement).font;
        tempSpan.style.position = 'absolute';
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.whiteSpace = 'pre';
        document.body.appendChild(tempSpan);

        let cursorPos = 0;
        for (let i = 0; i <= text.length; i++) {
          tempSpan.textContent = text.substring(0, i);
          const width = tempSpan.offsetWidth;

          if (width >= clickX) {
            // Check if we're closer to the current or previous character
            if (i > 0) {
              tempSpan.textContent = text.substring(0, i - 1);
              const prevWidth = tempSpan.offsetWidth;
              cursorPos = (clickX - prevWidth) < (width - clickX) ? i - 1 : i;
            } else {
              cursorPos = 0;
            }
            break;
          }
          cursorPos = i;
        }

        document.body.removeChild(tempSpan);
        setClickPosition(cursorPos);
      }
    } else {
      setClickPosition(null);
    }
  };

  const handleCreateCardFromBrainstorm = () => {
    // Get the textarea element to access selection
    const textarea = document.getElementById('brainstorm-textarea') as HTMLTextAreaElement;
    let selectedText = '';

    if (textarea && textarea.selectionStart !== textarea.selectionEnd) {
      selectedText = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd
      );
    }

    // Use selected text if available, otherwise use first line or prompt user
    const cardTitle = selectedText?.trim() || brainstormText.split('\n')[0].trim();

    if (!cardTitle) {
      alert('Please select text or write something in the textarea first');
      return;
    }

    // Create new card in Ideate column
    const newCard: ProductionCard = {
      id: `card-${Date.now()}`,
      title: cardTitle,
      description: brainstormText,
      columnId: 'ideate',
      isCompleted: false,
      isNew: true,
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === 'ideate' ? { ...col, cards: [...col.cards, newCard] } : col
      )
    );

    // Close dialog and reset
    setIsIdeateDialogOpen(false);
    setIdeateMode(null);
    setBrainstormText("");
  };

  const handleSelectHook = (hook: string) => {
    // Create new card in Ideate column with the selected hook
    const newCard: ProductionCard = {
      id: `card-${Date.now()}`,
      title: hook,
      columnId: 'ideate',
      isCompleted: false,
      isNew: true,
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === 'ideate' ? { ...col, cards: [...col.cards, newCard] } : col
      )
    );

    // Close both dialogs
    setShowHooksDialog(false);
    setIsIdeateDialogOpen(false);
  };

  const getAllAngleTemplates = (idea: string) => [
    `How to use ${idea} to achieve [desired result]`,
    `The biggest mistake people make with ${idea}`,
    `What nobody tells you about ${idea}`,
    `${idea} vs. [alternative approach]`,
    `Complete beginner's guide to ${idea}`,
    `Advanced strategies for ${idea}`,
    `How I used ${idea} to [specific result]`,
    `Common myths about ${idea} debunked`,
    `5 things you need to know before trying ${idea}`,
    `Why ${idea} isn't working for you (and how to fix it)`,
    `The ultimate ${idea} checklist`,
    `${idea}: What I wish I knew when I started`,
    `3 ways to level up your ${idea}`,
    `Is ${idea} worth it? My honest review`,
    `The fastest way to master ${idea}`,
    `Stop doing ${idea} wrong - here's the right way`,
    `The secret to ${idea} that nobody talks about`,
    `${idea} mistakes that are costing you time and money`,
    `How to get started with ${idea} in under 10 minutes`,
    `${idea} hacks that actually work`,
    `The complete ${idea} routine`,
    `${idea} trends you need to know about`,
    `Why everyone is talking about ${idea}`,
    `${idea}: Before and after results`,
    `The truth about ${idea}`,
    `${idea} on a budget: How to save money`,
    `Lazy person's guide to ${idea}`,
    `${idea} for busy people`,
    `Science-backed ${idea} techniques`,
    `${idea} mistakes I made so you don't have to`,
    `How to stay consistent with ${idea}`,
    `${idea}: Setting realistic expectations`,
    `The only ${idea} guide you'll ever need`,
    `${idea} routines of successful people`,
    `How to troubleshoot common ${idea} problems`,
    `${idea}: Quick wins for immediate results`,
    `Why ${idea} is harder than it looks`,
    `${idea} game-changers you need to try`,
    `The ${idea} method that changed my life`,
    `${idea} tips from experts`,
    `How to make ${idea} a habit`,
    `${idea}: What works and what doesn't`,
    `The psychology behind ${idea}`,
    `${idea} for different experience levels`,
    `How to track your ${idea} progress`,
  ];

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleGenerateAngles = () => {
    if (!ideaExpanderText.trim()) return;

    setIsGeneratingAngles(true);

    // Simulate AI generation with a delay
    setTimeout(() => {
      const allAngles = getAllAngleTemplates(ideaExpanderText);

      // Shuffle and take first 10, then capitalize first letter
      const shuffledAngles = allAngles
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .map(angle => capitalizeFirstLetter(angle));

      setExpandedAngles(shuffledAngles);
      setIsGeneratingAngles(false);
    }, 1500);
  };

  const handleGenerateMoreAngles = () => {
    setIsGeneratingAngles(true);

    setTimeout(() => {
      const allAngles = getAllAngleTemplates(ideaExpanderText);

      // Get angles that aren't already shown (need to compare lowercase versions)
      const currentAnglesLower = expandedAngles.map(a => a.toLowerCase());
      const newAngles = allAngles.filter(angle => !currentAnglesLower.includes(angle.toLowerCase()));

      // Shuffle and take 7 more, then capitalize first letter
      const moreAngles = newAngles
        .sort(() => Math.random() - 0.5)
        .slice(0, 7)
        .map(angle => capitalizeFirstLetter(angle));

      setExpandedAngles([...expandedAngles, ...moreAngles]);
      setIsGeneratingAngles(false);
    }, 1000);
  };

  const handleSelectAngle = (angle: string) => {
    // Create new card in Ideate column with the selected angle
    const newCard: ProductionCard = {
      id: `card-${Date.now()}`,
      title: angle,
      description: `Expanded from: ${ideaExpanderText}`,
      columnId: 'ideate',
      isCompleted: false,
      isNew: true,
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === 'ideate' ? { ...col, cards: [...col.cards, newCard] } : col
      )
    );

    // Show success state briefly before removing
    setAddedAngleText(angle);
    setTimeout(() => {
      // Remove the angle from the list (triggers exit animation)
      setExpandedAngles((prev) => prev.filter((a) => a !== angle));
      setAddedAngleText(null);
    }, 500);

    // Don't close dialog - user may want to add more angles
  };

  const handleSaveCardEdit = (cardId: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === cardId ? { ...card, title: newTitle.trim() } : card
        ),
      }))
    );

    setEditingCardId(null);
  };

  const openAddCardDialog = (columnId: string) => {
    setSelectedColumnId(columnId);
    setEditingCard(null);
    setNewCardTitle("");
    setNewCardDescription("");
    setIsAddCardDialogOpen(true);
  };

  const closeDialog = () => {
    setIsAddCardDialogOpen(false);
    setEditingCard(null);
    setNewCardTitle("");
    setNewCardDescription("");
    setSelectedColumnId("");
  };

  // Bank of Ideas handlers
  const handleAddBankIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankIdeaText.trim()) return;

    // Remove placeholders when adding a real idea
    const realIdeas = bankIdeas.filter(idea => !idea.isPlaceholder);
    const newIdea = {
      id: `idea-${Date.now()}`,
      text: newBankIdeaText.trim(),
      isPlaceholder: false,
    };

    setBankIdeas([newIdea, ...realIdeas]);
    setNewBankIdeaText("");
  };

  const handleDeleteBankIdea = (ideaId: string) => {
    const updatedIdeas = bankIdeas.filter(idea => idea.id !== ideaId);
    setBankIdeas(updatedIdeas);
  };

  const handleMoveBankIdeaToProduction = (ideaId: string, ideaText: string) => {
    // Create card in Ideate column
    const newCard: ProductionCard = {
      id: `card-${Date.now()}`,
      title: ideaText,
      columnId: 'ideate',
      isCompleted: false,
      isNew: true,
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === 'ideate' ? { ...col, cards: [...col.cards, newCard] } : col
      )
    );

    // Show success state briefly before removing
    setAddedBankIdeaId(ideaId);
    setTimeout(() => {
      // Remove the idea from bank (triggers exit animation)
      const updatedIdeas = bankIdeas.filter(idea => idea.id !== ideaId);
      setBankIdeas(updatedIdeas);
      setAddedBankIdeaId(null);
    }, 500);

    // Don't close dialog - user may want to add more ideas
  };

  return (
    <Layout>
      <div className="w-full h-[calc(100vh-4rem)] mx-auto px-8 py-6 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex gap-5 h-[calc(100%-2rem)] overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {columns.map((column, index) => {
            const colors = columnColors[column.id];
            return (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-80"
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div
                  className={cn(
                    "h-full flex flex-col rounded-2xl transition-all duration-300",
                    draggedOverColumn === column.id
                      ? "ring-2 ring-offset-2 ring-indigo-400 scale-105"
                      : "",
                    colors.bg,
                    "border-2",
                    colors.border
                  )}
                >
                  <div className="p-4 pb-6">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-1 h-6 rounded-full", colors.badge)}></div>
                        <h2 className={cn("font-semibold text-sm", colors.text)}>
                          {column.title}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5 scrollbar-none hover:scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    <AnimatePresence>
                      {column.cards.filter(card => card.title && card.title.trim() && !card.title.toLowerCase().includes('add quick idea')).map((card, cardIndex) => {
                        const isEditing = editingCardId === card.id;

                        // Find dragged card's current index in this column
                        const filteredCards = column.cards.filter(c => c.title && c.title.trim() && !c.title.toLowerCase().includes('add quick idea'));
                        const draggedCardIndex = draggedCard ? filteredCards.findIndex(c => c.id === draggedCard.id) : -1;

                        // Don't show indicator at or adjacent to the dragged card's original position in the same column
                        const isNearOriginalPosition = draggedCardIndex !== -1 &&
                                                       dropPosition?.columnId === column.id &&
                                                       (dropPosition?.index === draggedCardIndex ||
                                                        dropPosition?.index === draggedCardIndex + 1);

                        const showDropIndicatorBefore = dropPosition?.columnId === column.id &&
                                                         dropPosition?.index === cardIndex &&
                                                         !isNearOriginalPosition;

                        const isDragging = draggedCard !== null;
                        const isThisCardDragged = draggedCard?.id === card.id;

                        return (
                          <React.Fragment key={card.id}>
                            {/* Drop indicator - fixed height to prevent layout shift */}
                            {column.id !== "ideate" && (
                              <div className="relative h-0">
                                {showDropIndicatorBefore && draggedCard && (
                                  <div
                                    className="absolute inset-x-0 -top-1 h-0.5 bg-purple-500 rounded-full"
                                    style={{
                                      opacity: 1,
                                      transition: 'opacity 0.1s ease-out'
                                    }}
                                  />
                                )}
                              </div>
                            )}

                            <motion.div
                              layout={!isDragging}
                              initial={{ opacity: 1 }}
                              animate={{
                                opacity: 1,
                                boxShadow: card.isNew
                                  ? ["0 0 0px rgba(168, 85, 247, 0)", "0 0 20px rgba(168, 85, 247, 0.6)", "0 0 0px rgba(168, 85, 247, 0)"]
                                  : "0 1px 2px 0 rgb(0 0 0 / 0.05)"
                              }}
                              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                              transition={{
                                layout: { duration: 0.2, ease: "easeOut" },
                                opacity: { duration: 0.05 },
                                boxShadow: { duration: 1.5, repeat: card.isNew ? 2 : 0 }
                              }}
                              draggable={!isEditing}
                              onDragStart={(e) => !isEditing && handleDragStart(e, card)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => handleCardDragOver(e, column.id, cardIndex)}
                              className={cn(
                                "group backdrop-blur-sm rounded-lg shadow-sm relative",
                                column.id === "ideate" ? "py-4 px-2" : "p-2",
                                !isEditing && "cursor-grab active:cursor-grabbing",
                                !isDragging && "hover:shadow-md transition-shadow duration-150",
                                isThisCardDragged ? "opacity-40 scale-[0.98]" : "",
                                card.isCompleted && "opacity-60",
                                card.isNew ? "border-2 border-purple-600 bg-purple-100" : "bg-white/80 border border-white"
                              )}
                              style={{
                                willChange: isDragging ? 'transform' : 'auto'
                              }}
                            >
                            {card.isNew && (
                              <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10">
                                JUST ADDED
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={card.isCompleted}
                                onCheckedChange={() => handleToggleComplete(card.id)}
                                className="flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                {isEditing ? (
                                  <input
                                    ref={editInputRef}
                                    type="text"
                                    defaultValue={card.title}
                                    autoFocus
                                    onBlur={(e) => handleSaveCardEdit(card.id, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleSaveCardEdit(card.id, e.currentTarget.value);
                                      } else if (e.key === "Escape") {
                                        setEditingCardId(null);
                                      }
                                    }}
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 font-medium"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  <h3
                                    ref={(el) => {
                                      if (el) textRefs.current.set(card.id, el);
                                    }}
                                    className={cn(
                                      "font-medium text-sm text-gray-900 break-words leading-tight flex-1 cursor-grab hover:cursor-grab",
                                      card.isCompleted && "line-through text-gray-500"
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartEditingCard(card.id, column.id, 'click', e);
                                    }}
                                    onDoubleClick={(e) => {
                                      e.stopPropagation();
                                      handleStartEditingCard(card.id, column.id, 'doubleclick');
                                    }}
                                  >
                                    {card.title}
                                  </h3>
                                )}
                                <div className="flex flex-row gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                  {column.id === "shape-ideas" && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-3.5 w-3.5 p-0 rounded hover:bg-blue-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenScriptEditor(card);
                                      }}
                                    >
                                      <Edit className="h-2.5 w-2.5 text-gray-400 hover:text-blue-600" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-3.5 w-3.5 p-0 rounded hover:bg-red-50"
                                    onClick={() => handleDeleteCard(card.id)}
                                  >
                                    <Trash2 className="h-2.5 w-2.5 text-gray-400 hover:text-red-600" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            {/* Tags for Shape Ideas column */}
                            {column.id === "shape-ideas" && ((card.platforms && card.platforms.length > 0) || (card.formats && card.formats.length > 0) || card.status) && (
                              <div className="flex gap-1.5 mt-2 flex-wrap">
                                {card.formats?.map((format, idx) => {
                                  const colors = getFormatColors(format);
                                  return (
                                    <span key={`format-${idx}`} className={`text-[10px] px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} font-medium`}>
                                      {format}
                                    </span>
                                  );
                                })}
                                {card.platforms?.map((platform, idx) => {
                                  const colors = getPlatformColors(platform);
                                  return (
                                    <span key={`platform-${idx}`} className={`text-[10px] px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} font-medium`}>
                                      {platform}
                                    </span>
                                  );
                                })}
                                {card.status && (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                    card.status === 'to-start' ? 'bg-gray-200 text-gray-700' :
                                    card.status === 'needs-work' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {card.status === 'to-start' ? 'To start' :
                                     card.status === 'needs-work' ? 'Needs more work' :
                                     'Ready to film'}
                                  </span>
                                )}
                              </div>
                            )}
                          </motion.div>
                          </React.Fragment>
                        );
                      })}

                      {/* Drop indicator at the end of the column - fixed height to prevent layout shift */}
                      {column.id !== "ideate" && (() => {
                        const filteredCards = column.cards.filter(card => card.title && card.title.trim() && !card.title.toLowerCase().includes('add quick idea'));
                        const draggedCardIndex = draggedCard ? filteredCards.findIndex(c => c.id === draggedCard.id) : -1;
                        const isLastCard = draggedCardIndex !== -1 && draggedCardIndex === filteredCards.length - 1;
                        const shouldShow = dropPosition?.columnId === column.id &&
                                         dropPosition?.index === filteredCards.length &&
                                         !isLastCard;

                        return (
                          <div className="relative h-0">
                            {shouldShow && draggedCard && (
                              <div
                                className="absolute inset-x-0 top-0 h-0.5 bg-purple-500 rounded-full"
                                style={{
                                  opacity: 1,
                                  transition: 'opacity 0.1s ease-out'
                                }}
                              />
                            )}
                          </div>
                        );
                      })()}

                      {addingToColumn === column.id ? (
                        <div key={`inline-input-${column.id}`}>
                          <InlineCardInput
                            onSave={(title) => handleCreateInlineCard(column.id, title)}
                            onCancel={handleCancelAddingCard}
                          />
                        </div>
                      ) : (
                        <div
                          key={`add-button-${column.id}`}
                          className={cn(
                            "p-2 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer",
                            colors.buttonBg,
                            colors.border
                          )}
                          onClick={() => handleStartAddingCard(column.id)}
                        >
                          <div className={cn("flex items-center gap-2", colors.buttonText)}>
                            <PlusCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {column.id === 'ideate' ? 'Add quick idea' : 'Add new'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Help me generate ideas button - only for ideate column */}
                      {column.id === 'ideate' && (
                        <div className="p-2 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer bg-purple-100 hover:bg-purple-200 border-purple-300 hover:border-purple-400"
                          onClick={() => {
                            setSelectedIdeateCard(null);
                            setIsIdeateDialogOpen(true);
                          }}
                        >
                          <div className="flex items-center gap-2 text-purple-600">
                            <Lightbulb className="h-4 w-4" />
                            <span className="text-sm font-medium">Help me generate ideas</span>
                          </div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add/Edit Card Dialog */}
        <Dialog open={isAddCardDialogOpen} onOpenChange={closeDialog}>
          <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {editingCard ? "Edit Card" : "Add New Card"}
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                {editingCard
                  ? "Update the card details below"
                  : "Create a new card in the selected column"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Title</label>
                <Input
                  placeholder="Enter card title"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  className="border-2 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Description (optional)</label>
                <Textarea
                  placeholder="Enter card description"
                  value={newCardDescription}
                  onChange={(e) => setNewCardDescription(e.target.value)}
                  rows={4}
                  className="border-2 focus:ring-2 focus:ring-indigo-500 rounded-lg resize-none"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={closeDialog}
                className="rounded-lg border-2"
              >
                Cancel
              </Button>
              <Button
                onClick={editingCard ? handleUpdateCard : handleAddCard}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg shadow-md"
              >
                {editingCard ? "Update Card" : "Add Card"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ideate Card Dialog */}
        <Dialog open={isIdeateDialogOpen} onOpenChange={(open) => {
          setIsIdeateDialogOpen(open);
          if (!open) {
            setIdeateMode(null);
            setBrainstormText("");
          }
        }}>
          <DialogContent className={cn(
            "h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] overflow-hidden border-0 shadow-2xl flex flex-col",
            ideateMode === 'pillarsformats' ? "sm:max-w-[1400px]" : "sm:max-w-[900px]",
            ideateMode === 'bankofideas' && "bg-gradient-to-br from-yellow-50 via-white to-amber-50"
          )}>
            <DialogHeader className="flex-shrink-0 pt-6">
              {!ideateMode && (
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent px-4 mb-2">
                  Content Ideation
                </DialogTitle>
              )}

              {/* Breadcrumbs for Bank of Ideas */}
              {ideateMode === 'bankofideas' && (
                <div className="flex items-center gap-3 text-base mb-2 px-2">
                  <button
                    onClick={() => {
                      setIsIdeateDialogOpen(false);
                      setIdeateMode(null);
                    }}
                    className="text-gray-500 hover:text-amber-600 transition-colors font-medium"
                  >
                    Production
                  </button>
                  <span className="text-gray-400">/</span>
                  <button
                    onClick={() => setIdeateMode(null)}
                    className="text-gray-500 hover:text-amber-600 transition-colors font-medium"
                  >
                    Content Ideation
                  </button>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900 font-semibold">Bank of Ideas</span>
                </div>
              )}

              {/* Breadcrumbs for Brainstorm */}
              {ideateMode === 'brainstorm' && (
                <div className="flex items-center gap-3 text-base mb-6 px-2">
                  <button
                    onClick={() => {
                      setIsIdeateDialogOpen(false);
                      setIdeateMode(null);
                    }}
                    className="text-gray-500 hover:text-purple-600 transition-colors font-medium"
                  >
                    Production
                  </button>
                  <span className="text-gray-400">/</span>
                  <button
                    onClick={() => setIdeateMode(null)}
                    className="text-gray-500 hover:text-purple-600 transition-colors font-medium"
                  >
                    Content Ideation
                  </button>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900 font-semibold">Brainstorm on your own</span>
                </div>
              )}
            </DialogHeader>

            <div className="overflow-y-auto flex-1 pr-2 py-4">
              {/* Method Selection - Always show unless in a specific mode */}
              {!ideateMode && (
                <div className="space-y-6 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800">Choose Your Starting Point</h3>
                  </div>

                  <p className="text-sm text-gray-600">Stop staring at a blank page. Select a method to guide your content ideation process.</p>

                  <div className="grid grid-cols-6 gap-4 mt-6">
                    {/* 1. Start With Your Pillars - Emerald/Green - Spans 3 cols */}
                    <button
                      onClick={() => setIsPillarsDialogOpen(true)}
                      className="col-span-3 group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-2 border-emerald-200 hover:border-emerald-400 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xl shadow-md">
                          🎯
                        </div>
                        <h4 className="text-base font-bold text-gray-800">Start With Your Pillars</h4>
                        <p className="text-xs text-gray-600">Create content using a structured framework</p>
                      </div>
                    </button>

                    {/* 2. Trending Hooks - Rose/Pink - Spans 3 cols */}
                    <button
                      onClick={() => setShowHooksDialog(true)}
                      className="col-span-3 group relative overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 border-2 border-rose-200 hover:border-rose-400 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xl shadow-md">
                          🔥
                        </div>
                        <h4 className="text-base font-bold text-gray-800">Trending Hooks</h4>
                        <p className="text-xs text-gray-600">Start with hooks that are working now</p>
                      </div>
                    </button>

                    {/* 3. What Worked, What's Next - Sky/Cyan Blue - Spans 2 cols */}
                    <button
                      onClick={() => setIsWhatWorkedDialogOpen(true)}
                      className="col-span-2 group relative overflow-hidden bg-gradient-to-br from-sky-50 to-cyan-50 hover:from-sky-100 hover:to-cyan-100 border-2 border-sky-200 hover:border-sky-400 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-xl shadow-md">
                          ⭐
                        </div>
                        <h4 className="text-base font-bold text-gray-800">
                          What Worked,
                          <br />
                          What's Next
                        </h4>
                        <p className="text-xs text-gray-600">Build on your past successes or competitor insights</p>
                      </div>
                    </button>

                    {/* 4. Idea Expander - Orange - Spans 2 cols */}
                    <button
                      onClick={() => setIsIdeaExpanderOpen(true)}
                      className="col-span-2 group relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border-2 border-orange-200 hover:border-orange-400 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xl shadow-md">
                          💡
                        </div>
                        <h4 className="text-base font-bold text-gray-800">Idea Expander</h4>
                        <p className="text-xs text-gray-600">Take one idea and explore multiple angles</p>
                      </div>
                    </button>

                    {/* 5. Bank of Ideas - Yellow/Amber - Spans 2 cols */}
                    <button
                      onClick={() => setIdeateMode('bankofideas')}
                      className="col-span-2 group relative overflow-hidden bg-gradient-to-br from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 border-2 border-yellow-200 hover:border-yellow-400 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-white text-xl shadow-md">
                          🏦
                        </div>
                        <h4 className="text-base font-bold text-gray-800">Bank of Ideas</h4>
                        <p className="text-xs text-gray-600">Store ideas as they come, pick them later</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Brainstorm Mode */}
              {ideateMode === 'brainstorm' && (
                <div className="space-y-4 h-full flex flex-col px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800">Free-form Brainstorm</h3>
                  </div>
                  <Textarea
                    id="brainstorm-textarea"
                    value={brainstormText}
                    onChange={(e) => setBrainstormText(e.target.value)}
                    placeholder="Start writing your ideas here... Let your creativity flow!&#10;&#10;• What's the core message?&#10;• Who is this for?&#10;• What action do you want them to take?&#10;• What makes this unique?"
                    className="flex-1 min-h-[400px] border-2 focus:ring-2 focus:ring-purple-500 rounded-lg resize-none text-base p-4"
                  />
                </div>
              )}

              {/* Bank of Ideas Mode */}
              {ideateMode === 'bankofideas' && (
                <div className="h-full flex flex-col px-2">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Bank of Ideas</h3>
                    <p className="text-sm text-gray-600">Store ideas as they come, pick them later</p>
                  </div>

                  {/* Add New Idea Form */}
                  <form onSubmit={handleAddBankIdea} className="flex-shrink-0 mb-4">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={newBankIdeaText}
                        onChange={(e) => setNewBankIdeaText(e.target.value)}
                        placeholder="Add a new idea..."
                        className="flex-1 h-9 text-sm border-2 focus:ring-2 focus:ring-yellow-500 rounded-lg px-3"
                      />
                      <Button
                        type="submit"
                        disabled={!newBankIdeaText.trim()}
                        className="h-9 px-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white text-sm rounded-lg"
                      >
                        Add
                      </Button>
                    </div>
                  </form>

                  {/* Ideas List */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 mt-8 mb-4">
                    <AnimatePresence initial={false}>
                      {bankIdeas.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-12 text-gray-400"
                        >
                          <p className="text-sm">No ideas yet</p>
                        </motion.div>
                      ) : (
                        bankIdeas.map((idea) => (
                          <motion.div
                            key={idea.id}
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              scale: addedBankIdeaId === idea.id ? 1.02 : 1
                            }}
                            exit={{
                              opacity: 0,
                              x: 400,
                              scale: 0.8,
                              rotate: 5,
                              transition: { duration: 0.6, ease: "easeOut" }
                            }}
                            transition={{
                              duration: 0.3,
                              layout: { duration: 0.4, ease: "easeInOut" }
                            }}
                            className={cn(
                              "group px-3 py-2.5 rounded-lg border",
                              addedBankIdeaId === idea.id
                                ? "bg-yellow-100 border-yellow-500 shadow-lg"
                                : idea.isPlaceholder
                                  ? "bg-gray-50/50 border-gray-100 italic"
                                  : "bg-white border-gray-200 hover:border-yellow-300 hover:shadow-sm"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <p className={cn(
                                "flex-1 text-sm leading-snug",
                                idea.isPlaceholder ? "text-gray-400" : "text-gray-700"
                              )}>
                                {idea.text}
                              </p>
                              {!idea.isPlaceholder && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleMoveBankIdeaToProduction(idea.id, idea.text)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white text-xs px-3 py-1 h-auto"
                                  >
                                    Add to content cards
                                  </Button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteBankIdea(idea.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 hover:bg-gray-100 rounded"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                                  </button>
                                </>
                              )}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

            </div>
          </DialogContent>
        </Dialog>

        {/* Narrative Direction Dialog */}
        <Dialog open={isAngleDialogOpen} onOpenChange={(open) => {
          setIsAngleDialogOpen(open);
          if (!open) {
            setShowAIGenerator(false);
            setSelectedNarrative("");
            setGeneratedIdeas([]);
            setUserExperience("");
          }
        }}>
          <DialogContent className={cn(
            "max-w-[1100px] max-h-[90vh] border-0 shadow-2xl p-0 overflow-hidden",
            showAIGenerator && "[&>button]:hidden"
          )}>
            {!showAIGenerator ? (
              // Stage 1: Narrative Direction Selection
              <div className="bg-white">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {selectedPillar} + {selectedFormat}
                    </h3>
                    <p className="text-emerald-50 text-sm mt-1">Choose a narrative direction for your content</p>
                  </div>
                </div>

                <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="grid grid-cols-3 gap-4">
                    {narrativeDirections.map((narrative, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedNarrative(narrative.title);
                          setShowAIGenerator(true);
                        }}
                        className="group relative bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-emerald-400 rounded-xl p-5 text-left transition-all duration-200 hover:shadow-xl"
                      >
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-100 group-hover:bg-emerald-500 flex items-center justify-center transition-colors">
                          <span className="text-xs font-bold text-emerald-600 group-hover:text-white">{index + 1}</span>
                        </div>
                        <div className="pr-8">
                          <h4 className="font-bold text-gray-900 text-base mb-2 group-hover:text-emerald-600 transition-colors">
                            {narrative.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3 italic">
                            "{narrative.example}"
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Sparkles className="w-3 h-3" />
                            <span>{narrative.why}</span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Stage 2: AI Hook Generator
              <div className="bg-white h-full flex flex-col">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {selectedPillar} + {selectedNarrative}
                      </h3>
                      <p className="text-purple-50 text-sm mt-1">AI-generated ideas for your content</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAIGenerator(false);
                        setSelectedNarrative("");
                        setGeneratedIdeas([]);
                        setUserExperience("");
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      ← Back
                    </Button>
                  </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto">
                  <div className="max-w-3xl mx-auto">
                    {/* User Experience Input Section */}
                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 mb-6">
                      <div className="mb-4">
                        <h4 className="font-bold text-gray-900 mb-2">
                          {selectedNarrative === "Personal Experience" && `Share Your ${selectedPillar} Journey`}
                          {selectedNarrative === "Before / After" && `Describe Your ${selectedPillar} Transformation`}
                          {selectedNarrative === "Mistakes / Lessons" && `What Did You Learn About ${selectedPillar}?`}
                          {selectedNarrative === "How-To / Process" && `Explain Your ${selectedPillar} System`}
                          {selectedNarrative === "My Opinion / Hot Take" && `What's Your Unpopular ${selectedPillar} Opinion?`}
                          {selectedNarrative === "Beginner Advice" && `What Would You Tell ${selectedPillar} Beginners?`}
                          {selectedNarrative === "Advanced / Insider Tips" && `Share Your ${selectedPillar} Insider Knowledge`}
                          {selectedNarrative === "Problem → Solution" && `What ${selectedPillar} Problem Did You Solve?`}
                          {selectedNarrative === "Comparison" && `What ${selectedPillar} Comparisons Have You Made?`}
                          {selectedNarrative === "Routine / Day-in-the-Life" && `Describe Your ${selectedPillar} Routine`}
                          {selectedNarrative === "Storytelling" && `Tell Your ${selectedPillar} Story`}
                          {selectedNarrative === "Social Proof / Validation" && `What ${selectedPillar} Results Have You Seen?`}
                          {selectedNarrative === "POV" && `Describe a Relatable ${selectedPillar} Scenario`}
                          {selectedNarrative === "Reaction" && `React to ${selectedPillar} Trends or Beliefs`}
                          {selectedNarrative === "Myth Busting" && `What ${selectedPillar} Myths Can You Debunk?`}
                          {selectedNarrative === "List Format" && `List Your Key ${selectedPillar} Insights`}
                          {selectedNarrative === "Question-Based" && `What ${selectedPillar} Questions Need Answers?`}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {selectedNarrative === "Personal Experience" && `Think about a specific aspect of ${selectedPillar.toLowerCase()} that deeply impacted you. What moment or realization changed your perspective?`}
                          {selectedNarrative === "Before / After" && `Focus on a specific transformation within ${selectedPillar.toLowerCase()}. What was your life like before vs after? What changed?`}
                          {selectedNarrative === "Mistakes / Lessons" && `Reflect on a specific mistake you made with ${selectedPillar.toLowerCase()}. What did you learn? What would you do differently?`}
                          {selectedNarrative === "How-To / Process" && `Break down a specific system or process you use for ${selectedPillar.toLowerCase()}. What are the exact steps you follow?`}
                          {selectedNarrative === "My Opinion / Hot Take" && `Think about what you believe about ${selectedPillar.toLowerCase()} that most people disagree with. What's controversial or unpopular about your view?`}
                          {selectedNarrative === "Beginner Advice" && `If someone just started with ${selectedPillar.toLowerCase()}, what specific advice would you give? What should they focus on first?`}
                          {selectedNarrative === "Advanced / Insider Tips" && `What's a nuanced or non-obvious insight about ${selectedPillar.toLowerCase()} that only comes from deep experience?`}
                          {selectedNarrative === "Problem → Solution" && `Identify a specific problem you faced with ${selectedPillar.toLowerCase()} and the exact solution you discovered.`}
                          {selectedNarrative === "Comparison" && `What alternatives or options within ${selectedPillar.toLowerCase()} have you compared? What did you choose and why?`}
                          {selectedNarrative === "Routine / Day-in-the-Life" && `Walk through your daily habits and routines around ${selectedPillar.toLowerCase()}. What does a typical day look like?`}
                          {selectedNarrative === "Storytelling" && `Share a compelling story about your journey with ${selectedPillar.toLowerCase()}. Include the beginning, middle, and transformation.`}
                          {selectedNarrative === "Social Proof / Validation" && `What results, feedback, or proof do you have about ${selectedPillar.toLowerCase()}? What validates your approach?`}
                          {selectedNarrative === "POV" && `Describe a specific, relatable scenario about ${selectedPillar.toLowerCase()} that your audience experiences.`}
                          {selectedNarrative === "Reaction" && `What common trends, advice, or beliefs about ${selectedPillar.toLowerCase()} do you disagree with or want to respond to?`}
                          {selectedNarrative === "Myth Busting" && `What false belief or misconception about ${selectedPillar.toLowerCase()} can you clarify or debunk?`}
                          {selectedNarrative === "List Format" && `Create a list of key lessons, tips, or things you've learned about ${selectedPillar.toLowerCase()}.`}
                          {selectedNarrative === "Question-Based" && `What important questions about ${selectedPillar.toLowerCase()} aren't being asked or answered enough?`}
                        </p>
                      </div>
                      <Textarea
                        value={userExperience}
                        onChange={(e) => setUserExperience(e.target.value)}
                        placeholder={
                          selectedNarrative === "Personal Experience" ? `Example: I used to think ${selectedPillar.toLowerCase()} was all about... but then I discovered...` :
                          selectedNarrative === "Before / After" ? `Example: Before focusing on ${selectedPillar.toLowerCase()}, I was... Now I'm...` :
                          selectedNarrative === "Mistakes / Lessons" ? `Example: My biggest mistake with ${selectedPillar.toLowerCase()} was... Here's what I learned...` :
                          selectedNarrative === "How-To / Process" ? `Example: Here's my exact process for ${selectedPillar.toLowerCase()}: Step 1...` :
                          selectedNarrative === "My Opinion / Hot Take" ? `Example: Unpopular opinion about ${selectedPillar.toLowerCase()}: Most people think... but I believe...` :
                          selectedNarrative === "Beginner Advice" ? `Example: If you're new to ${selectedPillar.toLowerCase()}, start with... Don't worry about...` :
                          selectedNarrative === "Advanced / Insider Tips" ? `Example: What most people don't know about ${selectedPillar.toLowerCase()} is...` :
                          selectedNarrative === "Problem → Solution" ? `Example: I struggled with [specific problem in ${selectedPillar.toLowerCase()}] until I tried...` :
                          selectedNarrative === "Comparison" ? `Example: I tried [option A] vs [option B] in ${selectedPillar.toLowerCase()}, and here's what I found...` :
                          selectedNarrative === "Routine / Day-in-the-Life" ? `Example: My daily ${selectedPillar.toLowerCase()} routine looks like...` :
                          selectedNarrative === "Storytelling" ? `Example: Let me tell you about the time when ${selectedPillar.toLowerCase()}...` :
                          selectedNarrative === "Social Proof / Validation" ? `Example: After implementing [approach] in ${selectedPillar.toLowerCase()}, I saw... People told me...` :
                          selectedNarrative === "POV" ? `Example: POV: You're trying to improve your ${selectedPillar.toLowerCase()} but...` :
                          selectedNarrative === "Reaction" ? `Example: Everyone says [common belief about ${selectedPillar.toLowerCase()}], but here's my take...` :
                          selectedNarrative === "Myth Busting" ? `Example: The myth that ${selectedPillar.toLowerCase()} requires... is completely false. Here's why...` :
                          selectedNarrative === "List Format" ? `Example: 5 things I learned about ${selectedPillar.toLowerCase()}: 1)...` :
                          selectedNarrative === "Question-Based" ? `Example: Why does no one talk about [specific aspect of ${selectedPillar.toLowerCase()}]?` :
                          `Share your insights about ${selectedPillar.toLowerCase()}...`
                        }
                        className="min-h-[150px] text-base resize-none"
                      />
                    </div>

                    {/* AI Idea Generator Section */}
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border-2 border-purple-200">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">AI Idea Generator</h4>
                          <p className="text-sm text-gray-600">Generate 10 ideas for {selectedPillar} using {selectedNarrative}</p>
                        </div>
                      </div>

                      {!isGeneratingIdeas && generatedIdeas.length === 0 && (
                        <Button
                          onClick={() => {
                            setIsGeneratingIdeas(true);
                            // Simulate AI generation - replace with actual API call
                            // In real implementation, pass userExperience to AI API
                            setTimeout(() => {
                              setGeneratedIdeas([
                                `My experience with ${selectedPillar.toLowerCase()} that changed everything`,
                                `What I wish I knew about ${selectedPillar.toLowerCase()} before starting`,
                                `The ${selectedPillar.toLowerCase()} mistake that taught me the most`,
                                `How I transformed my ${selectedPillar.toLowerCase()} in 30 days`,
                                `The truth about ${selectedPillar.toLowerCase()} no one talks about`,
                                `Why your ${selectedPillar.toLowerCase()} routine isn't working`,
                                `3 ${selectedPillar.toLowerCase()} habits that actually work`,
                                `The ${selectedPillar.toLowerCase()} secret that changed my life`,
                                `Stop doing this if you care about your ${selectedPillar.toLowerCase()}`,
                                `My ${selectedPillar.toLowerCase()} journey: from struggle to success`,
                              ]);
                              setIsGeneratingIdeas(false);
                            }, 2000);
                          }}
                          disabled={!userExperience.trim()}
                          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Ideas
                        </Button>
                      )}

                      {isGeneratingIdeas && (
                        <div className="text-center py-12">
                          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-500 mb-4"></div>
                          <p className="text-gray-600 font-medium">Generating ideas...</p>
                        </div>
                      )}

                      {generatedIdeas.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 mb-4">Click any idea to turn it into a content card.</p>
                          {generatedIdeas.map((idea, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-purple-400 transition-all group cursor-pointer"
                              onClick={() => {
                                const newCard: ProductionCard = {
                                  id: `card-${Date.now()}-${index}`,
                                  title: idea,
                                  columnId: 'ideate',
                                  isCompleted: false,
                                  isNew: true,
                                };
                                setColumns((prev) =>
                                  prev.map((col) =>
                                    col.id === 'ideate' ? { ...col, cards: [...col.cards, newCard] } : col
                                  )
                                );
                                setIsAngleDialogOpen(false);
                                setIsIdeateDialogOpen(false);
                                setIdeateMode(null);
                                setShowAIGenerator(false);
                                setSelectedNarrative("");
                                setGeneratedIdeas([]);
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 group-hover:bg-purple-500 flex items-center justify-center transition-colors mt-0.5">
                                  <span className="text-xs font-bold text-purple-600 group-hover:text-white">{index + 1}</span>
                                </div>
                                <p className="text-gray-800 font-medium flex-1">{idea}</p>
                                <Plus className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0" />
                              </div>
                            </motion.div>
                          ))}
                          <Button
                            onClick={() => {
                              setGeneratedIdeas([]);
                              setIsGeneratingIdeas(true);
                              setTimeout(() => {
                                setGeneratedIdeas([
                                  `My ${selectedPillar.toLowerCase()} routine that actually works`,
                                  `The biggest ${selectedPillar.toLowerCase()} myths debunked`,
                                  `How I prioritize ${selectedPillar.toLowerCase()} as a busy person`,
                                  `${selectedPillar} tips from someone who struggled for years`,
                                  `What ${selectedPillar.toLowerCase()} looks like when you do it right`,
                                  `The ${selectedPillar.toLowerCase()} advice I'd give my younger self`,
                                  `Why ${selectedPillar.toLowerCase()} is more important than you think`,
                                  `My unconventional approach to ${selectedPillar.toLowerCase()}`,
                                  `${selectedPillar} mistakes everyone makes (and how to avoid them)`,
                                  `The ${selectedPillar.toLowerCase()} practice that saved me`,
                                ]);
                                setIsGeneratingIdeas(false);
                              }, 2000);
                            }}
                            variant="outline"
                            className="w-full mt-4 border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate More Ideas
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Pillars Cascade Dialog */}
        <Dialog open={isPillarsDialogOpen} onOpenChange={(open) => {
          setIsPillarsDialogOpen(open);
          if (!open) {
            // Close both Pillars dialog and Content Ideation dialog
            setIsIdeateDialogOpen(false);
            setSelectedUserPillar("");
            setSubCategories([]);
            setSelectedSubCategory("");
            setCascadeIdeas([]);
          }
        }}>
          <DialogContent className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] border-0 shadow-2xl p-0 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 h-full overflow-y-auto">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-3 text-base mb-4">
                <button
                  onClick={() => {
                    setIsPillarsDialogOpen(false);
                    setIsIdeateDialogOpen(false);
                  }}
                  className="text-gray-500 hover:text-emerald-600 transition-colors font-medium"
                >
                  Production
                </button>
                <span className="text-gray-400">/</span>
                <button
                  onClick={() => setIsPillarsDialogOpen(false)}
                  className="text-gray-500 hover:text-emerald-600 transition-colors font-medium"
                >
                  Content Ideation
                </button>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-semibold">Pillars × Formats</span>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Content Pillars</h3>
                <p className="text-sm text-gray-600">
                  Content pillars are the core themes or topics your content revolves around. They help you stay focused and build authority in specific areas.
                </p>
              </div>

              {/* Step 1: Pillars */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Your Content Pillars</h4>
                <div className="flex flex-wrap gap-3 mb-4">
                  {userPillars.map((pillar, index) => (
                    <div key={index} className="relative group">
                      <div
                        onClick={async () => {
                          if (selectedUserPillar !== pillar) {
                            setSelectedUserPillar(pillar);
                            setSelectedSubCategory("");
                            setCascadeIdeas([]);
                            setSubCategories([]); // Clear old sub-categories immediately
                            setIsGeneratingSubCategories(true);

                            try {
                              // TODO: Replace with actual AI API call
                              // const response = await fetch('/api/generate-subcategories', {
                              //   method: 'POST',
                              //   headers: { 'Content-Type': 'application/json' },
                              //   body: JSON.stringify({ pillar })
                              // });
                              // const data = await response.json();
                              // setSubCategories(data.subcategories);

                              // Temporary: Simulate AI generation with smart defaults
                              await new Promise(resolve => setTimeout(resolve, 800));
                              const pillarLower = pillar.toLowerCase();
                              let subCats: string[] = [];

                              // Only provide example sub-categories for Wellness pillar
                              // Users should add their own sub-categories for other pillars
                              if (pillarLower.includes("wellness")) {
                                subCats = ["Nutrition", "Exercise", "Mental Health", "Skincare", "Sleep"];
                              } else {
                                // Empty array - users will add their own sub-categories
                                subCats = [];
                              }

                              setSubCategories(subCats);
                            } catch (error) {
                              console.error('Error generating subcategories:', error);
                              setSubCategories([]);
                            } finally {
                              setIsGeneratingSubCategories(false);
                            }
                          }
                        }}
                        className={cn(
                          "px-6 py-3 rounded-xl font-medium transition-all cursor-pointer",
                          selectedUserPillar === pillar
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                            : "bg-white border-2 border-emerald-200 text-gray-800 hover:border-emerald-400 hover:shadow-md"
                        )}
                      >
                        <input
                          type="text"
                          value={pillar}
                          onChange={(e) => {
                            const newPillars = [...userPillars];
                            newPillars[index] = e.target.value;
                            setUserPillars(newPillars);
                          }}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                              if (selectedUserPillar !== pillar) {
                                setSelectedUserPillar(pillar);
                                setSelectedSubCategory("");
                                setCascadeIdeas([]);
                                setSubCategories([]); // Clear old sub-categories immediately
                                setIsGeneratingSubCategories(true);

                                try {
                                  await new Promise(resolve => setTimeout(resolve, 800));
                                  const pillarLower = pillar.toLowerCase();
                                  let subCats: string[] = [];

                                  // Only provide example sub-categories for Wellness pillar
                                  // Users should add their own sub-categories for other pillars
                                  if (pillarLower.includes("wellness")) {
                                    subCats = ["Nutrition", "Exercise", "Mental Health", "Skincare", "Sleep"];
                                  } else {
                                    // Empty array - users will add their own sub-categories
                                    subCats = [];
                                  }

                                  setSubCategories(subCats);
                                } catch (error) {
                                  console.error('Error generating subcategories:', error);
                                  setSubCategories([]);
                                } finally {
                                  setIsGeneratingSubCategories(false);
                                }
                              }
                            }
                          }}
                          onFocus={async (e) => {
                            e.stopPropagation();
                            if (selectedUserPillar !== pillar) {
                              setSelectedUserPillar(pillar);
                              setSelectedSubCategory("");
                              setCascadeIdeas([]);
                              setSubCategories([]); // Clear old sub-categories immediately
                              setIsGeneratingSubCategories(true);

                              try {
                                // Temporary: Simulate AI generation with smart defaults
                                await new Promise(resolve => setTimeout(resolve, 800));
                                const pillarLower = pillar.toLowerCase();
                                let subCats: string[] = [];

                                // Only provide example sub-categories for Wellness pillar
                                // Users should add their own sub-categories for other pillars
                                if (pillarLower.includes("wellness")) {
                                  subCats = ["Nutrition", "Exercise", "Mental Health", "Skincare", "Sleep"];
                                } else {
                                  // Empty array - users will add their own sub-categories
                                  subCats = [];
                                }

                                setSubCategories(subCats);
                              } catch (error) {
                                console.error('Error generating subcategories:', error);
                                setSubCategories([]);
                              } finally {
                                setIsGeneratingSubCategories(false);
                              }
                            }
                          }}
                          onMouseDown={(e) => {
                            if (document.activeElement === e.currentTarget) {
                              e.stopPropagation();
                            }
                          }}
                          className={cn(
                            "bg-transparent border-none outline-none text-center min-w-[80px] max-w-[200px] cursor-pointer",
                            selectedUserPillar === pillar ? "text-white placeholder:text-white/70" : "text-gray-800 placeholder:text-gray-400"
                          )}
                          placeholder="Enter pillar name"
                          size={pillar.length || 10}
                        />
                      </div>
                      {pillar.toLowerCase().includes("wellness") && (
                        <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
                          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            Sample
                          </span>
                        </div>
                      )}
                      {userPillars.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUserPillars(userPillars.filter((_, i) => i !== index));
                          }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 hover:bg-gray-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setUserPillars([...userPillars, `Pillar ${userPillars.length + 1}`])}
                    className="px-6 py-3 rounded-xl font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all border-2 border-dashed border-emerald-300"
                  >
                    + Add Pillar
                  </button>
                </div>
              </div>

              {/* Step 2: Sub-categories (appear when pillar is selected) */}
              {selectedUserPillar && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">
                    {selectedUserPillar} Sub-categories
                  </h4>
                  {isGeneratingSubCategories ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-500"></div>
                      <span className="ml-3 text-gray-600">Generating sub-categories...</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {subCategories.map((subCat, index) => (
                        <div
                          key={index}
                          className="relative group"
                        >
                          <button
                            onClick={async (e) => {
                              // Check if click is on input - if so, don't trigger the handler
                              if ((e.target as HTMLElement).tagName === 'INPUT') {
                                return;
                              }

                              if (selectedSubCategory === subCat) {
                                return;
                              }

                              setSelectedSubCategory(subCat);
                              setCascadeIdeas([]); // Clear old ideas immediately
                              setIsGeneratingCascadeIdeas(true);

                              try {
                                // TODO: Replace with actual AI API call
                                // const response = await fetch('/api/generate-content-ideas', {
                                //   method: 'POST',
                                //   headers: { 'Content-Type': 'application/json' },
                                //   body: JSON.stringify({
                                //     pillar: selectedUserPillar,
                                //     subcategory: subCat
                                //   })
                                // });
                                // const data = await response.json();
                                // setCascadeIdeas(data.ideas);

                                // Temporary: Generate contextually unique ideas based on sub-category
                                await new Promise(resolve => setTimeout(resolve, 800));
                                const subCatLower = subCat.toLowerCase();
                                let ideas: string[] = [];

                                // Universal smart idea generator that works for ANY subcategory
                                // Creates contextually relevant ideas by incorporating the topic naturally
                                ideas = [
                                  `How I got started with ${subCatLower}`,
                                  `My ${subCatLower} routine that actually works`,
                                  "The method that gave me real results",
                                  "What I wish I knew before starting",
                                  `My daily approach to ${subCatLower}`,
                                  "The mistakes I made and how I fixed them",
                                  "How I stay consistent week after week",
                                  `The ${subCatLower} strategy that changed everything`,
                                  "3 things that made the biggest difference",
                                  "My step-by-step process explained",
                                  "How I track progress and stay motivated",
                                  "The tools and resources I actually use",
                                  "What works vs what's just noise",
                                  "My before and after transformation",
                                  "The science and strategy behind my approach",
                                  "How I overcame the biggest challenges",
                                  "Quick wins you can implement today",
                                  "My honest experience and lessons learned",
                                  "The framework I follow every time",
                                  "Why this completely changed my life"
                                ];

                                // Shuffle and take only first 10 ideas
                                const shuffled = ideas.sort(() => Math.random() - 0.5);
                                setCascadeIdeas(shuffled.slice(0, 10));
                              } catch (error) {
                                console.error('Error generating content ideas:', error);
                                setCascadeIdeas([]);
                              } finally {
                                setIsGeneratingCascadeIdeas(false);
                              }
                            }}
                            className={cn(
                              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center",
                              selectedSubCategory === subCat
                                ? "bg-teal-500 text-white shadow-md"
                                : "bg-white border border-gray-300 text-gray-700 hover:border-teal-400 hover:bg-teal-50"
                            )}
                          >
                            <input
                              type="text"
                              value={subCat}
                              onChange={(e) => {
                                const newSubCats = [...subCategories];
                                newSubCats[index] = e.target.value;
                                setSubCategories(newSubCats);
                              }}
                              onKeyDown={async (e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur();
                                  if (selectedSubCategory !== subCat) {
                                    setSelectedSubCategory(subCat);
                                    setCascadeIdeas([]); // Clear old ideas immediately
                                    setIsGeneratingCascadeIdeas(true);

                                    try {
                                      await new Promise(resolve => setTimeout(resolve, 800));
                                      const subCatLower = subCat.toLowerCase();
                                      let ideas: string[] = [];

                                      // Universal smart idea generator that works for ANY subcategory
                                      // Creates contextually relevant ideas by incorporating the topic naturally
                                      ideas = [
                                        `How I got started with ${subCatLower}`,
                                        `My ${subCatLower} routine that actually works`,
                                        "The method that gave me real results",
                                        "What I wish I knew before starting",
                                        `My daily approach to ${subCatLower}`,
                                        "The mistakes I made and how I fixed them",
                                        "How I stay consistent week after week",
                                        `The ${subCatLower} strategy that changed everything`,
                                        "3 things that made the biggest difference",
                                        "My step-by-step process explained",
                                        "How I track progress and stay motivated",
                                        "The tools and resources I actually use",
                                        "What works vs what's just noise",
                                        "My before and after transformation",
                                        "The science and strategy behind my approach",
                                        "How I overcame the biggest challenges",
                                        "Quick wins you can implement today",
                                        "My honest experience and lessons learned",
                                        "The framework I follow every time",
                                        "Why this completely changed my life"
                                      ];

                                      const shuffled = ideas.sort(() => Math.random() - 0.5);
                                      setCascadeIdeas(shuffled.slice(0, 10));
                                    } catch (error) {
                                      console.error('Error generating content ideas:', error);
                                      setCascadeIdeas([]);
                                    } finally {
                                      setIsGeneratingCascadeIdeas(false);
                                    }
                                  }
                                }
                              }}
                              onFocus={async (e) => {
                                e.stopPropagation();
                                if (selectedSubCategory !== subCat) {
                                  setSelectedSubCategory(subCat);
                                  setCascadeIdeas([]); // Clear old ideas immediately
                                  setIsGeneratingCascadeIdeas(true);

                                  try {
                                    await new Promise(resolve => setTimeout(resolve, 800));
                                    const subCatLower = subCat.toLowerCase();
                                    let ideas: string[] = [];

                                    // Universal smart idea generator that works for ANY subcategory
                                    // Creates contextually relevant ideas by incorporating the topic naturally
                                    ideas = [
                                      `How I got started with ${subCatLower}`,
                                      `My ${subCatLower} routine that actually works`,
                                      "The method that gave me real results",
                                      "What I wish I knew before starting",
                                      `My daily approach to ${subCatLower}`,
                                      "The mistakes I made and how I fixed them",
                                      "How I stay consistent week after week",
                                      `The ${subCatLower} strategy that changed everything`,
                                      "3 things that made the biggest difference",
                                      "My step-by-step process explained",
                                      "How I track progress and stay motivated",
                                      "The tools and resources I actually use",
                                      "What works vs what's just noise",
                                      "My before and after transformation",
                                      "The science and strategy behind my approach",
                                      "How I overcame the biggest challenges",
                                      "Quick wins you can implement today",
                                      "My honest experience and lessons learned",
                                      "The framework I follow every time",
                                      "Why this completely changed my life"
                                    ];

                                    const shuffled = ideas.sort(() => Math.random() - 0.5);
                                    setCascadeIdeas(shuffled.slice(0, 10));
                                  } catch (error) {
                                    console.error('Error generating content ideas:', error);
                                    setCascadeIdeas([]);
                                  } finally {
                                    setIsGeneratingCascadeIdeas(false);
                                  }
                                }
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              className={cn(
                                "bg-transparent border-none outline-none text-center min-w-[80px] max-w-[200px] cursor-pointer",
                                selectedSubCategory === subCat ? "text-white placeholder:text-white/70" : "text-gray-700 placeholder:text-gray-400"
                              )}
                              size={subCat.length || 10}
                            />
                          </button>
                          {subCategories.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSubCategories(subCategories.filter((_, i) => i !== index));
                                if (selectedSubCategory === subCat) {
                                  setSelectedSubCategory("");
                                  setCascadeIdeas([]);
                                }
                              }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 hover:bg-gray-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all text-xs flex items-center justify-center"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newSubCat = `Sub-category ${subCategories.length + 1}`;
                          setSubCategories([...subCategories, newSubCat]);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-100 text-teal-700 hover:bg-teal-200 transition-all border-2 border-dashed border-teal-300"
                      >
                        + Add Sub-Category
                      </button>
                    </div>
                  )}
                  {selectedUserPillar.toLowerCase().includes("wellness") && !isGeneratingSubCategories && (
                    <div className="mt-4 flex justify-start">
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        Sample Sub-categories
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Content Ideas (appear when sub-category is selected) */}
              {selectedSubCategory && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">
                    Content Ideas for {selectedSubCategory}
                  </h4>
                  {isGeneratingCascadeIdeas ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-200 border-t-teal-500"></div>
                      <span className="ml-3 text-gray-600 font-medium">Generating content ideas...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence initial={false}>
                        {cascadeIdeas.map((idea, index) => (
                          <motion.div
                            key={idea}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                              opacity: 1,
                              x: 0,
                              scale: addedIdeaText === idea ? 1.02 : 1
                            }}
                            exit={{
                              opacity: 0,
                              x: 400,
                              scale: 0.8,
                              rotate: 5,
                              transition: { duration: 0.6, ease: "easeOut" }
                            }}
                            transition={{
                              duration: 0.3,
                              layout: { duration: 0.4, ease: "easeInOut" }
                            }}
                            className={cn(
                              "relative w-full flex items-center justify-between gap-3 p-4 rounded-lg border-2 group",
                              addedIdeaText === idea
                                ? "bg-green-100 border-green-500 shadow-lg"
                                : "bg-white border-gray-200 hover:border-teal-400 hover:shadow-md"
                            )}
                          >
                            <span className="text-sm text-gray-800 font-medium flex-1">{idea}</span>
                            <Button
                              size="sm"
                              onClick={() => {
                                const newCard: ProductionCard = {
                                  id: `card-${Date.now()}-${index}`,
                                  title: idea,
                                  columnId: 'ideate',
                                  isCompleted: false,
                                  isNew: true,
                                };
                                setColumns((prev) =>
                                  prev.map((col) =>
                                    col.id === 'ideate' ? { ...col, cards: [...col.cards, newCard] } : col
                                  )
                                );
                                // Show success state briefly before removing
                                setAddedIdeaText(idea);
                                setTimeout(() => {
                                  // Remove the idea from the list (triggers exit animation)
                                  setCascadeIdeas((prev) => prev.filter((i) => i !== idea));
                                  setAddedIdeaText(null);
                                }, 500);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-teal-500 hover:bg-teal-600 text-white text-xs px-3 py-1.5 h-auto whitespace-nowrap"
                            >
                              Add to Content Cards
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Generate More Ideas Button */}
                      {cascadeIdeas.length > 0 && (
                        <button
                          onClick={async () => {
                            setIsGeneratingMoreIdeas(true);
                            try {
                              await new Promise(resolve => setTimeout(resolve, 800));
                              const subCatLower = selectedSubCategory.toLowerCase();
                              let ideas: string[] = [];

                              if (subCatLower.includes("nutrition") || subCatLower.includes("meal")) {
                                ideas = ["What I eat in a day for optimal performance", "My meal prep routine that saves me 10 hours weekly", "Foods I stopped eating and why", "How I balance enjoying food and staying healthy", "My go-to high-protein meals", "The supplement stack that actually works", "Nutrition myths I used to believe", "My favorite healthy recipes", "How I meal plan without getting overwhelmed", "The macros breakdown I wish I knew earlier", "Grocery haul and what I buy weekly", "Restaurant hacks for eating healthy", "My cheat meals and how I approach them", "Hydration tips that changed my energy levels", "Foods for better sleep and recovery", "The nutrition mistake everyone makes", "How I track my food intake", "Budget-friendly nutrition tips", "Pre and post-workout nutrition explained", "The truth about [popular diet trend]"];
                              } else if (subCatLower.includes("exercise") || subCatLower.includes("workout") || subCatLower.includes("training")) {
                                ideas = ["My current workout split explained", "How I built workout consistency", "Form mistakes I see at the gym", "My favorite exercises for each muscle group", "How I track progressive overload", "Workout routine for busy schedules", "The exercises I removed from my routine", "My warm-up routine that prevents injuries", "How I structure my training week", "Home workout alternatives to gym exercises", "My recovery routine between workouts", "Training mistakes I made as a beginner", "How I stay motivated on tough days", "The workout split that gave me best results", "Exercise modifications for beginners", "How I program deload weeks", "My gym bag essentials", "Training myths debunked", "How long rest periods should actually be", "The truth about cardio vs strength training"];
                              } else if (subCatLower.includes("mental health") || subCatLower.includes("mindfulness") || subCatLower.includes("stress")) {
                                ideas = ["My morning routine for better mental clarity", "How I manage anxiety without medication", "Therapy lessons I apply daily", "My journaling practice explained", "Signs I need a mental health day", "Boundaries I set for better mental health", "My meditation practice and how I started", "How I deal with overwhelming thoughts", "Apps and tools I use for mental wellness", "The mindset shift that changed everything", "How I process difficult emotions", "My self-care routine when I'm struggling", "Red flags I ignore in my mental health", "How I talk to myself differently now", "The toxic positivity trap explained", "My support system and how I built it", "Coping mechanisms that actually work", "How I prioritize mental health at work", "Things I do when I feel burnout coming", "The mental health resources I swear by"];
                              } else if (subCatLower.includes("sleep") || subCatLower.includes("recovery") || subCatLower.includes("rest")) {
                                ideas = ["My sleep routine for better rest", "How I optimized my bedroom for sleep", "Things I stopped doing before bed", "My wind-down routine explained", "Sleep supplements I actually use", "How I track my sleep quality", "The sleep mistake ruining your gains", "My morning routine after a bad night", "How I fixed my sleep schedule", "Power nap strategy that works", "Sleep hygiene rules I follow", "How I deal with insomnia naturally", "The temperature I keep my room at", "My recovery protocol between hard days", "Active vs passive recovery explained", "How I know when to take a rest day", "Tools I use for better recovery", "The connection between sleep and performance", "My weekend recovery routine", "Sleep myths keeping you tired"];
                              } else {
                                ideas = [`My honest experience with ${subCatLower}`, `5 signs you need to prioritize ${subCatLower}`, `Before and after I focused on ${subCatLower}`, `The biggest mistakes I made with ${subCatLower}`, `My step-by-step approach to ${subCatLower}`, `Unpopular opinion about ${subCatLower}`, `Beginner's guide to ${subCatLower}`, `Advanced tips for ${subCatLower}`, `Quick wins for better ${subCatLower}`, `My daily ${subCatLower} routine`, `What happened when I tried ${subCatLower}`, `Why everyone should care about ${subCatLower}`, `POV: your ${subCatLower} journey`, `Reacting to ${subCatLower} trends`, `Myths about ${subCatLower} debunked`, `3 things that transformed my ${subCatLower}`, `Questions I had about ${subCatLower}`, `The ${subCatLower} habit that changed my life`, `What to avoid when starting ${subCatLower}`, `Resources for improving ${subCatLower}`];
                              }

                              // Filter out ideas already shown and shuffle
                              const newIdeas = ideas.filter(idea => !cascadeIdeas.includes(idea));
                              const shuffled = newIdeas.sort(() => Math.random() - 0.5);
                              setCascadeIdeas([...cascadeIdeas, ...shuffled.slice(0, 10)]);
                            } catch (error) {
                              console.error('Error generating more ideas:', error);
                            } finally {
                              setIsGeneratingMoreIdeas(false);
                            }
                          }}
                          disabled={isGeneratingMoreIdeas}
                          className="w-full mt-4 px-4 py-3 rounded-lg text-sm font-medium bg-teal-50 text-teal-700 hover:bg-teal-100 transition-all border-2 border-dashed border-teal-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGeneratingMoreIdeas ? (
                            <span className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-200 border-t-teal-500 mr-2"></div>
                              Generating...
                            </span>
                          ) : (
                            "+ Generate 10 More Ideas"
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Hooks Dialog */}
        <TitleHookSuggestions
          onSelectHook={handleSelectHook}
          externalOpen={showHooksDialog}
          onExternalOpenChange={setShowHooksDialog}
        />

        {/* Idea Expander Dialog */}
        <Dialog open={isIdeaExpanderOpen} onOpenChange={(open) => {
          setIsIdeaExpanderOpen(open);
          if (!open) {
            // Close both Idea Expander and Content Ideation dialogs
            setIsIdeateDialogOpen(false);
            setIdeaExpanderText("");
            setExpandedAngles([]);
          }
        }}>
          <DialogContent className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] overflow-hidden border-0 shadow-2xl flex flex-col">
            <DialogHeader className="flex-shrink-0">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-3 text-base mb-4">
                <button
                  onClick={() => {
                    setIsIdeaExpanderOpen(false);
                    setIsIdeateDialogOpen(false);
                  }}
                  className="text-gray-500 hover:text-orange-600 transition-colors font-medium"
                >
                  Production
                </button>
                <span className="text-gray-400">/</span>
                <button
                  onClick={() => setIsIdeaExpanderOpen(false)}
                  className="text-gray-500 hover:text-orange-600 transition-colors font-medium"
                >
                  Content Ideation
                </button>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-semibold">Idea Expander</span>
              </div>

              <div className="mb-3">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                  Idea Expander
                </DialogTitle>
              </div>
              <DialogDescription className="text-gray-500">
                Enter your idea and get multiple content angles to explore
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 pr-2 py-4">
              <div className="space-y-6">
                {/* User Input Section */}
                <div className="space-y-3">
                  <Textarea
                    value={ideaExpanderText}
                    onChange={(e) => setIdeaExpanderText(e.target.value)}
                    placeholder="Enter your content idea here... For example: 'morning routine for productivity', 'sustainable fashion tips', 'home workout guide'"
                    className="min-h-[120px] border-2 focus:ring-2 focus:ring-orange-500 rounded-lg resize-none text-base p-4"
                  />
                  <Button
                    onClick={handleGenerateAngles}
                    disabled={!ideaExpanderText.trim() || isGeneratingAngles}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg shadow-md"
                  >
                    {isGeneratingAngles ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating Angles...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Generate Different Angles
                      </div>
                    )}
                  </Button>
                </div>

                {/* AI Generated Angles Section */}
                {expandedAngles.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">Different Angles</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <AnimatePresence initial={false}>
                        {expandedAngles.map((angle) => (
                          <motion.div
                            key={angle}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                              opacity: 1,
                              x: 0,
                              scale: addedAngleText === angle ? 1.02 : 1
                            }}
                            exit={{
                              opacity: 0,
                              x: 400,
                              scale: 0.8,
                              rotate: 5,
                              transition: { duration: 0.6, ease: "easeOut" }
                            }}
                            transition={{
                              duration: 0.3,
                              layout: { duration: 0.4, ease: "easeInOut" }
                            }}
                            className={cn(
                              "relative group text-left p-4 border-2 rounded-lg flex items-center justify-between gap-3",
                              addedAngleText === angle
                                ? "bg-orange-100 border-orange-500 shadow-lg"
                                : "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 hover:border-orange-400 hover:shadow-md"
                            )}
                          >
                            <p className="text-sm text-gray-700 font-medium flex-1">
                              {angle}
                            </p>
                            <Button
                              size="sm"
                              onClick={() => handleSelectAngle(angle)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-xs px-3 py-1.5 h-auto whitespace-nowrap"
                            >
                              Add to Content Cards
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* More Ideas Button */}
                    {expandedAngles.length < getAllAngleTemplates(ideaExpanderText).length && (
                      <Button
                        onClick={handleGenerateMoreAngles}
                        disabled={isGeneratingAngles}
                        className="w-full mt-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-orange-200 hover:border-orange-400 rounded-lg"
                        variant="outline"
                      >
                        {isGeneratingAngles ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                            Loading More Ideas...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Generate More Ideas
                          </div>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                {/* Empty State */}
                {expandedAngles.length === 0 && ideaExpanderText.trim() && !isGeneratingAngles && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Click "Generate Different Angles" to see content ideas</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* What Worked → What's Next Dialog */}
        <Dialog open={isWhatWorkedDialogOpen} onOpenChange={(open) => {
          setIsWhatWorkedDialogOpen(open);
          if (!open) {
            setWwContentSubmitted(false);
            setWwShowAudienceSignals(false);
            setIsIdeateDialogOpen(false);
          }
        }}>
          <DialogContent className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] overflow-hidden border-0 shadow-2xl flex flex-col bg-gradient-to-br from-blue-50 via-white to-sky-50">
            <DialogHeader className="flex-shrink-0 pt-6 px-4">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent mb-2">
                {whatWorkedStep === 'input' ? 'What Worked → What\'s Next' : 'Your Remix Ideas'}
              </DialogTitle>
              {whatWorkedStep === 'input' && (
                <p className="text-gray-600 text-base">
                  Turn winning content patterns into fresh ideas
                </p>
              )}
            </DialogHeader>

            {whatWorkedStep === 'input' ? (
              <div className="flex-1 overflow-y-auto pr-6 pb-4 pl-4">
                <div className="space-y-6">
                  {/* Content Reference - Only show if not submitted */}
                  {!wwContentSubmitted && (
                  <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 rounded-lg p-5">
                    <div className="flex items-center gap-1.5 mb-4">
                      <div className="w-0.5 h-3.5 bg-sky-500 rounded-full"></div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Content Reference
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={wwContentLink}
                          onChange={(e) => setWwContentLink(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter' && wwContentLink.trim() && !wwAnalyzing) {
                              await handleContentSubmit();
                            }
                          }}
                          placeholder="Paste link (Instagram, TikTok, YouTube...)"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-colors"
                          disabled={wwAnalyzing}
                        />
                        {wwContentLink.trim() && !wwContentSubmitted && (
                          <button
                            onClick={handleContentSubmit}
                            disabled={wwAnalyzing}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-sky-600 text-white rounded text-xs font-medium hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {wwAnalyzing ? 'Analyzing...' : 'Continue'}
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="px-3 bg-white text-gray-400 uppercase tracking-wide">or</span>
                        </div>
                      </div>
                      <label className="flex items-center justify-center gap-2 w-full px-3 py-2.5 border border-dashed border-gray-300 rounded-md cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition-all text-sm text-gray-600">
                        <span className="text-gray-400">📎</span>
                        {wwVideoFile ? wwVideoFile.name : 'Upload video file'}
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setWwVideoFile(file);
                            if (file) {
                              setWwContentSubmitted(true);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  )}

                  {/* Content Preview - Show after submission */}
                  {wwContentSubmitted && (wwContentLink.trim() || wwVideoFile) && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
                        <h3 className="text-base font-semibold text-gray-900">Content Preview</h3>
                      </div>
                      <button
                        onClick={() => {
                          setWwContentLink('');
                          setWwVideoFile(null);
                          setWwContentSubmitted(false);
                          setWwThumbnailUrl('');
                          setWwShowAudienceSignals(false);
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                      >
                        Change content
                      </button>
                    </div>

                    {/* Two Column Layout: Embed + Form */}
                    <div className="flex gap-6">
                      {/* Thumbnail/Embed Container */}
                      <div className="flex-shrink-0">
                      {wwVideoFile ? (
                        <div className="rounded-xl overflow-hidden shadow-lg bg-black" style={{ maxWidth: '400px' }}>
                          <video
                            src={URL.createObjectURL(wwVideoFile)}
                            controls
                            className="w-full h-auto"
                          />
                        </div>
                      ) : wwContentLink.includes('instagram.com') ? (
                        <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left', paddingTop: '60px', position: 'relative' }}>
                          <blockquote
                            className="instagram-media"
                            data-instgrm-captioned
                            data-instgrm-permalink={wwContentLink}
                            data-instgrm-version="14"
                            style={{
                              background: '#FFF',
                              border: '0',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                              margin: '0',
                              maxWidth: '540px',
                              minWidth: '326px',
                              padding: '0',
                              width: '100%',
                              position: 'relative',
                              top: '-60px'
                            }}
                          >
                            <a href={wwContentLink} target="_blank" rel="noopener noreferrer">
                              View this post on Instagram
                            </a>
                          </blockquote>
                          {typeof window !== 'undefined' && (window as any).instgrm && (window as any).instgrm.Embeds && (window as any).instgrm.Embeds.process()}
                        </div>
                      ) : wwContentLink.includes('tiktok.com') ? (
                        <div style={{ transform: 'scale(0.85)', transformOrigin: 'top left' }}>
                          <blockquote
                            className="tiktok-embed"
                            cite={wwContentLink}
                            data-video-id={wwContentLink.split('/video/')[1]?.split('?')[0]}
                            style={{ maxWidth: '605px', minWidth: '325px' }}
                          >
                            <a href={wwContentLink} target="_blank" rel="noopener noreferrer">
                              View this video on TikTok
                            </a>
                          </blockquote>
                          {typeof window !== 'undefined' && (window as any).tiktok && (window as any).tiktok.embed && (window as any).tiktok.embed.process()}
                        </div>
                      ) : (wwContentLink.includes('youtube.com') || wwContentLink.includes('youtu.be')) ? (() => {
                        const videoId = wwContentLink.includes('youtube.com')
                          ? new URLSearchParams(wwContentLink.split('?')[1]).get('v')
                          : wwContentLink.split('youtu.be/')[1]?.split('?')[0];
                        return videoId ? (
                          <div className="rounded-xl overflow-hidden shadow-lg" style={{ maxWidth: '400px' }}>
                            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                              <iframe
                                className="absolute top-0 left-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        ) : null;
                      })() : (
                        <div className="rounded-xl shadow-lg bg-white p-6 text-center" style={{ maxWidth: '400px' }}>
                          <a
                            href={wwContentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 underline break-all"
                          >
                            {wwContentLink}
                          </a>
                        </div>
                      )}
                      </div>

                      {/* AI-Generated Content Analysis - Right Side */}
                      <div className="flex-1 min-w-0">
                        {wwAnalyzing ? (
                          <div className="bg-white rounded-lg p-6 text-center">
                            <div className="animate-pulse flex flex-col items-center gap-3">
                              <div className="w-12 h-12 bg-indigo-200 rounded-full"></div>
                              <div className="h-4 w-48 bg-indigo-100 rounded"></div>
                              <div className="h-3 w-64 bg-indigo-50 rounded"></div>
                            </div>
                            <p className="text-sm text-gray-600 mt-4">Analyzing content with Claude AI...</p>
                          </div>
                        ) : wwContentSubmitted && !wwAnalysisComplete ? (
                          <div className="bg-white rounded-lg p-6">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📸</span>
                              </div>
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload Screenshot</h4>
                              <p className="text-sm text-gray-600 mb-6">Upload a screenshot of the content so Claude can analyze it</p>
                              <label className="inline-block px-6 py-3 bg-sky-600 text-white rounded-lg cursor-pointer hover:bg-sky-700 transition-colors font-medium">
                                Choose Screenshot
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    try {
                                      setWwAnalyzing(true);
                                      toast.loading('Analyzing screenshot with Claude...');

                                      // Convert file to base64
                                      const reader = new FileReader();
                                      reader.onloadend = async () => {
                                        try {
                                          const base64String = (reader.result as string).split(',')[1];

                                          // Call analyze-content API with base64 image
                                          const analyzeResponse = await fetch('http://localhost:3001/api/analyze-content', {
                                            method: 'POST',
                                            headers: {
                                              'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({
                                              imageData: base64String,
                                              mediaType: file.type,
                                              contentType: 'screenshot'
                                            })
                                          });

                                          if (!analyzeResponse.ok) {
                                            const errorData = await analyzeResponse.json();
                                            throw new Error(errorData.error || 'Failed to analyze screenshot');
                                          }

                                          const analysisData = await analyzeResponse.json();
                                          const content = analysisData.content[0].text;

                                          // Parse JSON from response
                                          const jsonMatch = content.match(/\{[\s\S]*\}/);
                                          if (!jsonMatch) {
                                            throw new Error('Could not parse analysis from response');
                                          }

                                          const analysis = JSON.parse(jsonMatch[0]);

                                          // Populate state with analysis results
                                          setWwPillar(analysis.pillar || '');
                                          setWwFormat(analysis.format || '');
                                          setWwDeliveryStyle(analysis.deliveryStyle || '');
                                          setWwHookType(analysis.hook || '');
                                          setWwComments(analysis.comments || '');
                                          setWwContextSummary(analysis.summary || '');

                                          setWwAnalysisComplete(true);
                                          setWwShowAudienceSignals(true);

                                          toast.dismiss();
                                          toast.success('Screenshot analyzed successfully!');
                                        } catch (error) {
                                          console.error('Error analyzing screenshot:', error);
                                          toast.dismiss();
                                          toast.error('Failed to analyze screenshot. Please try again.');
                                        } finally {
                                          setWwAnalyzing(false);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    } catch (error) {
                                      console.error('Error reading file:', error);
                                      toast.error('Failed to read file');
                                      setWwAnalyzing(false);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        ) : wwAnalysisComplete ? (
                          <div className="space-y-6">
                            <div className="bg-white rounded-lg p-4">
                              {/* AI-Generated Content Summary */}
                              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                                <div className="flex items-center gap-1.5 mb-3">
                                  <div className="w-0.5 h-4 bg-indigo-500 rounded-full"></div>
                                  <h4 className="text-sm font-semibold text-gray-900">
                                    AI Analysis
                                  </h4>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-xs text-gray-600 mb-1">Topic</p>
                                    <p className="text-sm font-medium text-gray-900">{wwPillar}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600 mb-1">Format</p>
                                    <p className="text-sm font-medium text-gray-900">{wwFormat}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600 mb-1">Delivery Style</p>
                                    <p className="text-sm font-medium text-gray-900">{wwDeliveryStyle}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600 mb-1">Hook</p>
                                    <p className="text-sm font-medium text-gray-900">{wwHookType}</p>
                                  </div>
                                  {wwComments && (
                                    <div>
                                      <p className="text-xs text-gray-600 mb-1">Audience Response</p>
                                      <p className="text-sm font-medium text-gray-900">{wwComments}</p>
                                    </div>
                                  )}
                                  {wwContextSummary && (
                                    <div className="mt-4 pt-4 border-t border-indigo-200">
                                      <p className="text-xs text-gray-600 mb-1.5">What Makes It Work</p>
                                      <p className="text-sm text-gray-700 leading-relaxed">{wwContextSummary}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Give it your twist - Show after analysis is complete */}
                            {wwShowAudienceSignals && (
                            <div className="bg-white rounded-lg p-4">
                            <div className="flex items-center gap-1.5 mb-3">
                              <div className="w-0.5 h-4 bg-purple-500 rounded-full"></div>
                              <h4 className="text-sm font-semibold text-gray-900">
                                Give it a twist
                              </h4>
                            </div>
                            <textarea
                              value={wwTwist}
                              onChange={(e) => setWwTwist(e.target.value)}
                              placeholder="Describe how you'd like to twist it. Would you change the topic? The format? The hook? What else?"
                              rows={7}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                            />

                            {/* Generate Ideas Button */}
                            <button
                              onClick={async () => {
                                if (!wwTwist.trim()) {
                                  toast.error('Please describe your twist first');
                                  return;
                                }

                                try {
                                  toast.loading('Generating creative ideas with Claude...');

                                  const prompt = `You are a creative content strategist. Generate 10 unique and actionable content ideas based on the following information:

ORIGINAL CONTENT CONTEXT:
- Topic/Pillar: ${wwPillar}
- Format: ${wwFormat}
- Delivery Style: ${wwDeliveryStyle}
- Hook Used: ${wwHookType}
${wwComments ? `- Audience Response: ${wwComments}` : ''}

USER'S TWIST:
${wwTwist}

IMPORTANT: Pay close attention to the user's twist description. Generate ideas that specifically incorporate and honor what they want to change or try differently.

For each of the 10 ideas, provide:
1. A catchy, specific title (not generic)
2. A variation type (e.g., "Format Shift", "New Angle", "Audience-Driven")
3. A detailed, actionable description (2-3 sentences) that explains exactly what to create and how it incorporates the twist

Format your response as a JSON array with this structure:
[
  {
    "title": "Specific idea title here",
    "variation": "Type of variation",
    "description": "Detailed actionable description..."
  }
]

Make each idea unique, creative, and directly tied to both the original content context and the user's specific twist.`;

                                  const response = await fetch('http://localhost:3001/api/generate-ideas', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ prompt })
                                  });

                                  if (!response.ok) {
                                    const errorData = await response.json();
                                    throw new Error(errorData.error || `API error: ${response.status}`);
                                  }

                                  const data = await response.json();
                                  const content = data.content[0].text;

                                  // Parse JSON from response
                                  const jsonMatch = content.match(/\[[\s\S]*\]/);
                                  if (!jsonMatch) {
                                    throw new Error('Could not parse ideas from response');
                                  }

                                  const ideasArray = JSON.parse(jsonMatch[0]);
                                  const ideas = ideasArray.map((idea: any, index: number) => ({
                                    id: `idea-${index + 1}`,
                                    title: idea.title,
                                    variation: idea.variation,
                                    description: idea.description
                                  }));

                                  setWwRemixIdeas(ideas);
                                  setWhatWorkedStep('generate');
                                  toast.dismiss();
                                  toast.success(`Generated ${ideas.length} creative ideas!`);
                                } catch (error) {
                                  console.error('Error generating ideas:', error);
                                  toast.dismiss();
                                  toast.error('Failed to generate ideas. Please check your API key and try again.');
                                }
                              }}
                              className="w-full mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                              <Sparkles className="w-5 h-5" />
                              Generate Ideas
                            </button>
                            </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Remove old Audience Signals section */}
                  {false && wwContentSubmitted && (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Audience Signals <span className="text-red-500 text-sm">* Select 1-2</span>
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {['Saved a lot', 'Shared a lot', 'Lots of comments', 'Strong watch time (felt addictive)', 'All of the above'].map((signal) => (
                        <button
                          key={signal}
                          onClick={() => {
                            if (wwSelectedSignals.includes(signal)) {
                              setWwSelectedSignals(wwSelectedSignals.filter(s => s !== signal));
                            } else {
                              if (wwSelectedSignals.length < 2 || signal === 'All of the above') {
                                setWwSelectedSignals([signal]);
                              } else {
                                setWwSelectedSignals([...wwSelectedSignals.slice(0, 1), signal]);
                              }
                            }
                          }}
                          className={cn(
                            "px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 text-left border-2",
                            wwSelectedSignals.includes(signal)
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-600 shadow-md"
                              : "bg-white text-gray-700 border-emerald-200 hover:border-emerald-400 hover:shadow-sm"
                          )}
                        >
                          {signal}
                        </button>
                      ))}
                    </div>
                  </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 py-4 px-4">
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {wwRemixIdeas.map((idea, index) => (
                      <motion.div
                        key={idea.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border-2 border-purple-200 hover:border-purple-400 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1.5 rounded-full">
                                {idea.variation}
                              </span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">{idea.title}</h4>
                            <p className="text-base text-gray-700 leading-relaxed">{idea.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-5">
                          <Button
                            onClick={() => {
                              addContentCard(idea.title);
                              toast.success('Saved to Content Cards!');
                            }}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                          >
                            💾 Save to Content Cards
                          </Button>
                          <Button
                            variant="outline"
                            className="flex items-center gap-2 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 rounded-lg"
                          >
                            ✏️ Edit
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="flex-shrink-0 border-t pt-5 mt-5">
                  <Button
                    onClick={() => {
                      setWhatWorkedStep('input');
                      setWwContentLink('');
                      setWwVideoFile(null);
                      setWwPillar('');
                      setWwFormat('');
                      setWwDeliveryStyle('');
                      setWwHookType('');
                      setWwComments('');
                      setWwSelectedSignals([]);
                      setWwContentSubmitted(false);
                      setWwShowAudienceSignals(false);
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white py-6 text-lg font-semibold shadow-md hover:shadow-lg transition-all rounded-lg"
                  >
                    ➕ Capture Another
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Script Editor Dialog */}
        <Dialog open={isScriptEditorOpen} onOpenChange={(open) => {
          if (!open) {
            setIsScriptEditorOpen(false);
            setEditingScriptCard(null);
            setCardTitle("");
            setCardHook("");
            setScriptContent("");
            setPlatformTags([]);
            setFormatTags([]);
            setPlatformInput("");
            setFormatInput("");
            setLocationChecked(false);
            setLocationText("");
            setOutfitChecked(false);
            setOutfitText("");
            setPropsChecked(false);
            setPropsText("");
            setFilmingNotes("");
            setCardStatus(null);
          }
        }}>
          <DialogContent className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] overflow-hidden border-0 shadow-2xl flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6 space-y-6">
              {/* Title - borderless, no label */}
              <input
                ref={titleInputRef}
                type="text"
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                onFocus={(e) => e.target.setSelectionRange(0, 0)}
                autoComplete="off"
                placeholder="Content title..."
                className="w-full px-0 py-2 text-2xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-gray-300"
              />

              {/* Format and Platform Tags - Side by Side */}
              <div className="grid grid-cols-2 gap-6">
                {/* Format Tags */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Format
                  </label>
                  <input
                    type="text"
                    value={formatInput}
                    onChange={(e) => setFormatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFormatTag();
                      }
                    }}
                    placeholder="e.g., Carousel, Vlog"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  {formatTags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {formatTags.map((tag, idx) => {
                        const colors = getFormatColors(tag);
                        return (
                          <span
                            key={idx}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${colors.bg} ${colors.text} text-sm font-medium`}
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveFormatTag(tag)}
                              className={`${colors.hover} rounded-full p-0.5 transition-colors`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Platform Tags */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Platform
                  </label>
                  <input
                    type="text"
                    value={platformInput}
                    onChange={(e) => setPlatformInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPlatformTag();
                      }
                    }}
                    placeholder="e.g., Instagram, TikTok"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {platformTags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {platformTags.map((tag, idx) => {
                        const colors = getPlatformColors(tag);
                        return (
                          <span
                            key={idx}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${colors.bg} ${colors.text} text-sm font-medium`}
                          >
                            {tag}
                            <button
                              onClick={() => handleRemovePlatformTag(tag)}
                              className={`${colors.hover} rounded-full p-0.5 transition-colors`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Talking Points Area */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Talking Points
                </label>
                <Textarea
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  placeholder="Write your content script here..."
                  className="min-h-[350px] resize-none border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm leading-relaxed"
                />
              </div>

              {/* Filming Checklist */}
              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-700">
                  Filming Checklist
                </label>

                {/* Location */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={locationChecked}
                    onCheckedChange={(checked) => setLocationChecked(checked as boolean)}
                    className="flex-shrink-0 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <span className="text-sm font-medium text-gray-600 w-20">Location</span>
                  <input
                    ref={locationInputRef}
                    type="text"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        outfitInputRef.current?.focus();
                      }
                    }}
                    placeholder="Where do you want to shoot this content?"
                    className={`flex-1 px-0 py-2 bg-transparent border-0 text-sm focus:outline-none focus:ring-0 placeholder:text-gray-300 transition-colors ${!locationText ? 'border-b border-gray-200 focus:border-b-blue-500' : ''}`}
                  />
                </div>

                {/* Outfit */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={outfitChecked}
                    onCheckedChange={(checked) => setOutfitChecked(checked as boolean)}
                    className="flex-shrink-0 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <span className="text-sm font-medium text-gray-600 w-20">Outfit</span>
                  <input
                    ref={outfitInputRef}
                    type="text"
                    value={outfitText}
                    onChange={(e) => setOutfitText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        propsInputRef.current?.focus();
                      }
                    }}
                    placeholder="What do you want to wear?"
                    className={`flex-1 px-0 py-2 bg-transparent border-0 text-sm focus:outline-none focus:ring-0 placeholder:text-gray-300 transition-colors ${!outfitText ? 'border-b border-gray-200 focus:border-b-blue-500' : ''}`}
                  />
                </div>

                {/* Props */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={propsChecked}
                    onCheckedChange={(checked) => setPropsChecked(checked as boolean)}
                    className="flex-shrink-0 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <span className="text-sm font-medium text-gray-600 w-20">Props</span>
                  <input
                    ref={propsInputRef}
                    type="text"
                    value={propsText}
                    onChange={(e) => setPropsText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        notesInputRef.current?.focus();
                      }
                    }}
                    placeholder="What props do you need?"
                    className={`flex-1 px-0 py-2 bg-transparent border-0 text-sm focus:outline-none focus:ring-0 placeholder:text-gray-300 transition-colors ${!propsText ? 'border-b border-gray-200 focus:border-b-blue-500' : ''}`}
                  />
                </div>

                {/* Notes and Reminders */}
                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium text-gray-600">
                    Notes & Reminders
                  </label>
                  <Textarea
                    ref={notesInputRef}
                    value={filmingNotes}
                    onChange={(e) => setFilmingNotes(e.target.value)}
                    placeholder="Add any additional notes or reminders..."
                    className="min-h-[100px] resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-sm placeholder:text-gray-300"
                  />
                </div>

                {/* Status Section */}
                <div className="space-y-3 mt-6">
                  <label className="text-sm font-semibold text-gray-700">
                    Status
                  </label>

                  {/* To Start */}
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={cardStatus === 'to-start'}
                      onCheckedChange={(checked) => setCardStatus(checked ? 'to-start' : null)}
                      className="flex-shrink-0 data-[state=checked]:bg-gray-500 data-[state=checked]:border-gray-500"
                    />
                    <span className="text-sm font-medium text-gray-600">To start</span>
                  </div>

                  {/* Needs More Work */}
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={cardStatus === 'needs-work'}
                      onCheckedChange={(checked) => setCardStatus(checked ? 'needs-work' : null)}
                      className="flex-shrink-0 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                    />
                    <span className="text-sm font-medium text-gray-600">Needs more work</span>
                  </div>

                  {/* Ready to Film */}
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={cardStatus === 'ready'}
                      onCheckedChange={(checked) => setCardStatus(checked ? 'ready' : null)}
                      className="flex-shrink-0 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <span className="text-sm font-medium text-gray-600">Ready to film</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => {
                  setIsScriptEditorOpen(false);
                  setEditingScriptCard(null);
                  setCardTitle("");
                  setCardHook("");
                  setScriptContent("");
                  setPlatformTags([]);
                  setFormatTags([]);
                  setPlatformInput("");
                  setFormatInput("");
                  setLocationChecked(false);
                  setLocationText("");
                  setOutfitChecked(false);
                  setOutfitText("");
                  setPropsChecked(false);
                  setPropsText("");
                  setFilmingNotes("");
                  setCardStatus(null);
                }}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveScript}
                className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Production;
