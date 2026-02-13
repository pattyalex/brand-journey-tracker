import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import ContentFlowProgress from "./ContentFlowProgress";
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
import { Textarea } from "@/components/ui/textarea";
import { getFormatColors, getPlatformColors } from "../utils/productionHelpers";
import { SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import { MoreHorizontal, Video, Camera, ChevronDown, X, Circle, Wrench, CheckCircle2, MapPin, Shirt, Boxes, NotebookPen, PenLine, Check, Plus, ArrowRight, ArrowDown, Sparkles, Send, Bot, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

// Helper to get platform icon
const getPlatformIcon = (platform: string): React.ReactNode => {
  const lowercased = platform.toLowerCase();
  const iconClass = "w-4 h-4 text-gray-500";

  if (lowercased.includes("youtube")) return <SiYoutube className={iconClass} />;
  if (lowercased.includes("tiktok") || lowercased === "tt") return <SiTiktok className={iconClass} />;
  if (lowercased.includes("instagram") || lowercased === "ig") return <SiInstagram className={iconClass} />;
  if (lowercased.includes("facebook")) return <SiFacebook className={iconClass} />;
  if (lowercased.includes("linkedin")) return <SiLinkedin className={iconClass} />;
  if (lowercased.includes("twitter") || lowercased.includes("x.com") || lowercased.includes("x /")) return <RiTwitterXLine className={iconClass} />;
  if (lowercased.includes("threads")) return <RiThreadsLine className={iconClass} />;
  return null;
};

// Static formats that should show camera icon
const staticFormats = [
  'single photo post',
  'curated photo carousel',
  'casual photo dump',
  'text-only post',
  'carousel with text slides',
  'notes-app style screenshot',
  'tweet-style slide'
];

const isStaticFormat = (format: string): boolean => {
  return staticFormats.some(sf => format.toLowerCase().includes(sf) || sf.includes(format.toLowerCase()));
};

type CardStatus = "to-start" | "needs-work" | "ready";

interface ScriptEditorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel?: () => void;
  onSave: () => void;
  embedded?: boolean;
  titleInputRef?: React.RefObject<HTMLInputElement>;
  locationInputRef?: React.RefObject<HTMLTextAreaElement>;
  outfitInputRef?: React.RefObject<HTMLTextAreaElement>;
  propsInputRef?: React.RefObject<HTMLTextAreaElement>;
  notesInputRef?: React.RefObject<HTMLTextAreaElement>;
  cardTitle: string;
  setCardTitle: (value: string) => void;
  cardHook: string;
  setCardHook: (value: string) => void;
  scriptContent: string;
  setScriptContent: (value: string) => void;
  showBrainDumpSuggestion: boolean;
  brainDumpSuggestion: string;
  setShowBrainDumpSuggestion: (value: boolean) => void;
  formatTags: string[];
  setFormatTags: (value: string[]) => void;
  showCustomFormatInput: boolean;
  setShowCustomFormatInput: (value: boolean) => void;
  customFormatInput: string;
  setCustomFormatInput: (value: string) => void;
  platformTags: string[];
  setPlatformTags: (value: string[]) => void;
  showCustomPlatformInput: boolean;
  setShowCustomPlatformInput: (value: boolean) => void;
  customPlatformInput: string;
  setCustomPlatformInput: (value: string) => void;
  onRemoveFormatTag: (tag: string) => void;
  onRemovePlatformTag: (tag: string) => void;
  customVideoFormats: string[];
  setCustomVideoFormats: (value: string[]) => void;
  customPhotoFormats: string[];
  setCustomPhotoFormats: (value: string[]) => void;
  locationText: string;
  setLocationText: (value: string) => void;
  outfitText: string;
  setOutfitText: (value: string) => void;
  propsText: string;
  setPropsText: (value: string) => void;
  filmingNotes: string;
  setFilmingNotes: (value: string) => void;
  cardStatus: CardStatus;
  setCardStatus: (value: CardStatus) => void;
  onNavigateToStep?: (step: number) => void;
  slideDirection?: 'left' | 'right';
  completedSteps?: number[];
  caption?: string;
  setCaption?: (value: string) => void;
}

const ScriptEditorDialog: React.FC<ScriptEditorDialogProps> = ({
  isOpen,
  onOpenChange,
  onCancel,
  onSave,
  embedded = false,
  titleInputRef: externalTitleRef,
  locationInputRef: externalLocationRef,
  outfitInputRef: externalOutfitRef,
  propsInputRef: externalPropsRef,
  notesInputRef: externalNotesRef,
  cardTitle,
  setCardTitle,
  cardHook,
  setCardHook,
  scriptContent,
  setScriptContent,
  showBrainDumpSuggestion,
  brainDumpSuggestion,
  setShowBrainDumpSuggestion,
  formatTags,
  setFormatTags,
  showCustomFormatInput,
  setShowCustomFormatInput,
  customFormatInput,
  setCustomFormatInput,
  platformTags,
  setPlatformTags,
  showCustomPlatformInput,
  setShowCustomPlatformInput,
  customPlatformInput,
  setCustomPlatformInput,
  onRemoveFormatTag,
  onRemovePlatformTag,
  customVideoFormats,
  setCustomVideoFormats,
  customPhotoFormats,
  setCustomPhotoFormats,
  locationText,
  setLocationText,
  outfitText,
  setOutfitText,
  propsText,
  setPropsText,
  filmingNotes,
  setFilmingNotes,
  cardStatus,
  setCardStatus,
  onNavigateToStep,
  slideDirection = 'right',
  completedSteps = [],
  caption = '',
  setCaption,
}) => {
  // Internal refs for shooting plan navigation (fallback when external refs not provided)
  const internalTitleRef = useRef<HTMLInputElement>(null);
  const internalLocationRef = useRef<HTMLTextAreaElement>(null);
  const internalOutfitRef = useRef<HTMLTextAreaElement>(null);
  const internalPropsRef = useRef<HTMLTextAreaElement>(null);
  const internalNotesRef = useRef<HTMLTextAreaElement>(null);

  // Use external refs if provided, otherwise use internal refs
  const titleInputRef = externalTitleRef || internalTitleRef;
  const locationInputRef = externalLocationRef || internalLocationRef;
  const outfitInputRef = externalOutfitRef || internalOutfitRef;
  const propsInputRef = externalPropsRef || internalPropsRef;
  const notesInputRef = externalNotesRef || internalNotesRef;

  const [shakeButton, setShakeButton] = useState(false);
  const [isMegAIOpen, setIsMegAIOpen] = useState(false);
  const [megAIMessages, setMegAIMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [megAIInput, setMegAIInput] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [megAIMessages, isAILoading]);

  const getSystemPrompt = () => `You are MegAI, a helpful script writing assistant for social media content creators. You help improve scripts, suggest hooks, make content more engaging, and provide actionable feedback.

${scriptContent ? `The user is working on a script titled "${cardHook || cardTitle || 'Untitled'}":
---
${scriptContent}
---` : `The user is starting a new script${(cardHook || cardTitle) ? ` titled "${cardHook || cardTitle}"` : ''}.`}

${platformTags.length > 0 ? `Target platforms: ${platformTags.join(', ')}` : ''}
${formatTags.length > 0 ? `Content format: ${formatTags.join(', ')}` : ''}

Guidelines:
- SKIP introductions like "I'll help you..." or "Here's a..." - go STRAIGHT to the content
- Give specific, actionable suggestions based on the actual script content
- When asked to rewrite or improve, provide the actual improved text immediately
- Keep responses concise and direct
- Use bullet points for multiple suggestions
- If suggesting a hook, provide 2-3 specific options they can use right away
- Match the tone and style of their existing content
- Never use filler phrases - be direct and get to the point`;

  const callAI = async (userMessage: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    if (!apiKey) {
      return "AI service is temporarily unavailable. Please try again later.";
    }

    const systemPrompt = getSystemPrompt();

    try {
      const conversationHistory = megAIMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      conversationHistory.push({
        role: "user" as const,
        content: userMessage
      });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 800,
          system: systemPrompt,
          messages: conversationHistory
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Claude API error:", data);
        return "AI service is temporarily unavailable. Please try again.";
      }

      return data.content[0].text;
    } catch (error) {
      console.error("Error calling AI:", error);
      return "AI service is temporarily unavailable. Please try again.";
    }
  };

  const handleMegAISend = async (directMessage?: string) => {
    const messageToSend = directMessage || megAIInput.trim();
    if (!messageToSend || isAILoading) return;

    setMegAIMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    if (!directMessage) setMegAIInput("");
    setIsAILoading(true);

    try {
      const aiResponse = await callAI(messageToSend);
      setMegAIMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error("MegAI error:", error);
      toast.error("Failed to get AI response");
    } finally {
      setIsAILoading(false);
    }
  };

  const applyAISuggestion = (suggestion: string) => {
    setScriptContent(prev => prev + (prev ? "\n\n" : "") + suggestion);
  };

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

  const [addingFormatType, setAddingFormatType] = React.useState<'video' | 'photo' | null>(null);

  const handleAddCustomFormat = (format: string) => {
    if (!format.trim()) return;
    const trimmed = format.trim();

    // Add to the appropriate custom formats list
    if (addingFormatType === 'video') {
      if (!customVideoFormats.includes(trimmed)) {
        setCustomVideoFormats([...customVideoFormats, trimmed]);
      }
    } else if (addingFormatType === 'photo') {
      if (!customPhotoFormats.includes(trimmed)) {
        setCustomPhotoFormats([...customPhotoFormats, trimmed]);
      }
    }

    // Also add to selected formats if not already there
    if (!formatTags.includes(trimmed)) {
      setFormatTags([...formatTags, trimmed]);
    }

    setCustomFormatInput("");
    setShowCustomFormatInput(false);
    setAddingFormatType(null);
  };

  const handleRemoveCustomFormat = (format: string, type: 'video' | 'photo') => {
    if (type === 'video') {
      setCustomVideoFormats(customVideoFormats.filter(f => f !== format));
    } else {
      setCustomPhotoFormats(customPhotoFormats.filter(f => f !== format));
    }
    // Also remove from selected formats
    onRemoveFormatTag(format);
  };

  // Content that's shared between embedded and standalone modes
  const dialogContent = (
    <div onClick={() => isMegAIOpen && setIsMegAIOpen(false)} className="flex flex-col h-full">
      {/* Close Button */}
      <button
        onClick={() => onOpenChange(false)}
        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Step Progress Indicator - Centered */}
      <div className="flex justify-center pt-2 pb-4 flex-shrink-0">
        <ContentFlowProgress currentStep={2} className="w-[550px]" onStepClick={onNavigateToStep} completedSteps={completedSteps} />
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-1">
        {/* Title Section + Move to Film Button */}
        <div className="flex items-center gap-4 border-b border-gray-200 pb-2 mb-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={cardHook || cardTitle}
                  onChange={(e) => {
                    setCardHook(e.target.value);
                    // Also sync to title for backwards compatibility
                    if (!cardTitle) setCardTitle(e.target.value);
                  }}
                  tabIndex={-1}
                  autoComplete="off"
                  placeholder="Enter content title..."
                  className="w-2/3 px-0 py-1 text-xl font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-[#A0A0A0] truncate"
                />
              </TooltipTrigger>
              {(cardHook || cardTitle) && (cardHook || cardTitle).length > 30 && (
                <TooltipContent side="bottom" className="max-w-md">
                  {cardHook || cardTitle}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <Button
            size="sm"
            onClick={() => onNavigateToStep?.(3)}
            className="bg-[#612A4F] hover:bg-[#4A1F3D] text-white flex-shrink-0 ml-auto text-sm"
          >
            Save & Move to Film <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-[1fr,280px] gap-6 items-start relative">
          {/* Left Column - Talking Points */}
          <div className="space-y-3">
            <label className="text-[12px] font-medium text-[#612A4F] uppercase tracking-wider">
              Talking Points
            </label>

            {/* Brain Dump Suggestion Block */}
            {showBrainDumpSuggestion && brainDumpSuggestion && (
              <div className="bg-gradient-to-r from-[#C4A4B5]/15 to-[#D4B4C5]/15 border border-[#C4A4B5]/30 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[#9E7089] mb-2">
                      From your brainstorming notes:
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {brainDumpSuggestion}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBrainDumpSuggestion(false)}
                    className="text-[#C4A4B5] hover:text-[#9E7089] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-center mt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            setScriptContent(scriptContent + (scriptContent ? "\n\n" : "") + brainDumpSuggestion);
                            setShowBrainDumpSuggestion(false);
                          }}
                          className="w-8 h-8 rounded-full bg-[#9E7089] text-white flex items-center justify-center hover:bg-[#8B7082] transition-colors shadow-sm hover:shadow-md"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Append to Script</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )}

            {/* Textarea with AI button */}
            <div className="relative">
              <Textarea
                value={scriptContent}
                onChange={(e) => setScriptContent(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Write your script here..."
                className="min-h-[280px] resize-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#612A4F] focus:border-[#612A4F] transition-all text-sm leading-relaxed bg-white placeholder:text-gray-400 shadow-[0_1px_3px_rgba(0,0,0,0.06)] pr-12"
              />
              {/* MegAI Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsMegAIOpen(!isMegAIOpen)}
                      className={cn(
                        "absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg",
                        isMegAIOpen
                          ? "bg-[#612A4F] text-white"
                          : "bg-gradient-to-br from-[#8B7082] to-[#612A4F] text-white hover:scale-105"
                      )}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Ask MegAI for help</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-[#612A4F] uppercase tracking-wider">
                Caption
              </label>
              <Textarea
                value={caption}
                onChange={(e) => setCaption?.(e.target.value)}
                placeholder="Write your caption here..."
                className="min-h-[100px] resize-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#612A4F] focus:border-[#612A4F] transition-all text-sm leading-relaxed bg-white placeholder:text-gray-400 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              />
            </div>
          </div>

          {/* MegAI Chat Panel - Overlays the right column */}
          <AnimatePresence>
            {isMegAIOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="fixed bottom-6 right-0 w-[380px] z-[100] flex flex-col h-[550px] bg-gradient-to-b from-[#F8F6F9] to-white rounded-xl border border-[#E5E0E8] shadow-2xl overflow-hidden"
              >
                {/* Chat Header */}
                <div
                  onClick={() => setIsMegAIOpen(false)}
                  className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#612A4F] to-[#8B7082] text-white cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">Ask MegAI</h3>
                      <p className="text-[10px] text-white/70">Your content assistant</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMegAIOpen(false)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Chat Messages */}
                <div ref={chatMessagesRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                  {megAIMessages.length === 0 && (
                    <div className="text-center py-6 px-2">
                      <div className="w-12 h-12 rounded-full bg-[#612A4F]/10 flex items-center justify-center mx-auto mb-3">
                        <Bot className="w-6 h-6 text-[#612A4F]" />
                      </div>
                      <p className="text-base font-medium text-gray-700 mb-1">How can I help?</p>
                      <p className="text-sm text-gray-500 mb-4">Ask me to improve your script, suggest hooks, or make it more engaging.</p>
                      <div className="space-y-2">
                        {["Make it more engaging", "Make it shorter"].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => handleMegAISend(suggestion)}
                            className="block w-full text-left px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg hover:border-[#612A4F] hover:bg-[#612A4F]/5 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                        <button
                          onClick={() => setMegAIInput("Write a script about ")}
                          className="block w-full text-left px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg hover:border-[#612A4F] hover:bg-[#612A4F]/5 transition-colors"
                        >
                          Write a script about...
                        </button>
                      </div>
                    </div>
                  )}
                  {megAIMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex gap-2",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-full bg-[#612A4F] flex items-center justify-center flex-shrink-0">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[85%] px-3 py-2.5 rounded-xl text-sm leading-relaxed",
                          msg.role === 'user'
                            ? "bg-[#612A4F] text-white rounded-br-sm"
                            : "bg-white border border-gray-200 text-gray-700 rounded-bl-sm shadow-sm"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <User className="w-3 h-3 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isAILoading && (
                    <div className="flex gap-2 justify-start">
                      <div className="w-6 h-6 rounded-full bg-[#612A4F] flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl rounded-bl-sm px-3 py-2 shadow-sm">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-[#612A4F]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-[#612A4F]/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-[#612A4F]/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-3 border-t border-gray-100 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={megAIInput}
                      onChange={(e) => setMegAIInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleMegAISend();
                        }
                      }}
                      placeholder="Ask MegAI..."
                      className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#612A4F] focus:border-[#612A4F]"
                    />
                    <button
                      onClick={() => handleMegAISend()}
                      disabled={!megAIInput.trim() || isAILoading}
                      className="px-3 py-2 bg-[#612A4F] text-white rounded-lg hover:bg-[#4E2240] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right Column - Settings */}
          <div className="space-y-10 pt-8">
            {/* How It's Shot */}
            <div className="space-y-3">
              <h4 className="text-[12px] font-medium text-[#612A4F] uppercase tracking-wider">
                How It's Shot
              </h4>

              {/* Format selection */}
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Format dropdown */}
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !formatTags.includes(value)) {
                      setFormatTags([...formatTags, value]);
                    }
                  }}
                >
                  {formatTags.length === 0 ? (
                    <SelectTrigger className="w-full bg-white border border-gray-200 shadow-none h-9 text-sm rounded-lg px-3" iconClassName="text-gray-400">
                      <span className="text-gray-400">Select format</span>
                    </SelectTrigger>
                  ) : (
                    <SelectTrigger className="w-auto bg-transparent border-0 shadow-none p-0 h-auto hover:bg-gray-100 rounded px-1.5 py-1 focus:ring-0 focus:ring-offset-0 focus:outline-none" iconClassName="hidden">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </SelectTrigger>
                  )}
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-sm font-medium text-gray-500">Video</SelectLabel>
                      {!formatTags.includes("Talking to camera") && (
                        <SelectItem value="Talking to camera"><span className="flex items-center gap-2"><Video className="w-4 h-4 text-gray-400" />Talking to camera</span></SelectItem>
                      )}
                      {!formatTags.includes("Voice-over") && (
                        <SelectItem value="Voice-over"><span className="flex items-center gap-2"><Video className="w-4 h-4 text-gray-400" />Voice-over</span></SelectItem>
                      )}
                      {!formatTags.includes("Vlog") && (
                        <SelectItem value="Vlog"><span className="flex items-center gap-2"><Video className="w-4 h-4 text-gray-400" />Vlog</span></SelectItem>
                      )}
                      {!formatTags.includes("Tutorial") && (
                        <SelectItem value="Tutorial"><span className="flex items-center gap-2"><Video className="w-4 h-4 text-gray-400" />Tutorial</span></SelectItem>
                      )}
                      {!formatTags.includes("GRWM") && (
                        <SelectItem value="GRWM"><span className="flex items-center gap-2"><Video className="w-4 h-4 text-gray-400" />GRWM</span></SelectItem>
                      )}
                      {customVideoFormats.filter(f => !formatTags.includes(f)).map((format) => (
                        <SelectItem key={format} value={format}>
                          <span className="flex items-center gap-2 w-full">
                            <Video className="w-4 h-4 text-gray-400" />
                            <span className="flex-1">{format}</span>
                            <span
                              role="button"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleRemoveCustomFormat(format, 'video');
                              }}
                              className="text-gray-300 hover:text-red-500 transition-colors ml-2 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <div
                      className="flex items-center gap-2 px-2 py-1.5 cursor-text border-b border-gray-100 mb-1"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <Video className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="+ Add video format..."
                        className="flex-1 text-xs text-gray-500 bg-transparent border-none outline-none placeholder:text-gray-400 focus:placeholder:text-transparent"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            e.preventDefault();
                            const value = e.currentTarget.value.trim();
                            if (!customVideoFormats.includes(value)) {
                              setCustomVideoFormats([...customVideoFormats, value]);
                            }
                            if (!formatTags.includes(value)) {
                              setFormatTags([...formatTags, value]);
                            }
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </SelectContent>
                </Select>

                {/* Selected format tags */}
                {formatTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-[#8B7082] rounded-full text-xs text-white"
                  >
                    {isStaticFormat(tag) ? <Camera className="w-3 h-3 text-white" /> : <Video className="w-3 h-3 text-white" />}
                    {tag}
                    <button
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); onRemoveFormatTag(tag); }}
                      className="text-white/70 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Platforms */}
            <div className="space-y-3">
              <h4 className="text-[12px] font-medium text-[#612A4F] uppercase tracking-wider">
                Platforms
              </h4>
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { name: "Instagram", icon: SiInstagram },
                  { name: "TikTok", icon: SiTiktok },
                  { name: "YouTube", icon: SiYoutube },
                  { name: "Facebook", icon: SiFacebook },
                  { name: "LinkedIn", icon: SiLinkedin },
                  { name: "X", icon: RiTwitterXLine },
                  { name: "Threads", icon: RiThreadsLine },
                ].map((platform) => {
                  const isSelected = platformTags.includes(platform.name);
                  const IconComponent = platform.icon;
                  return (
                    <button
                      key={platform.name}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          onRemovePlatformTag(platform.name);
                        } else {
                          setPlatformTags([...platformTags, platform.name]);
                        }
                      }}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        isSelected
                          ? "bg-[#8B7082]/25 text-[#612A4F]"
                          : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      )}
                      title={platform.name}
                    >
                      <IconComponent className="w-4 h-4" />
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setShowCustomPlatformInput(!showCustomPlatformInput)}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    showCustomPlatformInput
                      ? "bg-[#612A4F] text-white"
                      : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  )}
                  title="Add other platform"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {showCustomPlatformInput && (
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={customPlatformInput}
                    onChange={(e) => setCustomPlatformInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customPlatformInput.trim()) {
                        e.preventDefault();
                        if (!platformTags.includes(customPlatformInput.trim())) {
                          setPlatformTags([...platformTags, customPlatformInput.trim()]);
                        }
                        setCustomPlatformInput("");
                        setShowCustomPlatformInput(false);
                      }
                    }}
                    placeholder="Platform name..."
                    className="flex-1 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#612A4F] focus:border-transparent"
                    autoFocus
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (customPlatformInput.trim() && !platformTags.includes(customPlatformInput.trim())) {
                        setPlatformTags([...platformTags, customPlatformInput.trim()]);
                        setCustomPlatformInput("");
                        setShowCustomPlatformInput(false);
                      }
                    }}
                    size="sm"
                    className="h-auto py-1 bg-[#612A4F] hover:bg-[#4E2240]"
                  >
                    Add
                  </Button>
                </div>
              )}

              {/* Custom platforms display */}
              {platformTags.filter(p => !["Instagram", "TikTok", "YouTube", "Facebook", "LinkedIn", "X", "Threads"].includes(p)).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {platformTags
                    .filter(p => !["Instagram", "TikTok", "YouTube", "Facebook", "LinkedIn", "X", "Threads"].includes(p))
                    .map((platform) => (
                      <span
                        key={platform}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-[#612A4F]/10 text-[#612A4F] rounded-full text-xs"
                      >
                        {platform}
                        <button
                          onClick={() => onRemovePlatformTag(platform)}
                          className="text-[#612A4F]/60 hover:text-[#612A4F] transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Shooting Plan */}
            <div className="space-y-3">
              <h4 className="text-[12px] font-medium text-[#612A4F] uppercase tracking-wider">
                Shooting Plan
              </h4>

              <div className="rounded-lg overflow-hidden">
                {/* Location - lightest mauve */}
                <div className="flex items-center gap-3 py-2.5 px-3 bg-[#8B7082]/[0.05] cursor-text">
                  <MapPin className="w-4 h-4 text-[#8B7082] flex-shrink-0" />
                  <textarea
                    ref={locationInputRef as React.RefObject<HTMLTextAreaElement>}
                    value={locationText}
                    onChange={(e) => {
                      setLocationText(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        outfitInputRef.current?.focus();
                      }
                    }}
                    placeholder="Location..."
                    className="flex-1 text-sm text-gray-700 bg-transparent border-none outline-none placeholder:text-gray-400 py-0 resize-none leading-relaxed"
                    style={{ fieldSizing: 'content', minHeight: '1.25rem' } as React.CSSProperties}
                  />
                </div>

                {/* Outfit - light-medium mauve */}
                <div className="flex items-center gap-3 py-2.5 px-3 bg-[#8B7082]/[0.09] cursor-text">
                  <Shirt className="w-4 h-4 text-[#8B7082] flex-shrink-0" />
                  <textarea
                    ref={outfitInputRef as React.RefObject<HTMLTextAreaElement>}
                    value={outfitText}
                    onChange={(e) => {
                      setOutfitText(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        propsInputRef.current?.focus();
                      }
                    }}
                    placeholder="Outfit..."
                    className="flex-1 text-sm text-gray-700 bg-transparent border-none outline-none placeholder:text-gray-400 py-0 resize-none leading-relaxed"
                    style={{ fieldSizing: 'content', minHeight: '1.25rem' } as React.CSSProperties}
                  />
                </div>

                {/* Props - medium-dark mauve */}
                <div className="flex items-center gap-3 py-2.5 px-3 bg-[#8B7082]/[0.12] cursor-text">
                  <Boxes className="w-4 h-4 text-[#8B7082] flex-shrink-0" />
                  <textarea
                    ref={propsInputRef as React.RefObject<HTMLTextAreaElement>}
                    value={propsText}
                    onChange={(e) => {
                      setPropsText(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        notesInputRef.current?.focus();
                      }
                    }}
                    placeholder="Props..."
                    className="flex-1 text-sm text-gray-700 bg-transparent border-none outline-none placeholder:text-gray-400 py-0 resize-none leading-relaxed"
                    style={{ fieldSizing: 'content', minHeight: '1.25rem' } as React.CSSProperties}
                  />
                </div>

                {/* Notes - darkest mauve */}
                <div className="flex items-center gap-3 py-2.5 px-3 bg-[#8B7082]/[0.16] cursor-text">
                  <NotebookPen className="w-4 h-4 text-[#8B7082] flex-shrink-0" />
                  <textarea
                    ref={notesInputRef}
                    value={filmingNotes}
                    onChange={(e) => setFilmingNotes(e.target.value)}
                    placeholder="Notes..."
                    className="flex-1 text-sm text-gray-700 bg-transparent border-none outline-none resize-none placeholder:text-gray-400 py-0"
                    style={{ fieldSizing: 'content', minHeight: '1.25rem' } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  // Embedded mode: return content without Dialog wrapper
  if (embedded) {
    return dialogContent;
  }

  // Standalone mode: return with full Dialog wrapper
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent hideCloseButton onInteractOutside={handleInteractOutside} onEscapeKeyDown={handleInteractOutside} className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] overflow-hidden border-0 shadow-2xl flex flex-col bg-gradient-to-br from-[#f0f7fa] via-white to-[#f0f7fa]/30">
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key="script-content"
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
  );
};

export default ScriptEditorDialog;
