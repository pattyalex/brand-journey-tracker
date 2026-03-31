import React from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Video, Camera, Check, X, GripVertical, Lightbulb, Clock, Sparkles, Archive, Trash2, AlertCircle } from "lucide-react";
import { SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import { cn } from "@/lib/utils";
import ContentFlowProgress from "./ContentFlowProgress";
import { EVENTS, emit } from "@/lib/events";
import { useScheduleState, isStaticFormat, parseTimeToMinutes, ExpandedScheduleViewProps } from "../hooks/useScheduleState";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CalendarGrid from "./schedule/CalendarGrid";
import ScheduleTimeline from "./schedule/ScheduleTimeline";
import BatchSchedulePanel from "./schedule/BatchSchedulePanel";

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

const ExpandedScheduleView: React.FC<ExpandedScheduleViewProps> = (props) => {
  const state = useScheduleState(props);

  const {
    embedded, singleCard, onClose, planningMode, planningCard, onPlanDate,
    onNavigateToStep, onMoveToScheduleColumn, completedSteps,
    calendarScrollRef, todayRef,
    draggedCardId, dragOverUnschedule, setDragOverUnschedule,
    popoverCardId, setPopoverCardId,
    singleCardScheduled, setSingleCardScheduled,
    scheduledDate, setScheduledDate,
    showCelebration, setShowCelebration,
    isLeftPanelCollapsed, setIsLeftPanelCollapsed,
    cards, today, unscheduledCards,
    scheduledCardsByDate, plannedCardsByDate,
    currentMonth, currentYear, monthNames, daysOfWeek,
    calendarDays,
    planningSize,
    pendingPlanDate, setPendingPlanDate,
    isDraggingPlanCard, setIsDraggingPlanCard,
    planDragOverDate, setPlanDragOverDate,
    timePickerOpen, setTimePickerOpen,
    pendingScheduleDate, setPendingScheduleDate,
    pendingScheduleCardId, setPendingScheduleCardId,
    startTime, endTime, setEndTime,
    timePeriod, setTimePeriod,
    showIncompleteWarning, setShowIncompleteWarning,
    incompleteWarningMissingSteps,
    deleteConfirmCard, setDeleteConfirmCard,
    handleResizeStart, handleResizeStartTopRight,
    goToPreviousMonth, goToNextMonth,
    handleDragStart, handleDragEnd,
    handleConfirmSchedule, handleStartTimeChange,
    handleArchiveAndRemove, handleDeletePermanently,
    onSchedule, onUnschedule,
    navigate,
  } = state;

  // Content component - shared between modal and embedded modes
  const content = (
    <div className="flex flex-col h-full overflow-hidden relative">

      {/* Expand button when collapsed - hidden in single card mode */}

      {/* Collapsed single card mode - card on left, stepper in middle */}
      {!planningMode && singleCard && isLeftPanelCollapsed && !singleCardScheduled && (
        <div className="flex items-center gap-4 pl-8 pr-4 pt-12 pb-3 border-b border-gray-100 flex-shrink-0">
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, singleCard.id)}
            onDragEnd={handleDragEnd}
            className={cn(
              "px-4 py-2 rounded-xl bg-white border border-[#8B7082]/20 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md flex items-center gap-3 flex-shrink-0",
              draggedCardId === singleCard.id && "opacity-40"
            )}
          >
            <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900 truncate">{singleCard.hook || singleCard.title || "Untitled content"}</span>
            <span className="text-xs text-[#8B7082] flex-shrink-0">Drag to schedule</span>
          </div>
          <div className="flex-1 flex justify-center">
            <ContentFlowProgress
              currentStep={singleCard?.contentType === 'image' ? 4 : 6}
              contentType={singleCard?.contentType || 'video'}
              onStepClick={onNavigateToStep ? (step) => { if (step !== (singleCard?.contentType === 'image' ? 4 : 6)) onNavigateToStep(step); } : undefined}
              className="w-[400px]"
              completedSteps={completedSteps}
              onToggleComplete={props.onToggleComplete}
            />
          </div>
        </div>
      )}

      {/* Collapsed single card mode AFTER scheduling */}
      {!planningMode && singleCard && isLeftPanelCollapsed && singleCardScheduled && (
        <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 flex-shrink-0"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">You're all set!</span>
              <span className="text-xs text-gray-600">
                Scheduled for {scheduledDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </motion.div>
          <div className="flex-1 flex justify-center">
            <ContentFlowProgress currentStep={singleCard?.contentType === 'image' ? 4 : 6} contentType={singleCard?.contentType || 'video'} onStepClick={onNavigateToStep ? (step) => { if (step !== (singleCard?.contentType === 'image' ? 4 : 6)) onNavigateToStep(step); } : undefined} className="w-[400px]" completedSteps={completedSteps} onToggleComplete={props.onToggleComplete} />
          </div>
          {onClose && (
            <button onClick={onClose} className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-[#8B7082] to-[#612A4F] hover:from-[#7A6073] hover:to-[#4E2240] text-white rounded-lg shadow-[0_2px_8px_rgba(97,42,79,0.3)] transition-all flex-shrink-0">Done</button>
          )}
        </div>
      )}

      {/* Main content - split panels */}
      <div className={cn(
        "flex-1 overflow-hidden grid transition-all duration-300 min-h-0",
        singleCard && isLeftPanelCollapsed ? "grid-cols-[1fr]" : isLeftPanelCollapsed ? "grid-cols-[48px_1fr]" : "grid-cols-[300px_1fr]"
      )} style={{ gridTemplateRows: '1fr' }}>
        {/* Top spacing for batch view */}
        {!planningMode && !singleCard && <div className="col-span-2 flex-shrink-0 pt-12 pb-2" />}

        {/* Step Progress Indicator */}
        {!planningMode && singleCard && !isLeftPanelCollapsed && (
          <div className="col-span-2 flex-shrink-0 pt-3 pb-2 flex items-center justify-between px-4">
            <div className="w-[160px]" />
            <ContentFlowProgress currentStep={singleCard?.contentType === 'image' ? 4 : 6} contentType={singleCard?.contentType || 'video'} onStepClick={onNavigateToStep ? (step) => { if (step !== (singleCard?.contentType === 'image' ? 4 : 6)) onNavigateToStep(step); } : undefined} completedSteps={completedSteps} onToggleComplete={props.onToggleComplete} />
            <div className="w-[160px]" />
            {onNavigateToStep && (
              <button onClick={() => onNavigateToStep(singleCard?.contentType === 'image' ? 3 : 5)} className="absolute top-3 left-3 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10" aria-label="Previous step">
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Left Panel */}
        {!(singleCard && isLeftPanelCollapsed) && (
          <div
            className={cn(
              "border-r flex flex-col min-h-0 transition-all duration-300 relative",
              embedded && !singleCard && !dragOverUnschedule ? "border-violet-100 bg-violet-50/40" : "border-transparent",
              dragOverUnschedule && "bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 rounded-2xl m-2"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (draggedCardId) {
                const draggedCard = cards.find(c => c.id === draggedCardId) || (singleCard?.id === draggedCardId ? singleCard : null);
                if (draggedCard?.schedulingStatus === 'scheduled') setDragOverUnschedule(true);
              }
            }}
            onDragLeave={() => setDragOverUnschedule(false)}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedCardId && onUnschedule) {
                const draggedCard = cards.find(c => c.id === draggedCardId) || (singleCard?.id === draggedCardId ? singleCard : null);
                if (draggedCard?.schedulingStatus === 'scheduled') {
                  onUnschedule(draggedCardId);
                  if (singleCard && draggedCardId === singleCard.id) {
                    setSingleCardScheduled(false);
                    setScheduledDate(null);
                    setShowCelebration(false);
                  }
                }
              }
              state.setDraggedCardId(null);
              setDragOverUnschedule(false);
            }}
          >
            {/* Collapse/Expand Button - hidden when single card is collapsed */}
            {!(singleCard && isLeftPanelCollapsed) && (
              <button
                onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                className="absolute left-full ml-1 top-1/2 -translate-y-1/2 z-30 p-1.5 bg-white/80 hover:bg-white shadow-md rounded-lg border border-gray-200 transition-colors"
              >
                <ChevronLeft className={cn("w-5 h-5 text-[#612A4F] transition-transform duration-300", isLeftPanelCollapsed && "rotate-180")} strokeWidth={2.5} />
              </button>
            )}

            {/* Header for embedded mode */}
            {embedded && !singleCard && (
              <div className={cn("flex items-center gap-3 px-6 py-4 border-b flex-shrink-0 transition-all duration-300", "border-violet-100", isLeftPanelCollapsed && "px-2 justify-center")}>
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                </div>
                {!isLeftPanelCollapsed && <h2 className="text-lg font-bold text-gray-900">Your Week</h2>}
              </div>
            )}

            {/* Body */}
            <div className={cn("flex-1 min-h-0 overflow-y-auto transition-all duration-300", isLeftPanelCollapsed ? "p-0 opacity-0 overflow-hidden" : "px-2 -mt-2 pb-4 opacity-100")}>
              {embedded && !singleCard ? (
                <ScheduleTimeline state={state} />
              ) : singleCard ? (
                renderSingleCardLeftPanel()
              ) : (
                <BatchSchedulePanel state={state} />
              )}
            </div>
          </div>
        )}

        {/* Right Panel - Calendar */}
        <CalendarGrid state={state} />
      </div>
    </div>
  );

  // Single card left panel content
  function renderSingleCardLeftPanel() {
    if (!singleCard) return null;

    if (singleCardScheduled && showCelebration) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-8 px-4">
          {dragOverUnschedule ? renderUnscheduleDropZone() : (
            <>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mb-4 shadow-lg">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </motion.div>
              <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl font-bold text-gray-900 mb-2">You're all set!</motion.h3>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-sm text-[#8B7082] text-center">
                Scheduled for{" "}
                <span className="font-semibold">{scheduledDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              </motion.p>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} onClick={onClose} className="mt-6 px-6 py-2.5 bg-gradient-to-r from-[#612A4F] to-[#8B7082] text-white text-sm font-medium rounded-xl hover:shadow-lg transition-shadow">
                Done
              </motion.button>
            </>
          )}
        </div>
      );
    }

    if (singleCardScheduled && !showCelebration) {
      return (
        <div className="flex flex-col items-center justify-center h-full pb-8 px-4">
          {dragOverUnschedule ? renderUnscheduleDropZone() : (
            <div className="text-center px-4">
              <p className="text-sm font-semibold text-gray-700 mb-4 line-clamp-2">{singleCard.hook || singleCard.title || "Untitled content"}</p>
              <div className="w-12 h-12 rounded-full bg-[#8B7082]/10 flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-6 h-6 text-[#8B7082]" />
              </div>
              <p className="text-sm text-[#8B7082] whitespace-nowrap">
                Scheduled for{" "}
                <span className="font-semibold text-[#612A4F]">{scheduledDate?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </p>
              <p className="text-xs text-gray-400 mt-3">Drag to a different date to reschedule</p>
            </div>
          )}
        </div>
      );
    }

    if (dragOverUnschedule) return renderUnscheduleDropZone();

    // Card to schedule
    return (
      <div className="space-y-4 pt-32">
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, singleCard.id)}
          onDragEnd={handleDragEnd}
          className={cn(
            "p-5 rounded-2xl bg-white border-2 border-[#8B7082]/30 shadow-lg cursor-grab active:cursor-grabbing transition-all hover:shadow-xl hover:border-[#8B7082]/50 ml-4",
            draggedCardId === singleCard.id && "opacity-40 scale-[0.98]"
          )}
        >
          <div className="flex items-center gap-3">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 cursor-grab active:cursor-grabbing" />
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={6}>
                  <p>Drag to a date to schedule</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex-1">
              <h4 className="text-base font-bold text-gray-900 mb-3">{singleCard.hook || singleCard.title || "Untitled content"}</h4>
              {singleCard.script && (
                <div className="mb-3">
                  <p className="text-[11px] font-semibold text-[#8B7082] uppercase tracking-wider mb-1">Script</p>
                  <p className="text-sm text-gray-600 line-clamp-3">{singleCard.script}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                {singleCard.formats && singleCard.formats.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {isStaticFormat(singleCard.formats[0]) ? <Camera className="w-4 h-4 text-[#8B7082]" /> : <Video className="w-4 h-4 text-[#8B7082]" />}
                    <span className="text-xs text-gray-600">{singleCard.formats[0]}</span>
                  </div>
                )}
                {singleCard.platforms && singleCard.platforms.length > 0 && (
                  <div className="flex items-center gap-2">
                    {singleCard.platforms.map((platform, idx) => (
                      <span key={idx} className="text-[#8B7082]">{getPlatformIcon(platform, "w-4 h-4")}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-[#8B7082] text-center italic">
          <CalendarDays className="w-4 h-4 inline-block align-middle mr-1" />
          Drag to a date on the calendar<br />to schedule
        </p>
        <div className="!mt-32 text-center space-y-4">
          {onMoveToScheduleColumn && (
            <div>
              <button onClick={() => onMoveToScheduleColumn(singleCard)} className="px-4 py-2 text-sm font-medium bg-[#612A4F] hover:bg-[#4A1F3D] text-white rounded-lg transition-colors whitespace-nowrap">
                Save & Schedule Later
              </button>
            </div>
          )}
          <button onClick={() => { if (onClose) onClose(); emit(window, EVENTS.OPEN_BATCH_SCHEDULE); }} className="text-sm text-[#8B7082] underline hover:text-[#612A4F] transition-colors">
            Batch Schedule
          </button>
        </div>
      </div>
    );
  }

  function renderUnscheduleDropZone() {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-400 flex items-center justify-center mb-4 shadow-lg">
          <CalendarDays className="w-10 h-10 text-amber-700" />
        </motion.div>
        <h3 className="text-lg font-bold text-amber-700 mb-2">Drop to unschedule</h3>
        <p className="text-sm text-amber-600 leading-relaxed">This content will move to<br /><span className="font-semibold">"Ready to Post"</span> column</p>
        <p className="text-xs text-amber-500 mt-2">Find it in Batch Schedule or its own dialog</p>
      </div>
    );
  }

  // Time Picker Modal (shared between embedded and modal modes)
  const timePickerModal = timePickerOpen && (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30" onClick={() => { setTimePickerOpen(false); setPendingScheduleDate(null); setPendingScheduleCardId(null); }}>
      <div className="bg-white rounded-2xl shadow-[0_20px_70px_-15px_rgba(139,112,130,0.3)] p-5 w-[320px]" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#EDE8F2] to-[#E0D6E6] flex items-center justify-center mx-auto mb-3">
            <Clock className="w-5 h-5 text-[#8B7082]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Schedule Content</h3>
          <p className="text-sm text-[#8B7082] font-medium mt-0.5">{pendingScheduleDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        </div>
        <div className="bg-[#F9F7FA] rounded-xl p-4 mb-4">
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <input type="text" value={startTime} onChange={(e) => handleStartTimeChange(e.target.value)} placeholder="9:00" className="w-[72px] h-11 bg-white border-0 rounded-xl shadow-sm text-center text-base font-medium text-gray-800 focus:ring-2 focus:ring-[#8B7082]/30 outline-none" autoFocus />
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">Start</p>
            </div>
            <div className="w-4 h-[2px] bg-[#D4CCD2] rounded-full mt-[-16px]" />
            <div className="text-center">
              <input type="text" value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="10:00" className="w-[72px] h-11 bg-white border-0 rounded-xl shadow-sm text-center text-base font-medium text-gray-800 focus:ring-2 focus:ring-[#8B7082]/30 outline-none" />
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">End</p>
            </div>
            <div className="flex flex-col gap-1 ml-1">
              <button onClick={() => setTimePeriod("AM")} className={cn("w-11 h-5 rounded-md text-[10px] font-semibold transition-all", timePeriod === "AM" ? "bg-[#8B7082] text-white shadow-sm" : "bg-white text-gray-400 hover:text-gray-600 shadow-sm")}>AM</button>
              <button onClick={() => setTimePeriod("PM")} className={cn("w-11 h-5 rounded-md text-[10px] font-semibold transition-all", timePeriod === "PM" ? "bg-[#8B7082] text-white shadow-sm" : "bg-white text-gray-400 hover:text-gray-600 shadow-sm")}>PM</button>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setTimePickerOpen(false); setPendingScheduleDate(null); setPendingScheduleCardId(null); }} className="flex-1 h-10 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
          <button onClick={handleConfirmSchedule} className="flex-1 h-10 text-sm font-medium text-white bg-[#8B7082] hover:bg-[#7A6272] rounded-xl transition-all shadow-md hover:shadow-lg">Schedule</button>
        </div>
      </div>
    </div>
  );

  // Incomplete Content Warning Modal (shared)
  const incompleteWarningModal = showIncompleteWarning && (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30" onClick={() => { setShowIncompleteWarning(false); setPendingScheduleDate(null); setPendingScheduleCardId(null); }}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[340px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-amber-500" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">Content is incomplete</h3>
        <div className="text-center text-sm text-gray-600 mb-4">
          <p className="mb-2">This content is missing:</p>
          <ul className="list-disc list-inside text-amber-600 font-medium">
            {incompleteWarningMissingSteps.map((step, idx) => <li key={idx}>{step}</li>)}
          </ul>
          <p className="mt-3 text-gray-500 text-xs">You can complete these steps later by clicking on the scheduled content.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowIncompleteWarning(false); setPendingScheduleDate(null); setPendingScheduleCardId(null); }} className="flex-1 h-10 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
          <button onClick={() => { setShowIncompleteWarning(false); setTimePickerOpen(true); }} className="flex-1 h-10 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors">Schedule anyway</button>
        </div>
      </div>
    </div>
  );

  // Delete Confirmation Dialog
  const deleteDialog = (
    <Dialog open={!!deleteConfirmCard} onOpenChange={(open) => !open && setDeleteConfirmCard(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">Remove from Calendar</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">What would you like to do with this content?</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <button onClick={handleArchiveAndRemove} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[#F5F2F4] hover:bg-[#EBE6E9] border border-[#D4C9CF] transition-all text-left group">
            <div className="w-10 h-10 rounded-lg bg-[#8B7082] flex items-center justify-center flex-shrink-0"><Archive className="w-5 h-5 text-white" /></div>
            <div className="flex-1"><p className="font-medium text-gray-900">Archive & Remove</p><p className="text-xs text-gray-500">Save a copy to archive, then remove from calendar</p></div>
            <span className="text-[10px] font-medium text-[#8B7082] bg-[#8B7082]/10 px-2 py-0.5 rounded-full">Recommended</span>
          </button>
          <button onClick={handleDeletePermanently} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 transition-all text-left group">
            <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0"><Trash2 className="w-5 h-5 text-white" /></div>
            <div className="flex-1"><p className="font-medium text-red-700">Delete Permanently</p><p className="text-xs text-red-500">Remove without saving - cannot be undone</p></div>
          </button>
          <button onClick={() => setDeleteConfirmCard(null)} className="w-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all mt-1">Cancel</button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Planning mode content
  const planningContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 bg-violet-50 border-b border-violet-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center"><CalendarDays className="w-4 h-4 text-violet-600" /></div>
          <div>
            <h3 className="font-semibold text-violet-900">Plan this idea</h3>
            <p className="text-xs text-violet-600 truncate max-w-[300px]">{planningCard?.title || planningCard?.hook || "Select a date"}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={() => { setPendingPlanDate(null); onClose(); }} className="p-1.5 hover:bg-violet-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-violet-500" />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <button onClick={goToPreviousMonth} className="p-1 hover:bg-gray-100 rounded transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
        <span className="text-sm font-medium text-gray-700">{monthNames[currentMonth]} {currentYear}</span>
        <button onClick={goToNextMonth} className="p-1 hover:bg-gray-100 rounded transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <div className="grid grid-cols-7 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-[10px] font-medium text-gray-400 uppercase tracking-wider py-1">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            const dateStr = day.date.toISOString().split('T')[0];
            const scheduledForDay = scheduledCardsByDate[dateStr] || [];
            const plannedForDay = plannedCardsByDate[dateStr] || [];
            const pendingDateStr = pendingPlanDate?.toISOString().split('T')[0];
            const isPendingDate = pendingDateStr === dateStr;
            const isDragOver = planDragOverDate === dateStr;
            const hasContent = scheduledForDay.length > 0 || plannedForDay.length > 0 || isPendingDate;

            return (
              <div
                key={idx}
                onClick={() => { if (planningCard && day.isCurrentMonth) setPendingPlanDate(day.date); }}
                onDragOver={(e) => { if (isDraggingPlanCard && day.isCurrentMonth) { e.preventDefault(); setPlanDragOverDate(dateStr); } }}
                onDragLeave={() => setPlanDragOverDate(null)}
                onDrop={(e) => { e.preventDefault(); if (isDraggingPlanCard && day.isCurrentMonth) { setPendingPlanDate(day.date); setPlanDragOverDate(null); setIsDraggingPlanCard(false); } }}
                className={cn(
                  "min-h-[70px] rounded-lg border p-1.5 transition-all",
                  day.date < today && !day.isToday ? "bg-gray-50 border-gray-100 text-gray-400"
                    : day.isCurrentMonth ? "bg-white border-gray-200 text-gray-900 cursor-pointer hover:bg-gray-50/70"
                    : "bg-white border-gray-200 text-[#999999] cursor-pointer hover:bg-gray-50/70",
                  day.isToday && "bg-[#8B7082]/5 border-[#8B7082]/30",
                  isPendingDate && "bg-violet-50/70",
                  isDragOver && (day.isCurrentMonth || day.date >= today) && "bg-violet-100"
                )}
              >
                <span className={cn("text-xs font-medium inline-flex items-center justify-center", !day.isCurrentMonth && day.date >= today && "text-[#999999]", !day.isCurrentMonth && day.date < today && "text-[#CCCCCC]", day.isToday && "bg-[#612a4f] text-white w-5 h-5 rounded-full")}>
                  {day.date.getDate()}
                </span>
                {hasContent && (
                  <div className="mt-1 space-y-0.5">
                    {isPendingDate && planningCard && (
                      <div
                        draggable
                        onDragStart={(e) => { setIsDraggingPlanCard(true); e.dataTransfer.effectAllowed = 'move'; }}
                        onDragEnd={() => { setIsDraggingPlanCard(false); setPlanDragOverDate(null); }}
                        className={cn("text-[9px] px-1 py-0.5 rounded border border-dashed border-violet-300 bg-violet-50 text-violet-600 truncate cursor-grab active:cursor-grabbing", isDraggingPlanCard && "opacity-50")}
                      >
                        {planningCard.hook || planningCard.title}
                      </div>
                    )}
                    {(() => {
                      const allItems = [
                        ...scheduledForDay.map(card => ({ card, type: 'scheduled' as const })),
                        ...plannedForDay.filter(c => c.id !== planningCard?.id).map(card => ({ card, type: 'planned' as const }))
                      ].sort((a, b) => {
                        const timeA = a.type === 'scheduled' ? a.card.scheduledStartTime : a.card.plannedStartTime;
                        const timeB = b.type === 'scheduled' ? b.card.scheduledStartTime : b.card.plannedStartTime;
                        return parseTimeToMinutes(timeA) - parseTimeToMinutes(timeB);
                      });
                      const limit = isPendingDate ? 1 : 2;
                      return (
                        <>
                          {allItems.slice(0, limit).map(({ card, type }) => (
                            <div key={card.id} className={type === 'scheduled' ? "text-[9px] px-1 py-0.5 rounded bg-indigo-100 text-indigo-700" : "text-[9px] px-1 py-0.5 rounded border border-dashed border-[#D4C9CF] bg-[#F5F2F4] text-[#8B7082]"}>
                              <div className="truncate">{card.hook || card.title}</div>
                              {type === 'scheduled' && card.scheduledStartTime && <div className="text-[8px] opacity-70">{card.scheduledStartTime}</div>}
                              {type === 'planned' && card.plannedStartTime && <div className="text-[8px] opacity-70">{card.plannedStartTime}</div>}
                            </div>
                          ))}
                          {allItems.length > limit && <div className="text-[8px] text-gray-400 px-1">+{allItems.length - limit} more</div>}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t">
        {pendingPlanDate ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-violet-600 font-medium">{pendingPlanDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPendingPlanDate(null)} className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => { if (planningCard && onPlanDate && pendingPlanDate) { onPlanDate(planningCard.id, pendingPlanDate); setPendingPlanDate(null); } }} className="px-3 py-1.5 text-xs bg-violet-600 text-white hover:bg-violet-700 rounded-lg transition-colors font-medium">Save</button>
            </div>
          </div>
        ) : <p className="text-xs text-gray-500 text-center">Click a date to plan your idea</p>}
      </div>
    </div>
  );

  // Render based on mode
  if (planningMode) {
    return (
      <div className="bg-white flex flex-col overflow-hidden rounded-lg relative" style={{ width: planningSize.width, height: planningSize.height }}>
        {planningContent}
        <div onMouseDown={handleResizeStartTopRight} className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize group" title="Drag to resize">
          <svg className="w-4 h-4 text-gray-300 group-hover:text-violet-400 transition-colors rotate-90" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22ZM18 14H16V12H18V14ZM14 18H12V16H14V18ZM10 22H8V20H10V22Z" />
          </svg>
        </div>
        <div onMouseDown={handleResizeStart} className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize group" title="Drag to resize">
          <svg className="w-4 h-4 text-gray-300 group-hover:text-violet-400 transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22ZM18 14H16V12H18V14ZM14 18H12V16H14V18ZM10 22H8V20H10V22Z" />
          </svg>
        </div>
      </div>
    );
  }

  if (embedded) {
    return (
      <>
        <div
          className={cn("flex flex-col h-full flex-1 overflow-hidden", !singleCard && "bg-white")}
          onClick={() => { if (popoverCardId) setPopoverCardId(null); }}
        >
          {content}
        </div>
        {incompleteWarningModal}
        {timePickerModal}
      </>
    );
  }

  // Modal mode
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
        <div
          className="bg-gradient-to-br from-[#E5E8F4] via-white to-[#E5E8F4] rounded-2xl shadow-2xl flex flex-col w-[1200px] max-w-[95vw] h-[calc(100vh-3rem)] max-h-[920px] overflow-hidden"
          onClick={(e) => { e.stopPropagation(); if (popoverCardId) setPopoverCardId(null); }}
        >
          {content}
        </div>
      </div>
      {incompleteWarningModal}
      {timePickerModal}
      {deleteDialog}
    </>
  );
};

export default ExpandedScheduleView;
