import React, { useState, KeyboardEvent } from "react";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Post, getPillarStyle, STATUS_COLORS } from "@/types/posts";
import { StatusIcon } from "@/components/posts/StatusDropdown";

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

  const labelClass = "text-xs uppercase tracking-wider text-gray-400 font-medium mb-1.5 block";
  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#612A4F] focus:ring-0 focus-visible:ring-0 outline-none transition-colors";

  const totalSelected = selectedPostIds.size + (selectedPostCount > 0 && selectedPostIds.size === 0 ? selectedPostCount : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">Plan a Shoot</DialogTitle>
          {(totalSelected > 0 || selectedPostIds.size > 0) && (
            <DialogDescription className="text-sm text-gray-400">
              {selectedPostIds.size || selectedPostCount} post{(selectedPostIds.size || selectedPostCount) !== 1 ? "s" : ""} selected
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className={labelClass}>Shoot name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="e.g. Beach Golden Hour" />
          </div>

          {/* Main Location */}
          <div>
            <label className={labelClass}>Main location</label>
            <input type="text" value={mainLocation} onChange={e => setMainLocation(e.target.value)} placeholder="e.g. Half Moon Bay" className={inputClass} />
          </div>

          {/* Date */}
          <div>
            <label className={labelClass}>Date of shoot</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
          </div>

          {/* Content to shoot — post picker */}
          {availablePosts.length > 0 && (
            <div>
              <label className={labelClass}>Content to shoot</label>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto rounded-lg border border-gray-200 p-2">
                {availablePosts.map(post => {
                  const isChecked = selectedPostIds.has(post.id);
                  const sc = STATUS_COLORS[post.status] || { dot: '#9CA3AF' };
                  return (
                    <div
                      key={post.id}
                      onClick={() => togglePost(post.id)}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors duration-150 ${
                        isChecked ? 'bg-[#612A4F]/[0.04]' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                        isChecked ? 'bg-[#612A4F] border-[#612A4F]' : 'border-gray-300'
                      }`}>
                        {isChecked && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-sm text-gray-700 flex-1 truncate">{post.title}</span>
                      <StatusIcon status={post.status} className="w-3 h-3 flex-shrink-0" style={{ color: sc.dot }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Outfits */}
          <div>
            <label className={labelClass}>Outfits</label>
            {outfits.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {outfits.map((o, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded-full">
                    {o}
                    <button type="button" onClick={() => removeOutfit(i)} className="text-gray-400 hover:text-gray-600">&times;</button>
                  </span>
                ))}
              </div>
            )}
            <input type="text" value={outfitInput} onChange={e => setOutfitInput(e.target.value)} onKeyDown={handleAddOutfit} placeholder="Add an outfit..." className={inputClass} />
          </div>

          {/* Props */}
          <div>
            <label className={labelClass}>Props</label>
            {gear.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {gear.map((g, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded-full">
                    {g}
                    <button type="button" onClick={() => removeGear(i)} className="text-gray-400 hover:text-gray-600">&times;</button>
                  </span>
                ))}
              </div>
            )}
            <input type="text" value={gearInput} onChange={e => setGearInput(e.target.value)} onKeyDown={handleAddGear} placeholder="Add a prop..." className={inputClass} />
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any notes for the shoot day..." className={inputClass} />
          </div>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className={`w-full bg-[#612A4F] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#4e2140] transition-colors ${!isValid ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Create shoot
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
