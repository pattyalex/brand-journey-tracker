import React, { useState } from 'react';
import { X } from 'lucide-react';

interface OutfitsGearNotesProps {
  outfits: string[];
  gear: string[];
  notes: string;
  onUpdateOutfits: (outfits: string[]) => void;
  onUpdateGear: (gear: string[]) => void;
  onUpdateNotes: (notes: string) => void;
}

interface TagBlockProps {
  label: string;
  items: string[];
  placeholder: string;
  onUpdate: (items: string[]) => void;
}

const TagBlock: React.FC<TagBlockProps> = ({ label, items, placeholder, onUpdate }) => {
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
      <div className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-3">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((item, index) => (
          <span
            key={index}
            className="bg-gray-100 text-gray-600 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5"
          >
            {item}
            <button
              onClick={() => handleRemove(index)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="text-sm border-none bg-transparent outline-none placeholder:text-gray-300 w-full"
      />
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
}) => {
  const [notesValue, setNotesValue] = useState(notes);

  const handleNotesBlur = () => {
    if (notesValue !== notes) {
      onUpdateNotes(notesValue);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Outfits */}
      <TagBlock
        label="Outfits"
        items={outfits}
        placeholder="Add outfit..."
        onUpdate={onUpdateOutfits}
      />

      {/* Props */}
      <TagBlock
        label="Props"
        items={gear}
        placeholder="Add a prop..."
        onUpdate={onUpdateGear}
      />

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
