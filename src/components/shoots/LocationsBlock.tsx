import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, MapPin } from 'lucide-react';
import { ShootLocation } from '@/types/shoots';

interface LocationsBlockProps {
  locations: ShootLocation[];
  onAddLocation: (location: ShootLocation) => void;
  onRemoveLocation: (id: string) => void;
  onReorderLocations: (locations: ShootLocation[]) => void;
}

const LocationsBlock: React.FC<LocationsBlockProps> = ({
  locations,
  onAddLocation,
  onRemoveLocation,
}) => {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddClick = () => {
    setShowInput(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onAddLocation({
        id: crypto.randomUUID(),
        name: inputValue.trim(),
        address: '',
        lat: 0,
        lng: 0,
        place_id: '',
      });
      setInputValue('');
      setShowInput(false);
    } else if (e.key === 'Escape') {
      setInputValue('');
      setShowInput(false);
    }
  };

  const handleInputBlur = () => {
    if (!inputValue.trim()) {
      setInputValue('');
      setShowInput(false);
    }
  };

  return (
    <div>
      {/* Section label */}
      <div className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-3">
        Location
      </div>

      {/* Location list */}
      <div>
        <AnimatePresence initial={false}>
          {locations.map((location, index) => (
            <React.Fragment key={location.id}>
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="group flex items-start gap-3"
              >
                {/* Pin number */}
                <div className="w-6 h-6 rounded-full bg-[#612A4F] text-white text-[10px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>

                {/* Location info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800">{location.name}</div>
                  {location.address && (
                    <div className="text-[11px] text-gray-400">{location.address}</div>
                  )}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => onRemoveLocation(location.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                >
                  <X size={14} className="text-gray-300 hover:text-red-400" />
                </button>
              </motion.div>

              {/* Connector line */}
              {index < locations.length - 1 && (
                <div className="w-px h-4 bg-gray-200 ml-3" />
              )}
            </React.Fragment>
          ))}
        </AnimatePresence>
      </div>

      {/* Add location */}
      {showInput ? (
        <div className="mt-3">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
            <MapPin size={14} className="text-gray-300 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onBlur={handleInputBlur}
              placeholder="Search for a location..."
              className="text-sm bg-transparent outline-none w-full placeholder:text-gray-300"
            />
          </div>
        </div>
      ) : (
        <button
          onClick={handleAddClick}
          className="mt-3 text-sm text-gray-400 hover:text-[#612A4F] flex items-center gap-2 transition-colors"
        >
          <Plus size={14} />
          Add location
        </button>
      )}
    </div>
  );
};

export default LocationsBlock;
