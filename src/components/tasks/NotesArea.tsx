import React, { useState, useEffect, useRef, useCallback } from 'react';

interface NotesAreaProps {
  content: string;
  onChange: (content: string) => void;
}

const NotesArea: React.FC<NotesAreaProps> = ({ content, onChange }) => {
  const [value, setValue] = useState(content);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setValue(content);
  }, [content]);

  const handleChange = useCallback((newVal: string) => {
    setValue(newVal);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(newVal), 500);
  }, [onChange]);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  return (
    <div className="mt-8 rounded-xl bg-[#f9f7f5] px-4 py-3.5">
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
        Notes for today
      </p>
      <textarea
        value={value}
        onChange={e => handleChange(e.target.value)}
        placeholder="Anything else on your mind?"
        className="w-full bg-transparent border-none outline-none resize-none text-[13px] text-gray-500 italic leading-relaxed placeholder:text-gray-300 placeholder:italic min-h-[60px]"
        rows={3}
      />
    </div>
  );
};

export default NotesArea;
