import React, { useState } from 'react';
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
  const [inputValue, setInputValue] = useState('');

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      onAddLocation({
        id: crypto.randomUUID(),
        name: inputValue.trim(),
        address: '',
        lat: 0,
        lng: 0,
        place_id: '',
      });
      setInputValue('');
    }
  };

  return (
    <div>
      {/* Section label */}
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-400 font-medium mb-3">
        <MapPin className="w-3 h-3" />
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
                className="group flex items-baseline gap-3 py-1.5 px-2 -mx-2 rounded-lg hover:bg-gray-50/80 transition-colors duration-150"
              >
                {/* Number */}
                <span className="w-4 text-right text-[12px] text-gray-300 font-medium tabular-nums flex-shrink-0">
                  {index + 1}
                </span>

                {/* Location info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-gray-700 leading-snug">{location.name}</div>
                  {location.address && (
                    <div className="text-[11px] text-gray-400 mt-0.5">{location.address}</div>
                  )}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => onRemoveLocation(location.id)}
                  className="self-center p-0.5 rounded text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-50/80 transition-all duration-150 flex-shrink-0"
                >
                  <X size={13} />
                </button>
              </motion.div>
            </React.Fragment>
          ))}
        </AnimatePresence>
      </div>

      {/* Add location */}
      <div className="group/add flex items-center gap-3 py-1.5 px-2 -mx-2 rounded-lg hover:bg-[#612A4F]/[0.06] transition-colors duration-150">
        <Plus size={12} className="w-4 text-gray-300 group-hover/add:text-[#612A4F] transition-colors duration-150 flex-shrink-0" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Add a location..."
          className="text-[13px] border-none bg-transparent outline-none placeholder:text-gray-300 group-hover/add:placeholder:text-[#612A4F]/70 transition-colors duration-150 w-full"
        />
      </div>
    </div>
  );
};

export default LocationsBlock;
