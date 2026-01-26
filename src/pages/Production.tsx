import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreVertical, Trash2, Pencil, Sparkles, Check, Plus, ArrowLeft, Lightbulb, Pin, Clapperboard, Video, Circle, Wrench, CheckCircle2, Camera, CheckSquare, Scissors, PlayCircle, PenLine, CalendarDays, X, Maximize2, PartyPopper, Archive, FolderOpen, ChevronRight, RefreshCw, Compass, TrendingUp, BarChart3, Zap } from "lucide-react";
import { SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine, RiPushpinFill } from "react-icons/ri";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { StorageKeys, getString, setString, remove } from "@/lib/storage";
import { EVENTS, emit, on } from "@/lib/events";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import TitleHookSuggestions from "@/components/content/TitleHookSuggestions";
import ScriptEditorDialog from "./production/components/ScriptEditorDialog";
import ContentFlowProgress from "./production/components/ContentFlowProgress";
import ContentFlowDialog from "./production/components/ContentFlowDialog";
import BrainDumpGuidanceDialog from "./production/components/BrainDumpGuidanceDialog";
import { KanbanColumn, ProductionCard, StoryboardScene, EditingChecklist, SchedulingStatus } from "./production/types";
import StoryboardEditorDialog from "./production/components/StoryboardEditorDialog";
import EditChecklistDialog from "./production/components/EditChecklistDialog";
import ExpandedScheduleView from "./production/components/ExpandedScheduleView";
import ArchiveDialog from "./production/components/ArchiveDialog";
import { columnColors, cardColors, defaultColumns } from "./production/utils/productionConstants";
import { getAllAngleTemplates, getFormatColors, getPlatformColors } from "./production/utils/productionHelpers";

