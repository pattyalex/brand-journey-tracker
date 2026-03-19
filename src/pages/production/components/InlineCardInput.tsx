import React, { useState, useEffect, useRef } from "react";

interface InlineCardInputProps {
  onSave: (title: string) => void;
  onCancel: () => void;
}

const InlineCardInput: React.FC<InlineCardInputProps> = ({ onSave, onCancel }) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSave(value);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-[#8B7082] shadow-md">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onSave(value)}
        placeholder="Enter a title"
        className="w-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400"
      />
    </div>
  );
};

export default InlineCardInput;
