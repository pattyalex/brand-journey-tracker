/**
 * ScheduleTimeline - The left panel "Your Week" / upcoming content view for embedded mode.
 * Shows monthly stats, upcoming scheduled/planned content, and a CTA to Content Hub.
 */
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CalendarDays, Check, X, Lightbulb, Clock, ArrowRight, TrendingUp, Sparkles, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductionCard } from "../../types";
import { UseScheduleStateReturn, defaultScheduledColor } from "../../hooks/useScheduleState";

interface ScheduleTimelineProps {
  state: UseScheduleStateReturn;
}

const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({ state }) => {
  const {
    navigate,
    today,
    currentMonth, monthNames,
    monthlyStats, upcomingContent,
    markedAsPostedIds,
    handleMarkAsPosted,
    handleArchiveContent,
    handleDeleteClick,
    handleRemovePlannedContent,
    onUnschedule,
  } = state;

  return (
    <div className="space-y-5">
      {/* Monthly Stats */}
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4 border border-violet-100/50">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-violet-500" />
          <h3 className="text-sm font-semibold text-gray-800">
            {monthNames[currentMonth]} Overview
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{monthlyStats.posted}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Posted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{monthlyStats.scheduled}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Scheduled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-violet-600">{monthlyStats.planned}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Planned</div>
          </div>
        </div>
      </div>

      {/* This Week Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-800">Coming Up</h3>
        </div>

        {upcomingContent.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
            <CalendarDays className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">No content scheduled this week</p>
            <p className="text-xs text-gray-400 mt-1">Time to plan ahead!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingContent.map(({ date, scheduled, planned }) => {
              const isToday = date.toDateString() === today.toDateString();
              const isPastDate = date < today;
              const dayLabel = isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

              return (
                <div key={date.toISOString()} className="bg-white rounded-lg border border-gray-100 p-3 hover:border-violet-200 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("text-xs font-medium", isToday ? "text-violet-600" : isPastDate ? "text-gray-400" : "text-gray-600")}>
                      {dayLabel}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {scheduled.length + planned.length} item{scheduled.length + planned.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {scheduled.map(card => (
                      <div
                        key={card.id}
                        data-card-id={card.id}
                        className={cn("text-xs px-2 py-1.5 rounded-md truncate group/sidecard", isPastDate && "opacity-70")}
                        style={{
                          backgroundColor: isPastDate ? '#e5e7eb' : defaultScheduledColor.bg,
                          color: isPastDate ? '#6b7280' : defaultScheduledColor.text
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          {!isPastDate && (() => {
                            const isMarkedPosted = markedAsPostedIds.has(card.id);
                            return (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleMarkAsPosted(card.id); }}
                                className={cn(
                                  "w-3 h-3 rounded-full border-[1.5px] flex-shrink-0 flex items-center justify-center transition-colors",
                                  isMarkedPosted ? "bg-white border-white" : "border-current hover:bg-current/20"
                                )}
                              >
                                {isMarkedPosted && <Check className="w-2 h-2 text-[#612A4F]" />}
                              </button>
                            );
                          })()}
                          {(() => {
                            const isMarkedPosted = markedAsPostedIds.has(card.id);
                            return (
                              <div className={cn("flex-1 min-w-0 cursor-default", isMarkedPosted && "line-through opacity-60")}>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="truncate">{card.hook || card.title}</div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="bg-white text-gray-900 border border-gray-200 shadow-xl max-w-xs">{card.hook || card.title}</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                {card.scheduledStartTime && (
                                  <div className="text-[8px] opacity-60 whitespace-nowrap">{card.scheduledStartTime}{card.scheduledEndTime && ` - ${card.scheduledEndTime}`}</div>
                                )}
                              </div>
                            );
                          })()}
                          {isPastDate && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleArchiveContent(card.id, e); }}
                                    className="opacity-0 group-hover/sidecard:opacity-100 hover:bg-gray-300/50 rounded p-0.5 transition-opacity flex-shrink-0"
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
                                    if (isPastDate) handleDeleteClick(card.id, e);
                                    else if (onUnschedule) onUnschedule(card.id);
                                  }}
                                  className="opacity-0 group-hover/sidecard:opacity-100 hover:bg-white/20 rounded p-0.5 transition-opacity flex-shrink-0"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top">{isPastDate ? "Remove from calendar" : "Unschedule content"}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    ))}
                    {planned.map(card => (
                      <div key={card.id} className="text-xs px-2 py-1.5 rounded-md bg-[#F5F2F4] border border-dashed border-[#D4C9CF] text-[#8B7082] group/sideplan">
                        <div className="flex items-start gap-1.5">
                          <Lightbulb className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#8B7082]" />
                          <div className="flex-1 min-w-0">
                            <div className="truncate">{card.hook || card.title}</div>
                            {card.plannedStartTime && (
                              <div className="text-[8px] opacity-75 whitespace-nowrap">{card.plannedStartTime}{card.plannedEndTime && ` - ${card.plannedEndTime}`}</div>
                            )}
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleRemovePlannedContent(card.id); }}
                                  className="opacity-0 group-hover/sideplan:opacity-100 hover:bg-[#8B7082]/10 rounded p-0.5 transition-opacity flex-shrink-0"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Remove from calendar</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA to Content Hub */}
      <div className="pt-2">
        <button
          onClick={() => navigate('/production')}
          className="w-full group relative overflow-hidden bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl p-4 text-left transition-all hover:shadow-lg hover:shadow-indigo-200/50"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm">Ready to create?</h4>
                <p className="text-xs text-indigo-100 mt-0.5">Head to Content Hub to develop your ideas</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
};

export default ScheduleTimeline;
