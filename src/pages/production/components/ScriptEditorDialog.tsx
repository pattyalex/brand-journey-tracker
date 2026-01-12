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
            {/* Format Tags */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">
                How it&apos;s shot
              </label>
              <Select
                onValueChange={(value) => {
                  if (value === "custom") {
                    setShowCustomFormatInput(true);
                  } else {
                    setShowCustomFormatInput(false);
                    if (!formatTags.includes(value)) {
                      setFormatTags([...formatTags, value]);
                    }
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>🎥 Video Formats</SelectLabel>
                    <SelectItem value="Talking to camera (static)">Talking to camera (static)</SelectItem>
                    <SelectItem value="Talking to camera (walking)">Talking to camera (walking)</SelectItem>
                    <SelectItem value="GRWM (Get Ready With Me)">GRWM (Get Ready With Me)</SelectItem>
                    <SelectItem value="Voice-over (B-roll)">Voice-over (B-roll)</SelectItem>
                    <SelectItem value="Silent video with text overlay">Silent video with text overlay</SelectItem>
                    <SelectItem value="Cinematic montage">Cinematic montage</SelectItem>
                    <SelectItem value="POV (first-person camera)">POV (first-person camera)</SelectItem>
                    <SelectItem value="Green screen">Green screen</SelectItem>
                    <SelectItem value="Split screen">Split screen</SelectItem>
                    <SelectItem value="Duet">Duet</SelectItem>
                    <SelectItem value="Stitch">Stitch</SelectItem>
                    <SelectItem value="Lip-sync">Lip-sync</SelectItem>
                    <SelectItem value="Skit / acting">Skit / acting</SelectItem>
                    <SelectItem value="Reaction video">Reaction video</SelectItem>
                    <SelectItem value="Tutorial / demo">Tutorial / demo</SelectItem>
                    <SelectItem value="Vlog-style">Vlog-style</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>📸 Static Formats</SelectLabel>
                    <SelectItem value="Single photo post">Single photo post</SelectItem>
                    <SelectItem value="Curated photo carousel">Curated photo carousel</SelectItem>
                    <SelectItem value="Casual photo dump">Casual photo dump</SelectItem>
                    <SelectItem value="Text-only post">Text-only post</SelectItem>
                    <SelectItem value="Carousel with text slides">Carousel with text slides</SelectItem>
                    <SelectItem value="Notes-app style screenshot">Notes-app style screenshot</SelectItem>
                    <SelectItem value="Tweet-style slide">Tweet-style slide</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>🔁 Other</SelectLabel>
                    <SelectItem value="custom">Write your own format</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

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
                    placeholder="Enter custom format..."
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                  <Button
                    onClick={() => {
                      if (customFormatInput.trim() && !formatTags.includes(customFormatInput.trim())) {
                        setFormatTags([...formatTags, customFormatInput.trim()]);
                        setCustomFormatInput("");
                        setShowCustomFormatInput(false);
                      }
                    }}
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    Add
                  </Button>
                </div>
              )}

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
                          onClick={() => onRemoveFormatTag(tag)}
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
              <Select
                onValueChange={(value) => {
                  if (value === "other") {
                    setShowCustomPlatformInput(true);
                  } else {
                    setShowCustomPlatformInput(false);
                    if (!platformTags.includes(value)) {
                      setPlatformTags([...platformTags, value]);
                    }
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="X / Threads">X / Threads</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              {showCustomPlatformInput && (
                <div className="flex gap-2">
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
                    placeholder="Enter custom platform..."
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                  <Button
                    onClick={() => {
                      if (customPlatformInput.trim() && !platformTags.includes(customPlatformInput.trim())) {
                        setPlatformTags([...platformTags, customPlatformInput.trim()]);
                        setCustomPlatformInput("");
                        setShowCustomPlatformInput(false);
                      }
                    }}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Add
                  </Button>
                </div>
              )}

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
                          onClick={() => onRemovePlatformTag(tag)}
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
              placeholder="Refine and finalize your script here..."
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
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="text-lg">✓</span> Status
            </label>

            <RadioGroup value={cardStatus || ""} onValueChange={(value) => setCardStatus(value as Exclude<CardStatus, null>)}>
              {/* To Start */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-colors">
                <RadioGroupItem value="to-start" id="status-to-start" className="text-gray-500" />
                <label htmlFor="status-to-start" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                  To start
                </label>
              </div>

              {/* Needs More Work */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-colors">
                <RadioGroupItem value="needs-work" id="status-needs-work" className="text-yellow-500" />
                <label htmlFor="status-needs-work" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                  Needs more work
                </label>
              </div>

              {/* Ready to Film */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-colors">
                <RadioGroupItem value="ready" id="status-ready" className="text-green-600" />
                <label htmlFor="status-ready" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                  Ready to film
                </label>
              </div>
            </RadioGroup>
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
