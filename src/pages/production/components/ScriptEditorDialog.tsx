import React, { useState } from "react";
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
import { MoreHorizontal, Video, Camera, ChevronDown, X, Circle, Wrench, CheckCircle2, MapPin, Shirt, Boxes, NotebookPen, PenLine, Check, Plus, ArrowRight, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  onCancel: () => void;
  onSave: () => void;
  titleInputRef: React.RefObject<HTMLInputElement>;
  locationInputRef: React.RefObject<HTMLInputElement>;
  outfitInputRef: React.RefObject<HTMLInputElement>;
  propsInputRef: React.RefObject<HTMLInputElement>;
  notesInputRef: React.RefObject<HTMLTextAreaElement>;
  cardTitle: string;
  setCardTitle: (value: string) => void;
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
}

const ScriptEditorDialog: React.FC<ScriptEditorDialogProps> = ({
  isOpen,
  onOpenChange,
  onCancel,
  onSave,
  titleInputRef,
  locationInputRef,
  outfitInputRef,
  propsInputRef,
  notesInputRef,
  cardTitle,
  setCardTitle,
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

  return (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent hideCloseButton onInteractOutside={handleInteractOutside} onEscapeKeyDown={handleInteractOutside} className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] overflow-hidden border-0 shadow-2xl flex flex-col bg-gradient-to-br from-[#f0f7fa] via-white to-[#f0f7fa]/30">
      {/* Step Progress Indicator - Centered */}
      <div className="flex justify-center pt-2 pb-0 flex-shrink-0">
        <ContentFlowProgress currentStep={2} className="w-[550px]" onStepClick={onNavigateToStep} />
      </div>

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
      <div className="flex-1 overflow-y-auto px-6 -mt-1 pb-1 space-y-2">
        {/* Title Section */}
        <div className="border-b border-gray-200 pb-1 mb-3">
          <input
            ref={titleInputRef}
            type="text"
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            placeholder="Enter content title..."
            className="w-full px-0 py-1 text-xl font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-[#A0A0A0]"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-[1fr,280px] gap-6 items-start">
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

            <Textarea
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              placeholder="Write your script here..."
              className="min-h-[400px] resize-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#612A4F] focus:border-[#612A4F] transition-all text-sm leading-relaxed bg-white placeholder:text-gray-400 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            />
          </div>

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
                    <SelectGroup>
                      <SelectLabel className="text-sm font-medium text-gray-500">Photo</SelectLabel>
                      {!formatTags.includes("Photo post") && (
                        <SelectItem value="Photo post"><span className="flex items-center gap-2"><Camera className="w-4 h-4 text-gray-400" />Photo post</span></SelectItem>
                      )}
                      {!formatTags.includes("Carousel") && (
                        <SelectItem value="Carousel"><span className="flex items-center gap-2"><Camera className="w-4 h-4 text-gray-400" />Carousel</span></SelectItem>
                      )}
                      {!formatTags.includes("Text post") && (
                        <SelectItem value="Text post"><span className="flex items-center gap-2"><Camera className="w-4 h-4 text-gray-400" />Text post</span></SelectItem>
                      )}
                      {customPhotoFormats.filter(f => !formatTags.includes(f)).map((format) => (
                        <SelectItem key={format} value={format}>
                          <span className="flex items-center gap-2 w-full">
                            <Camera className="w-4 h-4 text-gray-400" />
                            <span className="flex-1">{format}</span>
                            <span
                              role="button"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleRemoveCustomFormat(format, 'photo');
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
                      className="flex items-center gap-2 px-2 py-1.5 cursor-text"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <Camera className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="+ Add photo format..."
                        className="flex-1 text-xs text-gray-500 bg-transparent border-none outline-none placeholder:text-gray-400 focus:placeholder:text-transparent"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            e.preventDefault();
                            const value = e.currentTarget.value.trim();
                            if (!customPhotoFormats.includes(value)) {
                              setCustomPhotoFormats([...customPhotoFormats, value]);
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
                      onClick={() => onRemoveFormatTag(tag)}
                      className="text-white/70 hover:text-white transition-colors"
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

      {/* Fixed Footer with Action Buttons */}
      <div className="flex-shrink-0 px-6 pt-3 pb-0 border-t border-gray-200 bg-white flex justify-end">
        <motion.div
          animate={shakeButton ? { x: [0, -8, 8, -8, 8, 0], scale: [1, 1.02, 1.02, 1.02, 1.02, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={onSave}
            className="px-6 bg-[#612A4F] hover:bg-[#4E2240] text-white shadow-[0_2px_8px_rgba(97,42,79,0.3)]"
          >
            Stop Here, Finish Later
          </Button>
        </motion.div>
      </div>
        </motion.div>
      </AnimatePresence>
    </DialogContent>
  </Dialog>
  );
};

export default ScriptEditorDialog;
