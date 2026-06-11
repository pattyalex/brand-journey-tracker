import React, { useState } from 'react';
import { X, Shirt, Package, Plus } from 'lucide-react';

const CARD_CLASS =
  'rounded-2xl border border-gray-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]';

interface OutfitsGearNotesProps {
  outfits: string[];
  gear: string[];
  notes: string;
  onUpdateOutfits: (outfits: string[]) => void;
  onUpdateGear: (gear: string[]) => void;
  onUpdateNotes: (notes: string) => void;
  locationSlot?: React.ReactNode;
}

interface TagBlockProps {
  label: string;
  icon?: React.ReactNode;
  items: string[];
  placeholder: string;
  onUpdate: (items: string[]) => void;
}

const TagBlock: React.FC<TagBlockProps> = ({ label, icon, items, placeholder, onUpdate }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      onUpdate([...items, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemove = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-400 font-medium mb-3">
        {icon}
        {label}
      </div>
      <div className="flex flex-col">
        {items.map((item, index) => (
          <div
            key={index}
            className="group/item flex items-baseline gap-3 py-1.5 px-2 -mx-2 rounded-lg hover:bg-gray-50/80 transition-colors duration-150"
          >
            <span className="w-4 text-right text-[12px] text-gray-300 font-medium tabular-nums flex-shrink-0">
              {index + 1}
            </span>
            <span className="text-[13px] text-gray-700 leading-snug flex-1">
              {item.replace(/^\s*\d+\.\s*/, '')}
            </span>
            <button
              onClick={() => handleRemove(index)}
              className="self-center p-0.5 rounded text-gray-300 opacity-0 group-hover/item:opacity-100 hover:text-red-400 hover:bg-red-50/80 transition-all duration-150 flex-shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        ))}
        {/* Add row */}
        <div className="group/add flex items-center gap-3 py-1.5 px-2 -mx-2 rounded-lg hover:bg-[#612A4F]/[0.06] transition-colors duration-150">
          <Plus size={12} className="w-4 text-gray-300 group-hover/add:text-[#612A4F] transition-colors duration-150 flex-shrink-0" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="text-[13px] border-none bg-transparent outline-none placeholder:text-gray-300 group-hover/add:placeholder:text-[#612A4F]/70 transition-colors duration-150 w-full"
          />
        </div>
      </div>
    </div>
  );
};

const OutfitsGearNotes: React.FC<OutfitsGearNotesProps> = ({
  outfits,
  gear,
  notes,
  onUpdateOutfits,
  onUpdateGear,
  onUpdateNotes,
  locationSlot,
}) => {
  const [notesValue, setNotesValue] = useState(notes);

  const handleNotesBlur = () => {
    if (notesValue !== notes) {
      onUpdateNotes(notesValue);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Location · Outfits · Props — 3 soft panel cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Location */}
        <div className={CARD_CLASS}>{locationSlot}</div>

        {/* Outfits */}
        <div className={CARD_CLASS}>
          <TagBlock
            label="Outfits"
            icon={<Shirt className="w-3 h-3" />}
            items={outfits}
            placeholder="Add outfit..."
            onUpdate={onUpdateOutfits}
          />
        </div>

        {/* Props */}
        <div className={CARD_CLASS}>
          <TagBlock
            label="Props"
            icon={<Package className="w-3 h-3" />}
            items={gear}
            placeholder="Add a prop..."
            onUpdate={onUpdateGear}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <div className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-3">
          Notes
        </div>
        <textarea
          value={notesValue}
          onChange={(e) => setNotesValue(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Add notes..."
          className="text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 min-h-[80px] resize-none focus:border-[#612A4F] focus:ring-0 outline-none transition-colors w-full placeholder:text-gray-300"
        />
      </div>
    </div>
  );
};

export default OutfitsGearNotes;
