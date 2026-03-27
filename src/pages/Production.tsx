import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { callClaudeForJSON } from "@/services/claudeService";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreVertical, Trash2, Pencil, Sparkles, Check, Plus, ArrowLeft, Lightbulb, Pin, Clapperboard, Video, Circle, Wrench, CheckCircle2, Camera, CheckSquare, Scissors, PlayCircle, PenLine, CalendarDays, X, Maximize2, PartyPopper, Archive, FolderOpen, ChevronRight, RefreshCw, Compass, TrendingUp, BarChart3, Zap, LayoutGrid, RotateCcw, Image as ImageIcon, Layers } from "lucide-react";
import { SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine, RiPushpinFill } from "react-icons/ri";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { StorageKeys, getString, setString, remove } from "@/lib/storage";
import { EVENTS, on } from "@/lib/events";
import { useAuth } from "@/contexts/AuthContext";
import { useProductionBoard } from "./production/hooks/useProductionBoard";
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
import ContentFlowProgress, { getCompletedSteps } from "./production/components/ContentFlowProgress";
import ContentFlowDialog from "./production/components/ContentFlowDialog";
import BrainDumpGuidanceDialog from "./production/components/BrainDumpGuidanceDialog";
import { KanbanColumn, ProductionCard, StoryboardScene, EditingChecklist, SchedulingStatus, ContentType, ImageSlide, VisualReference, LinkPreview, StageCompletions } from "./production/types";
import StoryboardEditorDialog from "./production/components/StoryboardEditorDialog";
import ConceptEditorDialog from "./production/components/ConceptEditorDialog";
import EditChecklistDialog from "./production/components/EditChecklistDialog";
import ExpandedScheduleView from "./production/components/ExpandedScheduleView";
import ReadyToPostStep from "./production/components/ReadyToPostStep";
import ArchiveDialog from "./production/components/ArchiveDialog";
import MobileContentView from "./production/components/MobileContentView";
import MobileCardEditor from "./production/components/MobileCardEditor";
import MobileStoryboardView from "./production/components/MobileStoryboardView";
import { columnColors, cardColors, columnAccentColors, columnIcons, emptyStateIcons, DEFAULT_STAGE_COMPLETIONS, VIDEO_STEP_TO_STAGE, IMAGE_STEP_TO_STAGE } from "./production/utils/productionConstants";
import SkipColumnDialog from "./production/components/SkipColumnDialog";
import { getFormatColors, getPlatformColors } from "./production/utils/productionHelpers";
import { useSidebar } from "@/components/ui/sidebar";
import { ProductionProvider } from "@/contexts/ProductionContext";
import KanbanColumnComponent from "./production/components/KanbanColumn";

// columnHeaderIcons and emptyStateIconComponents moved to KanbanColumn.tsx

// Wrapper component to access sidebar state inside Layout context
const KanbanContainer: React.FC<{
  horizontalScrollRef: React.RefObject<HTMLDivElement>;
  setScrollProgress: (progress: number) => void;
  children: React.ReactNode;
}> = ({ horizontalScrollRef, setScrollProgress, children }) => {
  const { state: sidebarState } = useSidebar();
  const isSidebarCollapsed = sidebarState === 'collapsed';

  return (
    <div
      ref={horizontalScrollRef}
      className="flex gap-5 flex-1 overflow-x-auto overflow-y-visible ml-[-34px] pl-[34px] mt-[-16px] pt-[16px] hide-scrollbar items-start"
      onScroll={(e) => {
        const target = e.currentTarget;
        const maxScroll = target.scrollWidth - target.clientWidth;
        setScrollProgress(maxScroll > 0 ? target.scrollLeft / maxScroll : 0);
      }}
    >
      {children}
    </div>
  );
};

// getPlatformIcon moved to ProductionCardItem.tsx

// InlineCardInput moved to production/components/InlineCardInput.tsx

