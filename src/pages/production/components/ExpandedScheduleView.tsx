import React, { useState, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarDays, ChevronLeft, ChevronRight, Video, Camera, Check, X, Pin, PartyPopper } from "lucide-react";
import { SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { ProductionCard } from "../types";

// Helper to get platform icon
const getPlatformIcon = (platform: string, size: string = "w-5 h-5"): React.ReactNode => {
  const lowercased = platform.toLowerCase();

  if (lowercased.includes("youtube")) return <SiYoutube className={size} />;
  if (lowercased.includes("tiktok") || lowercased === "tt") return <SiTiktok className={size} />;
  if (lowercased.includes("instagram") || lowercased === "ig") return <SiInstagram className={size} />;
  if (lowercased.includes("facebook")) return <SiFacebook className={size} />;
  if (lowercased.includes("linkedin")) return <SiLinkedin className={size} />;
  if (lowercased.includes("twitter") || lowercased.includes("x.com") || lowercased.includes("x /")) return <RiTwitterXLine className={size} />;
  if (lowercased.includes("threads")) return <RiThreadsLine className={size} />;
  return null;
};

// Static formats that should show camera icon
const staticFormats = [
  'single photo post',
  'curated photo carousel',
  'casual photo dump',
  'text-only post',
  'carousel with text slides',
  'notes-app style screenshot',
  'tweet-style slide',
  'photo post',
  'carousel',
  'text post'
];

const isStaticFormat = (format: string): boolean => {
  return staticFormats.some(sf => format.toLowerCase().includes(sf) || sf.includes(format.toLowerCase()));
};

// Color options for scheduled content
const scheduleColors = {
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', hover: 'hover:bg-indigo-200', dot: 'bg-indigo-300' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-700', hover: 'hover:bg-rose-200', dot: 'bg-rose-300' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700', hover: 'hover:bg-amber-200', dot: 'bg-amber-300' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', hover: 'hover:bg-emerald-200', dot: 'bg-emerald-300' },
  sky: { bg: 'bg-sky-100', text: 'text-sky-700', hover: 'hover:bg-sky-200', dot: 'bg-sky-300' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-700', hover: 'hover:bg-violet-200', dot: 'bg-violet-300' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', hover: 'hover:bg-orange-200', dot: 'bg-orange-300' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', hover: 'hover:bg-cyan-200', dot: 'bg-cyan-300' },
  sage: { bg: 'bg-[#DCE5D4]', text: 'text-[#5F6B52]', hover: 'hover:bg-[#CAD4C0]', dot: 'bg-[#A8B89E]' },
};

type ScheduleColorKey = keyof typeof scheduleColors;

interface ExpandedScheduleViewProps {
  cards: ProductionCard[];
  onClose: () => void;
  onSchedule?: (cardId: string, date: Date) => void;
  onUnschedule?: (cardId: string) => void;
  onUpdateColor?: (cardId: string, color: ScheduleColorKey) => void;
}

const ExpandedScheduleView: React.FC<ExpandedScheduleViewProps> = ({
  cards,
  onClose,
  onSchedule,
  onUnschedule,
  onUpdateColor,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [dragOverUnschedule, setDragOverUnschedule] = useState(false);
  const [popoverCardId, setPopoverCardId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<ProductionCard | null>(null);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter unscheduled cards
  const unscheduledCards = cards.filter(c => c.schedulingStatus !== 'scheduled');

  // Create a map of scheduled cards by date
  const scheduledCardsByDate = useMemo(() => {
    const map: Record<string, ProductionCard[]> = {};
    cards.forEach(c => {
      if (c.schedulingStatus === 'scheduled' && c.scheduledDate) {
        const dateKey = c.scheduledDate.split('T')[0];
        if (!map[dateKey]) {
          map[dateKey] = [];
        }
        map[dateKey].push(c);
      }
    });
    return map;
  }, [cards]);

  // Calendar calculations
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get calendar days for the current month view
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];

    // Previous month days
    const prevMonth = new Date(currentYear, currentMonth, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1, daysInPrevMonth - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === today.toDateString();
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Next month days to fill the grid (6 rows × 7 days = 42)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [currentMonth, currentYear]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCardId(cardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(dateStr);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (draggedCardId && onSchedule) {
      onSchedule(draggedCardId, date);
    }
    setDraggedCardId(null);
    setDragOverDate(null);
  };

  // Render content details for popover
  const renderContentDetails = (cardToShow: ProductionCard) => {
    const allFormats = [
      ...(cardToShow.formats || []),
      ...(cardToShow.customVideoFormats || []),
      ...(cardToShow.customPhotoFormats || [])
    ];
    const hasFormats = allFormats.length > 0;
    const hasPlatforms = cardToShow.platforms && cardToShow.platforms.length > 0;

    return (
      <div className="space-y-4">
        {(cardToShow.title || cardToShow.hook) && (
          <div>
            <h3 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
              Hook
            </h3>
            <p className="text-[15px] font-medium text-gray-900">
              {cardToShow.hook || cardToShow.title}
            </p>
          </div>
        )}

        {cardToShow.script && (
          <div>
            <h3 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
              Script
            </h3>
            <div className="text-[14px] text-gray-700 whitespace-pre-wrap leading-relaxed">
              {cardToShow.script}
            </div>
          </div>
        )}

        {hasFormats && (
          <div>
            <h3 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
              How It's Shot
            </h3>
            <div className="space-y-1">
              {allFormats.map((format, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[14px] text-gray-700">
                  {isStaticFormat(format) ? (
                    <Camera className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Video className="w-4 h-4 text-gray-400" />
                  )}
                  <span>{format}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasPlatforms && (
          <div>
            <h3 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
              Platform
            </h3>
            <div className="flex items-center gap-2.5">
              {cardToShow.platforms!.map((platform, idx) => (
                <span key={idx} className="text-gray-700" title={platform}>
                  {getPlatformIcon(platform)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-[1200px] max-w-[95vw] h-[calc(100vh-6rem)] max-h-[800px] overflow-hidden">
      {/* Main content - split panels */}
      <div className={cn(
        "flex-1 overflow-hidden grid transition-all duration-300",
        isLeftPanelCollapsed ? "grid-cols-[48px_1fr]" : "grid-cols-[380px_1fr]"
      )}>
        {/* Left Panel - Content to Schedule */}
        <div
          className={cn(
            "border-r border-indigo-100 flex flex-col bg-indigo-100/60 min-h-0 transition-all duration-300 relative",
            dragOverUnschedule && "bg-indigo-200 ring-2 ring-inset ring-indigo-400"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setDragOverUnschedule(true);
          }}
          onDragLeave={() => setDragOverUnschedule(false)}
          onDrop={(e) => {
            e.preventDefault();
            if (draggedCardId && onUnschedule) {
              onUnschedule(draggedCardId);
            }
            setDraggedCardId(null);
            setDragOverUnschedule(false);
          }}
        >
          {/* Collapse/Expand Button */}
          <button
            onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-6 h-12 bg-white border border-gray-200 rounded-r-lg shadow-sm hover:bg-gray-50 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className={cn(
              "w-4 h-4 text-gray-600 transition-transform duration-300",
              isLeftPanelCollapsed && "rotate-180"
            )} />
          </button>

          {/* Header */}
          <div className={cn(
            "flex items-center gap-3 px-6 py-4 border-b border-indigo-100 flex-shrink-0 transition-all duration-300",
            isLeftPanelCollapsed && "px-2 justify-center"
          )}>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-4 h-4 text-indigo-500" />
            </div>
            {!isLeftPanelCollapsed && (
              <h2 className="text-lg font-bold text-gray-900">
                Content to Schedule
              </h2>
            )}
          </div>

          {/* Body - scrollable */}
          <div className={cn(
            "flex-1 min-h-0 overflow-y-auto transition-all duration-300",
            isLeftPanelCollapsed ? "p-0 opacity-0 overflow-hidden" : "p-4 opacity-100"
          )}>
            <div className="space-y-2">
              {unscheduledCards.length === 0 && !dragOverUnschedule ? (
                <div className="text-center py-8 text-gray-400">
                  <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No content to schedule</p>
                  <p className="text-xs mt-1">Drag content cards here from previous columns</p>
                </div>
              ) : unscheduledCards.length === 0 && dragOverUnschedule ? (
                <div className="text-center py-8 text-indigo-500">
                  <CalendarDays className="w-10 h-10 mx-auto mb-3" />
                  <p className="text-sm font-medium">Drop here to unschedule</p>
                </div>
              ) : (
                unscheduledCards.map((c) => {
                  const formats = c.formats || [];
                  const hasStatus = !!c.schedulingStatus;
                  const schedulingStatus = c.schedulingStatus;
                  const platforms = c.platforms || [];
                  const hasPlatforms = platforms.length > 0;

                  const renderPlatformIcons = () => (
                    <div className="flex gap-1.5 items-center">
                      {platforms.map((platform, idx) => {
                        const icon = getPlatformIcon(platform, "w-3 h-3 text-gray-400");
                        return icon ? (
                          <span key={`platform-${idx}`} title={platform}>
                            {icon}
                          </span>
                        ) : null;
                      })}
                    </div>
                  );

                  return (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, c.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedCard(selectedCard?.id === c.id ? null : c)}
                      className={cn(
                        "p-2 rounded-xl border cursor-pointer transition-all shadow-[2px_3px_0px_rgba(0,0,0,0.06)]",
                        "hover:border-indigo-300 hover:shadow-md",
                        draggedCardId === c.id && "opacity-40 scale-[0.98]",
                        selectedCard?.id === c.id
                          ? "border-indigo-500 bg-indigo-100 ring-2 ring-indigo-300"
                          : "border-gray-200 bg-white/90"
                      )}
                    >
                      {/* Title row with pin */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-gray-800 break-words leading-tight flex-1">
                          {c.hook || c.title || "Untitled content"}
                        </h3>
                        {c.isPinned && (
                          <Pin className="w-3 h-3 text-amber-500 flex-shrink-0 fill-amber-500" />
                        )}
                      </div>

                      {/* Format and Status Tags */}
                      {(formats.length > 0 || hasStatus || hasPlatforms) && (
                        <div className="flex flex-col gap-1 mt-2">
                          {formats.map((format, idx) => {
                            const isStatic = isStaticFormat(format);
                            const isLastRow = !hasStatus && idx === formats.length - 1;

                            if (isLastRow && hasPlatforms) {
                              return (
                                <div key={`format-${idx}`} className="flex items-center justify-between">
                                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full text-gray-500 font-medium">
                                    {isStatic ? <Camera className="w-2.5 h-2.5" /> : <Video className="w-2.5 h-2.5" />}
                                    {format}
                                  </span>
                                  {renderPlatformIcons()}
                                </div>
                              );
                            }

                            return (
                              <span key={`format-${idx}`} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full text-gray-500 font-medium">
                                {isStatic ? <Camera className="w-2.5 h-2.5" /> : <Video className="w-2.5 h-2.5" />}
                                {format}
                              </span>
                            );
                          })}

                          {hasStatus && (
                            <div className={hasPlatforms ? "flex items-center justify-between" : ""}>
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full text-gray-500 font-medium">
                                {schedulingStatus === 'to-schedule' && <CalendarDays className="w-2.5 h-2.5" />}
                                {schedulingStatus === 'scheduled' && <Check className="w-2.5 h-2.5" />}
                                {schedulingStatus === 'to-schedule' ? 'To schedule' :
                                 schedulingStatus === 'scheduled' ? 'Scheduled' : ''}
                              </span>
                              {hasPlatforms && renderPlatformIcons()}
                            </div>
                          )}

                          {!hasStatus && formats.length === 0 && hasPlatforms && (
                            <div className="flex items-center justify-end">
                              {renderPlatformIcons()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Selected Card Details */}
              {selectedCard && (
                <div className="mt-4 pt-4 border-t border-indigo-200">
                  {/* Hook */}
                  <div className="mb-4">
                    <h4 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
                      Hook
                    </h4>
                    <p className="text-base font-medium text-gray-900">
                      {selectedCard.hook || selectedCard.title || "No hook"}
                    </p>
                  </div>

                  {/* Script */}
                  {selectedCard.script && (
                    <div className="mb-4">
                      <h4 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
                        Script
                      </h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedCard.script}
                      </p>
                    </div>
                  )}

                  {/* How It's Shot */}
                  {selectedCard.formats && selectedCard.formats.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
                        How It's Shot
                      </h4>
                      <div className="space-y-1">
                        {selectedCard.formats.map((format, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                            {isStaticFormat(format) ? (
                              <Camera className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Video className="w-4 h-4 text-gray-400" />
                            )}
                            <span>{format}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Platform */}
                  {selectedCard.platforms && selectedCard.platforms.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
                        Platform
                      </h4>
                      <div className="flex items-center gap-2.5">
                        {selectedCard.platforms.map((platform, idx) => (
                          <span key={idx} className="text-gray-700" title={platform}>
                            {getPlatformIcon(platform, "w-5 h-5")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Calendar */}
        <div className="flex flex-col overflow-hidden bg-gray-50/50">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-500" />
                <span className="text-lg font-bold text-gray-900">Content Calendar</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-base font-medium text-gray-700 min-w-[140px] text-center">
                  {monthNames[currentMonth]} {currentYear}
                </span>
                <button
                  onClick={goToNextMonth}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((day, idx) => {
                const dateStr = day.date.toISOString().split('T')[0];
                const isDragOver = dragOverDate === dateStr;
                const scheduledForDay = scheduledCardsByDate[dateStr] || [];

                return (
                  <div
                    key={idx}
                    onDragOver={(e) => handleDragOver(e, dateStr)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, day.date)}
                    className={cn(
                      isLeftPanelCollapsed ? "rounded-lg border min-h-[120px] relative p-2" : "aspect-square rounded-lg border min-h-[90px] relative p-1.5",
                      day.isCurrentMonth
                        ? "bg-white border-gray-200 text-gray-900"
                        : "bg-gray-50 border-gray-100 text-gray-400",
                      isDragOver && "bg-indigo-100 border-indigo-400 border-2 scale-105"
                    )}
                  >
                    <span className={cn(
                      "absolute top-1.5 left-2 text-sm font-medium",
                      day.isToday && "text-indigo-600 font-bold"
                    )}>
                      {day.date.getDate()}
                    </span>

                    {/* Scheduled content indicators - scrollable */}
                    {scheduledForDay.length > 0 && (
                      <div className="absolute top-7 left-1 right-1 bottom-1 flex flex-col gap-1 overflow-y-auto">
                        {scheduledForDay.map((scheduledCard) => {
                          const isPublished = day.date < today;
                          return (
                          <Popover
                            key={scheduledCard.id}
                            open={popoverCardId === scheduledCard.id}
                            onOpenChange={(open) => setPopoverCardId(open ? scheduledCard.id : null)}
                          >
                            <PopoverTrigger asChild>
                              <div
                                draggable
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  setDraggedCardId(scheduledCard.id);
                                  setPopoverCardId(null);
                                  e.dataTransfer.effectAllowed = 'move';
                                }}
                                onDragEnd={() => {
                                  setDraggedCardId(null);
                                  setDragOverDate(null);
                                  setDragOverUnschedule(false);
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPopoverCardId(popoverCardId === scheduledCard.id ? null : scheduledCard.id);
                                }}
                                className={cn(
                                  "text-[11px] px-2 py-1.5 rounded-md cursor-grab active:cursor-grabbing transition-colors",
                                  isPublished
                                    ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    : scheduledCard.scheduledColor && scheduleColors[scheduledCard.scheduledColor]
                                      ? `${scheduleColors[scheduledCard.scheduledColor].bg} ${scheduleColors[scheduledCard.scheduledColor].text} ${scheduleColors[scheduledCard.scheduledColor].hover}`
                                      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
                                  draggedCardId === scheduledCard.id && "opacity-50"
                                )}
                                title={scheduledCard.hook || scheduledCard.title}
                              >
                                {/* Title row */}
                                <div className="flex items-start gap-1.5">
                                  {isPublished ? (
                                    <PartyPopper className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-600" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                  )}
                                  <span className="leading-tight">{scheduledCard.hook || scheduledCard.title || "Scheduled"}</span>
                                </div>
                                {/* Platforms - bottom right */}
                                {scheduledCard.platforms && scheduledCard.platforms.length > 0 && (
                                  <div className="flex gap-1.5 items-center justify-end mt-0.5">
                                    {scheduledCard.platforms.map((platform, idx) => (
                                      <span key={idx} title={platform}>
                                        {getPlatformIcon(platform, "w-3.5 h-3.5")}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-80 p-0 shadow-xl border-0"
                              side="right"
                              align="start"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                            >
                              <div
                                className="bg-white rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 border-b border-indigo-100">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center">
                                      <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                                    </div>
                                    <span className="text-sm font-semibold text-indigo-900">Content Overview</span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPopoverCardId(null);
                                    }}
                                    className="p-1 hover:bg-indigo-100 rounded transition-colors"
                                  >
                                    <X className="w-4 h-4 text-indigo-400" />
                                  </button>
                                </div>
                                <div className="p-4" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                                  {renderContentDetails(scheduledCard)}

                                  {/* Color Picker */}
                                  {!isPublished && (
                                    <div
                                      className="mt-4 pt-4 border-t border-gray-100"
                                      onClick={(e) => e.stopPropagation()}
                                      onDrop={(e) => { e.stopPropagation(); e.preventDefault(); }}
                                      onDragOver={(e) => { e.stopPropagation(); e.preventDefault(); }}
                                    >
                                      <h4 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                                        Label Color
                                      </h4>
                                      <div className="flex gap-2">
                                        {(Object.keys(scheduleColors) as ScheduleColorKey[]).map((colorKey) => (
                                          <button
                                            type="button"
                                            key={colorKey}
                                            onMouseDown={(e) => {
                                              e.stopPropagation();
                                              setDraggedCardId(null);
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              setDraggedCardId(null);
                                              if (onUpdateColor) {
                                                onUpdateColor(scheduledCard.id, colorKey);
                                              }
                                            }}
                                            className={cn(
                                              "w-6 h-6 rounded-full transition-all",
                                              scheduleColors[colorKey].dot,
                                              scheduledCard.scheduledColor === colorKey
                                                ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                                                : "hover:scale-110",
                                              !scheduledCard.scheduledColor && colorKey === 'indigo' && "ring-2 ring-offset-2 ring-gray-400 scale-110"
                                            )}
                                            title={colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        );})}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Help text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Drag content onto a date to schedule
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ExpandedScheduleView;
