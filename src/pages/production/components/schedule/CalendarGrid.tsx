/**
 * CalendarGrid - Renders the calendar month grid with day cells, scheduled/planned content indicators,
 * drag-and-drop support, and popover forms for adding/editing content.
 *
 * This is the right panel of the ExpandedScheduleView.
 */
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CalendarDays, ChevronLeft, ChevronRight, Video, Camera, Check, X, Lightbulb, Send, Plus, Sparkles, Archive, Trash2 } from "lucide-react";
import { SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { CardContent } from "@/components/ui/card";
import { ProductionCard } from "../../types";
import { UseScheduleStateReturn, parseTimeToMinutes, scheduleColors, defaultScheduledColor, isStaticFormat, ScheduleColorKey } from "../../hooks/useScheduleState";

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
          <h3 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">Hook</h3>
          <p className="text-[15px] font-medium text-gray-900">{cardToShow.hook || cardToShow.title}</p>
        </div>
      )}
      {cardToShow.script && (
        <div>
          <h3 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">Script</h3>
          <div className="text-[14px] text-gray-700 whitespace-pre-wrap leading-relaxed">{cardToShow.script}</div>
        </div>
      )}
      {hasFormats && (
        <div>
          <h3 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">How It's Shot</h3>
          <div className="space-y-1">
            {allFormats.map((format, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[14px] text-gray-700">
                {isStaticFormat(format) ? <Camera className="w-4 h-4 text-gray-400" /> : <Video className="w-4 h-4 text-gray-400" />}
                <span>{format}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {hasPlatforms && (
        <div>
          <h3 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">Platform</h3>
          <div className="flex items-center gap-2.5">
            {cardToShow.platforms!.map((platform, idx) => (
              <span key={idx} className="text-gray-700" title={platform}>{getPlatformIcon(platform)}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface CalendarGridProps {
  state: UseScheduleStateReturn;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ state }) => {
  const {
    embedded, singleCard, planningMode, planningCard, onPlanDate,
    calendarScrollRef, todayRef,
    displayedMonth, displayedYear,
    draggedCardId, setDraggedCardId,
    draggedPlannedCardId, setDraggedPlannedCardId,
    dragOverDate, setDragOverDate,
    popoverCardId, setPopoverCardId,
    addIdeaPopoverDate, setAddIdeaPopoverDate,
    newIdeaHook, setNewIdeaHook,
    newIdeaNotes, setNewIdeaNotes,
    newIdeaColor, setNewIdeaColor,
    editingScheduledHook, setEditingScheduledHook,
    editingScheduledNotes, setEditingScheduledNotes,
    editingScheduledColor, setEditingScheduledColor,
    isLeftPanelCollapsed,
    today, calendarDays, daysOfWeek, monthNames,
    scheduledCardsByDate, plannedCardsByDate,
    markedAsPostedIds,
    goToPreviousMonth, goToNextMonth,
    handleDragOver, handleDragLeave, handleDrop,
    handleRemovePlannedContent,
    handleArchiveContent, handleDeleteClick,
    handleMarkAsPosted,
    handleUpdateScheduledCard,
    handleSendScheduledToScriptIdeas,
    handleSaveToCalendar, handleSendToScriptIdeas,
    onSchedule, onUnschedule, onUpdateColor,
    onOpenContentFlow,
    headerComponent,
  } = state;

  return (
    <div
      ref={calendarScrollRef}
      className={cn(
        "flex flex-col h-full overflow-y-auto relative",
        singleCard && isLeftPanelCollapsed && "pl-9"
      )}
    >
      {/* Expand button when collapsed */}
      {singleCard && isLeftPanelCollapsed && (
        <button
          onClick={() => state.setIsLeftPanelCollapsed(false)}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-30 p-1.5 bg-white/80 hover:bg-white shadow-md rounded-lg border border-gray-200 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-[#612A4F]" strokeWidth={2.5} />
        </button>
      )}

      {/* Floating Calendar Controls */}
      {(!embedded || (embedded && singleCard)) && (
        <div className="sticky -top-1 z-20 flex items-center justify-between px-4 pt-1 pb-1">
          <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-xl shadow-md">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#8B7082]" />
              <span className="text-sm font-bold text-gray-900">Content Calendar</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={goToPreviousMonth} className="p-1 hover:bg-gray-100 rounded transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
                {monthNames[displayedMonth]} {displayedYear}
              </span>
              <button onClick={goToNextMonth} className="p-1 hover:bg-gray-100 rounded transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* External header component */}
      {embedded && headerComponent && (
        <div className="flex-shrink-0 px-6 bg-white">{headerComponent}</div>
      )}

      {/* Calendar Grid */}
      <CardContent className="pl-6 pr-4 pt-0 flex flex-col">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="pb-4">
          <div className="grid grid-cols-7 gap-1.5" style={{ gridAutoRows: 'minmax(120px, 1fr)' }}>
            {calendarDays.map((day, idx) => {
              const dateStr = day.date.toISOString().split('T')[0];
              const isDragOver = dragOverDate === dateStr;
              const scheduledForDay = scheduledCardsByDate[dateStr] || [];
              const plannedForDay = plannedCardsByDate[dateStr] || [];
              const hasContent = scheduledForDay.length > 0 || plannedForDay.length > 0;

              return (
                <Popover
                  key={idx}
                  open={embedded && addIdeaPopoverDate === dateStr}
                  onOpenChange={(open) => {
                    if (embedded) {
                      setAddIdeaPopoverDate(open ? dateStr : null);
                      if (!open) {
                        setNewIdeaHook("");
                        setNewIdeaNotes("");
                        setNewIdeaColor("indigo");
                      }
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <div
                      ref={day.isToday ? todayRef : undefined}
                      data-calendar-date={dateStr}
                      onDragOver={(e) => handleDragOver(e, dateStr)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day.date)}
                      onClick={(e) => {
                        if (planningMode && planningCard && onPlanDate) {
                          e.stopPropagation();
                          onPlanDate(planningCard.id, day.date);
                          return;
                        }
                        if (embedded && e.target === e.currentTarget) {
                          setAddIdeaPopoverDate(dateStr);
                        }
                      }}
                      className={cn(
                        "group transition-colors",
                        isLeftPanelCollapsed ? "rounded-lg border min-h-[120px] relative p-2" : "rounded-lg border min-h-[120px] relative p-1.5",
                        day.date < today && !day.isToday
                          ? "bg-gray-50 border-gray-100 text-gray-400"
                          : !day.isCurrentMonth
                            ? "bg-white border-gray-200 text-[#999999]"
                            : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50/70",
                        day.isToday && "bg-[#8B7082]/5 border-[#8B7082]/30",
                        isDragOver && "bg-indigo-100 border-indigo-400 border-2 scale-105",
                        (embedded || planningMode) && "cursor-pointer",
                        planningMode && "hover:bg-violet-50 hover:border-violet-300",
                        day.monthLabel && "mt-6"
                      )}
                    >
                      {/* Month label */}
                      {day.monthLabel && (
                        <span className="absolute -top-5 left-0 text-xs font-semibold text-[#8B7082]">{day.monthLabel}</span>
                      )}
                      <span className={cn(
                        "absolute top-1.5 left-2 text-[11px] font-medium",
                        !day.isCurrentMonth && day.date >= today && "text-[#999999]",
                        !day.isCurrentMonth && day.date < today && "text-[#CCCCCC]",
                        day.isToday && "bg-[#612a4f] text-white w-5 h-5 rounded-full flex items-center justify-center -top-0.5 left-1 text-[10px]"
                      )}>
                        {day.date.getDate()}
                      </span>

                      {/* Add button for embedded mode */}
                      {embedded && day.isCurrentMonth && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddIdeaPopoverDate(dateStr);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100"
                          style={{ opacity: addIdeaPopoverDate === dateStr ? 1 : undefined }}
                        >
                          <Plus className="w-3 h-3 text-indigo-600" />
                        </button>
                      )}

                      {/* Content indicators */}
                      {hasContent && (() => {
                        const allContentItems = [
                          ...scheduledForDay.map(card => ({ card, type: 'scheduled' as const, sortTime: parseTimeToMinutes(card.scheduledStartTime) })),
                          ...plannedForDay.map(card => ({ card, type: 'planned' as const, sortTime: parseTimeToMinutes(card.plannedStartTime) }))
                        ].sort((a, b) => a.sortTime - b.sortTime);

                        return (
                          <div className="absolute top-7 left-1 right-1 bottom-1 flex flex-col gap-1 overflow-y-auto">
                            {allContentItems.map(({ card: itemCard, type }) => {
                              if (type === 'scheduled') {
                                const scheduledCard = itemCard;
                                const isPublished = day.date < today;
                                return (
                                  <Popover
                                    key={scheduledCard.id}
                                    open={popoverCardId === scheduledCard.id}
                                    onOpenChange={(open) => {
                                      if (open) {
                                        setEditingScheduledHook(scheduledCard.hook || scheduledCard.title || "");
                                        setEditingScheduledNotes(scheduledCard.description || "");
                                        setEditingScheduledColor(scheduledCard.scheduledColor || "indigo");
                                      }
                                      setPopoverCardId(open ? scheduledCard.id : null);
                                    }}
                                  >
                                    <PopoverTrigger asChild>
                                      <div
                                        data-card-id={scheduledCard.id}
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
                                          state.setDragOverUnschedule(false);
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (!scheduledCard.fromCalendar && onOpenContentFlow) {
                                            onOpenContentFlow(scheduledCard);
                                          } else {
                                            setPopoverCardId(popoverCardId === scheduledCard.id ? null : scheduledCard.id);
                                          }
                                        }}
                                        className={cn(
                                          "text-[11px] px-2 py-1.5 rounded-md cursor-grab active:cursor-grabbing transition-colors group/schedcard",
                                          isPublished && "bg-gray-100 text-gray-500",
                                          draggedCardId === scheduledCard.id && "opacity-50"
                                        )}
                                        style={!isPublished ? {
                                          backgroundColor: defaultScheduledColor.bg,
                                          color: defaultScheduledColor.text
                                        } : undefined}
                                      >
                                        <div className="flex items-start gap-1.5">
                                          {(() => {
                                            const isMarkedPosted = markedAsPostedIds.has(scheduledCard.id);
                                            return (
                                              <>
                                                <TooltipProvider>
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <button
                                                        onClick={(e) => { e.stopPropagation(); handleMarkAsPosted(scheduledCard.id); }}
                                                        className={cn(
                                                          "w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors",
                                                          isMarkedPosted ? "bg-white border-white" : "border-current hover:bg-white/30"
                                                        )}
                                                      >
                                                        {isMarkedPosted && <Check className="w-2.5 h-2.5 text-[#612A4F]" />}
                                                      </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">{isMarkedPosted ? "Marked as posted" : "Mark as posted"}</TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                                <div className={cn("flex-1 min-w-0 cursor-default", isMarkedPosted && "line-through opacity-60")}>
                                                  <TooltipProvider>
                                                    <Tooltip>
                                                      <TooltipTrigger asChild>
                                                        <div className="leading-tight truncate">{scheduledCard.hook || scheduledCard.title || "Scheduled"}</div>
                                                      </TooltipTrigger>
                                                      <TooltipContent side="bottom" className="bg-white text-gray-900 border border-gray-200 shadow-xl max-w-xs">{scheduledCard.hook || scheduledCard.title || "Scheduled"}</TooltipContent>
                                                    </Tooltip>
                                                  </TooltipProvider>
                                                  {scheduledCard.scheduledStartTime && (
                                                    <div className="text-[8px] opacity-60 whitespace-nowrap">{scheduledCard.scheduledStartTime}{scheduledCard.scheduledEndTime && ` - ${scheduledCard.scheduledEndTime}`}</div>
                                                  )}
                                                </div>
                                              </>
                                            );
                                          })()}
                                          {isPublished && (
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); handleArchiveContent(scheduledCard.id, e); }}
                                                    className="opacity-0 group-hover/schedcard:opacity-100 hover:bg-white/30 rounded p-0.5 transition-opacity flex-shrink-0"
                                                  >
                                                    <Archive className="w-3 h-3" />
                                                  </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">Save a copy to archive</TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          )}
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isPublished) {
                                                      handleDeleteClick(scheduledCard.id, e);
                                                    } else if (onUnschedule) {
                                                      onUnschedule(scheduledCard.id);
                                                      if (singleCard && scheduledCard.id === singleCard.id) {
                                                        state.setSingleCardScheduled(false);
                                                        state.setScheduledDate(null);
                                                        state.setShowCelebration(false);
                                                      }
                                                    }
                                                  }}
                                                  className="opacity-0 group-hover/schedcard:opacity-100 hover:bg-white/20 rounded p-0.5 transition-opacity flex-shrink-0"
                                                >
                                                  <X className="w-3 h-3" />
                                                </button>
                                              </TooltipTrigger>
                                              <TooltipContent side="top">{isPublished ? "Remove from calendar" : "Unschedule content"}</TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </div>
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
                                      <div className="bg-white rounded-lg" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 border-b border-indigo-100">
                                          <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center">
                                              {scheduledCard.fromCalendar ? <Lightbulb className="w-3.5 h-3.5 text-indigo-500" /> : <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />}
                                            </div>
                                            <div className="flex flex-col">
                                              <span className="text-sm font-semibold text-indigo-900">{scheduledCard.fromCalendar ? "Add Quick Idea" : "Content Overview"}</span>
                                              {scheduledCard.fromCalendar && <span className="text-[10px] text-indigo-500">Develop in Content Hub later</span>}
                                            </div>
                                          </div>
                                          <button onClick={(e) => { e.stopPropagation(); setPopoverCardId(null); }} className="p-1 hover:bg-indigo-100 rounded transition-colors">
                                            <X className="w-4 h-4 text-indigo-400" />
                                          </button>
                                        </div>
                                        <div className="p-4" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                                          {scheduledCard.fromCalendar ? (
                                            <div className="space-y-4">
                                              <div>
                                                <label className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5 block">Hook</label>
                                                <input type="text" value={editingScheduledHook} onChange={(e) => setEditingScheduledHook(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="What's the hook?" />
                                              </div>
                                              <div>
                                                <label className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5 block">Notes</label>
                                                <textarea value={editingScheduledNotes} onChange={(e) => setEditingScheduledNotes(e.target.value)} placeholder="Any additional notes..." rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" />
                                              </div>
                                              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100 shadow-sm">
                                                <h4 className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>Choose a color
                                                </h4>
                                                <div className="grid grid-cols-5 gap-2.5">
                                                  {(Object.keys(scheduleColors) as ScheduleColorKey[]).map((colorKey) => {
                                                    const isSelected = editingScheduledColor === colorKey;
                                                    return (
                                                      <button
                                                        type="button" key={colorKey}
                                                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setEditingScheduledColor(colorKey); onUpdateColor?.(scheduledCard.id, colorKey); }}
                                                        className={cn("w-10 h-10 rounded-xl transition-all duration-200 flex items-center justify-center shadow-sm border-2", isSelected ? "scale-105 shadow-md border-white ring-2 ring-offset-1" : "border-transparent hover:scale-110 hover:shadow-md")}
                                                        style={{ backgroundColor: scheduleColors[colorKey].bg, ...(isSelected && { ringColor: scheduleColors[colorKey].text }) }}
                                                        title={colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
                                                      >
                                                        {isSelected && <Check className="w-4 h-4" style={{ color: scheduleColors[colorKey].text }} />}
                                                      </button>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                              <div className="pt-3 border-t border-gray-100 space-y-2">
                                                <button
                                                  onClick={(e) => { e.stopPropagation(); handleUpdateScheduledCard(scheduledCard.id, editingScheduledHook, editingScheduledNotes); setPopoverCardId(null); }}
                                                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                                                >
                                                  <Check className="w-4 h-4" />Save
                                                </button>
                                                <button
                                                  onClick={(e) => { e.stopPropagation(); handleSendScheduledToScriptIdeas(scheduledCard); }}
                                                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all"
                                                >
                                                  <Send className="w-3.5 h-3.5" />Develop Idea in Content Hub
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <div>
                                              {renderContentDetails(scheduledCard)}
                                              {onOpenContentFlow && (
                                                <button
                                                  onClick={(e) => { e.stopPropagation(); setPopoverCardId(null); onOpenContentFlow(scheduledCard); }}
                                                  className="mt-4 w-full py-2 px-3 bg-[#8B7082] hover:bg-[#7A6272] text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                                >
                                                  <Sparkles className="w-4 h-4" />Edit in Content Flow
                                                </button>
                                              )}
                                              <div className="mt-4 pt-4 border-t border-gray-100">
                                                <h4 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-2">Label Color</h4>
                                                <div className="flex gap-2">
                                                  {(Object.keys(scheduleColors) as ScheduleColorKey[]).map((colorKey) => (
                                                    <button
                                                      type="button" key={colorKey}
                                                      onClick={(e) => { e.stopPropagation(); setEditingScheduledColor(colorKey); onUpdateColor?.(scheduledCard.id, colorKey); }}
                                                      className={cn("w-6 h-6 rounded-full transition-all", scheduleColors[colorKey].dot, editingScheduledColor === colorKey ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-110")}
                                                      title={colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
                                                    />
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                );
                              } else {
                                const plannedCard = itemCard;
                                return (
                                  <div
                                    key={`planned-${plannedCard.id}`}
                                    draggable
                                    onDragStart={(e) => { e.stopPropagation(); setDraggedPlannedCardId(plannedCard.id); setPopoverCardId(null); e.dataTransfer.effectAllowed = 'move'; }}
                                    onDragEnd={() => { setDraggedPlannedCardId(null); setDragOverDate(null); }}
                                    className={cn(
                                      "text-[11px] px-2 py-1.5 rounded-md transition-colors cursor-grab active:cursor-grabbing group/plancard",
                                      "bg-[#F5F2F4] border border-dashed border-[#D4C9CF] text-[#8B7082]",
                                      draggedPlannedCardId === plannedCard.id && "opacity-50"
                                    )}
                                  >
                                    <div className="flex items-start gap-1.5">
                                      <Lightbulb className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#8B7082]" />
                                      <div className="flex-1 min-w-0 cursor-default opacity-80">
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div className="leading-tight truncate">{plannedCard.hook || plannedCard.title || "Planned idea"}</div>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom" className="bg-white text-gray-900 border border-gray-200 shadow-xl max-w-xs">{plannedCard.hook || plannedCard.title || "Planned idea"}</TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                        {plannedCard.plannedStartTime && (
                                          <div className="text-[8px] opacity-75 whitespace-nowrap">{plannedCard.plannedStartTime}{plannedCard.plannedEndTime && ` - ${plannedCard.plannedEndTime}`}</div>
                                        )}
                                      </div>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button
                                              onClick={(e) => { e.stopPropagation(); handleRemovePlannedContent(plannedCard.id); }}
                                              className="opacity-0 group-hover/plancard:opacity-100 hover:bg-[#8B7082]/10 rounded p-0.5 transition-opacity flex-shrink-0"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent side="top">Remove from calendar</TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </div>
                                );
                              }
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </PopoverTrigger>

                  {/* Add Idea Popover Content */}
                  {embedded && (
                    <PopoverContent className="w-80 p-0 shadow-xl border-0" side="right" align="start" onClick={(e) => e.stopPropagation()}>
                      <div className="bg-white rounded-lg">
                        <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 border-b border-indigo-100">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center">
                              <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />
                            </div>
                            <span className="text-sm font-semibold text-indigo-900">New Content Idea</span>
                          </div>
                          <button onClick={() => { setAddIdeaPopoverDate(null); setNewIdeaHook(""); setNewIdeaNotes(""); setNewIdeaColor("indigo"); }} className="p-1 hover:bg-indigo-100 rounded transition-colors">
                            <X className="w-4 h-4 text-indigo-400" />
                          </button>
                        </div>
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5 block">Hook</label>
                            <input
                              type="text" value={newIdeaHook} onChange={(e) => setNewIdeaHook(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter' && newIdeaHook.trim()) { e.preventDefault(); handleSaveToCalendar(); } }}
                              placeholder="What's the hook for this content?" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" autoFocus
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Press Enter to save to calendar</p>
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5 block">Notes</label>
                            <textarea value={newIdeaNotes} onChange={(e) => setNewIdeaNotes(e.target.value)} placeholder="Any additional notes or ideas..." rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-2 block">Color</label>
                            <div className="flex gap-2">
                              {(Object.keys(scheduleColors) as Array<keyof typeof scheduleColors>).map((colorKey) => (
                                <button key={colorKey} type="button" onClick={() => setNewIdeaColor(colorKey)} className={cn("w-6 h-6 rounded-full transition-all", scheduleColors[colorKey].dot, newIdeaColor === colorKey ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-110")} title={colorKey.charAt(0).toUpperCase() + colorKey.slice(1)} />
                              ))}
                            </div>
                          </div>
                          <div className="border-t border-gray-100 pt-3">
                            <button
                              onClick={handleSendToScriptIdeas}
                              disabled={!newIdeaHook.trim()}
                              className={cn(
                                "w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all border",
                                newIdeaHook.trim() ? "border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300" : "border-gray-100 text-gray-300 cursor-not-allowed"
                              )}
                            >
                              <Send className="w-3 h-3" />Develop Idea in Content Hub
                            </button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  )}
                </Popover>
              );
            })}
          </div>
        </div>
      </CardContent>
    </div>
  );
};

export default CalendarGrid;