const Production = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Helper to scroll to and highlight a column
  const columnRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [highlightedColumn, setHighlightedColumn] = useState<string | null>(null);
  const [recentlyRepurposedCardId, setRecentlyRepurposedCardId] = useState<string | null>(null);
  const [planningCardId, setPlanningCardId] = useState<string | null>(null);

  const scrollToAndHighlightColumn = (columnId: string) => {
    const columnElement = columnRefs.current.get(columnId);
    if (columnElement) {
      columnElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      setHighlightedColumn(columnId);
      setTimeout(() => setHighlightedColumn(null), 2000);
    }
  };

  // Schedule expanded view state
  const [isScheduleColumnExpanded, setIsScheduleColumnExpanded] = useState(false);
  const [schedulingCard, setSchedulingCard] = useState<ProductionCard | null>(null);

  // ── Production Board Hook ─────────────────────────────────────────────
  const board = useProductionBoard(
    { userId: user?.id },
    {
      onRepurposedCardHighlight: (cardId) => {
        setRecentlyRepurposedCardId(cardId);
        setTimeout(() => setRecentlyRepurposedCardId(null), 5000);
      },
      scrollToAndHighlightColumn,
      onPlanningCardClear: () => {
        setPlanningCardId(null);
      },
      navigate,
      onScheduleColumnExpandedChange: (expanded) => setIsScheduleColumnExpanded(expanded),
      onSchedulingCardClear: () => setSchedulingCard(null),
    }
  );

  // Destructure for local use (preserves existing references throughout the file)
  const {
    columns, setColumns,
    archivedCards, setArchivedCards,
    lastArchivedCard, setLastArchivedCard,
    isArchiveDialogOpen, setIsArchiveDialogOpen,
    draggedCard, setDraggedCard,
    dropIndicator, setDropIndicator,
    draggedOverColumn, setDraggedOverColumn,
    draggedOverCardId, setDraggedOverCardId,
    dropPosition, setDropPosition,
    isDraggingRef,
    showPlannedToScheduledDialog, setShowPlannedToScheduledDialog,
    pendingScheduleMove, setPendingScheduleMove,
    deletedCardRef,
    handleAddCard: handleAddCardFromHook,
    handleUpdateCard: handleUpdateCardFromHook,
    handleDeleteCard,
    handleToggleComplete,
    handleTogglePin,
    handleSetPlannedDate,
    handleScheduleContent,
    handleUnscheduleContent,
    handleUpdateScheduledColor,
    handleDeleteArchivedContent,
    handleRepurposeContent,
    handleRestoreContent,
    handleDragStart,
    handleDragEnd,
    handleCardDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePlannedToScheduledChoice,
    showSkipColumnDialog,
    pendingSkipMove,
    handleSkipColumnChoice,
  } = board;

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
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
  const [ideaExpanderText, setIdeaExpanderText] = useState(() => {
    return getString(StorageKeys.ideaExpanderText) || "";
  });
  const [expandedAngles, setExpandedAngles] = useState<string[]>(() => {
    const saved = getString(StorageKeys.ideaExpanderAngles);
    return saved ? JSON.parse(saved) : [];
  });
  const [isGeneratingAngles, setIsGeneratingAngles] = useState(false);
  const [showAngleFeedback, setShowAngleFeedback] = useState(false);
  const [angleFeedbackText, setAngleFeedbackText] = useState("");
  const [selectedAngleDirection, setSelectedAngleDirection] = useState<string | null>(null);

  // Persist Idea Expander state
  useEffect(() => {
    setString(StorageKeys.ideaExpanderText, ideaExpanderText);
  }, [ideaExpanderText]);

  useEffect(() => {
    setString(StorageKeys.ideaExpanderAngles, JSON.stringify(expandedAngles));
  }, [expandedAngles]);

  // Script editor modal state
  const [isScriptEditorOpen, setIsScriptEditorOpen] = useState(false);
  const [editingScriptCard, setEditingScriptCard] = useState<ProductionCard | null>(null);

  // Storyboard editor modal state
  const [isStoryboardDialogOpen, setIsStoryboardDialogOpen] = useState(false);
  const [editingStoryboardCard, setEditingStoryboardCard] = useState<ProductionCard | null>(null);

  // Edit checklist modal state
  const [isEditChecklistDialogOpen, setIsEditChecklistDialogOpen] = useState(false);
  const [editingEditCard, setEditingEditCard] = useState<ProductionCard | null>(null);

  // Unified Content Flow Dialog state (for seamless transitions between steps)
  const [activeContentFlowStep, setActiveContentFlowStep] = useState<number | null>(null);
  const [contentFlowCard, setContentFlowCard] = useState<ProductionCard | null>(null);

  // Content type state (video vs image)
  const [contentType, setContentType] = useState<ContentType>('video');

  // Image-specific state for Concept step
  const [caption, setCaption] = useState("");
  const [visualReferences, setVisualReferences] = useState<VisualReference[]>([]);
  const [linkPreviews, setLinkPreviews] = useState<LinkPreview[]>([]);
  const [slides, setSlides] = useState<ImageSlide[]>([]);
  const [imageMode, setImageMode] = useState<'image' | 'carousel'>('image');

  const [brainDumpSuggestion, setBrainDumpSuggestion] = useState<string>("");

  // Highlighted unscheduled card state
  const [highlightedUnscheduledCardId, setHighlightedUnscheduledCardId] = useState<string | null>(null);

  const [showBrainDumpSuggestion, setShowBrainDumpSuggestion] = useState(false);
  const [cardTitle, setCardTitle] = useState("");

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
  const locationInputRef = useRef<HTMLTextAreaElement>(null);
  const outfitInputRef = useRef<HTMLTextAreaElement>(null);
  const propsInputRef = useRef<HTMLTextAreaElement>(null);
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
  const [userPillars, setUserPillars] = useState<string[]>([]);
  const [hasSeenPillarsExample, setHasSeenPillarsExample] = useState(false);
  const [selectedUserPillar, setSelectedUserPillar] = useState<string>("");
  const [pillarSubCategories, setPillarSubCategories] = useState<Record<string, string[]>>({});
  const [isGeneratingSubCategories, setIsGeneratingSubCategories] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [cascadeIdeas, setCascadeIdeas] = useState<string[]>([]);
  const [isGeneratingCascadeIdeas, setIsGeneratingCascadeIdeas] = useState(false);
  const [newPillarIndex, setNewPillarIndex] = useState<number | null>(null);
  const [newSubCategoryIndex, setNewSubCategoryIndex] = useState<number | null>(null);

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

  // Helper function to generate sub-categories using server API (key stays hidden)
  const generateSubCategoriesWithAI = async (pillarName: string): Promise<string[]> => {
    try {
      const response = await fetch('http://localhost:3001/api/generate-subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pillarName }),
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.subCategories || [];
    } catch (error) {
      console.error('Error generating subcategories:', error);
      return [];
    }
  };

  // Helper function to generate content ideas using server API (key stays hidden)
  const generateContentIdeasWithAI = async (pillarName: string, subCategory: string): Promise<string[]> => {
    try {
      const response = await fetch('http://localhost:3001/api/generate-content-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pillarName, subCategory }),
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.ideas || [];
    } catch (error) {
      console.error('Error generating content ideas:', error);
      return [];
    }
  };

  // Helper function to generate content angles using Claude API
  const generateAnglesWithAI = async (ideaText: string, count: number = 10, options?: { direction?: string; alreadyGenerated?: string[] }): Promise<string[]> => {
    const systemPrompt = `You are a creative content strategist helping creators find unique angles for their content.

Analyze what the user wrote and generate compelling content hooks:
- If they shared a personal story or experience, make hooks specific to their unique details, emotions, and insights
- If they shared a broad topic or idea, generate fresh, opinionated, scroll-stopping angles that stand out from generic content on that topic

RULES:
- Mix styles: vulnerable confessions, surprising revelations, contrarian takes, specific lessons, relatable moments
- Write as compelling video/post titles that make people stop scrolling
- Keep hooks concise (under 15 words)
- NO emojis
- NO generic templates like "How to X" or "5 tips for Y"
- ALWAYS return a JSON array, even for broad topics

Return ONLY a JSON array of strings, nothing else.`;

    let userMessage = `The creator's idea: "${ideaText}"

Generate ${count} compelling content angles for this. Create scroll-stopping hooks that feel fresh and specific — not the same generic takes everyone else makes on this topic.`;

    if (options?.direction) {
      userMessage += `\n\n⚠️ CRITICAL INSTRUCTION FROM THE CREATOR — YOU MUST FOLLOW THIS:\n${options.direction}\n\nThis is the creator's feedback on the previous batch of ideas. You MUST adapt your output to match exactly what they're asking for. If they say shorter, make them SHORT. If they say funnier, make them FUNNY. Their direction overrides the default rules above.`;
    }

    if (options?.alreadyGenerated && options.alreadyGenerated.length > 0) {
      userMessage += `\n\nAlready generated (do NOT repeat these, create completely different ones): ${options.alreadyGenerated.join(" | ")}`;
    }

    userMessage += `\n\nReturn only a JSON array of ${count} strings.`;

    const result = await callClaudeForJSON<string[]>({
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      maxTokens: 800,
    }, "array");

    return result.ok && result.data ? result.data : [];
  };

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

  // Listen for openBatchSchedule event from schedule dialog
  useEffect(() => {
    const cleanup = on(window, EVENTS.OPEN_BATCH_SCHEDULE, () => {
      // Clear any single card state to ensure batch view shows properly
      setSchedulingCard(null);
      setIsScheduleColumnExpanded(true);
    });
    return cleanup;
  }, []);

  // Handle scrolling to specific column from URL parameter
  useEffect(() => {
    const scrollToColumn = searchParams.get('scrollTo');
    if (scrollToColumn && columnRefs.current.has(scrollToColumn)) {
      // Wait for DOM to be fully rendered
      setTimeout(() => {
        scrollToAndHighlightColumn(scrollToColumn);
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

  // Drag-drop, card CRUD, archive, and scheduling handlers are in useProductionBoard hook


  // Wrapper: handleAddCard calls hook's handleAddCard and resets local form state
  const handleAddCard = () => {
    handleAddCardFromHook(newCardTitle, newCardDescription, selectedColumnId);
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

  // Wrapper: handleUpdateCard calls hook's handleUpdateCard and resets local form state
  const handleUpdateCard = () => {
    if (!editingCard) return;
    handleUpdateCardFromHook(editingCard, newCardTitle, newCardDescription);
    setEditingCard(null);
    setNewCardTitle("");
    setNewCardDescription("");
    setIsAddCardDialogOpen(false);
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
    // Only show if notes exist AND haven't already been handled (dismissed or appended)
    const notesText = card.description?.trim() || "";
    const alreadyHandledText = card.brainDumpHandledText?.trim() || "";
    const hasNotes = notesText.length > 0;
    const alreadyHandled = alreadyHandledText.length > 0 && notesText === alreadyHandledText;

    if (hasNotes && !alreadyHandled) {
      setBrainDumpSuggestion(card.description!);
      setShowBrainDumpSuggestion(true);
    } else {
      setBrainDumpSuggestion("");
      setShowBrainDumpSuggestion(false);
    }
    // Use unified content flow dialog
    setContentFlowCard(card);
    if (!card.contentType) {
      setActiveContentFlowStep(0);
    } else {
      setContentType(card.contentType);
      setActiveContentFlowStep(2);
    }
  };

  // Toggle a stage completion on the currently-open content flow card
  const handleToggleStage = (stage: keyof StageCompletions) => {
    const card = contentFlowCard || editingScriptCard || editingStoryboardCard || editingEditCard || editingIdeateCard;
    if (!card) return;
    const current = card.stageCompletions || DEFAULT_STAGE_COMPLETIONS;
    const updated = { ...current, [stage]: !current[stage] };
    setColumns(prev =>
      prev.map(col => ({
        ...col,
        cards: col.cards.map(c =>
          c.id === card.id ? { ...c, stageCompletions: updated } : c
        ),
      }))
    );
    if (contentFlowCard?.id === card.id) {
      setContentFlowCard(prev => prev ? { ...prev, stageCompletions: updated } : prev);
    }
  };

  const handleToggleStepComplete = (stepNumber: number) => {
    const stepToStage = contentType === 'image' ? IMAGE_STEP_TO_STAGE : VIDEO_STEP_TO_STAGE;
    const stage = stepToStage[stepNumber];
    if (stage) {
      handleToggleStage(stage);
    }
  };

  const handleSaveScript = () => {
    if (!editingScriptCard) return;

    // Update card data in place (keep it in its current column)
    const now = new Date().toISOString();
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
                lastUpdated: now,
              }
            : card
        ),
      }))
    );

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
    if (!card.contentType) {
      setActiveContentFlowStep(0);
    } else {
      setContentType(card.contentType);
      setActiveContentFlowStep(3);
    }
  };

  const handleSaveStoryboard = (storyboard: StoryboardScene[], title?: string, script?: string, hook?: string, status?: "to-start" | "needs-work" | "ready" | null) => {
    if (!editingStoryboardCard) return;

    // Update card data in place (keep it in its current column)
    const now = new Date().toISOString();
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === editingStoryboardCard.id
            ? {
                ...card,
                storyboard,
                ...(title !== undefined && { title }),
                ...(script !== undefined && { script }),
                ...(hook !== undefined && { hook }),
                ...(status !== undefined && { status }),
                lastUpdated: now,
              }
            : card
        ),
      }))
    );
  };

  // Edit checklist handlers
  const handleOpenEditChecklist = (card: ProductionCard) => {
    setEditingEditCard(card);
    // Use unified content flow dialog
    setContentFlowCard(card);
    if (!card.contentType) {
      setActiveContentFlowStep(0);
    } else {
      setContentType(card.contentType);
      setActiveContentFlowStep(4);
    }
  };

  const handleSaveEditChecklist = (checklist: EditingChecklist, title?: string, hook?: string, script?: string) => {
    if (!editingEditCard) return;

    // Update card data in place (keep it in its current column)
    const now = new Date().toISOString();
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === editingEditCard.id
            ? {
                ...card,
                editingChecklist: checklist,
                ...(title !== undefined && { title }),
                ...(hook !== undefined && { hook }),
                ...(script !== undefined && { script }),
                lastUpdated: now,
              }
            : card
        ),
      }))
    );
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
    const initialTitle = card.hook || card.title || "";
    setIdeateCardTitle(initialTitle);
    setIdeateCardNotes(card.description || "");
    // Also initialize cardHook to keep forms in sync from the start
    setCardHook(initialTitle);
    // Use unified content flow dialog
    setContentFlowCard(card);
    // If card has no content type set, show the picker first (step 0)
    if (!card.contentType) {
      setActiveContentFlowStep(0);
    } else {
      setContentType(card.contentType);
      setActiveContentFlowStep(1);
    }
  };

  // Open content flow dialog for any card (used for scheduled content)
  const handleOpenContentFlowForCard = (card: ProductionCard, startStep?: number) => {
    if (!card.contentType) {
      // No content type set — show picker first
      setContentFlowCard(card);
      setEditingIdeateCard(card);
      setIdeateCardTitle(card.hook || card.title || "");
      setIdeateCardNotes(card.description || "");
      setCardHook(card.hook || card.title || "");
      setActiveContentFlowStep(0);
      return;
    }
    const cardContentType = card.contentType;
    setContentType(cardContentType);

    // Determine which step to start on based on what's completed
    const completedSteps = getCompletedSteps(card);
    const maxStep = cardContentType === 'image' ? 4 : 6;
    let step = startStep || 1;

    // If no startStep provided, start at first incomplete step or step 1
    if (!startStep) {
      if (!completedSteps.includes(1)) step = 1;
      else if (!completedSteps.includes(2)) step = 2;
      else if (!completedSteps.includes(3)) step = 3;
      else if (!completedSteps.includes(4)) step = 4;
      else if (cardContentType === 'video' && !completedSteps.includes(5)) step = 5;
      else step = maxStep;
    }

    // Initialize all state for the card
    setEditingIdeateCard(card);
    setIdeateCardTitle(card.hook || card.title || "");
    setIdeateCardNotes(card.description || "");
    setEditingScriptCard(card);
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
    setEditingStoryboardCard(card);
    setEditingEditCard(card);
    setSchedulingCard(card);

    // Initialize image-specific state
    setCaption(card.caption || "");
    setVisualReferences(card.visualReferences || []);
    setLinkPreviews(card.linkPreviews || []);
    setSlides(card.slides || []);
    setImageMode(card.imageMode || 'image');

    // Check for brain dump suggestion
    // Only show if notes exist AND haven't already been handled (dismissed or appended)
    const notesText = card.description?.trim() || "";
    const alreadyHandledText = card.brainDumpHandledText?.trim() || "";
    const hasNotes = notesText.length > 0;
    const alreadyHandled = alreadyHandledText.length > 0 && notesText === alreadyHandledText;
    if (hasNotes && !alreadyHandled) {
      setBrainDumpSuggestion(card.description!);
      setShowBrainDumpSuggestion(true);
    } else {
      setBrainDumpSuggestion("");
      setShowBrainDumpSuggestion(false);
    }

    // Close the ExpandedScheduleView if it's open (to keep screen clean)
    setIsScheduleColumnExpanded(false);

    // Open the content flow dialog
    setContentFlowCard(card);
    setActiveContentFlowStep(step);
  };

  const handleSaveIdeateCard = () => {
    if (!editingIdeateCard) return;

    // Update card data in place (keep it in its current column)
    const now = new Date().toISOString();
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === editingIdeateCard.id
            ? { ...card, title: ideateCardTitle, description: ideateCardNotes, lastUpdated: now }
            : card
        ),
      }))
    );

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
    'ready-to-post': 5,
    'to-schedule': 6,
  };

  const stepToColumn: Record<number, string> = {
    1: 'ideate',
    2: 'shape-ideas',
    3: 'to-film',
    4: 'to-edit',
    5: 'ready-to-post',
    6: 'to-schedule',
  };

  // Determine appropriate column based on card content
  const determineColumnByContent = (card: Partial<ProductionCard>): string => {
    // Check from most advanced to least advanced stage

    // 1. Has scheduled date → Schedule column
    if (card.scheduledDate) {
      return 'to-schedule';
    }

    // 2. Has editing checklist with items → Edit column
    if (card.editingChecklist?.items && card.editingChecklist.items.length > 0) {
      return 'to-edit';
    }

    // For image content: check concept data instead of storyboard/script
    if (card.contentType === 'image') {
      // 3. Has concept content (caption, slides, visual refs) → equivalent of Script column
      const hasConceptContent =
        card.caption?.trim() ||
        (card.slides && card.slides.length > 0 && card.slides.some(s => s.content?.trim())) ||
        (card.visualReferences && card.visualReferences.length > 0) ||
        (card.linkPreviews && card.linkPreviews.length > 0);
      if (hasConceptContent) {
        return 'shape-ideas';
      }
    } else {
      // 3. Has storyboard scenes → Film column (video only)
      if (card.storyboard && card.storyboard.length > 0) {
        return 'to-film';
      }

      // 4. Has script content → Script column (video only)
      if (card.script && card.script.trim().length > 0) {
        return 'shape-ideas';
      }
    }

    // 5. Default → Ideate column
    return 'ideate';
  };

  // Close content flow dialog — save parent-controlled data for steps 1 & 2.
  // Steps 3 (Film), 4 (Edit), 5 (Schedule) save their own data on unmount.
  const handleCloseContentFlowDialog = () => {
    if (!contentFlowCard) {
      setActiveContentFlowStep(null);
      setContentFlowCard(null);
      return;
    }

    const currentStep = activeContentFlowStep;

    // For steps 1 & 2, save the parent-controlled state to columns
    if (currentStep === 1 || currentStep === 2) {
      const now = new Date().toISOString();
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.map((card) => {
            if (card.id !== contentFlowCard.id) return card;
            const updates: Partial<ProductionCard> = {
              contentType,
              lastUpdated: now,
            };
            if (currentStep === 1) {
              // Ideate step — parent controls title/notes
              if (ideateCardTitle) updates.title = ideateCardTitle;
              if (ideateCardTitle) updates.hook = ideateCardTitle;
              if (ideateCardNotes !== undefined) updates.description = ideateCardNotes;
            } else if (currentStep === 2) {
              // Script/Concept step — parent controls hook, script, tags, etc.
              if (cardHook) { updates.hook = cardHook; updates.title = cardHook; }
              if (scriptContent) updates.script = scriptContent;
              updates.platforms = platformTags;
              updates.formats = formatTags;
              updates.locationChecked = locationChecked;
              updates.locationText = locationText;
              updates.outfitChecked = outfitChecked;
              updates.outfitText = outfitText;
              updates.propsChecked = propsChecked;
              updates.propsText = propsText;
              if (filmingNotes) updates.filmingNotes = filmingNotes;
              if (cardStatus) updates.status = cardStatus;
              if (caption) updates.caption = caption;
              if (visualReferences.length > 0) updates.visualReferences = visualReferences;
              if (linkPreviews.length > 0) updates.linkPreviews = linkPreviews;
              if (slides.length > 0) updates.slides = slides;
              updates.imageMode = imageMode;
            }
            return { ...card, ...updates };
          }),
        }))
      );
    }
    // Steps 3/4/5: child dialogs save via their unmount cleanup — no action needed here

    // Reset dialog state — note: editingStoryboardCard and editingEditCard are NOT
    // reset here because their child dialogs need them during unmount cleanup saves.
    // They get re-initialized when the next dialog opens via handleOpenContentFlowForCard.
    setActiveContentFlowStep(null);
    setContentFlowCard(null);
    setEditingIdeateCard(null);
    setEditingScriptCard(null);
    setSchedulingCard(null);
  };

  // Handle content type toggle (Video <-> Image)
  const handleContentTypeChange = (newType: ContentType) => {
    setContentType(newType);
    // Reset to step 1 when switching content type
    setActiveContentFlowStep(1);
    // Update the card's content type in columns
    if (contentFlowCard) {
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.map((card) =>
            card.id === contentFlowCard.id ? { ...card, contentType: newType } : card
          ),
        }))
      );
    }
  };

  // Handle first-time content type selection (step 0 → step 1)
  const handleSelectContentTypeAndProceed = (newType: ContentType) => {
    setContentType(newType);
    setActiveContentFlowStep(1);
    // Save the content type to the card
    if (contentFlowCard) {
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.map((card) =>
            card.id === contentFlowCard.id ? { ...card, contentType: newType } : card
          ),
        }))
      );
    }
  };

  // Helper to move a card to a specific column
  const moveCardToColumn = (cardId: string, targetColumnId: string, updatedCardData: Partial<ProductionCard>) => {
    const now = new Date().toISOString();
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
            card.id === cardId ? { ...card, ...updatedCardData, columnId: targetColumnId, lastUpdated: now } : card
          ),
        }));
      }

      // Move card to new column
      const updatedCard = { ...cardToMove, ...updatedCardData, columnId: targetColumnId, lastUpdated: now };

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

  // Handler for brain dump suggestion dismissal - saves the handled text to prevent reappearing
  const handleBrainDumpDismiss = (show: boolean) => {
    console.log('[BrainDump Prod] handleBrainDumpDismiss called with show:', show);
    setShowBrainDumpSuggestion(show);

    if (!show) {
      // When dismissing, save the current description as handled text
      const currentCard = contentFlowCard || editingScriptCard;
      console.log('[BrainDump Prod] currentCard:', currentCard?.id, 'description:', currentCard?.description);

      if (currentCard && currentCard.description) {
        // Update the card with brainDumpHandledText
        setColumns((prev) =>
          prev.map((col) => ({
            ...col,
            cards: col.cards.map((card) =>
              card.id === currentCard.id
                ? { ...card, brainDumpHandledText: currentCard.description }
                : card
            ),
          }))
        );
        console.log('[BrainDump Prod] Saved brainDumpHandledText:', currentCard.description);
      }
    }
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
    // IMPORTANT: contentFlowCard should be checked first as it's the primary card in the unified content flow
    const currentCard = contentFlowCard || editingIdeateCard || editingScriptCard || editingStoryboardCard || editingEditCard || schedulingCard;
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
    // Fallback: if card not found in columns, use currentCard directly
    if (!latestCard) {
      latestCard = { ...currentCard };
      cardColumnId = currentCard.columnId || 'ideate';
    }

    // Get the current step we're LEAVING (this determines which form data to save)
    const currentStep = activeContentFlowStep ||
      (isIdeateCardEditorOpen ? 1 : isScriptEditorOpen ? 2 : isStoryboardDialogOpen ? 3 : isEditChecklistDialogOpen ? 4 : isScheduleColumnExpanded ? 6 : 1);

    // Build form data based on CURRENT step only - don't mix form data from different steps
    const currentFormData: Partial<ProductionCard> = {};

    if (currentStep === 1) {
      // Leaving Ideate - save Ideate form data
      // Use explicit check for undefined to allow empty strings
      if (ideateCardTitle !== undefined && ideateCardTitle !== "") {
        currentFormData.title = ideateCardTitle;
        currentFormData.hook = ideateCardTitle; // Ideate title IS the hook
      }
      if (ideateCardNotes !== undefined) {
        currentFormData.description = ideateCardNotes;
      }
    } else if (currentStep === 2) {
      // Leaving Script - save Script form data
      if (cardHook !== undefined && cardHook !== "") {
        currentFormData.hook = cardHook;
        currentFormData.title = cardHook; // Keep title in sync with hook
      }
      if (scriptContent !== undefined) {
        currentFormData.script = scriptContent;
      }
      currentFormData.platforms = platformTags;
      currentFormData.formats = formatTags;
      currentFormData.locationChecked = locationChecked;
      currentFormData.locationText = locationText;
      currentFormData.outfitChecked = outfitChecked;
      currentFormData.outfitText = outfitText;
      currentFormData.propsChecked = propsChecked;
      currentFormData.propsText = propsText;
      if (filmingNotes !== undefined) {
        currentFormData.filmingNotes = filmingNotes;
      }
      if (cardStatus) {
        currentFormData.status = cardStatus;
      }
      if (customVideoFormats.length > 0) {
        currentFormData.customVideoFormats = customVideoFormats;
      }
      if (customPhotoFormats.length > 0) {
        currentFormData.customPhotoFormats = customPhotoFormats;
      }
      currentFormData.contentType = contentType;
      currentFormData.imageMode = imageMode;
    }
    // Steps 3, 4, 5 save their own data through their respective dialogs

    // Merge: savedCardData (if provided) > currentFormData > latestCard
    latestCard = { ...latestCard, ...currentFormData, ...(savedCardData || {}) };

    // Save to columns
    setColumns((prev) => {
      let cardFound = false;
      const updated = prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) => {
          if (card.id === currentCard.id) {
            cardFound = true;
            return latestCard!;
          }
          return card;
        }),
      }));
      if (!cardFound && cardColumnId) {
        return updated.map((col) =>
          col.id === cardColumnId
            ? { ...col, cards: [...col.cards, latestCard!] }
            : col
        );
      }
      return updated;
    });

    const stepLabels: Record<number, string> = {
      1: 'Bank of Ideas',
      2: 'Script',
      3: 'Film',
      4: 'Edit',
      5: 'Ready',
      6: 'Schedule',
    };

    const currentWorkflowStep = cardColumnId ? columnToStep[cardColumnId] || 1 : 1;

    // Determine slide direction based on step comparison
    const currentDialogStep = activeContentFlowStep || (isIdeateCardEditorOpen ? 1 : isScriptEditorOpen ? 2 : isStoryboardDialogOpen ? 3 : isEditChecklistDialogOpen ? 4 : isScheduleColumnExpanded ? 6 : 6);
    setSlideDirection(step > currentDialogStep ? 'left' : 'right');

    // If we're in the unified content flow dialog, just update the step (no blink!)
    const maxStep = contentType === 'image' ? 4 : 6;
    if (activeContentFlowStep !== null && step >= 1 && step <= maxStep) {
      // Initialize state for the target step
      if (contentType === 'image') {
        // Image flow: 1=Ideate, 2=Concept, 3=Edit, 4=Schedule
        switch (step) {
          case 1: { // Ideate
            setEditingIdeateCard(latestCard!);
            const ideateTitle = latestCard!.hook || latestCard!.title || "";
            setIdeateCardTitle(ideateTitle);
            setIdeateCardNotes(latestCard!.description || "");
            setCardHook(ideateTitle);
            break;
          }
          case 2: { // Concept
            const conceptTitle = latestCard!.hook || latestCard!.title || "";
            setCardTitle(latestCard!.title || "");
            setCardHook(conceptTitle);
            setIdeateCardTitle(conceptTitle);
            setCaption(latestCard!.caption || "");
            setVisualReferences(latestCard!.visualReferences || []);
            setLinkPreviews(latestCard!.linkPreviews || []);
            setSlides(latestCard!.slides || []);
            setImageMode(latestCard!.imageMode || 'image');
            setPlatformTags(latestCard!.platforms || []);
            break;
          }
          case 3: // Edit
            setEditingEditCard(latestCard!);
            break;
          case 4: // Schedule
            setSchedulingCard(latestCard!);
            break;
        }
      } else {
        // Video flow: 1=Ideate, 2=Script, 3=Film, 4=Edit, 5=Schedule
        switch (step) {
          case 1: { // Ideate
            setEditingIdeateCard(latestCard!);
            const ideateTitle = latestCard!.hook || latestCard!.title || "";
            setIdeateCardTitle(ideateTitle);
            setIdeateCardNotes(latestCard!.description || "");
            setCardHook(ideateTitle);
            break;
          }
          case 2: { // Script
            setEditingScriptCard(latestCard!);
            const scriptTitle = latestCard!.hook || latestCard!.title || "";
            setCardTitle(latestCard!.title || "");
            setCardHook(scriptTitle);
            setIdeateCardTitle(scriptTitle);
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
            // Check for brain dump suggestion
            {
              const notesText = latestCard!.description?.trim() || "";
              const alreadyHandledText = latestCard!.brainDumpHandledText?.trim() || "";
              const hasNotes = notesText.length > 0;
              const alreadyHandled = alreadyHandledText.length > 0 && notesText === alreadyHandledText;
              if (hasNotes && !alreadyHandled) {
                setBrainDumpSuggestion(latestCard!.description!);
                setShowBrainDumpSuggestion(true);
              } else {
                setBrainDumpSuggestion("");
                setShowBrainDumpSuggestion(false);
              }
            }
            break;
          }
          case 3: // Film
            setEditingStoryboardCard(latestCard!);
            break;
          case 4: // Edit
            setEditingEditCard(latestCard!);
            break;
          case 5: // Ready
            break;
          case 6: // Schedule
            setSchedulingCard(latestCard!);
            break;
        }
      }
      setContentFlowCard(latestCard!);
      setActiveContentFlowStep(step);
      return;
    }

    // Legacy approach for opening from outside
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

  const handleAddFormatTag = () => {
    if (formatInput.trim() && !formatTags.includes(formatInput.trim())) {
      setFormatTags([...formatTags, formatInput.trim()]);
      setFormatInput("");
    }
  };

  const handleAddPlatformTag = (tag: string) => {
    setPlatformTags(prev => prev.includes(tag) ? prev : [...prev, tag]);
  };

  const handleRemovePlatformTag = (tag: string) => {
    setPlatformTags(prev => prev.filter(t => t !== tag));
  };

  const handleRemoveFormatTag = (tag: string) => {
    setFormatTags(prev => prev.filter(t => t !== tag));
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

    // For ideate column, immediately reopen input for rapid idea entry
    if (columnId === 'ideate') {
      setTimeout(() => setAddingToColumn('ideate'), 0);
    }
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
      stageCompletions: { ...DEFAULT_STAGE_COMPLETIONS, ideate: true },
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
      stageCompletions: { ...DEFAULT_STAGE_COMPLETIONS, ideate: true },
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

  const handleGenerateAngles = async () => {
    if (!ideaExpanderText.trim()) return;

    setIsGeneratingAngles(true);
    setShowAngleFeedback(false);
    setAngleFeedbackText("");
    setSelectedAngleDirection(null);

    try {
      const angles = await generateAnglesWithAI(ideaExpanderText, 7);
      if (angles.length > 0) {
        setExpandedAngles(angles);
        setShowAngleFeedback(true); // Show feedback UI after first batch
      } else {
        toast.error("Could not generate angles. Please check your API key in Settings.");
      }
    } catch (error) {
      console.error("Error generating angles:", error);
      toast.error("Failed to generate angles. Please try again.");
    } finally {
      setIsGeneratingAngles(false);
    }
  };

  const handleGenerateMoreAngles = async (direction?: string) => {
    const feedbackDirection = direction || selectedAngleDirection || angleFeedbackText;

    setIsGeneratingAngles(true);

    try {
      const moreAngles = await generateAnglesWithAI(ideaExpanderText, 7, {
        direction: feedbackDirection || undefined,
        alreadyGenerated: expandedAngles.length > 0 ? expandedAngles : undefined,
      });
      if (moreAngles.length > 0) {
        setExpandedAngles([...expandedAngles, ...moreAngles]);
        // Keep feedback section visible so user can keep refining direction
        setAngleFeedbackText("");
        setSelectedAngleDirection(null);
      }
    } catch (error) {
      console.error("Error generating more angles:", error);
      toast.error("Failed to generate more angles. Please try again.");
    } finally {
      setIsGeneratingAngles(false);
    }
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
      stageCompletions: { ...DEFAULT_STAGE_COMPLETIONS, ideate: true },
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === 'ideate' ? { ...col, cards: [...col.cards, newCard] } : col
      )
    );

    toast.success("Added to Bank of Ideas!", {
      action: {
        label: "View",
        onClick: () => {
          setIsIdeaExpanderOpen(false);
          setIsIdeateDialogOpen(false);
        },
      },
    });

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

    const now = new Date().toISOString();
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) => {
          if (card.id === cardId) {
            // Save to hook if it exists, otherwise save to title
            if (card.hook) {
              return { ...card, hook: newValue.trim(), lastUpdated: now };
            }
            return { ...card, title: newValue.trim(), lastUpdated: now };
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
      stageCompletions: { ...DEFAULT_STAGE_COMPLETIONS, ideate: true },
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

  // Mobile view handlers
  const handleMobileAddIdea = () => {
    setIsIdeateDialogOpen(true);
  };

  const handleMobileCardClick = (card: ProductionCard) => {
    // Open the appropriate editor based on card column
    if (card.columnId === 'ideate') {
      setEditingIdeateCard(card);
      setIdeateCardTitle(card.title);
      setIdeateCardNotes(card.description || '');
      setIsIdeateCardEditorOpen(true);
    } else {
      setEditingScriptCard(card);
      setCardTitle(card.title || '');
      setCardHook(card.hook || '');
      setScriptContent(card.script || '');
      setIsScriptEditorOpen(true);
    }
  };

  // Mobile view
  // State for mobile card editing
  const [mobileEditingCard, setMobileEditingCard] = useState<ProductionCard | null>(null);
  // State for mobile storyboard view (filming mode)
  const [mobileStoryboardCard, setMobileStoryboardCard] = useState<ProductionCard | null>(null);

  if (isMobile) {
    return (
      <>
        <MobileContentView
          columns={columns}
          onAddIdea={handleMobileAddIdea}
          onCardClick={(card) => setMobileEditingCard(card)}
        />

        {/* Simple Add Idea Dialog */}
        <Dialog open={isIdeateDialogOpen} onOpenChange={setIsIdeateDialogOpen}>
          <DialogContent className="max-w-[calc(100vw-32px)] rounded-2xl">
            <DialogHeader>
              <DialogTitle>New Idea</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Input
                placeholder="What's your idea?"
                value={brainstormText}
                onChange={(e) => setBrainstormText(e.target.value)}
                autoFocus
                className="text-base"
              />
              <Textarea
                placeholder="Any notes? (optional)"
                value={ideateCardNotes}
                onChange={(e) => setIdeateCardNotes(e.target.value)}
                rows={4}
                className="text-base resize-none"
              />
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  if (brainstormText.trim()) {
                    const newCard: ProductionCard = {
                      id: `card-${Date.now()}`,
                      title: brainstormText.trim(),
                      description: ideateCardNotes.trim() || undefined,
                      columnId: 'ideate',
                      addedFrom: 'quick-idea',
                      stageCompletions: { ...DEFAULT_STAGE_COMPLETIONS, ideate: true },
                    };
                    setColumns(prev => prev.map(col =>
                      col.id === 'ideate'
                        ? { ...col, cards: [...col.cards, newCard] }
                        : col
                    ));
                    setBrainstormText('');
                    setIdeateCardNotes('');
                    setIsIdeateDialogOpen(false);
                    toast.success('Idea added!');
                  }
                }}
                disabled={!brainstormText.trim()}
                className="w-full"
                style={{ background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)' }}
              >
                Add Idea
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mobile Card Editor */}
        {mobileEditingCard && (
          <MobileCardEditor
            card={mobileEditingCard}
            columns={columns}
            onSave={(updatedCard) => {
              setColumns(prev => prev.map(col => ({
                ...col,
                cards: col.cards.map(c => c.id === updatedCard.id ? updatedCard : c)
              })));
            }}
            onMove={(cardId, targetColumnId) => {
              setColumns(prev => {
                // Find the card and its current column
                let cardToMove: ProductionCard | null = null;
                const newColumns = prev.map(col => {
                  const card = col.cards.find(c => c.id === cardId);
                  if (card) {
                    cardToMove = { ...card, columnId: targetColumnId };
                    return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
                  }
                  return col;
                });

                // Add card to target column
                if (cardToMove) {
                  return newColumns.map(col =>
                    col.id === targetColumnId
                      ? { ...col, cards: [...col.cards, cardToMove!] }
                      : col
                  );
                }
                return newColumns;
              });
              toast.success('Card moved!');
            }}
            onDelete={(cardId) => {
              setColumns(prev => prev.map(col => ({
                ...col,
                cards: col.cards.filter(c => c.id !== cardId)
              })));
              toast.success('Card deleted');
            }}
            onClose={() => setMobileEditingCard(null)}
            onOpenStoryboard={(card) => {
              setMobileEditingCard(null);
              setMobileStoryboardCard(card);
            }}
          />
        )}

        {/* Mobile Storyboard View (Filming Mode) */}
        {mobileStoryboardCard && (
          <MobileStoryboardView
            card={mobileStoryboardCard}
            onClose={() => setMobileStoryboardCard(null)}
            onUpdateCard={(updatedCard) => {
              setColumns(prev => prev.map(col => ({
                ...col,
                cards: col.cards.map(c => c.id === updatedCard.id ? updatedCard : c)
              })));
            }}
            onBackToEditor={() => {
              const card = mobileStoryboardCard;
              setMobileStoryboardCard(null);
              setMobileEditingCard(card);
            }}
          />
        )}
      </>
    );
  }

  return (
      <div className="w-full h-screen flex flex-col pl-5 pr-3 pt-4" style={{ background: 'linear-gradient(180deg, #FAF7F5 0%, #F0EBE8 100%)' }}>
        <ProductionProvider value={board}>
        <KanbanContainer
          horizontalScrollRef={horizontalScrollRef}
          setScrollProgress={setScrollProgress}
        >
          {columns.map((column, index) => (
            <KanbanColumnComponent
              key={column.id}
              column={column}
              index={index}
              highlightedColumn={highlightedColumn}
              recentlyRepurposedCardId={recentlyRepurposedCardId}
              highlightedUnscheduledCardId={highlightedUnscheduledCardId}
              planningCardId={planningCardId}
              editingCardId={editingCardId}
              addingToColumn={addingToColumn}
              columnRefs={columnRefs}
              editInputRef={editInputRef}
              clickTimeoutRef={clickTimeoutRef}
              textRefs={textRefs}
              handleOpenScriptEditor={handleOpenScriptEditor}
              handleOpenStoryboard={handleOpenStoryboard}
              handleOpenIdeateCardEditor={handleOpenIdeateCardEditor}
              handleOpenEditChecklist={handleOpenEditChecklist}
              handleStartEditingCard={handleStartEditingCard}
              handleSaveCardEdit={handleSaveCardEdit}
              handleCreateInlineCard={handleCreateInlineCard}
              handleStartAddingCard={handleStartAddingCard}
              handleCancelAddingCard={handleCancelAddingCard}
              setEditingCardId={setEditingCardId}
              setPlanningCardId={setPlanningCardId}
              setSchedulingCard={setSchedulingCard}
              setIsScheduleColumnExpanded={setIsScheduleColumnExpanded}
              setSelectedIdeateCard={setSelectedIdeateCard}
              setIsIdeateDialogOpen={setIsIdeateDialogOpen}
              setAddingToColumn={setAddingToColumn}
            />
          ))}

          {/* Collapsible Archive Side Panel - inside KanbanContainer */}
          <div
            className="flex-shrink-0 self-stretch mr-4 w-[48px] relative flex items-end pb-6"
            onDragOver={(e) => handleDragOver(e, "posted")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "posted")}
          >
            <div
              className={cn(
                "group h-[280px] rounded-2xl transition-all duration-300 flex flex-col items-center justify-center overflow-hidden absolute right-0 bottom-6",
                draggedOverColumn === "posted" && draggedCard
                  ? "bg-[#F5F0F7] border-2 border-dashed border-[#8B7082] shadow-lg w-[180px]"
                  : "bg-white/90 backdrop-blur-sm border border-[#E8E4E6] shadow-md hover:shadow-lg hover:border-[#C9B5C0] w-[48px] hover:w-[180px]",
                draggedCard && "w-[180px]"
              )}
            >
              {/* Collapsed state - just icon */}
              <div className={cn(
                "flex flex-col items-center gap-2 transition-all duration-300",
                (draggedCard || draggedOverColumn === "posted") ? "opacity-0 absolute" : "group-hover:opacity-0 group-hover:absolute"
              )}>
                <Archive className="w-5 h-5 text-[#8B7082]" />
                <span className="text-[10px] text-[#8B7082] font-medium" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  Archive
                </span>
              </div>

              {/* Expanded state - full content */}
              <div className={cn(
                "flex flex-col items-center gap-3 px-4 transition-all duration-300",
                (draggedCard || draggedOverColumn === "posted") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                <Archive className={cn(
                  "w-7 h-7 transition-colors",
                  draggedOverColumn === "posted" && draggedCard
                    ? "text-[#6B5062]"
                    : "text-[#8B7082]"
                )} />

                <p className={cn(
                  "text-xs text-center transition-colors font-medium",
                  draggedOverColumn === "posted" && draggedCard
                    ? "text-[#5C466C]"
                    : "text-[#8B7082]"
                )}>
                  {draggedOverColumn === "posted" && draggedCard
                    ? "Release to archive"
                    : <>Drop cards here<br />to archive</>
                  }
                </p>

                {/* View archive button */}
                <button
                  onClick={() => setIsArchiveDialogOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-white font-medium bg-[#8B7082] hover:bg-[#7A6272] px-3 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <Archive className="w-3.5 h-3.5" />
                  View Archive
                </button>

                {/* Undo button */}
                {lastArchivedCard && (
                  <button
                    onClick={() => {
                      setArchivedCards((prev) => prev.filter((c) => c.id !== lastArchivedCard.card.id));
                      setColumns((prev) =>
                        prev.map((col) =>
                          col.id === 'to-schedule'
                            ? { ...col, cards: [{
                                ...lastArchivedCard.card,
                                columnId: 'to-schedule',
                                scheduledDate: undefined,
                                schedulingStatus: 'to-schedule',
                              }, ...col.cards] }
                            : col
                        )
                      );
                      setLastArchivedCard(null);
                      toast.success("Content restored!");
                    }}
                    className="flex items-center gap-1 text-[11px] text-[#7D6B87] hover:text-[#5C466C] font-medium bg-[#F5F0F7] hover:bg-[#E8DFED] px-2.5 py-1.5 rounded-md transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Undo
                  </button>
                )}
              </div>
            </div>
          </div>
        </KanbanContainer>
        </ProductionProvider>

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
            "border-0 shadow-2xl flex flex-col",
            ideateMode ? "h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] overflow-hidden" : "",
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
                <div className="space-y-8 px-6 pt-8 pb-6">
                  <div className="text-center pb-4">
                    <h3 className="text-2xl font-semibold text-[#612A4F] tracking-tight mb-3">Choose Your Starting Point</h3>
                    <p className="text-sm text-[#612A4F]/70">Select a method to guide your content ideation process</p>
                  </div>

                  <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {/* 1. Start With Your Pillars - Green */}
                    <button
                      onClick={() => setIsPillarsDialogOpen(true)}
                      className="group relative overflow-hidden bg-gradient-to-br from-[#F0FDF6] to-[#E6FAF0] border-l-4 border-l-[#2D9D70] border-y border-r border-[#D1EDE0] hover:border-[#2D9D70] rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(45,157,112,0.3)]"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#2D9D70]/10 to-transparent rounded-bl-full" />
                      <div className="relative flex flex-col items-center text-center space-y-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#2D9D70] to-[#1F7A55] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <Compass className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-black mb-2">Start With Your Pillars</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">Create content using a structured framework</p>
                        </div>
                      </div>
                    </button>

                    {/* 2. Trending Hooks - Coral */}
                    <button
                      onClick={() => setShowHooksDialog(true)}
                      className="group relative overflow-hidden bg-gradient-to-br from-[#FEF6F4] to-[#FDEEEA] border-l-4 border-l-[#E07A5F] border-y border-r border-[#F5D5CD] hover:border-[#E07A5F] rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(224,122,95,0.3)]"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#E07A5F]/10 to-transparent rounded-bl-full" />
                      <div className="relative flex flex-col items-center text-center space-y-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#E07A5F] to-[#C75D43] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-black mb-2">Trending Hooks</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">Start with hooks that are working now</p>
                        </div>
                      </div>
                    </button>

                    {/* 3. Idea Expander - Muted Purple */}
                    <button
                      onClick={() => setIsIdeaExpanderOpen(true)}
                      className="group relative overflow-hidden bg-gradient-to-br from-[#F8F6FB] to-[#F0EDF6] border-l-4 border-l-[#9B8AB8] border-y border-r border-[#DDD6E8] hover:border-[#9B8AB8] rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(155,138,184,0.3)]"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#9B8AB8]/10 to-transparent rounded-bl-full" />
                      <div className="relative flex flex-col items-center text-center space-y-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#9B8AB8] to-[#7A6A94] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-black mb-2">Idea Expander</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">Take one idea and explore multiple angles</p>
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
                                  stageCompletions: { ...DEFAULT_STAGE_COMPLETIONS, ideate: true },
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
            setSelectedSubCategory("");
            setCascadeIdeas([]);
          }
        }}>
          <DialogContent className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] border-0 shadow-2xl overflow-hidden flex flex-col bg-gradient-to-br from-[#F0F7F4] via-[#F7FAF8] to-[#E8F3EE]">
            <DialogHeader className="flex-shrink-0 px-8 pt-6">
              {/* Back Button */}
              <button
                onClick={() => setIsPillarsDialogOpen(false)}
                className="flex items-center gap-2 text-gray-400 hover:text-[#7BA393] transition-colors mb-6"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back</span>
              </button>

              <div className="mb-2">
                <DialogTitle className="text-2xl font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Content Pillars
                </DialogTitle>
              </div>
              <DialogDescription className="text-gray-500 text-sm">
                List the core themes your content revolves around
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 px-8 py-6">
              {/* Step 1: Pillars */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Your Content Pillars</h4>
                <div className="flex flex-wrap gap-3 mb-4">
                  {/* Show example pillars when user hasn't added any */}
                  {userPillars.length === 0 && !hasSeenPillarsExample && (
                    <>
                      {["Wellness", "Travel", "Productivity"].map((example) => (
                        <div
                          key={example}
                          className="px-5 py-2.5 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 text-gray-400 italic text-sm"
                        >
                          e.g. {example}
                        </div>
                      ))}
                    </>
                  )}
                  {userPillars.map((pillar, index) => (
                    <div key={index} className="relative group">
                      <div
                        onClick={async () => {
                          if (selectedUserPillar !== pillar) {
                            setSelectedUserPillar(pillar);
                            setSelectedSubCategory("");
                            setCascadeIdeas([]);

                            // Only generate sub-categories if they don't exist for this pillar
                            if (!pillarSubCategories[pillar] || pillarSubCategories[pillar].length === 0) {
                              setIsGeneratingSubCategories(true);
                              try {
                                const subCats = await generateSubCategoriesWithAI(pillar);
                                setPillarSubCategories(prev => ({ ...prev, [pillar]: subCats }));
                              } catch (error) {
                                console.error('Error generating subcategories:', error);
                              } finally {
                                setIsGeneratingSubCategories(false);
                              }
                            }
                          }
                        }}
                        className={cn(
                          "px-6 py-3 rounded-xl font-medium transition-all cursor-pointer shadow-sm",
                          selectedUserPillar === pillar
                            ? "bg-gradient-to-r from-[#7BA393] to-[#5A8A78] text-white shadow-md"
                            : "bg-white/80 border border-[#D4E5DE] text-gray-700 hover:border-[#7BA393] hover:shadow-md hover:bg-white"
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
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur(); // This triggers onBlur which handles generation
                            }
                          }}
                          onBlur={async (e) => {
                            const currentPillarValue = e.currentTarget.value;
                            // Clear auto-focus state
                            if (newPillarIndex === index) {
                              setNewPillarIndex(null);
                            }
                            // Generate sub-categories when user finishes typing pillar name (only if they don't exist)
                            if (currentPillarValue.trim() && currentPillarValue.trim().length >= 2) {
                              setSelectedUserPillar(currentPillarValue);
                              setSelectedSubCategory("");
                              setCascadeIdeas([]);

                              // Only generate if sub-categories don't exist for this pillar
                              if (!pillarSubCategories[currentPillarValue] || pillarSubCategories[currentPillarValue].length === 0) {
                                setIsGeneratingSubCategories(true);
                                try {
                                  const subCats = await generateSubCategoriesWithAI(currentPillarValue);
                                  setPillarSubCategories(prev => ({ ...prev, [currentPillarValue]: subCats }));
                                } catch (error) {
                                  console.error('Error generating subcategories:', error);
                                } finally {
                                  setIsGeneratingSubCategories(false);
                                }
                              }
                            }
                          }}
                          onMouseDown={(e) => {
                            if (document.activeElement === e.currentTarget) {
                              e.stopPropagation();
                            }
                          }}
                          autoFocus={newPillarIndex === index}
                          className={cn(
                            "bg-transparent border-none outline-none text-center min-w-[80px] max-w-[200px] cursor-pointer",
                            selectedUserPillar === pillar ? "text-white placeholder:text-white/70" : "text-gray-800 placeholder:text-gray-400"
                          )}
                          placeholder="Type..."
                          size={pillar.length || 10}
                        />
                      </div>
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
                    onClick={() => {
                      const newPillarName = "";
                      const newIndex = userPillars.length;
                      setUserPillars([...userPillars, newPillarName]);
                      setSelectedUserPillar(newPillarName);
                      setSelectedSubCategory("");
                      setCascadeIdeas([]);
                      setNewPillarIndex(newIndex);
                      setHasSeenPillarsExample(true);
                    }}
                    className="px-6 py-3 rounded-xl font-medium bg-white/60 text-[#5D8A7A] hover:bg-white/80 hover:shadow-sm transition-all border-2 border-dashed border-[#B8D4CA] hover:border-[#7BA393]"
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
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-700">
                      {selectedUserPillar} Sub-Categories
                    </h4>
                    {(pillarSubCategories[selectedUserPillar]?.length > 0) && (
                      <button
                        onClick={async () => {
                          setIsGeneratingSubCategories(true);
                          try {
                            const subCats = await generateSubCategoriesWithAI(selectedUserPillar);
                            setPillarSubCategories(prev => ({ ...prev, [selectedUserPillar]: subCats }));
                            setSelectedSubCategory("");
                            setCascadeIdeas([]);
                          } catch (error) {
                            console.error('Error regenerating subcategories:', error);
                          } finally {
                            setIsGeneratingSubCategories(false);
                          }
                        }}
                        disabled={isGeneratingSubCategories}
                        className="text-xs text-[#7BA393] hover:text-[#5D8A7A] font-medium disabled:opacity-50"
                      >
                        ↻ Regenerate
                      </button>
                    )}
                  </div>
                  {isGeneratingSubCategories ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#C8DED5] border-t-[#7BA393]"></div>
                      <span className="ml-3 text-gray-600">Generating sub-categories...</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(pillarSubCategories[selectedUserPillar] || []).map((subCat, index) => (
                        <div
                          key={index}
                          className="relative group"
                        >
                          <button
                            onClick={async () => {
                              // Don't auto-generate for newly added sub-categories - wait for Enter
                              if (newSubCategoryIndex === index) {
                                return;
                              }

                              // Don't generate if sub-category is empty or just whitespace
                              if (!subCat.trim()) {
                                return;
                              }

                              if (selectedSubCategory === subCat) {
                                return;
                              }

                              setSelectedSubCategory(subCat);
                              setCascadeIdeas([]);
                              setIsGeneratingCascadeIdeas(true);

                              try {
                                const ideas = await generateContentIdeasWithAI(selectedUserPillar, subCat);
                                setCascadeIdeas(ideas);
                              } catch (error) {
                                console.error('Error generating content ideas:', error);
                                setCascadeIdeas([]);
                              } finally {
                                setIsGeneratingCascadeIdeas(false);
                              }
                            }}
                            className={cn(
                              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center whitespace-nowrap",
                              selectedSubCategory === subCat
                                ? "bg-[#7BA393] text-white shadow-md"
                                : "bg-white border border-gray-300 text-gray-700 hover:border-[#9AC0B3] hover:bg-[#F0F7F4]"
                            )}
                          >
                            {newSubCategoryIndex === index ? (
                              <input
                                type="text"
                                value={subCat}
                                onChange={(e) => {
                                  const currentSubCats = [...(pillarSubCategories[selectedUserPillar] || [])];
                                  currentSubCats[index] = e.target.value;
                                  setPillarSubCategories(prev => ({
                                    ...prev,
                                    [selectedUserPillar]: currentSubCats
                                  }));
                                }}
                                onKeyDown={async (e) => {
                                  if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                  }
                                }}
                                onBlur={async () => {
                                  setNewSubCategoryIndex(null);
                                  const name = subCat.trim();
                                  if (!name) {
                                    // Remove empty sub-category
                                    const currentSubCats = (pillarSubCategories[selectedUserPillar] || []).filter((_, i) => i !== index);
                                    setPillarSubCategories(prev => ({
                                      ...prev,
                                      [selectedUserPillar]: currentSubCats
                                    }));
                                    return;
                                  }
                                  // Select it and generate ideas
                                  setSelectedSubCategory(name);
                                  setCascadeIdeas([]);
                                  setIsGeneratingCascadeIdeas(true);
                                  try {
                                    const ideas = await generateContentIdeasWithAI(selectedUserPillar, name);
                                    setCascadeIdeas(ideas);
                                  } catch (error) {
                                    console.error('Error generating content ideas:', error);
                                    setCascadeIdeas([]);
                                  } finally {
                                    setIsGeneratingCascadeIdeas(false);
                                  }
                                }}
                                autoFocus
                                className="bg-transparent border-none outline-none text-center min-w-[60px] max-w-[150px] text-gray-700 placeholder:text-gray-400"
                                placeholder="Type..."
                                size={subCat.length || 6}
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              subCat
                            )}
                          </button>
                          {(pillarSubCategories[selectedUserPillar]?.length || 0) > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentSubCats = pillarSubCategories[selectedUserPillar] || [];
                                setPillarSubCategories(prev => ({
                                  ...prev,
                                  [selectedUserPillar]: currentSubCats.filter((_, i) => i !== index)
                                }));
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
                          const currentSubCats = pillarSubCategories[selectedUserPillar] || [];
                          const newIndex = currentSubCats.length;
                          setPillarSubCategories(prev => ({
                            ...prev,
                            [selectedUserPillar]: [...currentSubCats, ""]
                          }));
                          setNewSubCategoryIndex(newIndex);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-[#E8F3EF] text-[#5D8A7A] hover:bg-[#D8EBE4] transition-all border-2 border-dashed border-[#B8D4CA]"
                      >
                        + Add Sub-Category
                      </button>
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
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#C8DED5] border-t-[#7BA393]"></div>
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
                                ? "bg-[#E8F3EF] border-[#7BA393] shadow-lg"
                                : "bg-white border-gray-200 hover:border-[#9AC0B3] hover:shadow-md"
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
                                  stageCompletions: { ...DEFAULT_STAGE_COMPLETIONS, ideate: true },
                                };
                                setColumns((prev) =>
                                  prev.map((col) =>
                                    col.id === 'ideate' ? { ...col, cards: [...col.cards, newCard] } : col
                                  )
                                );
                                toast.success("Added to Bank of Ideas!", {
                                  action: {
                                    label: "View",
                                    onClick: () => {
                                      setIsPillarsDialogOpen(false);
                                      setIsIdeateDialogOpen(false);
                                    },
                                  },
                                });
                                // Show success state briefly before removing
                                setAddedIdeaText(idea);
                                setTimeout(() => {
                                  // Remove the idea from the list (triggers exit animation)
                                  setCascadeIdeas((prev) => prev.filter((i) => i !== idea));
                                  setAddedIdeaText(null);
                                }, 500);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#7BA393] hover:bg-[#6B9080] text-white text-xs px-3 py-1.5 h-auto whitespace-nowrap"
                            >
                              Add to Bank of Ideas
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
                              const newIdeas = await generateContentIdeasWithAI(selectedUserPillar, selectedSubCategory);
                              // Filter out ideas already shown
                              const filteredIdeas = newIdeas.filter(idea => !cascadeIdeas.includes(idea));
                              setCascadeIdeas([...cascadeIdeas, ...filteredIdeas]);
                            } catch (error) {
                              console.error('Error generating more ideas:', error);
                            } finally {
                              setIsGeneratingMoreIdeas(false);
                            }
                          }}
                          disabled={isGeneratingMoreIdeas}
                          className="w-full mt-4 px-4 py-3 rounded-lg text-sm font-medium bg-[#F0F7F4] text-[#5D8A7A] hover:bg-[#E8F3EF] transition-all border-2 border-dashed border-[#B8D4CA] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGeneratingMoreIdeas ? (
                            <span className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#C8DED5] border-t-[#7BA393] mr-2"></div>
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
            // Keep ideaExpanderText and expandedAngles - they're persisted
            setShowAngleFeedback(false);
            setAngleFeedbackText("");
            setSelectedAngleDirection(null);
          }
        }}>
          <DialogContent className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] overflow-hidden border-0 shadow-2xl flex flex-col bg-gradient-to-br from-[#F5F0F8] via-[#FAF7FC] to-[#EDE5F3]">
            <DialogHeader className="flex-shrink-0 px-8 pt-6">
              {/* Back Button */}
              <button
                onClick={() => setIsIdeaExpanderOpen(false)}
                className="flex items-center gap-2 text-gray-400 hover:text-[#9B8AB8] transition-colors mb-6"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back</span>
              </button>

              <div className="flex items-center justify-between mb-2">
                <DialogTitle className="text-2xl font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Idea Expander
                </DialogTitle>
                {(ideaExpanderText.trim() || expandedAngles.length > 0) && (
                  <button
                    onClick={() => {
                      setIdeaExpanderText("");
                      setExpandedAngles([]);
                      setShowAngleFeedback(false);
                      setAngleFeedbackText("");
                      setSelectedAngleDirection(null);
                    }}
                    className="text-xs text-gray-400 hover:text-[#9B8AB8] transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Start fresh
                  </button>
                )}
              </div>
              <DialogDescription className="text-gray-500 text-sm">
                Enter your idea and get multiple content angles to explore
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 px-8 py-6">
              <div className="space-y-6">
                {/* User Input Section */}
                <div className="space-y-4">
                  <Textarea
                    value={ideaExpanderText}
                    onChange={(e) => setIdeaExpanderText(e.target.value)}
                    placeholder="Enter your content idea here... For example: 'morning routine for productivity', 'sustainable fashion tips', 'home workout guide'"
                    className="min-h-[140px] border border-[#E8E2EA] focus:border-[#9B8AB8] focus:ring-2 focus:ring-[#9B8AB8]/20 rounded-xl resize-none text-base p-5 bg-white/80 shadow-sm"
                  />
                  <Button
                    onClick={handleGenerateAngles}
                    disabled={!ideaExpanderText.trim() || isGeneratingAngles}
                    className="w-full bg-gradient-to-r from-[#9B8AB8] to-[#7A6A94] hover:from-[#8A7AA8] hover:to-[#695A84] text-white rounded-xl shadow-md py-6 text-base font-medium"
                  >
                    {isGeneratingAngles ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating Angles...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Generate Ideas
                      </div>
                    )}
                  </Button>
                </div>

                {/* AI Generated Angles Section */}
                {expandedAngles.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-[#9B8AB8] to-[#7A6A94] rounded-full"></div>
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
                              "relative group text-left p-4 border-2 rounded-xl flex items-center justify-between gap-3",
                              addedAngleText === angle
                                ? "bg-purple-100 border-[#9B8AB8] shadow-lg"
                                : "bg-gradient-to-r from-[#F8F5FB] to-[#F3EFF8] border-[#D4C9E0] hover:border-[#9B8AB8] hover:shadow-md"
                            )}
                          >
                            <p className="text-sm text-gray-700 font-medium flex-1">
                              {angle}
                            </p>
                            <Button
                              size="sm"
                              onClick={() => handleSelectAngle(angle)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-[#9B8AB8] to-[#7A6A94] hover:from-[#8A7AA8] hover:to-[#695A84] text-white text-xs px-3 py-1.5 h-auto whitespace-nowrap rounded-lg"
                            >
                              Add to Bank of Ideas
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* AI Feedback Section */}
                    {showAngleFeedback && expandedAngles.length > 0 && expandedAngles.length < 30 && (
                      <div className="mt-6 p-5 bg-white/80 rounded-xl border border-[#D4C9E0]">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="h-4 w-4 text-[#9B8AB8]" />
                          <p className="text-sm font-medium text-gray-700">What direction would you like MegAI to explore?</p>
                        </div>

                        {/* Quick Direction Options */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {[
                            { label: "More fun & playful", value: "Make them more fun, playful, and entertaining - less serious" },
                            { label: "More storytelling", value: "Make them sound more like personal stories and narratives I could tell" },
                            { label: "More vulnerable", value: "Make them more vulnerable and emotionally honest - real struggles and feelings" }
                          ].map((option) => (
                            <button
                              key={option.label}
                              onClick={() => setSelectedAngleDirection(
                                selectedAngleDirection === option.value ? null : option.value
                              )}
                              className={cn(
                                "px-3 py-2 text-xs font-medium rounded-lg transition-all",
                                selectedAngleDirection === option.value
                                  ? "bg-[#9B8AB8] text-white"
                                  : "bg-[#F8F5FB] text-[#7A6A94] hover:bg-[#EDE5F3] border border-[#D4C9E0]"
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>

                        {/* Custom Feedback Input */}
                        <div className="mb-4">
                          <textarea
                            value={angleFeedbackText}
                            onChange={(e) => setAngleFeedbackText(e.target.value)}
                            placeholder="Or tell me exactly what you're looking for..."
                            className="w-full px-3 py-2 text-sm border border-[#D4C9E0] rounded-lg focus:border-[#9B8AB8] focus:ring-1 focus:ring-[#9B8AB8]/20 outline-none resize-none bg-white/60"
                            rows={2}
                          />
                        </div>

                        {/* Generate Button */}
                        <Button
                          onClick={() => handleGenerateMoreAngles()}
                          disabled={isGeneratingAngles || (!selectedAngleDirection && !angleFeedbackText.trim())}
                          className="w-full bg-gradient-to-r from-[#9B8AB8] to-[#7A6A94] hover:from-[#8A7AA8] hover:to-[#695A84] text-white rounded-lg disabled:opacity-50"
                        >
                          {isGeneratingAngles ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Generating...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              Generate 7 More Ideas
                            </div>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Simple More Ideas Button (after feedback has been used) */}
                    {!showAngleFeedback && expandedAngles.length > 0 && expandedAngles.length < 30 && (
                      <Button
                        onClick={() => setShowAngleFeedback(true)}
                        disabled={isGeneratingAngles}
                        className="w-full mt-4 bg-white hover:bg-[#F8F5FB] text-gray-900 border-2 border-[#D4C9E0] hover:border-[#9B8AB8] rounded-xl"
                        variant="outline"
                      >
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Generate More Ideas
                        </div>
                      </Button>
                    )}
                  </div>
                )}

                              </div>
            </div>
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
          cardHook={cardHook}
          setCardHook={setCardHook}
          scriptContent={scriptContent}
          setScriptContent={setScriptContent}
          showBrainDumpSuggestion={showBrainDumpSuggestion}
          brainDumpSuggestion={brainDumpSuggestion}
          setShowBrainDumpSuggestion={handleBrainDumpDismiss}
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
          onAddPlatformTag={handleAddPlatformTag}
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
          completedSteps={getCompletedSteps(editingScriptCard)}
          caption={caption}
          setCaption={setCaption}
          card={editingScriptCard}
          onToggleStage={handleToggleStage}
          onToggleComplete={handleToggleStepComplete}
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
          completedSteps={getCompletedSteps(editingIdeateCard)}
          card={editingIdeateCard}
          onToggleStage={handleToggleStage}
          onToggleComplete={handleToggleStepComplete}
        />

        <StoryboardEditorDialog
          open={isStoryboardDialogOpen}
          onOpenChange={setIsStoryboardDialogOpen}
          card={editingStoryboardCard}
          onSave={handleSaveStoryboard}
          onNavigateToStep={handleNavigateToStep}
          slideDirection={slideDirection}
          completedSteps={getCompletedSteps(editingStoryboardCard)}
          onToggleStage={handleToggleStage}
          onToggleComplete={handleToggleStepComplete}
        />

        <EditChecklistDialog
          isOpen={isEditChecklistDialogOpen}
          onOpenChange={setIsEditChecklistDialogOpen}
          card={editingEditCard}
          onSave={handleSaveEditChecklist}
          onNavigateToStep={handleNavigateToStep}
          slideDirection={slideDirection}
          completedSteps={getCompletedSteps(editingEditCard)}
          onToggleStage={handleToggleStage}
          onToggleComplete={handleToggleStepComplete}
        />

        {/* Unified Content Flow Dialog - seamless transitions between steps */}
        <ContentFlowDialog
          activeStep={activeContentFlowStep}
          onClose={handleCloseContentFlowDialog}
          slideDirection={slideDirection}
          contentType={contentType}
          onContentTypeChange={handleContentTypeChange}
          onSelectContentTypeAndProceed={handleSelectContentTypeAndProceed}
          card={contentFlowCard}
          onToggleStage={handleToggleStage}
        >
          {/* Step 1: Ideate (same for both video and image) */}
          {activeContentFlowStep === 1 && contentFlowCard && (
            <BrainDumpGuidanceDialog
              isOpen={true}
              onOpenChange={(open) => {
                if (!open) {
                  handleCloseContentFlowDialog();
                }
              }}
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
              completedSteps={getCompletedSteps(contentFlowCard)}
              contentType={contentType}
              onContentTypeChange={handleContentTypeChange}
              onToggleComplete={handleToggleStepComplete}
            />
          )}

          {/* Step 2: Script (video) or Concept (image) */}
          {activeContentFlowStep === 2 && contentFlowCard && contentType === 'video' && (
            <ScriptEditorDialog
              isOpen={true}
              onOpenChange={(open) => {
                if (!open) {
                  handleCloseContentFlowDialog();
                }
              }}
              card={contentFlowCard}
              onSave={handleSaveScript}
              cardTitle={cardTitle}
              setCardTitle={setCardTitle}
              cardHook={cardHook}
              setCardHook={setCardHook}
              scriptContent={scriptContent}
              setScriptContent={setScriptContent}
              showBrainDumpSuggestion={showBrainDumpSuggestion}
              brainDumpSuggestion={brainDumpSuggestion}
              setShowBrainDumpSuggestion={handleBrainDumpDismiss}
              platformTags={platformTags}
              setPlatformTags={setPlatformTags}
              formatTags={formatTags}
              setFormatTags={setFormatTags}
              showCustomFormatInput={showCustomFormatInput}
              setShowCustomFormatInput={setShowCustomFormatInput}
              customFormatInput={customFormatInput}
              setCustomFormatInput={setCustomFormatInput}
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
              onRemoveFormatTag={handleRemoveFormatTag}
              onAddPlatformTag={handleAddPlatformTag}
              onRemovePlatformTag={handleRemovePlatformTag}
              showCustomPlatformInput={showCustomPlatformInput}
              setShowCustomPlatformInput={setShowCustomPlatformInput}
              customPlatformInput={customPlatformInput}
              setCustomPlatformInput={setCustomPlatformInput}
              onNavigateToStep={handleNavigateToStep}
              slideDirection={slideDirection}
              embedded={true}
              completedSteps={getCompletedSteps(contentFlowCard)}
              contentType={contentType}
              onContentTypeChange={handleContentTypeChange}
              caption={caption}
              setCaption={setCaption}
              onToggleComplete={handleToggleStepComplete}
            />
          )}
          {activeContentFlowStep === 2 && contentFlowCard && contentType === 'image' && (
            <ConceptEditorDialog
              isOpen={true}
              onOpenChange={(open) => {
                if (!open) {
                  handleCloseContentFlowDialog();
                }
              }}
              onSave={() => {}}
              cardTitle={cardTitle}
              setCardTitle={setCardTitle}
              cardHook={cardHook}
              setCardHook={setCardHook}
              caption={caption}
              setCaption={setCaption}
              visualReferences={visualReferences}
              setVisualReferences={setVisualReferences}
              linkPreviews={linkPreviews}
              setLinkPreviews={setLinkPreviews}
              slides={slides}
              setSlides={setSlides}
              imageMode={imageMode}
              setImageMode={setImageMode}
              platformTags={platformTags}
              setPlatformTags={setPlatformTags}
              showCustomPlatformInput={showCustomPlatformInput}
              setShowCustomPlatformInput={setShowCustomPlatformInput}
              customPlatformInput={customPlatformInput}
              setCustomPlatformInput={setCustomPlatformInput}
              onAddPlatformTag={handleAddPlatformTag}
              onRemovePlatformTag={handleRemovePlatformTag}
              onNavigateToStep={handleNavigateToStep}
              slideDirection={slideDirection}
              embedded={true}
              completedSteps={getCompletedSteps(contentFlowCard)}
              contentType={contentType}
              onContentTypeChange={handleContentTypeChange}
              onToggleComplete={handleToggleStepComplete}
            />
          )}

          {/* Step 3: Film (video) or Edit (image) */}
          {activeContentFlowStep === 3 && contentFlowCard && contentType === 'video' && (
            <StoryboardEditorDialog
              open={true}
              onOpenChange={(open) => {
                if (!open) {
                  handleCloseContentFlowDialog();
                }
              }}
              card={contentFlowCard}
              onSave={handleSaveStoryboard}
              onNavigateToStep={handleNavigateToStep}
              slideDirection={slideDirection}
              embedded={true}
              completedSteps={getCompletedSteps(contentFlowCard)}
              contentType={contentType}
              onContentTypeChange={handleContentTypeChange}
              onToggleComplete={handleToggleStepComplete}
            />
          )}
          {activeContentFlowStep === 3 && contentFlowCard && contentType === 'image' && (
            <EditChecklistDialog
              isOpen={true}
              onOpenChange={(open) => {
                if (!open) {
                  handleCloseContentFlowDialog();
                }
              }}
              card={contentFlowCard}
              onSave={handleSaveEditChecklist}
              onNavigateToStep={handleNavigateToStep}
              slideDirection={slideDirection}
              embedded={true}
              completedSteps={getCompletedSteps(contentFlowCard)}
              contentType="image"
              onContentTypeChange={handleContentTypeChange}
              onToggleComplete={handleToggleStepComplete}
            />
          )}

          {/* Step 4: Edit (video) or Schedule (image) */}
          {activeContentFlowStep === 4 && contentFlowCard && contentType === 'video' && (
            <EditChecklistDialog
              isOpen={true}
              onOpenChange={(open) => {
                if (!open) {
                  handleCloseContentFlowDialog();
                }
              }}
              card={contentFlowCard}
              onSave={handleSaveEditChecklist}
              onNavigateToStep={handleNavigateToStep}
              slideDirection={slideDirection}
              embedded={true}
              completedSteps={getCompletedSteps(contentFlowCard)}
              contentType="video"
              onContentTypeChange={handleContentTypeChange}
              onToggleComplete={handleToggleStepComplete}
            />
          )}
          {/* Step 5: Ready to Post (video only) */}
          {activeContentFlowStep === 5 && contentType === 'video' && contentFlowCard && (
            <ReadyToPostStep
              onNavigateToStep={handleNavigateToStep}
              onClose={handleCloseContentFlowDialog}
              onConfirmReady={() => {
                // Move card to ready-to-post column
                setColumns((prev) => {
                  let sourceColumnId: string | undefined;
                  for (const col of prev) {
                    if (col.cards.find(c => c.id === contentFlowCard.id)) {
                      sourceColumnId = col.id;
                      break;
                    }
                  }
                  if (sourceColumnId === 'ready-to-post') {
                    // Already in ready-to-post, no move needed
                    return prev;
                  }
                  const updatedCard: ProductionCard = {
                    ...contentFlowCard,
                    columnId: 'ready-to-post',
                  };
                  if (sourceColumnId) {
                    return prev.map((col) => {
                      if (col.id === sourceColumnId) {
                        return { ...col, cards: col.cards.filter(c => c.id !== contentFlowCard.id) };
                      }
                      if (col.id === 'ready-to-post') {
                        return { ...col, cards: [...col.cards, updatedCard] };
                      }
                      return col;
                    });
                  }
                  return prev;
                });
                // Update the content flow card reference
                setContentFlowCard({ ...contentFlowCard, columnId: 'ready-to-post' });
              }}
              onSaveAndExit={handleCloseContentFlowDialog}
              completedSteps={getCompletedSteps(contentFlowCard)}
              contentType={contentType}
              onToggleComplete={handleToggleStepComplete}
            />
          )}
          {/* Step 6: Schedule (video) — or step 4 for image is handled above */}
          {((activeContentFlowStep === 6 && contentType === 'video') || (activeContentFlowStep === 4 && contentType === 'image')) && contentFlowCard && (
            <ExpandedScheduleView
              embedded={true}
              singleCard={contentFlowCard}
              onClose={handleCloseContentFlowDialog}
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
                // Close the content flow dialog after moving
                setActiveContentFlowStep(null);
                setContentFlowCard(null);
              }}
              completedSteps={getCompletedSteps(contentFlowCard)}
              onOpenContentFlow={handleOpenContentFlowForCard}
              onToggleComplete={handleToggleStepComplete}
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
            onOpenContentFlow={handleOpenContentFlowForCard}
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
              // Close the expanded schedule view after moving
              setIsScheduleColumnExpanded(false);
              setSchedulingCard(null);
            }}
            completedSteps={getCompletedSteps(schedulingCard)}
            onToggleComplete={handleToggleStepComplete}
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

        {/* Skip Column Nudge Dialog */}
        <SkipColumnDialog
          open={showSkipColumnDialog}
          cardTitle={pendingSkipMove?.card.title || pendingSkipMove?.card.hook || ''}
          skippedColumnIds={pendingSkipMove?.skippedColumnIds || []}
          targetColumnTitle={
            columns.find(c => c.id === pendingSkipMove?.targetColumnId)?.title || ''
          }
          onConfirm={() => handleSkipColumnChoice(true)}
          onCancel={() => handleSkipColumnChoice(false)}
        />

              </div>
  );
};

export default Production;
