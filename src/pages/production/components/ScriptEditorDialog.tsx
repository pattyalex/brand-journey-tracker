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
import { MoreHorizontal, Video, Camera, ChevronDown, X, Circle, Wrench, CheckCircle2 } from "lucide-react";
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

        {/* Format and Platform Section */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
          <div className="grid grid-cols-2 gap-6">
            {/* Format Selection - Compact Inline */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="text-lg">📹</span> How It's Shot
              </label>
              <div className="flex items-center gap-3 flex-wrap">
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
                  <SelectTrigger className="w-auto bg-white border-0 shadow-none p-0 h-auto gap-1 hover:bg-gray-100 rounded-lg px-2 py-1" iconClassName="hidden">
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
                  <span className="text-sm text-gray-400">Select format</span>
                )}
                {formatTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-600"
                  >
                    {isStaticFormat(tag) ? <Camera className="w-3.5 h-3.5 text-gray-400" /> : <Video className="w-3.5 h-3.5 text-gray-400" />}
                    {tag}
                    <button
                      onClick={() => onRemoveFormatTag(tag)}
                      className="text-gray-300 hover:text-gray-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              {showCustomFormatInput && (
                <div className="flex gap-2">
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
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
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
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>

            {/* Platform Selection - Clickable Icons */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="text-lg">📱</span> Platforms
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { name: "Instagram", icon: <SiInstagram className="w-5 h-5" /> },
                  { name: "TikTok", icon: <SiTiktok className="w-5 h-5" /> },
                  { name: "YouTube", icon: <SiYoutube className="w-5 h-5" /> },
                  { name: "Facebook", icon: <SiFacebook className="w-5 h-5" /> },
                  { name: "LinkedIn", icon: <SiLinkedin className="w-5 h-5" /> },
                  { name: "X / Threads", icon: <RiTwitterXLine className="w-5 h-5" /> },
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
                      className={`p-2.5 rounded-xl transition-all duration-200 ${
                        isSelected
                          ? "bg-gray-800 text-white shadow-md scale-105"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                      }`}
                      title={platform.name}
                    >
                      {platform.icon}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setShowCustomPlatformInput(!showCustomPlatformInput)}
                  className={`p-2.5 rounded-xl transition-all duration-200 ${
                    showCustomPlatformInput
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                  }`}
                  title="Add other platform"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {showCustomPlatformInput && (
                <div className="flex gap-2 mt-2">
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
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
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
                    className="bg-gray-800 hover:bg-gray-900"
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
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

        {/* Filming Plan Section */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
          <div className="space-y-6">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="text-lg">🎬</span> Filming Plan
            </label>

            <div className="space-y-4">
              {/* Location */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Location
                </label>
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
                  placeholder="Where do you want to shoot this content?"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Outfit */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Outfit
                </label>
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
                  placeholder="What do you want to wear?"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Props */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Props
                </label>
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
                  placeholder="What props do you need?"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Notes and Reminders */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Notes &amp; Reminders
                </label>
                <Textarea
                  ref={notesInputRef}
                  value={filmingNotes}
                  onChange={(e) => setFilmingNotes(e.target.value)}
                  placeholder="Add any additional notes or reminders..."
                  className="min-h-[100px] resize-none bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-blue-50/40 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Circle className="w-4 h-4 text-blue-500" /> Scripting Status
            </h3>
            <p className="text-xs text-gray-500 mt-1">Track where you are in the scripting process</p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {/* To Start */}
              <button
                type="button"
                onClick={() => setCardStatus('to-start')}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all text-left",
                  cardStatus === 'to-start'
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "flex items-center gap-2 mb-2",
                  cardStatus === 'to-start' ? "text-blue-600" : "text-gray-500"
                )}>
                  <Circle className="w-4 h-4" />
                  <span className="font-semibold text-sm">To Start Scripting</span>
                </div>
                <p className={cn(
                  "text-xs",
                  cardStatus === 'to-start' ? "text-blue-600" : "text-gray-400"
                )}>
                  Haven't started yet
                </p>
              </button>

              {/* Needs More Work */}
              <button
                type="button"
                onClick={() => setCardStatus('needs-work')}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all text-left",
                  cardStatus === 'needs-work'
                    ? "border-amber-400 bg-amber-50"
                    : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "flex items-center gap-2 mb-2",
                  cardStatus === 'needs-work' ? "text-amber-600" : "text-gray-500"
                )}>
                  <Wrench className="w-4 h-4" />
                  <span className="font-semibold text-sm">Needs More Work</span>
                </div>
                <p className={cn(
                  "text-xs",
                  cardStatus === 'needs-work' ? "text-amber-600" : "text-gray-400"
                )}>
                  In progress, needs refinement
                </p>
              </button>

              {/* Scripted */}
              <button
                type="button"
                onClick={() => setCardStatus('ready')}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all text-left",
                  cardStatus === 'ready'
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "flex items-center gap-2 mb-2",
                  cardStatus === 'ready' ? "text-emerald-600" : "text-gray-500"
                )}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-semibold text-sm">Scripted</span>
                </div>
                <p className={cn(
                  "text-xs",
                  cardStatus === 'ready' ? "text-emerald-600" : "text-gray-400"
                )}>
                  Ready to move to filming
                </p>
              </button>
            </div>
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