// Platform icon helper - returns icon component for each platform
const getPlatformIcon = (platform: string): React.ReactNode => {
  const lowercased = platform.toLowerCase();
  const iconClass = "w-3.5 h-3.5 text-[#8B7082]";

  if (lowercased.includes("youtube")) {
    return <SiYoutube className={iconClass} />;
  }
  if (lowercased.includes("tiktok") || lowercased === "tt") {
    return <SiTiktok className={iconClass} />;
  }
  if (lowercased.includes("instagram") || lowercased === "ig") {
    return <SiInstagram className={iconClass} />;
  }
  if (lowercased.includes("facebook")) {
    return <SiFacebook className={iconClass} />;
  }
  if (lowercased.includes("linkedin")) {
    return <SiLinkedin className={iconClass} />;
  }
  if (lowercased.includes("twitter") || lowercased.includes("x.com") || lowercased.includes("x /")) {
    return <RiTwitterXLine className={iconClass} />;
  }
  if (lowercased.includes("threads")) {
    return <RiThreadsLine className={iconClass} />;
  }
  return null;
};

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
    <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-[#8B7082] shadow-md">
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const columnRefs = useRef<Map<string, HTMLDivElement>>(new Map());
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
  const [highlightedColumn, setHighlightedColumn] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const textRefs = useRef<Map<string, HTMLElement>>(new Map());
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isIdeateDialogOpen, setIsIdeateDialogOpen] = useState(false);
  const [isIdeateCardEditorOpen, setIsIdeateCardEditorOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [editingIdeateCard, setEditingIdeateCard] = useState<ProductionCard | null>(null);
  const [ideateCardTitle, setIdeateCardTitle] = useState("");
  const [ideateCardNotes, setIdeateCardNotes] = useState("");
  const [selectedIdeateCard, setSelectedIdeateCard] = useState<ProductionCard | null>(null);
  const [ideateMode, setIdeateMode] = useState<'brainstorm' | 'guidance' | 'pillarsformats' | null>(null);
  const [brainstormText, setBrainstormText] = useState("");
  const [showHooksDialog, setShowHooksDialog] = useState(false);
  const [isIdeaExpanderOpen, setIsIdeaExpanderOpen] = useState(false);
  const [ideaExpanderText, setIdeaExpanderText] = useState("");
  const [expandedAngles, setExpandedAngles] = useState<string[]>([]);
  const [isGeneratingAngles, setIsGeneratingAngles] = useState(false);

  // Script editor modal state
  const [isScriptEditorOpen, setIsScriptEditorOpen] = useState(false);
  const [editingScriptCard, setEditingScriptCard] = useState<ProductionCard | null>(null);

  // Storyboard editor modal state
  const [isStoryboardDialogOpen, setIsStoryboardDialogOpen] = useState(false);
  const [editingStoryboardCard, setEditingStoryboardCard] = useState<ProductionCard | null>(null);

  // Edit checklist modal state
  const [isEditChecklistDialogOpen, setIsEditChecklistDialogOpen] = useState(false);
  const [editingEditCard, setEditingEditCard] = useState<ProductionCard | null>(null);

  // Schedule expanded view state
  const [isScheduleColumnExpanded, setIsScheduleColumnExpanded] = useState(false);
  const [schedulingCard, setSchedulingCard] = useState<ProductionCard | null>(null);

  // Unified Content Flow Dialog state (for seamless transitions between steps)
  const [activeContentFlowStep, setActiveContentFlowStep] = useState<number | null>(null);
  const [contentFlowCard, setContentFlowCard] = useState<ProductionCard | null>(null);

  // Archive state - load from localStorage
  const [archivedCards, setArchivedCards] = useState<ProductionCard[]>(() => {
    const saved = getString(StorageKeys.archivedContent);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [lastArchivedCard, setLastArchivedCard] = useState<{ card: ProductionCard; sourceColumnId: string } | null>(null);
  const [brainDumpSuggestion, setBrainDumpSuggestion] = useState<string>("");


  // Highlighted unscheduled card state
  const [highlightedUnscheduledCardId, setHighlightedUnscheduledCardId] = useState<string | null>(null);

  // Recently repurposed card highlight
  const [recentlyRepurposedCardId, setRecentlyRepurposedCardId] = useState<string | null>(null);

  // Planned to scheduled conversion dialog state
  const [showPlannedToScheduledDialog, setShowPlannedToScheduledDialog] = useState(false);
  const [pendingScheduleMove, setPendingScheduleMove] = useState<{
    card: ProductionCard;
    dropPosition: { columnId: string; index: number };
    sourceColumnId: string;
  } | null>(null);
  const [showBrainDumpSuggestion, setShowBrainDumpSuggestion] = useState(false);
  const [cardTitle, setCardTitle] = useState("");

  // Planning state for Ideate cards
  const [planningCardId, setPlanningCardId] = useState<string | null>(null);
  const [cardHook, setCardHook] = useState("");
  const [scriptContent, setScriptContent] = useState("");
  const [platformTags, setPlatformTags] = useState<string[]>([]);
  const [formatTags, setFormatTags] = useState<string[]>([]);
  const [platformInput, setPlatformInput] = useState("");
  const [formatInput, setFormatInput] = useState("");
  const [customFormatInput, setCustomFormatInput] = useState("");
  const [showCustomFormatInput, setShowCustomFormatInput] = useState(false);
  const [customPlatformInput, setCustomPlatformInput] = useState("");
  const [showCustomPlatformInput, setShowCustomPlatformInput] = useState(false);
  const [customVideoFormats, setCustomVideoFormats] = useState<string[]>([]);
  const [customPhotoFormats, setCustomPhotoFormats] = useState<string[]>([]);
  // Filming checklist state
  const [locationChecked, setLocationChecked] = useState(false);
  const [locationText, setLocationText] = useState("");
  const [outfitChecked, setOutfitChecked] = useState(false);
  const [outfitText, setOutfitText] = useState("");
  const [propsChecked, setPropsChecked] = useState(false);
  const [propsText, setPropsText] = useState("");
  const [filmingNotes, setFilmingNotes] = useState("");
  const [cardStatus, setCardStatus] = useState<'to-start' | 'needs-work' | 'ready'>('to-start');
  // Refs for filming checklist navigation
  const titleInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const outfitInputRef = useRef<HTMLInputElement>(null);
  const propsInputRef = useRef<HTMLInputElement>(null);
  const notesInputRef = useRef<HTMLTextAreaElement>(null);
  const deletedCardRef = useRef<{ card: ProductionCard; columnId: string; index: number } | null>(null);
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

  // Check for highlighted unscheduled card and show it
  useEffect(() => {
    const highlightedCardId = getString(StorageKeys.highlightedUnscheduledCard);
    if (highlightedCardId) {
      setHighlightedUnscheduledCardId(highlightedCardId);
      // Clear from storage immediately
      remove(StorageKeys.highlightedUnscheduledCard);
      // Remove highlight after 4 seconds
      const timer = setTimeout(() => {
        setHighlightedUnscheduledCardId(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-hide undo archive button after 8 seconds
  useEffect(() => {
    if (lastArchivedCard) {
      const timer = setTimeout(() => {
        setLastArchivedCard(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [lastArchivedCard]);

  // Listen for openArchiveDialog event from toast notifications
  useEffect(() => {
    const cleanup = on(window, EVENTS.openArchiveDialog, () => {
      setIsArchiveDialogOpen(true);
    });
    return cleanup;
  }, []);

  // Listen for contentArchived event from calendar views
  useEffect(() => {
    const cleanup = on(window, EVENTS.contentArchived, (event) => {
      const { card } = event.detail || {};
      if (card) {
        setArchivedCards((prev) => [card, ...prev]);
      }
    });
    return cleanup;
  }, []);

  // Save archived cards to localStorage when they change
  useEffect(() => {
    setString(StorageKeys.archivedContent, JSON.stringify(archivedCards));
  }, [archivedCards]);

  // Clear drop indicators when drag ends
  useEffect(() => {
    if (!draggedCard) {
      setDropPosition(null);
      setDraggedOverColumn(null);
      isDraggingRef.current = false;
    }
  }, [draggedCard]);

  // Global dragend and mouseup listeners as safety net
  useEffect(() => {
    const clearDragState = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setDraggedCard(null);
        setDropPosition(null);
        setDraggedOverColumn(null);
      }
    };

    document.addEventListener('dragend', clearDragState);
    document.addEventListener('mouseup', clearDragState);
    document.addEventListener('drop', clearDragState);

    return () => {
      document.removeEventListener('dragend', clearDragState);
      document.removeEventListener('mouseup', clearDragState);
      document.removeEventListener('drop', clearDragState);
    };
  }, []);

  // Handle scrolling to specific column from URL parameter
  useEffect(() => {
    const scrollToColumn = searchParams.get('scrollTo');
    if (scrollToColumn && columnRefs.current.has(scrollToColumn)) {
      // Wait for DOM to be fully rendered
      setTimeout(() => {
        const columnElement = columnRefs.current.get(scrollToColumn);
        if (columnElement) {
          columnElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          // Highlight the column briefly
          setHighlightedColumn(scrollToColumn);
          setTimeout(() => setHighlightedColumn(null), 2000);
        }
      }, 300);
    }
  }, [searchParams]);

  // Load Bank of Ideas from localStorage
  useEffect(() => {
    const savedBankIdeas = getString(StorageKeys.bankOfIdeas);
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
      setString(StorageKeys.bankOfIdeas, JSON.stringify(bankIdeas));
    }
  }, [bankIdeas]);

  // Load data from localStorage
  useEffect(() => {
    const savedData = getString(StorageKeys.productionKanban);
    if (savedData) {
      try {
        const savedColumns = JSON.parse(savedData);
        // Merge saved cards with current default column titles (in case titles changed)
        setColumns(defaultColumns.map(defaultCol => {
          const savedCol = savedColumns.find((sc: KanbanColumn) => sc.id === defaultCol.id);
          return {
            ...defaultCol,
            cards: savedCol?.cards || [],
          };
        }));
      } catch (error) {
        console.error("Failed to load production data:", error);
      }
    }
  }, []);

  // Save data to localStorage whenever columns change
  useEffect(() => {
    setString(StorageKeys.productionKanban, JSON.stringify(columns));
    // Emit event so other pages (like Dashboard) can update
    emit(window, EVENTS.productionKanbanUpdated, columns);
  }, [columns]);

  // Listen for column updates from other components (like ExpandedScheduleView calendar)
  useEffect(() => {
    const cleanup = on(window, EVENTS.productionKanbanUpdated, (event) => {
      // Only reload if the event came from a different source (like calendar)
      if (event.detail?.source === 'calendar') {
        const savedData = getString(StorageKeys.productionKanban);
        if (savedData) {
          try {
            const savedColumns = JSON.parse(savedData);
            setColumns(defaultColumns.map(defaultCol => {
              const savedCol = savedColumns.find((sc: KanbanColumn) => sc.id === defaultCol.id);
              return {
                ...defaultCol,
                cards: savedCol?.cards || [],
              };
            }));
          } catch (error) {
            console.error("Failed to reload production data:", error);
          }
        }
      }
    });
    return cleanup;
  }, []);

  // Clean up any cards with empty titles or missing IDs
  useEffect(() => {
    const hasInvalidCards = columns.some(col =>
      col.cards.some(card => !card.id || !card.title || !card.title.trim())
    );

    if (hasInvalidCards) {
      setColumns(prev =>
        prev.map(col => ({
          ...col,
          cards: col.cards.filter(card => card.id && card.title && card.title.trim()),
        }))
      );
    }
  }, []);

  // Clear drop position when drag ends (safety net)
  useEffect(() => {
    if (!draggedCard && dropPosition) {
      setDropPosition(null);
      setDraggedOverColumn(null);
    }
  }, [draggedCard, dropPosition]);

  // Remove isNew flag after closing content ideation dialogs and viewing cards
  useEffect(() => {
    // Trigger when closing either the Pillars dialog or the Content Ideation dialog (Bank of Ideas)
    if (!isPillarsDialogOpen && !isIdeateDialogOpen) {
      const hasNewCards = columns.some(col =>
        col.cards.some(card => card.isNew)
      );

      if (hasNewCards) {
        // Wait 5 seconds after closing dialog to let user observe the new cards
        const timer = setTimeout(() => {
          setColumns(prev =>
            prev.map(col => ({
              ...col,
              cards: col.cards.map(card => ({ ...card, isNew: false, addedFrom: undefined })),
            }))
          );
        }, 5000);

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
    isDraggingRef.current = true;
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    setDraggedCard(null);
    setDraggedOverColumn(null);
    setDropPosition(null);
    setDropIndicator(null);
  };

  const handleCardDragOver = (e: React.DragEvent, columnId: string, cardIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    // Check ref first (synchronous) to prevent late events after drop
    if (!isDraggingRef.current || !draggedCard) return;

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

    // Check ref first (synchronous) to prevent late events after drop
    if (!isDraggingRef.current || !draggedCard) return;

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

    // Immediately mark drag as ended (synchronous)
    isDraggingRef.current = false;

    // Always clear drop indicators immediately
    setDropPosition(null);
    setDraggedOverColumn(null);

    if (!draggedCard || !dropPosition) {
      setDraggedCard(null);
      return;
    }

    // Save the drop position before clearing state
    const savedDropPosition = { ...dropPosition };
    const actualTargetColumnId = savedDropPosition.columnId;

    const sourceColumn = columns.find((col) =>
      col.cards.some((card) => card.id === draggedCard.id)
    );
    const sourceColumnId = sourceColumn?.id;

    if (!sourceColumn) {
      setDraggedCard(null);
      return;
    }

    // Prevent moving cards back to Ideate from other columns
    if (actualTargetColumnId === "ideate" && sourceColumnId !== "ideate") {
      toast.error("Content cannot be moved back to Ideation", {
        description: "Once content moves forward in your workflow, it stays on that path. Start fresh with a new idea instead.",
      });
      setDraggedCard(null);
      return;
    }

    // Check if moving a card with planned date to "to-schedule" column
    if (actualTargetColumnId === "to-schedule" && draggedCard.plannedDate && sourceColumnId !== "to-schedule") {
      // Store the pending move and show the dialog
      setPendingScheduleMove({
        card: draggedCard,
        dropPosition: savedDropPosition,
        sourceColumnId: sourceColumnId,
      });
      setShowPlannedToScheduledDialog(true);
      setDraggedCard(null);
      return;
    }

    // Handle archiving when dropped on Posted column
    if (actualTargetColumnId === "posted") {
      const cardToArchive = {
        ...draggedCard,
        columnId: "posted",
        isPinned: false,
        archivedAt: new Date().toISOString()
      };

      // Store for undo
      const undoInfo = { card: draggedCard, sourceColumnId: sourceColumnId };
      setLastArchivedCard(undoInfo);

      // Remove from source column
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.filter((c) => c.id !== draggedCard.id),
        }))
      );

      // Add to archived cards
      setArchivedCards((prev) => [cardToArchive, ...prev]);
      setDraggedCard(null);
      return;
    }

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
        // Auto-set status when moving between columns
        // Auto-unpin if moving to 'posted' column (finished work shouldn't be on dashboard)
        let cardToAdd = { ...draggedCard, columnId: column.id };

        // Set status to 'to-start' if moving to shape-ideas column and card doesn't already have a status
        if (column.id === 'shape-ideas' && !draggedCard.status) {
          cardToAdd = { ...cardToAdd, status: 'to-start' as const };
        }

        // Auto-set filming status to 'to-start' when moving to 'to-film' column
        if (column.id === 'to-film') {
          cardToAdd = { ...cardToAdd, status: 'to-start' as const };
        }

        if (column.id === 'posted' && draggedCard.isPinned) {
          cardToAdd = { ...cardToAdd, isPinned: false };
          toast.info("Auto-unpinned", {
            description: "Posted content is removed from your dashboard"
          });
        }

        // Auto-set editing status to 'to-start-editing' when moving to 'to-edit' column
        if (column.id === 'to-edit') {
          cardToAdd = {
            ...cardToAdd,
            editingChecklist: {
              ...cardToAdd.editingChecklist,
              items: cardToAdd.editingChecklist?.items || [],
              notes: cardToAdd.editingChecklist?.notes || '',
              externalLinks: cardToAdd.editingChecklist?.externalLinks || [],
              status: 'to-start-editing' as const
            }
          };
        }

        // Auto-set scheduling status to 'to-schedule' when moving to 'to-schedule' column
        if (column.id === 'to-schedule') {
          cardToAdd = {
            ...cardToAdd,
            schedulingStatus: 'to-schedule' as const
          };
        }
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
    // Find the card and its position before deleting
    let deletedCard: ProductionCard | null = null;
    let deletedColumnId: string | null = null;
    let deletedIndex: number = -1;

    columns.forEach((col) => {
      const index = col.cards.findIndex((card) => card.id === cardId);
      if (index !== -1) {
        deletedCard = col.cards[index];
        deletedColumnId = col.id;
        deletedIndex = index;
      }
    });

    if (deletedCard && deletedColumnId !== null) {
      // Store the deleted card info for potential undo
      deletedCardRef.current = {
        card: deletedCard,
        columnId: deletedColumnId,
        index: deletedIndex,
      };

      // Remove the card
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.filter((card) => card.id !== cardId),
        }))
      );

      // Show toast with undo option
      toast("Card deleted", {
        description: deletedCard.hook || deletedCard.title || "Untitled card",
        action: {
          label: "Undo",
          onClick: () => {
            if (deletedCardRef.current) {
              const { card, columnId, index } = deletedCardRef.current;
              setColumns((prev) =>
                prev.map((col) => {
                  if (col.id === columnId) {
                    const newCards = [...col.cards];
                    // Insert at original position, or at end if position no longer valid
                    const insertIndex = Math.min(index, newCards.length);
                    newCards.splice(insertIndex, 0, card);
                    return { ...col, cards: newCards };
                  }
                  return col;
                })
              );
              deletedCardRef.current = null;
              toast.success("Card restored");
            }
          },
        },
        duration: 7000,
      });
    }
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

  const handleTogglePin = (cardId: string) => {
    setColumns((prev) => {
      const newColumns = prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) => {
          if (card.id === cardId) {
            const newPinnedState = !card.isPinned;

            // Check if trying to pin and already at max
            if (newPinnedState) {
              const currentPinnedCount = prev.reduce((count, c) =>
                count + c.cards.filter(card => card.isPinned).length, 0
              );

              if (currentPinnedCount >= 5) {
                toast.error("Maximum reached", {
                  description: "You can only pin up to 5 content cards"
                });
                return card;
              }

              toast.success("Pinned to dashboard", {
                description: "This content will appear in 'Next to Work On'",
                action: {
                  label: "Go to Dashboard",
                  onClick: () => navigate("/")
                }
              });
            } else {
              toast.success("Unpinned", {
                description: "Content removed from dashboard"
              });
            }

            return { ...card, isPinned: newPinnedState };
          }
          return card;
        }),
      }));

      return newColumns;
    });
  };

  // Handler to set planned date for Ideate cards
  const handleSetPlannedDate = (cardId: string, date: Date | undefined) => {
    if (!date) {
      // Clear the planned date
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.map((card) =>
            card.id === cardId
              ? { ...card, plannedDate: undefined, plannedColor: undefined }
              : card
          ),
        }))
      );
      toast.success("Planning removed");
    } else {
      // Set the planned date
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.map((card) =>
            card.id === cardId
              ? { ...card, plannedDate: date.toISOString(), plannedColor: 'violet' as const }
              : card
          ),
        }))
      );
      toast.success("Idea planned", {
        description: `Planned for ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      });
    }
    setPlanningCardId(null);
    setPlanningDate(undefined);
  };

  // Handle the planned-to-scheduled conversion dialog choice
  const handlePlannedToScheduledChoice = (useAsScheduled: boolean) => {
    if (!pendingScheduleMove) return;

    const { card, dropPosition, sourceColumnId } = pendingScheduleMove;

    setColumns((prev) => {
      return prev.map((column) => {
        if (column.id === sourceColumnId) {
          // Remove from source column
          return {
            ...column,
            cards: column.cards.filter((c) => c.id !== card.id),
          };
        } else if (column.id === "to-schedule") {
          // Add to target column with appropriate scheduling
          const filtered = column.cards.filter(
            (c) => c.title && c.title.trim() && !c.title.toLowerCase().includes('add quick idea')
          );

          let cardToAdd: ProductionCard = {
            ...card,
            columnId: "to-schedule",
            schedulingStatus: 'to-schedule' as const,
          };

          if (useAsScheduled && card.plannedDate) {
            // Use the planned date as the scheduled date
            cardToAdd = {
              ...cardToAdd,
              scheduledDate: card.plannedDate,
              schedulingStatus: 'scheduled' as const,
              plannedDate: undefined,
              plannedColor: undefined,
            };
          } else {
            // Clear the planned date, let them schedule manually
            cardToAdd = {
              ...cardToAdd,
              plannedDate: undefined,
              plannedColor: undefined,
            };
          }

          filtered.splice(dropPosition.index, 0, cardToAdd);
          return { ...column, cards: filtered };
        }
        return column;
      });
    });

    if (useAsScheduled && card.plannedDate) {
      toast.success("Scheduled!", {
        description: `Scheduled for ${new Date(card.plannedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      });
    }

    setShowPlannedToScheduledDialog(false);
    setPendingScheduleMove(null);
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
    setCardStatus(card.status || 'to-start');
    setCustomVideoFormats(card.customVideoFormats || []);
    setCustomPhotoFormats(card.customPhotoFormats || []);
    // Check if card has brain dump notes from Ideate column
    // Only show if notes exist AND haven't already been appended to the script
    const notesText = card.description?.trim() || "";
    const scriptText = card.script?.trim() || "";
    const notesAlreadyInScript = notesText && scriptText.includes(notesText);

    if (notesText && !notesAlreadyInScript) {
      setBrainDumpSuggestion(card.description!);
      setShowBrainDumpSuggestion(true);
    } else {
      setBrainDumpSuggestion("");
      setShowBrainDumpSuggestion(false);
    }
    // Use unified content flow dialog
    setContentFlowCard(card);
    setActiveContentFlowStep(2);
  };

  const handleSaveScript = () => {
    if (!editingScriptCard) return;

    // Move card to 'shape-ideas' column (Script step) and update data
    moveCardToColumn(editingScriptCard.id, 'shape-ideas', {
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

    resetScriptEditorState();
  };

  const resetScriptEditorState = () => {
    setIsScriptEditorOpen(false);
    setEditingScriptCard(null);
    setActiveContentFlowStep(null);
    setContentFlowCard(null);
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
    setCardStatus('to-start');
  };

  // Storyboard editor handlers
  const handleOpenStoryboard = (card: ProductionCard) => {
    setEditingStoryboardCard(card);
    // Use unified content flow dialog
    setContentFlowCard(card);
    setActiveContentFlowStep(3);
  };

  const handleSaveStoryboard = (storyboard: StoryboardScene[], title?: string, script?: string, hook?: string, status?: "to-start" | "needs-work" | "ready" | null) => {
    if (!editingStoryboardCard) return;

    // Move card to 'to-film' column (Film step) and update data
    moveCardToColumn(editingStoryboardCard.id, 'to-film', {
      storyboard,
      ...(title !== undefined && { title }),
      ...(script !== undefined && { script }),
      ...(hook !== undefined && { hook }),
      ...(status !== undefined && { status }),
    });

    setEditingStoryboardCard(null);
  };

  // Edit checklist handlers
  const handleOpenEditChecklist = (card: ProductionCard) => {
    setEditingEditCard(card);
    // Use unified content flow dialog
    setContentFlowCard(card);
    setActiveContentFlowStep(4);
  };

  const handleSaveEditChecklist = (checklist: EditingChecklist, title?: string, hook?: string, script?: string) => {
    if (!editingEditCard) return;

    // Move card to 'to-edit' column (Edit step) and update data
    moveCardToColumn(editingEditCard.id, 'to-edit', {
      editingChecklist: checklist,
      ...(title !== undefined && { title }),
      ...(hook !== undefined && { hook }),
      ...(script !== undefined && { script }),
    });

    setEditingEditCard(null);
  };

  const handleScheduleContent = (cardId: string, date: Date) => {
    const dateString = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Extract time from the date object
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Calculate end time (1 hour later)
    const endDate = new Date(date);
    endDate.setHours(endDate.getHours() + 1);
    const endHours = endDate.getHours();
    const endMinutes = endDate.getMinutes();
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    // Format time for toast message
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                schedulingStatus: 'scheduled' as const,
                scheduledDate: dateString,
                scheduledStartTime: startTime,
                scheduledEndTime: endTime,
              }
            : card
        ),
      }))
    );
  };

  const handleUnscheduleContent = (cardId: string) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                schedulingStatus: 'to-schedule' as const,
                scheduledDate: undefined,
                scheduledStartTime: undefined,
                scheduledEndTime: undefined,
              }
            : card
        ),
      }))
    );
  };

  const handleUpdateScheduledColor = (cardId: string, color: 'indigo' | 'rose' | 'amber' | 'emerald' | 'sky' | 'violet' | 'orange' | 'cyan' | 'sage') => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === cardId
            ? { ...card, scheduledColor: color }
            : card
        ),
      }))
    );
  };

  // Repurpose archived content - creates a copy in Script Ideas
  const handleRepurposeContent = (card: ProductionCard) => {
    const newCardId = `card-${Date.now()}`;
    const repurposedCard: ProductionCard = {
      id: newCardId,
      title: card.title,
      hook: card.hook,
      script: card.script,
      platforms: card.platforms,
      formats: card.formats,
      customVideoFormats: card.customVideoFormats,
      customPhotoFormats: card.customPhotoFormats,
      columnId: 'shape-ideas',
      status: 'to-start' as const,
      isCompleted: false,
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === 'shape-ideas'
          ? { ...col, cards: [repurposedCard, ...col.cards] }
          : col
      )
    );

    // Highlight the newly repurposed card
    setRecentlyRepurposedCardId(newCardId);
    setTimeout(() => {
      setRecentlyRepurposedCardId(null);
    }, 5000); // Clear highlight after 5 seconds

    toast.success("Content repurposed! 🔄", {
      description: "A copy has been added to Script Ideas"
    });
  };

  const handleRestoreContent = (card: ProductionCard) => {
    // Remove from archived cards
    setArchivedCards((prev) => prev.filter((c) => c.id !== card.id));

    // Create restored card for to-schedule column
    const restoredCard: ProductionCard = {
      ...card,
      columnId: 'to-schedule',
      archivedAt: undefined,
    };

    // Add to to-schedule column
    setColumns((prev) =>
      prev.map((col) =>
        col.id === 'to-schedule'
          ? { ...col, cards: [restoredCard, ...col.cards] }
          : col
      )
    );

    // Clear the last archived card state if it matches
    if (lastArchivedCard?.card.id === card.id) {
      setLastArchivedCard(null);
    }

    toast.success("Content restored!", {
      description: "Moved back to To Schedule"
    });
  };

  // Delete archived content
  const handleDeleteArchivedContent = (card: ProductionCard) => {
    // Remove from archived cards
    setArchivedCards((prev) => prev.filter((c) => c.id !== card.id));

    toast.success("Content deleted");
  };

  const handleScriptEditorOpenChange = (open: boolean) => {
    if (!open) {
      resetScriptEditorState();
      return;
    }
    setIsScriptEditorOpen(true);
  };

  const handleOpenIdeateCardEditor = (card: ProductionCard) => {
    setEditingIdeateCard(card);
    setIdeateCardTitle(card.title || "");
    setIdeateCardNotes(card.description || "");
    // Use unified content flow dialog
    setContentFlowCard(card);
    setActiveContentFlowStep(1);
  };

  const handleSaveIdeateCard = () => {
    if (!editingIdeateCard) return;

    // Keep card in 'ideate' column (Ideate step) and update data
    moveCardToColumn(editingIdeateCard.id, 'ideate', {
      title: ideateCardTitle,
      description: ideateCardNotes,
    });

    resetIdeateCardEditorState();
  };

  const handleMoveIdeateToScript = () => {
    if (!editingIdeateCard) return;

    // Update the card and move it to shape-ideas column
    const updatedCard: ProductionCard = {
      ...editingIdeateCard,
      title: ideateCardTitle,
      description: ideateCardNotes,
      columnId: 'shape-ideas',
      status: 'to-start' as const,
    };

    setColumns((prev) =>
      prev.map((col) => {
        // Remove from ideate column
        if (col.id === 'ideate') {
          return {
            ...col,
            cards: col.cards.filter((card) => card.id !== editingIdeateCard.id),
          };
        }
        // Add to shape-ideas column
        if (col.id === 'shape-ideas') {
          return {
            ...col,
            cards: [...col.cards, updatedCard],
          };
        }
        return col;
      })
    );

    // Close ideate editor and open script editor
    resetIdeateCardEditorState();
    handleOpenScriptEditor(updatedCard);
  };

  const resetIdeateCardEditorState = () => {
    setIsIdeateCardEditorOpen(false);
    setEditingIdeateCard(null);
    setActiveContentFlowStep(null);
    setContentFlowCard(null);
    setIdeateCardTitle("");
    setIdeateCardNotes("");
  };

  const handleIdeateCardEditorOpenChange = (open: boolean) => {
    if (!open) {
      resetIdeateCardEditorState();
      return;
    }
    setIsIdeateCardEditorOpen(true);
  };

  // Map column ID to workflow step number
  const columnToStep: Record<string, number> = {
    'ideate': 1,
    'shape-ideas': 2,
    'to-film': 3,
    'to-edit': 4,
    'to-schedule': 5,
    'posted': 6,
  };

  const stepToColumn: Record<number, string> = {
    1: 'ideate',
    2: 'shape-ideas',
    3: 'to-film',
    4: 'to-edit',
    5: 'to-schedule',
    6: 'posted',
  };

  // Helper to move a card to a specific column
  const moveCardToColumn = (cardId: string, targetColumnId: string, updatedCardData: Partial<ProductionCard>) => {
    setColumns((prev) => {
      // Find the card and its current column
      let cardToMove: ProductionCard | undefined;
      let sourceColumnId: string | undefined;

      for (const col of prev) {
        const found = col.cards.find(c => c.id === cardId);
        if (found) {
          cardToMove = found;
          sourceColumnId = col.id;
          break;
        }
      }

      if (!cardToMove) return prev;

      // If already in target column, just update the card
      if (sourceColumnId === targetColumnId) {
        return prev.map((col) => ({
          ...col,
          cards: col.cards.map((card) =>
            card.id === cardId ? { ...card, ...updatedCardData, columnId: targetColumnId } : card
          ),
        }));
      }

      // Move card to new column
      const updatedCard = { ...cardToMove, ...updatedCardData, columnId: targetColumnId };

      return prev.map((col) => {
        if (col.id === sourceColumnId) {
          // Remove from source
          return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
        }
        if (col.id === targetColumnId) {
          // Add to target
          return { ...col, cards: [...col.cards, updatedCard] };
        }
        return col;
      });
    });
  };

  // Auto-save helper for Ideate dialog (saves without closing/resetting)
  const autoSaveIdeateCard = () => {
    if (!editingIdeateCard) return;
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === editingIdeateCard.id
            ? { ...card, title: ideateCardTitle, description: ideateCardNotes }
            : card
        ),
      }))
    );
  };

  // Auto-save helper for Script dialog (saves without closing/resetting)
  const autoSaveScript = () => {
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
                customVideoFormats,
                customPhotoFormats,
              }
            : card
        ),
      }))
    );
  };

  // Navigation handler for step progress clicks
  // savedCardData is optional - when provided (from Storyboard/Edit dialogs), use it directly
  const handleNavigateToStep = (step: number, savedCardData?: Partial<ProductionCard>) => {
    // Get the current card from whichever dialog is open
    const currentCard = editingIdeateCard || editingScriptCard || editingStoryboardCard || editingEditCard || schedulingCard;
    if (!currentCard) return;

    // Find the current version of the card and its column
    let latestCard: ProductionCard | undefined;
    let cardColumnId: string | undefined;
    for (const col of columns) {
      const found = col.cards.find(c => c.id === currentCard.id);
      if (found) {
        latestCard = { ...found };
        cardColumnId = col.id;
        break;
      }
    }
    if (!latestCard) return;

    // If savedCardData is provided (from Storyboard/Edit dialogs), merge it with latestCard
    if (savedCardData) {
      latestCard = { ...latestCard, ...savedCardData };
      // Save to state
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.map((card) =>
            card.id === currentCard.id ? latestCard! : card
          ),
        }))
      );
    }
    // Auto-save current dialog and update latestCard with current form values
    else if (isIdeateCardEditorOpen && editingIdeateCard) {
      // Update latestCard with current form values
      latestCard = {
        ...latestCard,
        title: ideateCardTitle,
        description: ideateCardNotes,
      };
      // Save to state
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.map((card) =>
            card.id === editingIdeateCard.id ? latestCard! : card
          ),
        }))
      );
    } else if (isScriptEditorOpen && editingScriptCard) {
      // Update latestCard with current form values
      latestCard = {
        ...latestCard,
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
      };
      // Save to state
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.map((card) =>
            card.id === editingScriptCard.id ? latestCard! : card
          ),
        }))
      );
    }

    const stepLabels: Record<number, string> = {
      1: 'Ideate',
      2: 'Script',
      3: 'Film',
      4: 'Edit',
      5: 'Schedule',
      6: 'Posted',
    };

    const currentWorkflowStep = cardColumnId ? columnToStep[cardColumnId] || 1 : 1;

    // Determine slide direction based on step comparison
    const currentDialogStep = activeContentFlowStep || (isIdeateCardEditorOpen ? 1 : isScriptEditorOpen ? 2 : isStoryboardDialogOpen ? 3 : isEditChecklistDialogOpen ? 4 : isScheduleColumnExpanded ? 5 : 6);
    setSlideDirection(step > currentDialogStep ? 'left' : 'right');

    // If we're in the unified content flow dialog, just update the step (no blink!)
    if (activeContentFlowStep !== null && step >= 1 && step <= 6) {
      // Initialize state for the target step
      switch (step) {
        case 1: // Ideate
          setEditingIdeateCard(latestCard!);
          setIdeateCardTitle(latestCard!.title || "");
          setIdeateCardNotes(latestCard!.description || "");
          break;
        case 2: // Script
          setEditingScriptCard(latestCard!);
          setCardTitle(latestCard!.title || "");
          setCardHook(latestCard!.hook || "");
          setScriptContent(latestCard!.script || "");
          setPlatformTags(latestCard!.platforms || []);
          setFormatTags(latestCard!.formats || []);
          setLocationChecked(latestCard!.locationChecked || false);
          setLocationText(latestCard!.locationText || "");
          setOutfitChecked(latestCard!.outfitChecked || false);
          setOutfitText(latestCard!.outfitText || "");
          setPropsChecked(latestCard!.propsChecked || false);
          setPropsText(latestCard!.propsText || "");
          setFilmingNotes(latestCard!.filmingNotes || "");
          setCardStatus(latestCard!.status || 'to-start');
          setCustomVideoFormats(latestCard!.customVideoFormats || []);
          setCustomPhotoFormats(latestCard!.customPhotoFormats || []);
          break;
        case 3: // Film
          setEditingStoryboardCard(latestCard!);
          break;
        case 4: // Edit
          setEditingEditCard(latestCard!);
          break;
        case 5: // Schedule
          setSchedulingCard(latestCard!);
          break;
        case 6: // Post/Archive
          // No special state needed for archive view
          break;
      }
      setContentFlowCard(latestCard!);
      setActiveContentFlowStep(step);
      return;
    }

    // Legacy approach for opening from outside or for step 6 (archive)
    const performNavigation = () => {
      // Close all dialogs
      setIsIdeateCardEditorOpen(false);
      setIsScriptEditorOpen(false);
      setIsStoryboardDialogOpen(false);
      setIsEditChecklistDialogOpen(false);
      setIsScheduleColumnExpanded(false);
      setIsArchiveDialogOpen(false);
      setActiveContentFlowStep(null);

      // Reset all editing states
      setEditingIdeateCard(null);
      setEditingScriptCard(null);
      setEditingStoryboardCard(null);
      setEditingEditCard(null);
      setContentFlowCard(null);

      // Small delay to allow dialogs to close before opening new one
      setTimeout(() => {
        switch (step) {
          case 1: // Ideate
            setContentFlowCard(latestCard!);
            setActiveContentFlowStep(1);
            break;
          case 2: // Script
            setContentFlowCard(latestCard!);
            setActiveContentFlowStep(2);
            break;
          case 3: // Film
            setContentFlowCard(latestCard!);
            setActiveContentFlowStep(3);
            break;
          case 4: // Edit
            setContentFlowCard(latestCard!);
            setActiveContentFlowStep(4);
            break;
          case 5: // Schedule
            setContentFlowCard(latestCard!);
            setActiveContentFlowStep(5);
            break;
          case 6: // Post/Archive
            setContentFlowCard(latestCard!);
            setActiveContentFlowStep(6);
            break;
        }
      }, 50);
    };

    // Navigate directly to the step
    performNavigation();
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
      addedFrom: 'bank-of-ideas',
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
      addedFrom: 'bank-of-ideas',
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
      addedFrom: 'idea-expander',
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

  const handleSaveCardEdit = (cardId: string, newValue: string) => {
    if (!newValue.trim()) return;

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) => {
          if (card.id === cardId) {
            // Save to hook if it exists, otherwise save to title
            if (card.hook) {
              return { ...card, hook: newValue.trim() };
            }
            return { ...card, title: newValue.trim() };
          }
          return card;
        }),
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
      addedFrom: 'bank-of-ideas',
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
      <div className="w-full h-screen flex flex-col pl-5 pr-3 pt-4 bg-[#F5F3F4]">
        <div
          ref={horizontalScrollRef}
          className="flex gap-5 flex-1 overflow-x-auto overflow-y-visible ml-[-34px] pl-[34px] mt-[-16px] pt-[16px] hide-scrollbar"
          onScroll={(e) => {
            const target = e.currentTarget;
            const maxScroll = target.scrollWidth - target.clientWidth;
            setScrollProgress(maxScroll > 0 ? target.scrollLeft / maxScroll : 0);
          }}
        >
          {columns.map((column, index) => {
            const colors = columnColors[column.id];
            return (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-[340px]"
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div
                  ref={(el) => {
                    if (el) columnRefs.current.set(column.id, el);
                  }}
                  className={cn(
                    "flex flex-col rounded-2xl transition-all duration-300 overflow-hidden",
                    "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.03),0_4px_8px_rgba(0,0,0,0.03),0_8px_16px_rgba(0,0,0,0.02)]",
                                        draggedOverColumn === column.id && draggedCard
                      ? column.id === "ideate" && columns.find(col => col.cards.some(c => c.id === draggedCard.id))?.id !== "ideate"
                        ? "ring-2 ring-offset-2 ring-red-400 opacity-60"
                        : "ring-2 ring-offset-2 ring-[#B8A0C4] scale-[1.02]"
                      : "",
                    highlightedColumn === column.id ? "ring-4 ring-[#B8A0C4] ring-offset-4 shadow-2xl scale-105" : "",
                    colors.bg
                  )}
                >
                  {/* Special Archive UI for Posted column */}
                  {column.id === "posted" ? (
                    <>
                      <div className="px-5 pt-5 pb-4">
                        <div className="flex items-center gap-2">
                          <h2 className={cn("font-medium text-[13px] tracking-[0.04em] uppercase", colors.text)}>
                            {column.title}
                          </h2>
                          <PartyPopper className={cn("w-4 h-4", colors.text)} />
                        </div>
                      </div>

                      {/* Minimal archive drop zone */}
                      <div className="flex-1 flex flex-col items-center justify-start pt-44 px-4">
                        <motion.div
                          className={cn(
                            "flex flex-col items-center transition-all duration-200",
                            draggedOverColumn === "posted" && draggedCard
                              ? "scale-105"
                              : ""
                          )}
                        >
                          <Archive className={cn(
                            "w-8 h-8 mb-3 transition-colors",
                            draggedOverColumn === "posted" && draggedCard
                              ? "text-[#685078]"
                              : "text-[#887098]"
                          )} />

                          <p className={cn(
                            "text-sm text-center transition-colors max-w-[180px] font-medium",
                            draggedOverColumn === "posted" && draggedCard
                              ? "text-[#5C466C]"
                              : "text-[#675275]"
                          )}>
                            {draggedOverColumn === "posted" && draggedCard
                              ? "Release to archive"
                              : "Drop published content here to archive"
                            }
                          </p>

                          {/* Open archive button */}
                          <button
                            onClick={() => setIsArchiveDialogOpen(true)}
                            className="mt-4 flex items-center gap-2 text-sm text-white hover:text-white font-medium bg-[#887098] hover:bg-[#786088] px-4 py-2.5 rounded-lg transition-colors shadow-sm"
                          >
                            <Archive className="w-4 h-4" />
                            {archivedCards.length > 0
                              ? `View archive (${archivedCards.length})`
                              : "Open archive"
                            }
                          </button>
                        </motion.div>

                        {/* Undo button - positioned in center area */}
                        {lastArchivedCard && (
                          <button
                            onClick={() => {
                              // Remove from archive
                              setArchivedCards((prev) => prev.filter((c) => c.id !== lastArchivedCard.card.id));
                              // Add to To Schedule column
                              setColumns((prev) =>
                                prev.map((col) =>
                                  col.id === 'to-schedule'
                                    ? { ...col, cards: [{ ...lastArchivedCard.card, columnId: 'to-schedule' }, ...col.cards] }
                                    : col
                                )
                              );
                              setLastArchivedCard(null);
                              toast.success("Restored to To Schedule");
                            }}
                            className="mt-6 flex items-center gap-1.5 text-sm text-[#7D6B87] hover:text-[#5C466C] font-medium bg-[#F5F0F7] hover:bg-[#E8DFED] px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Undo archive
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-5 pt-5 pb-4">
                        <h2 className={cn("font-medium text-[13px] tracking-[0.04em] uppercase", colors.text)}>
                          {column.title}
                        </h2>
                      </div>

                      <div className="flex-1 overflow-y-auto px-4 pt-1 pb-4 space-y-3 hide-scrollbar hover:hide-scrollbar relative">
                        {/* Not Allowed Overlay for Ideate Column */}
                        {column.id === "ideate" && draggedCard && draggedOverColumn === column.id &&
                         columns.find(col => col.cards.some(c => c.id === draggedCard.id))?.id !== "ideate" && (
                          <div className="absolute inset-0 bg-red-50/90 backdrop-blur-sm rounded-lg z-20 flex items-center justify-center pointer-events-none">
                            <div className="text-center px-6">
                              <div className="text-4xl mb-3">🚫</div>
                              <p className="text-sm font-semibold text-red-700 mb-1">Cannot Move Back</p>
                              <p className="text-xs text-red-600">Content flows forward only</p>
                            </div>
                          </div>
                        )}
                        <AnimatePresence>
                          {column.cards.filter(card => {
                            // Basic filter: has id, has title, not empty, not add quick idea
                            const basicFilter = card.id && card.title && card.title.trim() && !card.title.toLowerCase().includes('add quick idea');
                            // For to-schedule column: hide cards that already have a scheduledDate
                            if (column.id === 'to-schedule' && card.scheduledDate) {
                              return false;
                            }
                            return basicFilter;
                          }).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map((card, cardIndex) => {
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
                              <React.Fragment key={card.id || `fallback-${cardIndex}`}>
                            {/* Drop indicator - only render during active drag */}
                            {showDropIndicatorBefore && draggedCard && isDraggingRef.current && (
                              <div className="relative h-0">
                                <div
                                  className="absolute inset-x-0 -top-1 h-0.5 rounded-full bg-[#A890B8]"
                                />
                              </div>
                            )}

                            <motion.div
                              layout={false}
                              initial={{ opacity: 1 }}
                              animate={{
                                opacity: 1,
                              }}
                              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                              transition={{
                                opacity: { duration: 0.05 },
                              }}
                              draggable={!isEditing}
                              onDragStart={(e) => !isEditing && handleDragStart(e, card)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => handleCardDragOver(e, column.id, cardIndex)}
                              onClick={(e) => {
                                // Open edit modal for Shape Ideas, Ideate, To Film, To Edit, and To Schedule cards on single click (with delay to detect double-click)
                                if ((column.id === "shape-ideas" || column.id === "ideate" || column.id === "to-film" || column.id === "to-edit" || column.id === "to-schedule") && !isEditing) {
                                  e.stopPropagation();
                                  // Clear any existing timeout
                                  if (clickTimeoutRef.current) {
                                    clearTimeout(clickTimeoutRef.current);
                                  }
                                  // Set timeout to open modal after 250ms (if no double-click happens)
                                  clickTimeoutRef.current = setTimeout(() => {
                                    if (column.id === "shape-ideas") {
                                      handleOpenScriptEditor(card);
                                    } else if (column.id === "to-film") {
                                      handleOpenStoryboard(card);
                                    } else if (column.id === "ideate") {
                                      handleOpenIdeateCardEditor(card);
                                    } else if (column.id === "to-edit") {
                                      handleOpenEditChecklist(card);
                                    } else if (column.id === "to-schedule") {
                                      setSchedulingCard(card);
                                      setIsScheduleColumnExpanded(true);
                                    }
                                  }, 250);
                                }
                              }}
                              className={cn(
                                "group relative bg-white",
                                "rounded-xl border border-stone-200",
                                "shadow-[0_0_0_1px_rgba(0,0,0,0.02),0_2px_4px_rgba(0,0,0,0.04),0_8px_20px_rgba(0,0,0,0.06)]",
                                "hover:shadow-[0_0_0_1px_rgba(0,0,0,0.02),0_4px_8px_rgba(0,0,0,0.05),0_12px_28px_rgba(0,0,0,0.08)]",
                                "hover:-translate-y-[3px]",
                                "transition-all duration-200",
                                column.id === "ideate" ? "py-4 px-3" : "p-3",
                                (column.id === "shape-ideas" || column.id === "ideate" || column.id === "to-film" || column.id === "to-edit" || column.id === "to-schedule") && !isEditing ? "cursor-pointer" : (!isEditing && "cursor-grab active:cursor-grabbing"),
                                isThisCardDragged ? "opacity-40 scale-[0.98]" : "",
                                card.isCompleted && "opacity-60",
                                recentlyRepurposedCardId === card.id && "ring-2 ring-emerald-500 ring-offset-2",
                                highlightedUnscheduledCardId === card.id && "ring-2 ring-indigo-500 ring-offset-2",
                                card.isNew && "ring-1 ring-[#8B7082]"
                              )}
                            >
                            {highlightedUnscheduledCardId === card.id && (
                              <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10">
                                UNSCHEDULED
                              </div>
                            )}
                            {recentlyRepurposedCardId === card.id && (
                              <div className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10">
                                REPURPOSED
                              </div>
                            )}
                            {/* Calendar origin indicator */}
                            {card.fromCalendar && (
                              <div className="flex items-center gap-1 mb-1.5">
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#F5F2F4] rounded-md border border-[#DDD6DA]">
                                  <CalendarDays className="w-3 h-3 text-[#8B7082]" />
                                  <span className="text-[11px] font-normal text-[#8B7082]">
                                    {card.plannedDate ? `Planned for ${new Date(card.plannedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'From Calendar'}
                                  </span>
                                </div>
                              </div>
                            )}
                            {/* Planned date indicator - clickable to edit */}
                            {column.id !== "posted" && column.id !== "to-schedule" && !card.fromCalendar && card.plannedDate && (
                              <div className="flex items-center gap-1 mb-1 -mt-0.5">
                                <Popover
                                  open={planningCardId === card.id}
                                  onOpenChange={(open) => {
                                    if (open) {
                                      setPlanningCardId(card.id);
                                    } else {
                                      setPlanningCardId(null);
                                    }
                                  }}
                                >
                                  <PopoverTrigger asChild>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      className="flex items-center gap-1 px-1.5 py-0.5 bg-[#F5F2F4] rounded-md border border-[#DDD6DA] hover:bg-[#EBE7E9] hover:border-[#CCC5C9] transition-colors cursor-pointer"
                                    >
                                      <CalendarDays className="w-3 h-3 text-[#8B7082]" />
                                      <span className="text-[11px] font-normal text-[#8B7082]">
                                        Planned: {new Date(card.plannedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </span>
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0 border-0 shadow-2xl"
                                    align="center"
                                    side="right"
                                    sideOffset={8}
                                    collisionPadding={16}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ExpandedScheduleView
                                      planningMode={true}
                                      planningCard={card}
                                      onPlanDate={(cardId, date) => {
                                        handleSetPlannedDate(cardId, date);
                                      }}
                                      onClose={() => setPlanningCardId(null)}
                                    />
                                  </PopoverContent>
                                </Popover>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetPlannedDate(card.id, undefined);
                                  }}
                                  className="hover:bg-violet-100 rounded p-0.5"
                                  title="Remove from calendar"
                                >
                                  <X className="w-2.5 h-2.5 text-[#A99BA3] hover:text-[#8B7082]" />
                                </button>
                              </div>
                            )}
                            <div className="flex items-center justify-between gap-2">
                                {isEditing ? (
                                  <input
                                    ref={editInputRef}
                                    type="text"
                                    defaultValue={card.hook || card.title}
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
                                    className="font-medium text-[15px] text-gray-800 break-words leading-[1.4] tracking-[-0.01em] flex-1 cursor-pointer"
                                    onDoubleClick={(e) => {
                                      e.stopPropagation();
                                      // Clear the single-click timeout to prevent modal from opening
                                      if (clickTimeoutRef.current) {
                                        clearTimeout(clickTimeoutRef.current);
                                        clickTimeoutRef.current = null;
                                      }
                                      handleStartEditingCard(card.id, column.id, 'doubleclick');
                                    }}
                                  >
                                    {card.hook || card.title}
                                  </h3>
                                )}
                                {/* Pin button - always visible when pinned */}
                                {column.id !== "posted" && card.isPinned && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0.5 rounded-lg hover:bg-gray-100 flex-shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTogglePin(card.id);
                                    }}
                                    title="Unpin from dashboard"
                                  >
                                    <Pin className="h-4 w-4 rotate-45 fill-yellow-400 stroke-orange-500" strokeWidth={2} />
                                  </Button>
                                )}
                                <div className="flex flex-row gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                  {/* Plan button */}
                                  {column.id !== "posted" && column.id !== "to-schedule" && !card.plannedDate && (
                                    <Popover
                                      open={planningCardId === card.id}
                                      onOpenChange={(open) => {
                                        if (open) {
                                          setPlanningCardId(card.id);
                                        } else {
                                          setPlanningCardId(null);
                                        }
                                      }}
                                    >
                                      <PopoverTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-3.5 w-3.5 p-0 rounded hover:bg-violet-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                          }}
                                          title="Plan on calendar"
                                        >
                                          <CalendarDays className="h-2.5 w-2.5 text-gray-400 hover:text-violet-600" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        className="w-auto p-0 border-0 shadow-2xl"
                                        align="center"
                                        side="right"
                                        sideOffset={8}
                                        collisionPadding={16}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <ExpandedScheduleView
                                          planningMode={true}
                                          planningCard={card}
                                          onPlanDate={(cardId, date) => {
                                            handleSetPlannedDate(cardId, date);
                                          }}
                                          onClose={() => setPlanningCardId(null)}
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  )}
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
                                      <PenLine className="h-2.5 w-2.5 text-gray-400 hover:text-blue-600" />
                                    </Button>
                                  )}
                                  {column.id === "to-film" && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-3.5 w-3.5 p-0 rounded hover:bg-amber-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenStoryboard(card);
                                      }}
                                    >
                                      <Clapperboard className="h-2.5 w-2.5 text-gray-400 hover:text-amber-600" />
                                    </Button>
                                  )}
                                  {column.id === "to-edit" && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-3.5 w-3.5 p-0 rounded hover:bg-rose-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditChecklist(card);
                                      }}
                                    >
                                      <Scissors className="h-2.5 w-2.5 text-gray-400 hover:text-rose-600" />
                                    </Button>
                                  )}
                                  {column.id !== "posted" && !card.isPinned && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-3.5 w-3.5 p-0 rounded transition-colors hover:bg-amber-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTogglePin(card.id);
                                      }}
                                      title="Pin to dashboard"
                                    >
                                      <Pin className="h-2.5 w-2.5 text-gray-400 hover:text-amber-600" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-3.5 w-3.5 p-0 rounded hover:bg-red-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCard(card.id);
                                    }}
                                  >
                                    <Trash2 className="h-2.5 w-2.5 text-gray-400 hover:text-red-600" />
                                  </Button>
                                </div>
                            </div>
                            {/* Tags for cards with metadata */}
                            {column.id !== "ideate" && ((card.formats && card.formats.length > 0) || card.schedulingStatus || (card.platforms && card.platforms.length > 0)) && (() => {
                              const formats = card.formats || [];
                              const hasStatus = column.id === 'to-schedule' && !!card.schedulingStatus;
                              const schedulingStatus = card.schedulingStatus;
                              const platforms = card.platforms || [];
                              const hasPlatforms = platforms.length > 0;

                              // Determine which is the last tag row
                              const lastFormatIndex = hasStatus ? -1 : formats.length - 1;

                              const staticFormats = [
                                'single photo post',
                                'curated photo carousel',
                                'casual photo dump',
                                'text-only post',
                                'carousel with text slides',
                                'notes-app style screenshot',
                                'tweet-style slide'
                              ];

                              const renderPlatformIcons = () => (
                                <div className="flex gap-1.5 items-center">
                                  {platforms.map((platform, idx) => {
                                    const icon = getPlatformIcon(platform);
                                    return icon ? (
                                      <span key={`platform-${idx}`} title={platform}>
                                        {icon}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              );

                              return (
                                <div className="flex flex-col gap-1 mt-2">
                                  {/* Format tags - all except last if no status */}
                                  {formats.map((format, idx) => {
                                    const isStatic = staticFormats.some(sf => format.toLowerCase().includes(sf) || sf.includes(format.toLowerCase()));
                                    const isLastRow = !hasStatus && idx === formats.length - 1;

                                    if (isLastRow && hasPlatforms) {
                                      return (
                                        <div key={`format-${idx}`} className="flex items-center justify-between">
                                          <span className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full text-gray-500/80 font-normal">
                                            {isStatic ? <Camera className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                                            {format}
                                          </span>
                                          {renderPlatformIcons()}
                                        </div>
                                      );
                                    }

                                    return (
                                      <span key={`format-${idx}`} className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full text-gray-500/80 font-normal">
                                        {isStatic ? <Camera className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                                        {format}
                                      </span>
                                    );
                                  })}
                                  {/* Status tag - only for scheduling column */}
                                  {hasStatus && (
                                    <div className={hasPlatforms ? "flex items-center justify-between" : ""}>
                                      <span className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full text-gray-500/80 font-normal">
                                        {(() => {
                                          const isPublished = schedulingStatus === 'scheduled' && card.scheduledDate && new Date(card.scheduledDate) < new Date(new Date().toDateString());
                                          return (
                                            <>
                                              {schedulingStatus === 'to-schedule' && <CalendarDays className="w-2.5 h-2.5" />}
                                              {schedulingStatus === 'scheduled' && !isPublished && <Check className="w-2.5 h-2.5" />}
                                              {isPublished && <PartyPopper className="w-2.5 h-2.5" />}
                                              {schedulingStatus === 'to-schedule' ? 'To schedule' :
                                               isPublished ? 'Published' :
                                               schedulingStatus === 'scheduled' ? 'Scheduled' : ''}
                                            </>
                                          );
                                        })()}
                                      </span>
                                      {hasPlatforms && renderPlatformIcons()}
                                    </div>
                                  )}
                                  {/* If only platforms, no formats or status */}
                                  {!hasStatus && formats.length === 0 && hasPlatforms && (
                                    <div className="flex items-center justify-end">
                                      {renderPlatformIcons()}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                            {/* Just added message at bottom */}
                            {card.isNew && (
                              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[#E8E2E5]">
                                <span className="text-[11px] text-[#8B7082] font-medium">
                                  ✦ Just added{card.addedFrom === 'calendar' ? ' from Content Calendar' :
                                    card.addedFrom === 'quick-idea' ? ' via quick idea' :
                                    card.addedFrom === 'ai-generated' ? ' via AI' :
                                    card.addedFrom === 'bank-of-ideas' ? ' from Bank of Ideas' :
                                    card.addedFrom === 'idea-expander' ? ' via Idea Expander' :
                                    card.addedFrom === 'repurposed' ? ' (repurposed)' : ''}
                                </span>
                              </div>
                            )}
                          </motion.div>
                          </React.Fragment>
                        );
                      })}

                      {/* Drop indicator at the end of the column - only show during active drag */}
                      {column.id !== "ideate" && draggedCard && isDraggingRef.current && (() => {
                        const filteredCards = column.cards.filter(card => card.title && card.title.trim() && !card.title.toLowerCase().includes('add quick idea'));
                        const draggedCardIndex = filteredCards.findIndex(c => c.id === draggedCard.id);
                        const isLastCard = draggedCardIndex !== -1 && draggedCardIndex === filteredCards.length - 1;
                        const shouldShow = dropPosition?.columnId === column.id &&
                                         dropPosition?.index === filteredCards.length &&
                                         !isLastCard;

                        if (!shouldShow) return null;

                        return (
                          <div className="relative h-0">
                            <div className="absolute inset-x-0 top-0 h-0.5 rounded-full bg-[#A890B8]" />
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
                      ) : column.id !== 'to-schedule' ? (
                        <div
                          key={`add-button-${column.id}`}
                          className={cn(
                            "group/btn px-4 py-2.5 border transition-all duration-200 cursor-pointer active:scale-[0.98]",
                            "w-full rounded-xl bg-white/80 hover:bg-white border-[#C4A4B5] hover:-translate-y-0.5"
                          )}
                          onClick={() => {
                            if (column.id === 'shape-ideas') {
                              // Create a new card and open script editor directly
                              const newCard: ProductionCard = {
                                id: `card-${Date.now()}`,
                                title: '',
                                columnId: 'shape-ideas',
                                isCompleted: false,
                              };
                              setColumns((prev) =>
                                prev.map((col) =>
                                  col.id === 'shape-ideas' ? { ...col, cards: [...col.cards, newCard] } : col
                                )
                              );
                              handleOpenScriptEditor(newCard);
                            } else if (column.id === 'to-film') {
                              // Create a new card and open storyboard editor directly
                              const newCard: ProductionCard = {
                                id: `card-${Date.now()}`,
                                title: '',
                                columnId: 'to-film',
                                isCompleted: false,
                              };
                              setColumns((prev) =>
                                prev.map((col) =>
                                  col.id === 'to-film' ? { ...col, cards: [...col.cards, newCard] } : col
                                )
                              );
                              handleOpenStoryboard(newCard);
                            } else if (column.id === 'to-edit') {
                              // Create a new card and open edit checklist dialog directly
                              const newCard: ProductionCard = {
                                id: `card-${Date.now()}`,
                                title: '',
                                columnId: 'to-edit',
                                isCompleted: false,
                              };
                              setColumns((prev) =>
                                prev.map((col) =>
                                  col.id === 'to-edit' ? { ...col, cards: [...col.cards, newCard] } : col
                                )
                              );
                              handleOpenEditChecklist(newCard);
                            } else {
                              handleStartAddingCard(column.id);
                            }
                          }}
                        >
                          <div className="flex items-center justify-center gap-2 text-[#8B7082]">
                            <Plus className="h-4 w-4 group-hover/btn:rotate-90 transition-transform duration-200" />
                            <span className="text-sm font-medium">
                              {column.id === 'ideate' ? 'Add quick idea' : 'Add new'}
                            </span>
                          </div>
                        </div>
                      ) : null}

                      {/* See Content Calendar button - only for to-schedule column */}
                      {column.id === 'to-schedule' && (
                        <div
                          className="group/btn px-4 py-2 rounded-full border border-dashed hover:border-solid transition-all duration-200 cursor-pointer w-fit hover:scale-105 active:scale-95 bg-[#F5F2F4] hover:bg-[#EBE7E9] border-[#DDD6DA]"
                          onClick={() => setIsScheduleColumnExpanded(true)}
                        >
                          <div className="flex items-center gap-2 text-[#8B7082]">
                            <CalendarDays className="h-4 w-4" />
                            <span className="text-sm font-semibold">Schedule in Content Calendar</span>
                          </div>
                        </div>
                      )}

                      {/* Help me generate ideas button - only for ideate column */}
                      {column.id === 'ideate' && (
                        <div className="group/btn px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer w-full hover:-translate-y-0.5 active:scale-[0.98] bg-[#8B7082] hover:bg-[#7A6272] shadow-sm hover:shadow-md"
                          onClick={() => {
                            setSelectedIdeateCard(null);
                            setIsIdeateDialogOpen(true);
                          }}
                        >
                          <div className="flex items-center justify-center gap-2 text-white">
                            <Zap className="h-4 w-4 group-hover/btn:animate-pulse" />
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold leading-tight">Generate ideas</span>
                              <span className="text-[10px] opacity-80 leading-tight">AI-powered suggestions</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Invisible scroll area at bottom - enables horizontal scroll when cursor is here */}
        <div
          className="h-8 flex-shrink-0 cursor-ew-resize"
          onWheel={(e) => {
            if (horizontalScrollRef.current) {
              e.preventDefault();
              horizontalScrollRef.current.scrollLeft += e.deltaX || e.deltaY;
            }
          }}
        />

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
            ideateMode === 'pillarsformats' ? "sm:max-w-[1400px]" : "sm:max-w-[900px]"
          )}>
            <DialogHeader className="flex-shrink-0">
              {!ideateMode && (
                <DialogTitle className="sr-only">Content Ideation</DialogTitle>
              )}


              {/* Breadcrumbs for Brainstorm */}
              {ideateMode === 'brainstorm' && (
                <div className="flex items-center gap-3 text-base mb-6 px-2 pt-6">
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

            <div className="overflow-y-auto flex-1 pr-2 pb-4">
              {/* Method Selection - Always show unless in a specific mode */}
              {!ideateMode && (
                <div className="space-y-8 px-6 pt-8">
                  <div className="text-center pb-4">
                    <h3 className="text-2xl font-semibold text-[#612A4F] tracking-tight mb-3">Choose Your Starting Point</h3>
                    <p className="text-sm text-[#612A4F]/70">Select a method to guide your content ideation process</p>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    {/* 1. Start With Your Pillars - Green */}
                    <button
                      onClick={() => setIsPillarsDialogOpen(true)}
                      className="group relative overflow-hidden bg-gradient-to-br from-[#F0FDF6] to-[#E6FAF0] border-l-4 border-l-[#2D9D70] border-y border-r border-[#D1EDE0] hover:border-[#2D9D70] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(45,157,112,0.3)]"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#2D9D70]/10 to-transparent rounded-bl-full" />
                      <div className="relative flex flex-col items-center text-center space-y-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#2D9D70] to-[#1F7A55] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <Compass className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-black">Start With Your Pillars</h4>
                          <p className="text-xs text-gray-700 mt-1.5 leading-relaxed">Create content using a structured framework</p>
                        </div>
                      </div>
                    </button>

                    {/* 2. Trending Hooks - Coral */}
                    <button
                      onClick={() => setShowHooksDialog(true)}
                      className="group relative overflow-hidden bg-gradient-to-br from-[#FEF6F4] to-[#FDEEEA] border-l-4 border-l-[#E07A5F] border-y border-r border-[#F5D5CD] hover:border-[#E07A5F] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(224,122,95,0.3)]"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#E07A5F]/10 to-transparent rounded-bl-full" />
                      <div className="relative flex flex-col items-center text-center space-y-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#E07A5F] to-[#C75D43] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-black">Trending Hooks</h4>
                          <p className="text-xs text-gray-700 mt-1.5 leading-relaxed">Start with hooks that are working now</p>
                        </div>
                      </div>
                    </button>

                    {/* 3. What Worked, What's Next - Amber/Gold */}
                    <button
                      onClick={() => setIsWhatWorkedDialogOpen(true)}
                      className="group relative overflow-hidden bg-gradient-to-br from-[#FFFCF5] to-[#FEF7E8] border-l-4 border-l-[#E9B44C] border-y border-r border-[#F5E6C4] hover:border-[#E9B44C] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(233,180,76,0.3)]"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#E9B44C]/10 to-transparent rounded-bl-full" />
                      <div className="relative flex flex-col items-center text-center space-y-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#E9B44C] to-[#D19A2A] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-black">What Worked, What's Next</h4>
                          <p className="text-xs text-gray-700 mt-1.5 leading-relaxed">Build on your past successes or competitor insights</p>
                        </div>
                      </div>
                    </button>

                    {/* 4. Idea Expander - Purple */}
                    <button
                      onClick={() => setIsIdeaExpanderOpen(true)}
                      className="group relative overflow-hidden bg-gradient-to-br from-[#FAF8FF] to-[#F3EFFE] border-l-4 border-l-[#8B5CF6] border-y border-r border-[#E0D4F7] hover:border-[#8B5CF6] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(139,92,246,0.3)]"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#8B5CF6]/10 to-transparent rounded-bl-full" />
                      <div className="relative flex flex-col items-center text-center space-y-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#8B5CF6] to-[#6D3FD6] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-black">Idea Expander</h4>
                          <p className="text-xs text-gray-700 mt-1.5 leading-relaxed">Take one idea and explore multiple angles</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Brainstorm Mode */}
              {ideateMode === 'brainstorm' && (
                <div className="space-y-4 h-full flex flex-col px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-[#8B7082] rounded-full"></div>
                    <h3 className="text-lg font-semibold text-[#5C4E54]">Free-form Brainstorm</h3>
                  </div>
                  <Textarea
                    id="brainstorm-textarea"
                    value={brainstormText}
                    onChange={(e) => setBrainstormText(e.target.value)}
                    placeholder="Start writing your ideas here... Let your creativity flow!&#10;&#10;• What's the core message?&#10;• Who is this for?&#10;• What action do you want them to take?&#10;• What makes this unique?"
                    className="flex-1 min-h-[400px] border border-[#E8E2E5] focus:ring-2 focus:ring-[#8B7082]/30 focus:border-[#8B7082] rounded-xl resize-none text-base p-4 text-[#5C4E54]"
                  />
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
                        className="group relative bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-emerald-400 rounded-xl p-5 text-left transition-all duration-200 hover:-translate-y-1 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.04),0_8px_16px_rgba(0,0,0,0.04),0_16px_24px_rgba(0,0,0,0.02)]"
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
                                  addedFrom: 'ai-generated',
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
            <div className="bg-gradient-to-br from-[#d3f3f5] via-white to-[#d3f3f5]/50 p-8 h-full overflow-y-auto">
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
                                  addedFrom: 'ai-generated',
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
                      <h3 className="text-sm font-semibold text-black">
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
                                  <h4 className="text-sm font-semibold text-black">
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
                              <h4 className="text-sm font-semibold text-black">
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
                        className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border-2 border-purple-200 hover:border-purple-400 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.04),0_8px_16px_rgba(0,0,0,0.04),0_16px_24px_rgba(0,0,0,0.02)]"
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

        <ScriptEditorDialog
          isOpen={isScriptEditorOpen}
          onOpenChange={handleScriptEditorOpenChange}
          onCancel={resetScriptEditorState}
          onSave={handleSaveScript}
          titleInputRef={titleInputRef}
          locationInputRef={locationInputRef}
          outfitInputRef={outfitInputRef}
          propsInputRef={propsInputRef}
          notesInputRef={notesInputRef}
          cardTitle={cardTitle}
          setCardTitle={setCardTitle}
          scriptContent={scriptContent}
          setScriptContent={setScriptContent}
          showBrainDumpSuggestion={showBrainDumpSuggestion}
          brainDumpSuggestion={brainDumpSuggestion}
          setShowBrainDumpSuggestion={setShowBrainDumpSuggestion}
          formatTags={formatTags}
          setFormatTags={setFormatTags}
          showCustomFormatInput={showCustomFormatInput}
          setShowCustomFormatInput={setShowCustomFormatInput}
          customFormatInput={customFormatInput}
          setCustomFormatInput={setCustomFormatInput}
          platformTags={platformTags}
          setPlatformTags={setPlatformTags}
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
          setCardStatus={(value) => setCardStatus(value)}
          customVideoFormats={customVideoFormats}
          setCustomVideoFormats={setCustomVideoFormats}
          customPhotoFormats={customPhotoFormats}
          setCustomPhotoFormats={setCustomPhotoFormats}
          onNavigateToStep={handleNavigateToStep}
          slideDirection={slideDirection}
        />

        <BrainDumpGuidanceDialog
          isOpen={isIdeateCardEditorOpen}
          onOpenChange={handleIdeateCardEditorOpenChange}
          onCancel={resetIdeateCardEditorState}
          onSave={handleSaveIdeateCard}
          onMoveToScript={handleMoveIdeateToScript}
          title={ideateCardTitle}
          setTitle={setIdeateCardTitle}
          notes={ideateCardNotes}
          setNotes={setIdeateCardNotes}
          onNavigateToStep={handleNavigateToStep}
          slideDirection={slideDirection}
        />

        <StoryboardEditorDialog
          open={isStoryboardDialogOpen}
          onOpenChange={setIsStoryboardDialogOpen}
          card={editingStoryboardCard}
          onSave={handleSaveStoryboard}
          onNavigateToStep={handleNavigateToStep}
          slideDirection={slideDirection}
        />

        <EditChecklistDialog
          isOpen={isEditChecklistDialogOpen}
          onOpenChange={setIsEditChecklistDialogOpen}
          card={editingEditCard}
          onSave={handleSaveEditChecklist}
          onNavigateToStep={handleNavigateToStep}
          slideDirection={slideDirection}
        />

        {/* Unified Content Flow Dialog - seamless transitions between steps */}
        <ContentFlowDialog
          activeStep={activeContentFlowStep}
          onClose={() => {
            // Save current state before closing
            if (activeContentFlowStep === 1 && editingIdeateCard) {
              handleSaveIdeateCard();
            } else if (activeContentFlowStep === 2 && editingScriptCard) {
              handleSaveScript();
            } else if (activeContentFlowStep === 3 && editingStoryboardCard) {
              handleSaveStoryboard(editingStoryboardCard.storyboard || []);
            } else if (activeContentFlowStep === 4 && editingEditCard) {
              handleSaveEditChecklist(editingEditCard.editingChecklist || { items: [], notes: '', externalLinks: [] });
            }
            setActiveContentFlowStep(null);
            setContentFlowCard(null);
          }}
          slideDirection={slideDirection}
        >
          {activeContentFlowStep === 1 && contentFlowCard && (
            <BrainDumpGuidanceDialog
              isOpen={true}
              onOpenChange={() => {}}
              onCancel={resetIdeateCardEditorState}
              onSave={handleSaveIdeateCard}
              onMoveToScript={handleMoveIdeateToScript}
              title={ideateCardTitle}
              setTitle={setIdeateCardTitle}
              notes={ideateCardNotes}
              setNotes={setIdeateCardNotes}
              onNavigateToStep={handleNavigateToStep}
              slideDirection={slideDirection}
              embedded={true}
            />
          )}
          {activeContentFlowStep === 2 && contentFlowCard && (
            <ScriptEditorDialog
              isOpen={true}
              onOpenChange={() => {}}
              card={contentFlowCard}
              onSave={handleSaveScript}
              cardTitle={cardTitle}
              setCardTitle={setCardTitle}
              cardHook={cardHook}
              setCardHook={setCardHook}
              scriptContent={scriptContent}
              setScriptContent={setScriptContent}
              platformTags={platformTags}
              setPlatformTags={setPlatformTags}
              formatTags={formatTags}
              setFormatTags={setFormatTags}
              platformInput={platformInput}
              setPlatformInput={setPlatformInput}
              formatInput={formatInput}
              setFormatInput={setFormatInput}
              locationChecked={locationChecked}
              setLocationChecked={setLocationChecked}
              locationText={locationText}
              setLocationText={setLocationText}
              outfitChecked={outfitChecked}
              setOutfitChecked={setOutfitChecked}
              outfitText={outfitText}
              setOutfitText={setOutfitText}
              propsChecked={propsChecked}
              setPropsChecked={setPropsChecked}
              propsText={propsText}
              setPropsText={setPropsText}
              filmingNotes={filmingNotes}
              setFilmingNotes={setFilmingNotes}
              cardStatus={cardStatus}
              setCardStatus={(value) => setCardStatus(value)}
              customVideoFormats={customVideoFormats}
              setCustomVideoFormats={setCustomVideoFormats}
              customPhotoFormats={customPhotoFormats}
              setCustomPhotoFormats={setCustomPhotoFormats}
              onNavigateToStep={handleNavigateToStep}
              slideDirection={slideDirection}
              embedded={true}
            />
          )}
          {activeContentFlowStep === 3 && contentFlowCard && (
            <StoryboardEditorDialog
              open={true}
              onOpenChange={() => {}}
              card={contentFlowCard}
              onSave={handleSaveStoryboard}
              onNavigateToStep={handleNavigateToStep}
              slideDirection={slideDirection}
              embedded={true}
            />
          )}
          {activeContentFlowStep === 4 && contentFlowCard && (
            <EditChecklistDialog
              isOpen={true}
              onOpenChange={() => {}}
              card={contentFlowCard}
              onSave={handleSaveEditChecklist}
              onNavigateToStep={handleNavigateToStep}
              slideDirection={slideDirection}
              embedded={true}
            />
          )}
          {activeContentFlowStep === 5 && contentFlowCard && (
            <ExpandedScheduleView
              embedded={true}
              singleCard={contentFlowCard}
              onClose={() => {
                setActiveContentFlowStep(null);
                setContentFlowCard(null);
              }}
              onSchedule={handleScheduleContent}
              onUnschedule={handleUnscheduleContent}
              onUpdateColor={handleUpdateScheduledColor}
              onNavigateToStep={handleNavigateToStep}
              onMoveToScheduleColumn={(card) => {
                setColumns((prev) => {
                  let sourceColumnId: string | undefined;
                  for (const col of prev) {
                    if (col.cards.find(c => c.id === card.id)) {
                      sourceColumnId = col.id;
                      break;
                    }
                  }
                  const updatedCard: ProductionCard = {
                    ...card,
                    columnId: 'to-schedule',
                    schedulingStatus: 'to-schedule' as const,
                  };
                  if (sourceColumnId) {
                    if (sourceColumnId === 'to-schedule') {
                      return prev.map((col) => ({
                        ...col,
                        cards: col.cards.map((c) => c.id === card.id ? updatedCard : c),
                      }));
                    }
                    return prev.map((col) => {
                      if (col.id === sourceColumnId) {
                        return { ...col, cards: col.cards.filter(c => c.id !== card.id) };
                      }
                      if (col.id === 'to-schedule') {
                        return { ...col, cards: [...col.cards, updatedCard] };
                      }
                      return col;
                    });
                  }
                  return prev.map((col) => {
                    if (col.id === 'to-schedule') {
                      return { ...col, cards: [...col.cards, updatedCard] };
                    }
                    return col;
                  });
                });
              }}
            />
          )}
          {activeContentFlowStep === 6 && (
            <ArchiveDialog
              isOpen={true}
              onOpenChange={() => {}}
              archivedCards={columns.find(col => col.id === 'archive')?.cards || []}
              onRepurpose={handleRepurposeContent}
              onRestore={handleRestoreContent}
              onDelete={handleDeleteArchivedContent}
              onNavigateToStep={handleNavigateToStep}
              embedded={true}
            />
          )}
        </ContentFlowDialog>

        {/* Expanded Schedule Column View */}
        {isScheduleColumnExpanded && (
          <ExpandedScheduleView
            cards={columns.find(col => col.id === 'to-schedule')?.cards || []}
            singleCard={schedulingCard}
            onClose={() => {
              setIsScheduleColumnExpanded(false);
              setSchedulingCard(null);
            }}
            onSchedule={handleScheduleContent}
            onUnschedule={handleUnscheduleContent}
            onUpdateColor={handleUpdateScheduledColor}
            onNavigateToStep={handleNavigateToStep}
            onMoveToScheduleColumn={(card) => {
              // Move card to 'to-schedule' column
              setColumns((prev) => {
                // Check if card exists in any column
                let cardExists = false;
                let sourceColumnId: string | undefined;

                for (const col of prev) {
                  if (col.cards.find(c => c.id === card.id)) {
                    cardExists = true;
                    sourceColumnId = col.id;
                    break;
                  }
                }

                const updatedCard: ProductionCard = {
                  ...card,
                  columnId: 'to-schedule',
                  schedulingStatus: 'to-schedule' as const,
                };

                if (cardExists && sourceColumnId) {
                  // Card exists - move it to to-schedule
                  if (sourceColumnId === 'to-schedule') {
                    // Already in to-schedule, just update
                    return prev.map((col) => ({
                      ...col,
                      cards: col.cards.map((c) =>
                        c.id === card.id ? updatedCard : c
                      ),
                    }));
                  }
                  // Move from source to to-schedule
                  return prev.map((col) => {
                    if (col.id === sourceColumnId) {
                      return { ...col, cards: col.cards.filter(c => c.id !== card.id) };
                    }
                    if (col.id === 'to-schedule') {
                      return { ...col, cards: [...col.cards, updatedCard] };
                    }
                    return col;
                  });
                } else {
                  // Card doesn't exist in columns - add it to to-schedule
                  return prev.map((col) => {
                    if (col.id === 'to-schedule') {
                      return { ...col, cards: [...col.cards, updatedCard] };
                    }
                    return col;
                  });
                }
              });
            }}
          />
        )}

        {/* Archive Dialog */}
        <ArchiveDialog
          isOpen={isArchiveDialogOpen}
          onOpenChange={setIsArchiveDialogOpen}
          archivedCards={archivedCards}
          onRepurpose={handleRepurposeContent}
          onRestore={handleRestoreContent}
          onDelete={handleDeleteArchivedContent}
          onNavigateToStep={handleNavigateToStep}
        />

        {/* Planned to Scheduled Conversion Dialog */}
        <Dialog open={showPlannedToScheduledDialog} onOpenChange={(open) => {
          if (!open) {
            setShowPlannedToScheduledDialog(false);
            setPendingScheduleMove(null);
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-violet-500" />
                Use planned date?
              </DialogTitle>
              <DialogDescription>
                This idea was planned for{" "}
                <span className="font-medium text-violet-600">
                  {pendingScheduleMove?.card.plannedDate &&
                    new Date(pendingScheduleMove.card.plannedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })
                  }
                </span>
                . Would you like to use this as the scheduled date?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => handlePlannedToScheduledChoice(false)}
              >
                No, I'll schedule later
              </Button>
              <Button
                onClick={() => handlePlannedToScheduledChoice(true)}
                className="bg-violet-600 hover:bg-violet-700"
              >
                Yes, schedule it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Production;
