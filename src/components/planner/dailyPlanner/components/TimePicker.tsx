import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Generate time options in 15-minute intervals
const generateTimeOptions = () => {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour < 12 ? 'am' : 'pm';
      const minuteStr = minute.toString().padStart(2, '0');
      options.push(`${hour12}:${minuteStr} ${period}`);
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

export const TimePicker = ({ value, onChange, placeholder = "Select time", className }: TimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update dropdown position when opening
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to selected time when opening
  useEffect(() => {
    if (isOpen && listRef.current && value) {
      const selectedIndex = TIME_OPTIONS.findIndex(
        opt => opt.toLowerCase() === value.toLowerCase()
      );
      if (selectedIndex !== -1) {
        const itemHeight = 36; // Approximate height of each option
        listRef.current.scrollTop = Math.max(0, (selectedIndex - 2) * itemHeight);
      }
    }
  }, [isOpen, value]);

  // Filter options based on search
  const filteredOptions = search
    ? TIME_OPTIONS.filter(opt =>
        opt.toLowerCase().includes(search.toLowerCase()) ||
        opt.replace(':', '').toLowerCase().includes(search.toLowerCase())
      )
    : TIME_OPTIONS;

  const handleSelect = (time: string) => {
    onChange(time);
    setIsOpen(false);
    setSearch("");
  };

  const displayValue = value || placeholder;
  const hasValue = !!value;

  const dropdown = isOpen ? createPortal(
    <div
      className="fixed z-[9999] bg-white rounded-lg shadow-lg border border-[#8B7082]/30 overflow-hidden"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Search Input */}
      <div className="p-2 border-b border-[#8B7082]/20">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Type to search..."
          className="w-full px-2 py-1.5 text-sm border border-[#8B7082]/30 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B7082]/30 focus:border-[#8B7082]/50"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && filteredOptions.length > 0) {
              handleSelect(filteredOptions[0]);
            } else if (e.key === 'Escape') {
              setIsOpen(false);
              setSearch("");
            }
          }}
        />
      </div>

      {/* Options List */}
      <div
        ref={listRef}
        className="max-h-48 overflow-y-auto overscroll-contain"
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => handleSelect(time)}
              className={cn(
                "w-full px-3 py-2 text-sm text-left transition-colors",
                "hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                value?.toLowerCase() === time.toLowerCase() && "bg-indigo-50 text-indigo-700 font-medium"
              )}
            >
              {time}
            </button>
          ))
        ) : (
          <div className="px-3 py-4 text-sm text-gray-400 text-center">
            No times found
          </div>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all",
          "hover:border-[#8B7082]/60 focus:outline-none focus:ring-1 focus:ring-[#8B7082]/30",
          isOpen ? "border border-[#8B7082] ring-1 ring-[#8B7082]/30" : "border border-[#8B7082]/40",
          hasValue ? "text-gray-900" : "text-gray-400"
        )}
      >
        <span>{displayValue}</span>
        <ChevronDown className={cn(
          "w-4 h-4 text-gray-400 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {dropdown}
    </div>
  );
};
