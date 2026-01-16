import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { getFormatColors, getPlatformColors } from "../utils/productionHelpers";
import { SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import { MoreHorizontal, Video, Camera, ChevronDown, X, Circle, Wrench, CheckCircle2, MapPin, Shirt, Boxes, NotebookPen, PenLine, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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

type CardStatus = "to-start" | "needs-work" | "ready" | null;

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
  locationText: string;
  setLocationText: (value: string) => void;
  outfitText: string;
  setOutfitText: (value: string) => void;
  propsText: string;
  setPropsText: (value: string) => void;
  filmingNotes: string;
  setFilmingNotes: (value: string) => void;
  cardStatus: CardStatus;
  setCardStatus: (value: Exclude<CardStatus, null>) => void;
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
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] overflow-hidden border-0 shadow-2xl flex flex-col bg-gradient-to-br from-gray-50 to-white">
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 space-y-6">
        {/* Title Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <input
            ref={titleInputRef}
            type="text"
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            placeholder="Content title..."
            className="w-full px-0 py-2 text-2xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-gray-300"
          />
        </div>

        {/* Format and Platform Section - Clean minimal design */}
        <div className="grid grid-cols-2 gap-8">
          {/* Format Selection */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
              How It's Shot
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                onValueChange={(value) => {
                  if (value === "other") {
                    setShowCustomFormatInput(true);
                  } else if (value && !formatTags.includes(value)) {
                    setShowCustomFormatInput(false);
                    setFormatTags([...formatTags, value]);
                  }
                }}
              >
                <SelectTrigger className="w-auto bg-transparent border-0 shadow-none p-0 h-auto gap-1 hover:bg-gray-100 rounded-lg px-2 py-1" iconClassName="hidden">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="text-sm font-medium text-gray-500">Video</SelectLabel>
                    <SelectItem value="Talking to camera"><span className="flex items-center gap-2"><Video className="w-4 h-4 text-gray-400" />Talking to camera</span></SelectItem>
                    <SelectItem value="Voice-over"><span className="flex items-center gap-2"><Video className="w-4 h-4 text-gray-400" />Voice-over</span></SelectItem>
                    <SelectItem value="Vlog"><span className="flex items-center gap-2"><Video className="w-4 h-4 text-gray-400" />Vlog</span></SelectItem>
                    <SelectItem value="Tutorial"><span className="flex items-center gap-2"><Video className="w-4 h-4 text-gray-400" />Tutorial</span></SelectItem>
                    <SelectItem value="GRWM"><span className="flex items-center gap-2"><Video className="w-4 h-4 text-gray-400" />GRWM</span></SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="text-sm font-medium text-gray-500">Photo</SelectLabel>
                    <SelectItem value="Photo post"><span className="flex items-center gap-2"><Camera className="w-4 h-4 text-gray-400" />Photo post</span></SelectItem>
                    <SelectItem value="Carousel"><span className="flex items-center gap-2"><Camera className="w-4 h-4 text-gray-400" />Carousel</span></SelectItem>
                    <SelectItem value="Text post"><span className="flex items-center gap-2"><Camera className="w-4 h-4 text-gray-400" />Text post</span></SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectItem value="other"><span className="flex items-center gap-2"><MoreHorizontal className="w-4 h-4 text-gray-400" />Other...</span></SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {formatTags.length === 0 && (
                <span className="text-[13px] text-gray-400">Select format</span>
              )}
              {formatTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 text-[13px] text-gray-700"
                >
                  {isStaticFormat(tag) ? <Camera className="w-3.5 h-3.5 text-gray-400" /> : <Video className="w-3.5 h-3.5 text-gray-400" />}
                  {tag}
                  <button
                    onClick={() => onRemoveFormatTag(tag)}
                    className="text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            {showCustomFormatInput && (
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={customFormatInput}
                  onChange={(e) => setCustomFormatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customFormatInput.trim()) {
                      e.preventDefault();
                      if (!formatTags.includes(customFormatInput.trim())) {
                        setFormatTags([...formatTags, customFormatInput.trim()]);
                      }
                      setCustomFormatInput("");
                      setShowCustomFormatInput(false);
                    }
                  }}
                  placeholder="Enter format..."
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent"
                  autoFocus
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (customFormatInput.trim() && !formatTags.includes(customFormatInput.trim())) {
                      setFormatTags([...formatTags, customFormatInput.trim()]);
                      setCustomFormatInput("");
                      setShowCustomFormatInput(false);
                    }
                  }}
                  size="sm"
                  variant="outline"
                  className="h-auto py-1.5"
                >
                  Add
                </Button>
              </div>
            )}
          </div>

          {/* Platform Selection */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
              Platforms
            </h4>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { name: "Instagram", icon: <SiInstagram className="w-4 h-4" /> },
                { name: "TikTok", icon: <SiTiktok className="w-4 h-4" /> },
                { name: "YouTube", icon: <SiYoutube className="w-4 h-4" /> },
                { name: "Facebook", icon: <SiFacebook className="w-4 h-4" /> },
                { name: "LinkedIn", icon: <SiLinkedin className="w-4 h-4" /> },
                { name: "X / Threads", icon: <RiTwitterXLine className="w-4 h-4" /> },
              ].map((platform) => {
                const isSelected = platformTags.includes(platform.name);
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
                      "p-2 rounded-lg transition-all",
                      isSelected
                        ? "bg-gray-500 text-white"
                        : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    )}
                    title={platform.name}
                  >
                    {platform.icon}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setShowCustomPlatformInput(!showCustomPlatformInput)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  showCustomPlatformInput
                    ? "bg-gray-500 text-white"
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
                  placeholder="Enter platform name..."
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent"
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
                  className="h-auto py-1.5 bg-gray-500 hover:bg-gray-600"
                >
                  Add
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Talking Points Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="text-lg">💬</span> Talking Points
            </label>

            {/* Brain Dump Suggestion Block */}
            {showBrainDumpSuggestion && brainDumpSuggestion && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-purple-700 mb-2 flex items-center gap-1">
                      <span>💡</span> From your brain dump notes:
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {brainDumpSuggestion}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBrainDumpSuggestion(false)}
                    className="text-purple-400 hover:text-purple-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setScriptContent(scriptContent + (scriptContent ? "\n\n" : "") + brainDumpSuggestion);
                      setShowBrainDumpSuggestion(false);
                    }}
                    className="text-xs px-3 py-1.5 bg-white text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50 transition-colors"
                  >
                    Append to script
                  </button>
                </div>
              </div>
            )}

            <Textarea
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              placeholder="Write your script here..."
              className="min-h-[300px] resize-none border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm leading-relaxed bg-gray-50"
            />
          </div>
        </div>

        {/* Filming Plan Section - Clean minimal design */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
            Filming Plan
          </h4>

          <div className="space-y-1">
            {/* Location */}
            <div className="flex items-center gap-3 group">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                ref={locationInputRef}
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    outfitInputRef.current?.focus();
                  }
                }}
                placeholder="Add location..."
                className="flex-1 text-[13px] text-gray-700 bg-transparent border-none outline-none placeholder:text-gray-400 hover:bg-gray-50 focus:bg-gray-50 rounded px-2 py-1.5 -ml-2 transition-colors"
              />
            </div>

            {/* Outfit */}
            <div className="flex items-center gap-3 group">
              <Shirt className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                ref={outfitInputRef}
                type="text"
                value={outfitText}
                onChange={(e) => setOutfitText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    propsInputRef.current?.focus();
                  }
                }}
                placeholder="Add outfit..."
                className="flex-1 text-[13px] text-gray-700 bg-transparent border-none outline-none placeholder:text-gray-400 hover:bg-gray-50 focus:bg-gray-50 rounded px-2 py-1.5 -ml-2 transition-colors"
              />
            </div>

            {/* Props */}
            <div className="flex items-center gap-3 group">
              <Boxes className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                ref={propsInputRef}
                type="text"
                value={propsText}
                onChange={(e) => setPropsText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    notesInputRef.current?.focus();
                  }
                }}
                placeholder="Add props..."
                className="flex-1 text-[13px] text-gray-700 bg-transparent border-none outline-none placeholder:text-gray-400 hover:bg-gray-50 focus:bg-gray-50 rounded px-2 py-1.5 -ml-2 transition-colors"
              />
            </div>

            {/* Notes */}
            <div className="flex items-start gap-3 group">
              <NotebookPen className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1.5" />
              <textarea
                ref={notesInputRef}
                value={filmingNotes}
                onChange={(e) => setFilmingNotes(e.target.value)}
                placeholder="Add notes..."
                rows={2}
                className="flex-1 text-[13px] text-gray-700 bg-transparent border-none outline-none resize-none placeholder:text-gray-400 hover:bg-gray-50 focus:bg-gray-50 rounded px-2 py-1.5 -ml-2 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Status Section - Clean minimal design */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
            Scripting Status
          </h4>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCardStatus('to-start')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium transition-all",
                cardStatus === 'to-start'
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              <PenLine className="w-3.5 h-3.5 flex-shrink-0" />
              <div className="text-left">
                <div>To Start Scripting</div>
                <div className={cn("text-[10px] font-normal", cardStatus === 'to-start' ? "text-blue-600" : "text-gray-400")}>Haven't started yet</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCardStatus('needs-work')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium transition-all",
                cardStatus === 'needs-work'
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              <Wrench className="w-3.5 h-3.5 flex-shrink-0" />
              <div className="text-left">
                <div>Needs More Work</div>
                <div className={cn("text-[10px] font-normal", cardStatus === 'needs-work' ? "text-amber-600" : "text-gray-400")}>In progress</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCardStatus('ready')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium transition-all",
                cardStatus === 'ready'
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
              <div className="text-left">
                <div>Scripted</div>
                <div className={cn("text-[10px] font-normal", cardStatus === 'ready' ? "text-emerald-600" : "text-gray-400")}>Ready to film</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 flex-shrink-0">
        <Button
          variant="outline"
          onClick={onCancel}
          className="px-6"
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          Save Changes
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default ScriptEditorDialog;
