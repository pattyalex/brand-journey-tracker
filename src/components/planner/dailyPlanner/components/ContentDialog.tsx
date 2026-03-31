import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { X, ArrowRight, Lightbulb, Video } from "lucide-react";
import { ProductionCard, KanbanColumn } from "@/pages/production/types";
import { StorageKeys, getString, setString } from "@/lib/storage";
import { EVENTS, emit } from "@/lib/events";
import { toast } from "sonner";
import { TimePicker } from "./TimePicker";
import { parseTimeTo24 } from "../utils/timeUtils";

interface ContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ProductionCard | null;
  type: 'scheduled' | 'planned';
  onSave?: () => void;
  onOpenFullFlow?: (cardId: string) => void;
}

const to12h = (time24: string): string => {
  if (!time24) return "";
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

export const ContentDialog = ({
  open,
  onOpenChange,
  content,
  type,
  onSave,
  onOpenFullFlow,
}: ContentDialogProps) => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);

  useEffect(() => {
    if (open && content) {
      setDragOffset({ x: 0, y: 0 });
      if (type === 'scheduled') {
        setStartTime(to12h(content.scheduledStartTime || ""));
        setEndTime(to12h(content.scheduledEndTime || ""));
      } else {
        setStartTime(to12h(content.plannedStartTime || ""));
        setEndTime(to12h(content.plannedEndTime || ""));
      }
    }
  }, [open, content, type]);

  if (!open || !content) return null;

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    dragStartRef.current = { x: e.clientX, y: e.clientY, offsetX: dragOffset.x, offsetY: dragOffset.y };
    const handleMouseMove = (ev: MouseEvent) => {
      if (dragStartRef.current) {
        setDragOffset({
          x: dragStartRef.current.offsetX + ev.clientX - dragStartRef.current.x,
          y: dragStartRef.current.offsetY + ev.clientY - dragStartRef.current.y,
        });
      }
    };
    const handleMouseUp = () => {
      dragStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleSaveTime = () => {
    const savedData = getString(StorageKeys.productionKanban);
    if (!savedData) return;
    try {
      const columns: KanbanColumn[] = JSON.parse(savedData);
      const newStart = parseTimeTo24(startTime);
      const newEnd = parseTimeTo24(endTime);
      if (type === 'scheduled') {
        const col = columns.find(c => c.id === 'ready-to-post');
        const card = col?.cards.find(c => c.id === content.id);
        if (card) {
          if (newStart) card.scheduledStartTime = newStart;
          if (newEnd) card.scheduledEndTime = newEnd;
        }
      } else {
        const col = columns.find(c => c.id === 'ideate');
        const card = col?.cards.find(c => c.id === content.id);
        if (card) {
          if (newStart) card.plannedStartTime = newStart;
          if (newEnd) card.plannedEndTime = newEnd;
        }
      }
      setString(StorageKeys.productionKanban, JSON.stringify(columns));
      emit(window, EVENTS.productionKanbanUpdated);
      emit(window, EVENTS.scheduledContentUpdated);
      onSave?.();
      toast.success('Time updated');
      onOpenChange(false);
    } catch (err) {
      console.error('Error saving time:', err);
      toast.error('Failed to save');
    }
  };

  const isPlanned = type === 'planned';
  const dateStr = isPlanned ? content.plannedDate : content.scheduledDate;
  const accentGradient = isPlanned
    ? 'from-[#b8a0b0] to-[#9a8090]'
    : 'from-[#7a3868] to-[#4e2040]';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-[340px] mx-4 rounded-3xl overflow-hidden shadow-2xl"
        style={{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }}
      >
        {/* Gradient header band — also drag handle */}
        <div
          onMouseDown={handleDragStart}
          className={`bg-gradient-to-br ${accentGradient} px-5 pt-5 pb-6 cursor-grab active:cursor-grabbing`}
        >
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>

          {/* Icon + label */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              {isPlanned
                ? <Lightbulb className="w-3.5 h-3.5 text-white" />
                : <Video className="w-3.5 h-3.5 text-white" />
              }
            </div>
            <span className="text-white/70 text-[11px] font-medium uppercase tracking-widest">
              {isPlanned ? 'Planned' : 'Scheduled'}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-white font-semibold text-[17px] leading-snug pr-8 line-clamp-3">
            {content.hook || content.title || 'Untitled'}
          </h3>

          {/* Date pill */}
          {dateStr && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
              <span className="text-white/90 text-[11px] font-medium">
                {format(new Date(dateStr + 'T12:00:00'), 'EEE, MMM d')}
              </span>
            </div>
          )}
        </div>

        {/* White body */}
        <div className="bg-white px-5 pt-5 pb-5">

          {/* Time section */}
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Post time
          </p>
          <div className="flex items-center gap-2 mb-5">
            <div className="flex-1 bg-gray-50 rounded-2xl px-3 py-2.5 border border-gray-100 focus-within:border-[#8B7082] focus-within:ring-1 focus-within:ring-[#8B7082]/20 transition-all">
              <TimePicker
                value={startTime}
                onChange={setStartTime}
                placeholder="Start"
                className="w-full text-sm text-gray-800 bg-transparent"
              />
            </div>
            <div className="w-4 h-[1px] bg-gray-300 flex-shrink-0" />
            <div className="flex-1 bg-gray-50 rounded-2xl px-3 py-2.5 border border-gray-100 focus-within:border-[#8B7082] focus-within:ring-1 focus-within:ring-[#8B7082]/20 transition-all">
              <TimePicker
                value={endTime}
                onChange={setEndTime}
                placeholder="End"
                className="w-full text-sm text-gray-800 bg-transparent"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 mb-4" />

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenChange(false);
                onOpenFullFlow?.(content.id);
              }}
              className="w-full px-4 py-3 rounded-2xl text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all duration-150 flex items-center justify-between"
            >
              <span>Open Full Workflow</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleSaveTime}
              className={`w-full flex items-center justify-center px-4 py-3.5 rounded-2xl bg-gradient-to-r ${accentGradient} text-white font-medium text-sm shadow-lg shadow-[#612a4f]/25 hover:shadow-xl hover:shadow-[#612a4f]/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150`}
            >
              Save time & close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
