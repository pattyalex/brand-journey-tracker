import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import ContentFlowProgress from "./ContentFlowProgress";
import { Textarea } from "@/components/ui/textarea";
import { SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import {
  MoreHorizontal, X, MapPin, Shirt, Boxes, Plus, ArrowRight, ChevronDown, ChevronUp,
  Sparkles, Send, Bot, User, Upload, Link2, Image as ImageIcon, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { ImageSlide, VisualReference, LinkPreview } from "../types";

interface ConceptEditorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  embedded?: boolean;
  // Card data props
  cardTitle: string;
  setCardTitle: (value: string) => void;
  cardHook: string;
  setCardHook: (value: string) => void;
  caption: string;
  setCaption: (value: string) => void;
  visualReferences: VisualReference[];
  setVisualReferences: (value: VisualReference[]) => void;
  linkPreviews: LinkPreview[];
  setLinkPreviews: (value: LinkPreview[]) => void;
  slides: ImageSlide[];
  setSlides: (value: ImageSlide[]) => void;
  imageMode: 'image' | 'carousel';
  setImageMode: (value: 'image' | 'carousel') => void;
  platformTags: string[];
  setPlatformTags: (value: string[]) => void;
  onAddPlatformTag: (tag: string) => void;
  showCustomPlatformInput: boolean;
  setShowCustomPlatformInput: (value: boolean) => void;
  customPlatformInput: string;
  setCustomPlatformInput: (value: string) => void;
  onRemovePlatformTag: (tag: string) => void;
  onNavigateToStep?: (step: number) => void;
  slideDirection?: 'left' | 'right';
  completedSteps?: number[];
}

const ConceptEditorDialog: React.FC<ConceptEditorDialogProps> = ({
  isOpen,
  onOpenChange,
  onSave,
  embedded = false,
  cardTitle,
  setCardTitle,
  cardHook,
  setCardHook,
  caption,
  setCaption,
  visualReferences,
  setVisualReferences,
  linkPreviews,
  setLinkPreviews,
  slides,
  setSlides,
  imageMode,
  setImageMode,
  platformTags,
  setPlatformTags,
  onAddPlatformTag,
  showCustomPlatformInput,
  setShowCustomPlatformInput,
  customPlatformInput,
  setCustomPlatformInput,
  onRemovePlatformTag,
  onNavigateToStep,
  slideDirection = 'right',
  completedSteps = [],
}) => {
  const [shakeButton, setShakeButton] = useState(false);
  const [expandedSlideId, setExpandedSlideId] = useState<string | null>(
    slides.length > 0 ? slides[0].id : null
  );
  const [linkInput, setLinkInput] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<VisualReference | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // MegAI state
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

  // Initialize with one slide if empty
  useEffect(() => {
    if (slides.length === 0) {
      const defaultSlide: ImageSlide = {
        id: `slide-${Date.now()}`,
        content: '',
        location: '',
        outfit: '',
        props: '',
      };
      setSlides([defaultSlide]);
      setExpandedSlideId(defaultSlide.id);
    }
  }, []);

  const slideCount = slides.length;
  const isCarousel = imageMode === 'carousel';

  const handleAddSlide = () => {
    const newSlide: ImageSlide = {
      id: `slide-${Date.now()}`,
      content: '',
      location: '',
      outfit: '',
      props: '',
    };
    setSlides([...slides, newSlide]);
    setExpandedSlideId(newSlide.id);
  };

  const handleRemoveSlide = (slideId: string) => {
    if (slides.length <= 1) return;
    const updated = slides.filter(s => s.id !== slideId);
    setSlides(updated);
    if (expandedSlideId === slideId) {
      setExpandedSlideId(updated[0]?.id || null);
    }
  };

  const handleUpdateSlide = (slideId: string, field: keyof ImageSlide, value: string) => {
    setSlides(slides.map(s => s.id === slideId ? { ...s, [field]: value } : s));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const ref: VisualReference = {
        id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        url,
        name: file.name,
      };
      setVisualReferences([...visualReferences, ref]);
    });
  };

  const handleRemoveReference = (refId: string) => {
    setVisualReferences(visualReferences.filter(r => r.id !== refId));
  };

  const handleAddLink = () => {
    const url = linkInput.trim();
    if (!url) return;
    const preview: LinkPreview = {
      id: `link-${Date.now()}`,
      url,
      title: new URL(url).hostname,
    };
    setLinkPreviews([...linkPreviews, preview]);
    setLinkInput("");
  };

  const handleRemoveLink = (linkId: string) => {
    setLinkPreviews(linkPreviews.filter(l => l.id !== linkId));
  };

  // MegAI for caption
  const getSystemPrompt = () => `You are MegAI, a helpful caption writing assistant for social media content creators. You help write engaging captions, suggest hashtags, and improve post copy.

${caption ? `The user is working on a caption titled "${cardHook || cardTitle || 'Untitled'}":
---
${caption}
---` : `The user is starting a new caption${(cardHook || cardTitle) ? ` titled "${cardHook || cardTitle}"` : ''}.`}

${platformTags.length > 0 ? `Target platforms: ${platformTags.join(', ')}` : ''}

Guidelines:
- SKIP introductions - go STRAIGHT to the content
- Give specific, actionable suggestions
- When asked to write or improve, provide the actual text immediately
- Keep responses concise and direct
- Use bullet points for multiple suggestions
- Match the tone and style of their existing content`;

  const callAI = async (userMessage: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) return "AI service is temporarily unavailable. Please try again later.";

    try {
      const conversationHistory = megAIMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      conversationHistory.push({ role: "user" as const, content: userMessage });

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
          system: getSystemPrompt(),
          messages: conversationHistory
        })
      });

      const data = await response.json();
      if (!response.ok) return "AI service is temporarily unavailable. Please try again.";
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
    center: { x: 0, opacity: 1 },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? -300 : 300,
      opacity: 0,
    }),
  };

  const getPlaceholderForSlide = (index: number) => {
    const placeholders = [
      "What goes on this slide — text overlay, shot direction, notes...",
      "Describe your vision for this slide...",
      "CTA, closing thought, or final image direction...",
    ];
    return placeholders[index] || placeholders[1];
  };

  const dialogContent = (
    <div onClick={() => isMegAIOpen && setIsMegAIOpen(false)} className="flex flex-col h-full">
      {/* Close Button */}
      <button
        onClick={() => onOpenChange(false)}
        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Step Progress Indicator */}
      <div className="flex justify-center pt-2 pb-12 flex-shrink-0">
        <ContentFlowProgress currentStep={2} contentType="image" className="w-[550px]" onStepClick={onNavigateToStep} completedSteps={completedSteps} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 -mt-1 pb-1">
        {/* Title + CTA */}
        <div className="flex items-center gap-4 border-b border-gray-200 pb-2 mb-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <input
                  type="text"
                  value={cardHook || cardTitle}
                  onChange={(e) => {
                    setCardHook(e.target.value);
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
            Save & Move to Edit <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-[1fr,320px] gap-6 items-start relative">
          {/* Left Column - Visual References + Caption */}
          <div className="space-y-6">
            {/* Visual References */}
            <div className="space-y-3">
              <label className="text-[12px] font-medium text-[#612A4F] uppercase tracking-wider">
                Visual References
              </label>
              <p className="text-xs text-gray-400 -mt-1">
                Upload moodboard images, paste links, or describe your vision
              </p>

              {/* Upload zone - full when no images, compact "add more" when images exist */}
              {visualReferences.length === 0 ? (
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                    isDragOver
                      ? "border-[#612A4F] bg-[#612A4F]/5"
                      : "border-gray-200 hover:border-[#8B7082] hover:bg-gray-50"
                  )}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    handleFileUpload(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Drop images here or click to upload</p>
                </div>
              ) : (
                <div
                  className="flex flex-wrap gap-3"
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    handleFileUpload(e.dataTransfer.files);
                  }}
                >
                  {visualReferences.map(ref => (
                    <div
                      key={ref.id}
                      className="relative group w-[calc(33.333%-8px)] aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-[#8B7082]/40 transition-all"
                      onClick={() => setPreviewImage(ref)}
                    >
                      <img src={ref.url} alt={ref.name || 'Reference'} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveReference(ref.id); }}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {/* Compact add-more button */}
                  <div
                    className={cn(
                      "w-[calc(33.333%-8px)] aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
                      isDragOver
                        ? "border-[#612A4F] bg-[#612A4F]/5"
                        : "border-gray-200 hover:border-[#8B7082] hover:bg-gray-50"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-400">Add more</span>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />

              {/* Link paste field */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLink();
                      }
                    }}
                    placeholder="Paste a link to Instagram, Pinterest..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#612A4F] focus:border-[#612A4F]"
                  />
                </div>
                {linkInput.trim() && (
                  <Button
                    size="sm"
                    onClick={handleAddLink}
                    className="bg-[#612A4F] hover:bg-[#4E2240] h-auto py-2"
                  >
                    Add
                  </Button>
                )}
              </div>

              {/* Link previews */}
              {linkPreviews.length > 0 && (
                <div className="space-y-2">
                  {linkPreviews.map(link => (
                    <div key={link.id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <Link2 className="w-4 h-4 text-[#8B7082] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">{link.title || link.url}</p>
                        <p className="text-xs text-gray-400 truncate">{link.url}</p>
                      </div>
                      <button onClick={() => handleRemoveLink(link.id)} className="text-gray-300 hover:text-gray-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="space-y-3">
              <label className="text-[12px] font-medium text-[#612A4F] uppercase tracking-wider">
                Caption
              </label>

              <div className="relative">
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Write your post caption here..."
                  className="min-h-[200px] resize-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#612A4F] focus:border-[#612A4F] transition-all text-sm leading-relaxed bg-white placeholder:text-gray-400 shadow-[0_1px_3px_rgba(0,0,0,0.06)] pr-12"
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
            </div>
          </div>

          {/* MegAI Chat Panel */}
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
                  <button onClick={() => setIsMegAIOpen(false)} className="p-1 hover:bg-white/10 rounded transition-colors">
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
                      <p className="text-sm text-gray-500 mb-4">Ask me to write a caption, suggest hashtags, or improve your copy.</p>
                      <div className="space-y-2">
                        {["Write a caption for this", "Suggest relevant hashtags"].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => handleMegAISend(suggestion)}
                            className="block w-full text-left px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg hover:border-[#612A4F] hover:bg-[#612A4F]/5 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {megAIMessages.map((msg, idx) => (
                    <div key={idx} className={cn("flex gap-2", msg.role === 'user' ? "justify-end" : "justify-start")}>
                      {msg.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-full bg-[#612A4F] flex items-center justify-center flex-shrink-0">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className={cn(
                        "max-w-[85%] px-3 py-2.5 rounded-xl text-sm leading-relaxed",
                        msg.role === 'user' ? "bg-[#612A4F] text-white rounded-br-sm" : "bg-white border border-gray-200 text-gray-700 rounded-bl-sm shadow-sm"
                      )}>
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

          {/* Right Column - Slides */}
          <div className="space-y-6 pt-0">
            {/* Image / Carousel toggle */}
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setImageMode('image');
                    // Trim to 1 slide when switching to single image
                    if (slides.length > 1) {
                      setSlides([slides[0]]);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium uppercase tracking-wider transition-all",
                    !isCarousel
                      ? "bg-[#612A4F]/10 text-[#612A4F]"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Image
                </button>
                <button
                  onClick={() => setImageMode('carousel')}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium uppercase tracking-wider transition-all",
                    isCarousel
                      ? "bg-[#612A4F]/10 text-[#612A4F]"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Carousel
                </button>
                <span className="text-[11px] text-gray-400 ml-auto">
                  {slideCount} {slideCount === 1 ? 'image' : 'slides'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {isCarousel
                  ? 'Plan what each slide will look like and how to shoot it'
                  : 'Plan what your image will look like and how to shoot it'
                }
              </p>
            </div>

            {/* Slide accordion cards */}
            <div className="space-y-2">
              {slides.map((slide, index) => {
                const isExpanded = expandedSlideId === slide.id;
                return (
                  <div
                    key={slide.id}
                    className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                  >
                    {/* Slide header (always visible) */}
                    <button
                      onClick={() => setExpandedSlideId(isExpanded ? null : slide.id)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#612A4F]/10 text-[#612A4F] text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700 flex-1">
                        Slide {index + 1}
                      </span>
                      {slides.length > 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveSlide(slide.id); }}
                          className="text-gray-300 hover:text-red-400 transition-colors p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-3 border-t border-gray-100">
                        {/* Text area */}
                        <Textarea
                          value={slide.content}
                          onChange={(e) => handleUpdateSlide(slide.id, 'content', e.target.value)}
                          placeholder={getPlaceholderForSlide(index)}
                          className="min-h-[80px] resize-none border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#612A4F] focus:border-[#612A4F] text-sm leading-relaxed bg-white placeholder:text-gray-400 mt-2"
                        />

                        {/* Per-slide shooting details */}
                        <div className="rounded-lg overflow-hidden">
                          <div className="flex items-center gap-3 py-2 px-3 bg-[#8B7082]/[0.05] cursor-text">
                            <MapPin className="w-3.5 h-3.5 text-[#8B7082] flex-shrink-0" />
                            <input
                              type="text"
                              value={slide.location}
                              onChange={(e) => handleUpdateSlide(slide.id, 'location', e.target.value)}
                              placeholder="Where to shoot this slide..."
                              className="flex-1 text-xs text-gray-700 bg-transparent border-none outline-none placeholder:text-gray-400"
                            />
                          </div>
                          <div className="flex items-center gap-3 py-2 px-3 bg-[#8B7082]/[0.09] cursor-text">
                            <Shirt className="w-3.5 h-3.5 text-[#8B7082] flex-shrink-0" />
                            <input
                              type="text"
                              value={slide.outfit}
                              onChange={(e) => handleUpdateSlide(slide.id, 'outfit', e.target.value)}
                              placeholder="What to wear..."
                              className="flex-1 text-xs text-gray-700 bg-transparent border-none outline-none placeholder:text-gray-400"
                            />
                          </div>
                          <div className="flex items-center gap-3 py-2 px-3 bg-[#8B7082]/[0.12] cursor-text">
                            <Boxes className="w-3.5 h-3.5 text-[#8B7082] flex-shrink-0" />
                            <input
                              type="text"
                              value={slide.props}
                              onChange={(e) => handleUpdateSlide(slide.id, 'props', e.target.value)}
                              placeholder="Any props needed..."
                              className="flex-1 text-xs text-gray-700 bg-transparent border-none outline-none placeholder:text-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add slide button - only in carousel mode */}
              {isCarousel && (
                <button
                  onClick={handleAddSlide}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#8B7082] hover:text-[#612A4F] hover:bg-[#612A4F]/[0.03] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add slide
                </button>
              )}
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
                          onAddPlatformTag(platform.name);
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
                        onAddPlatformTag(customPlatformInput.trim());
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
                      if (customPlatformInput.trim()) {
                        onAddPlatformTag(customPlatformInput.trim());
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
          </div>
        </div>
      </div>

      {/* Large Image Preview Overlay */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative max-w-[92%] max-h-[92%]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage.url}
                alt={previewImage.name || 'Preview'}
                className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
              />
              {previewImage.name && (
                <p className="text-center text-sm text-white/80 mt-3 truncate">{previewImage.name}</p>
              )}
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (embedded) {
    return dialogContent;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent hideCloseButton onInteractOutside={handleInteractOutside} onEscapeKeyDown={handleInteractOutside} className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] overflow-hidden border-0 shadow-2xl flex flex-col bg-gradient-to-br from-[#f0f7fa] via-white to-[#f0f7fa]/30">
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key="concept-content"
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

export default ConceptEditorDialog;
