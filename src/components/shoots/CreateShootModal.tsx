import React, { useState, KeyboardEvent } from "react";
import { Check, MapPin, Calendar as CalendarIcon, FileText, Shirt, Package, StickyNote, Camera, Clapperboard, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Post, getPillarStyle, STATUS_COLORS } from "@/types/posts";
import { StatusIcon } from "@/components/posts/StatusDropdown";
import { format } from "date-fns";

interface CreateShootModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPostCount: number;
  availablePosts?: Post[];
  preSelectedPostIds?: string[];
  onSave: (data: {
    name: string;
    mainLocation: string;
    date: string;
    outfits: string[];
    gear: string[];
    notes: string;
    postIds: string[];
  }) => void;
}

export default function CreateShootModal({
  open,
  onOpenChange,
  selectedPostCount,
  availablePosts = [],
  preSelectedPostIds = [],
  onSave,
}: CreateShootModalProps) {
  const [name, setName] = useState("");
  const [mainLocation, setMainLocation] = useState("");
  const [date, setDate] = useState("");
  const [outfits, setOutfits] = useState<string[]>([]);
  const [gear, setGear] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [outfitInput, setOutfitInput] = useState("");
  const [gearInput, setGearInput] = useState("");
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set(preSelectedPostIds));

  // Reset selection when modal opens with new preselected
  React.useEffect(() => {
    if (open) {
      setSelectedPostIds(new Set(preSelectedPostIds));
    }
  }, [open, preSelectedPostIds]);

  const isValid = name.trim() !== "" && date !== "";

  const togglePost = (id: string) => {
    setSelectedPostIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddOutfit = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = outfitInput.trim();
      if (value && !outfits.includes(value)) setOutfits([...outfits, value]);
      setOutfitInput("");
    }
  };

  const handleAddGear = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = gearInput.trim();
      if (value && !gear.includes(value)) setGear([...gear, value]);
      setGearInput("");
    }
  };

  const removeOutfit = (i: number) => setOutfits(outfits.filter((_, idx) => idx !== i));
  const removeGear = (i: number) => setGear(gear.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      name: name.trim(),
      mainLocation: mainLocation.trim(),
      date,
      outfits,
      gear,
      notes: notes.trim(),
      postIds: Array.from(selectedPostIds),
    });
    onOpenChange(false);
    setName(""); setMainLocation(""); setDate(""); setOutfits([]); setGear([]);
    setNotes(""); setOutfitInput(""); setGearInput(""); setSelectedPostIds(new Set());
  };

  const totalSelected = selectedPostIds.size + (selectedPostCount > 0 && selectedPostIds.size === 0 ? selectedPostCount : 0);

  const inputClass = "w-full bg-gray-50/80 border border-gray-200/80 rounded-xl px-3.5 py-2.5 text-[13px] text-gray-700 placeholder:text-gray-300 focus:bg-white focus:border-[#612A4F]/40 focus:ring-0 focus-visible:ring-0 outline-none transition-all duration-200";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!block max-w-[440px] max-h-[90vh] overflow-y-auto overflow-x-hidden !p-0 !gap-0 rounded-2xl border-0 shadow-[0_24px_48px_rgba(0,0,0,0.12)]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[#612A4F]/10 flex items-center justify-center">
                <Camera className="w-4 h-4 text-[#612A4F]" />
              </div>
              <DialogTitle className="text-[17px] font-semibold text-gray-900">Plan a Shoot</DialogTitle>
            </div>
            {(totalSelected > 0 || selectedPostIds.size > 0) && (
              <DialogDescription className="text-[13px] text-gray-400 ml-[42px]">
                {selectedPostIds.size || selectedPostCount} post{(selectedPostIds.size || selectedPostCount) !== 1 ? "s" : ""} selected
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 flex flex-col gap-5">
          {/* Name */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
              Shoot name
            </label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="e.g. Beach Golden Hour" />
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
              <MapPin className="w-3 h-3" />
              Location
            </label>
            <input type="text" value={mainLocation} onChange={e => setMainLocation(e.target.value)} placeholder="e.g. Half Moon Bay" className={inputClass} />
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
              <CalendarIcon className="w-3 h-3" />
              Date of shoot
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className={`${inputClass} text-left flex items-center justify-between`}>
                  <span className={date ? 'text-gray-700' : 'text-gray-300'}>
                    {date ? format(new Date(date + 'T00:00:00'), 'MMM d, yyyy') : 'Pick a date'}
                  </span>
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl border border-gray-200 shadow-xl z-[10200]" align="start" sideOffset={4} onOpenAutoFocus={(e) => e.preventDefault()}>
                <Calendar
                  mode="single"
                  selected={date ? new Date(date + 'T00:00:00') : undefined}
                  onSelect={(day) => {
                    if (day) {
                      const y = day.getFullYear();
                      const m = String(day.getMonth() + 1).padStart(2, '0');
                      const d = String(day.getDate()).padStart(2, '0');
                      setDate(`${y}-${m}-${d}`);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Content to shoot */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
              <Clapperboard className="w-3 h-3" />
              Content to shoot
            </label>
            {availablePosts.length > 0 ? (
              <div className="space-y-1 max-h-[200px] overflow-y-auto rounded-xl border border-gray-200/80 bg-gray-50/50 p-2">
                {availablePosts.map(post => {
                  const isChecked = selectedPostIds.has(post.id);
                  const sc = STATUS_COLORS[post.status] || { dot: '#9CA3AF' };
                  return (
                    <div
                      key={post.id}
                      onClick={() => togglePost(post.id)}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
                        isChecked ? 'bg-[#612A4F]/[0.06] border border-[#612A4F]/10' : 'hover:bg-white border border-transparent'
                      }`}
                    >
                      <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${
                        isChecked ? 'bg-[#612A4F] border-[#612A4F]' : 'border-gray-300'
                      }`}>
                        {isChecked && <Check size={10} className="text-white" strokeWidth={2.5} />}
                      </div>
                      <span className="text-[13px] text-gray-700 flex-1 truncate">{post.title}</span>
                      <StatusIcon status={post.status} className="w-3 h-3 flex-shrink-0" style={{ color: sc.dot }} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200/80 bg-gray-50/50 px-4 py-4">
                <p className="text-[12px] text-gray-400 mb-3">
                  No content ready to shoot yet. Add content to your shoot plan by changing their status to <span className="font-semibold text-gray-500">"Ready to Shoot"</span>.
                </p>
                <a
                  href="/posts"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-medium text-[#612A4F] bg-[#612A4F]/[0.06] hover:bg-[#612A4F]/[0.12] rounded-lg transition-colors"
                >
                  Add Content
                  <ArrowRight size={12} />
                </a>
                <p className="text-[11px] text-gray-400 mt-3 italic">
                  You can also add content to this shoot later.
                </p>
              </div>
            )}
          </div>

          {/* Outfits */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
              <Shirt className="w-3 h-3" />
              Outfits
            </label>
            {outfits.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {outfits.map((o, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-[#612A4F]/[0.06] text-[#612A4F] text-[11px] font-medium px-2.5 py-1 rounded-full">
                    {o}
                    <button type="button" onClick={() => removeOutfit(i)} className="text-[#612A4F]/40 hover:text-[#612A4F]/80 transition-colors">&times;</button>
                  </span>
                ))}
              </div>
            )}
            <input type="text" value={outfitInput} onChange={e => setOutfitInput(e.target.value)} onKeyDown={handleAddOutfit} placeholder="Add an outfit..." className={inputClass} />
          </div>

          {/* Props */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
              <Package className="w-3 h-3" />
              Props
            </label>
            {gear.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {gear.map((g, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-[#612A4F]/[0.06] text-[#612A4F] text-[11px] font-medium px-2.5 py-1 rounded-full">
                    {g}
                    <button type="button" onClick={() => removeGear(i)} className="text-[#612A4F]/40 hover:text-[#612A4F]/80 transition-colors">&times;</button>
                  </span>
                ))}
              </div>
            )}
            <input type="text" value={gearInput} onChange={e => setGearInput(e.target.value)} onKeyDown={handleAddGear} placeholder="Add a prop..." className={inputClass} />
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
              <StickyNote className="w-3 h-3" />
              Notes
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any notes for the shoot day..." className={`${inputClass} resize-none`} />
          </div>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className={`w-full bg-[#612A4F] text-white py-3 rounded-xl text-[13px] font-semibold hover:bg-[#4e2140] transition-all duration-200 shadow-sm hover:shadow-md ${!isValid ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            Create shoot
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
