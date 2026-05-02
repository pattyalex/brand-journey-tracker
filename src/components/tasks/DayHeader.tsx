import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayHeaderProps {
  date: string; // YYYY-MM-DD
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isToday(dateStr: string): boolean {
  const now = new Date();
  const d = parseDate(dateStr);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

const DayHeader: React.FC<DayHeaderProps> = ({ date, onPrev, onNext, onToday }) => {
  const d = parseDate(date);
  const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const today = isToday(date);

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1
          className="text-[22px] font-medium text-gray-900"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {dayName}
        </h1>
        <p className="text-[13px] text-gray-400 mt-0.5">{fullDate}</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          className="w-[28px] h-[28px] flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onToday}
          className="px-2.5 py-1 text-[12px] font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {today ? 'Today' : dayName}
        </button>
        <button
          onClick={onNext}
          className="w-[28px] h-[28px] flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DayHeader;
