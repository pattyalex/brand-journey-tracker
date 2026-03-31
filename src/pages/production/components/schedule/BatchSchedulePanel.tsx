/**
 * BatchSchedulePanel - Renders the unscheduled cards list in the left panel (batch scheduling mode).
 * Shows draggable cards ready to be scheduled, with content details for the selected card.
 */
import React from "react";
import { CalendarDays, Video, Camera, Pin } from "lucide-react";
import { SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { ProductionCard } from "../../types";
import { UseScheduleStateReturn, isStaticFormat } from "../../hooks/useScheduleState";

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

interface BatchSchedulePanelProps {
  state: UseScheduleStateReturn;
}

const BatchSchedulePanel: React.FC<BatchSchedulePanelProps> = ({ state }) => {
  const {
    unscheduledCards,
    selectedCard, setSelectedCard,
    draggedCardId,
    dragOverUnschedule,
    handleDragStart, handleDragEnd,
  } = state;

  return (
    <div className="space-y-2">
      {/* Yellow drop zone when dragging a scheduled card over */}
      {dragOverUnschedule ? (
        <div className="flex flex-col items-center justify-center py-12 flex-1 text-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-400 flex items-center justify-center mb-4 shadow-lg">
            <CalendarDays className="w-10 h-10 text-amber-700" />
          </div>
          <h3 className="text-lg font-bold text-amber-700 mb-2">Drop to unschedule</h3>
          <p className="text-sm text-amber-600 leading-relaxed">
            This content will move to<br />
            <span className="font-semibold">"Ready to Post"</span> column
          </p>
          <p className="text-sm text-amber-700 mt-5 font-medium">
            Reschedule via <span className="font-bold">Batch Schedule</span> or by clicking on the card
          </p>
        </div>
      ) : unscheduledCards.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">No content to schedule</p>
          <p className="text-xs mt-1 leading-relaxed px-2">
            Drag cards into the "Ready to Post" column<br />to add content here
          </p>
        </div>
      ) : (
        <>
          <h3 className="text-base font-semibold text-[#612A4F] mb-3 px-1">
            Ready to Schedule
          </h3>
          {unscheduledCards.map((c) => {
            const formats = c.formats || [];
            const platforms = c.platforms || [];
            const hasPlatforms = platforms.length > 0;

            const renderPlatformIcons = () => (
              <div className="flex gap-1.5 items-center">
                {platforms.map((platform, idx) => {
                  const icon = getPlatformIcon(platform, "w-3 h-3 text-gray-400");
                  return icon ? <span key={`platform-${idx}`} title={platform}>{icon}</span> : null;
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
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-gray-800 break-words leading-tight flex-1">
                    {c.hook || c.title || "Untitled content"}
                  </h3>
                  {c.isPinned && <Pin className="w-3 h-3 text-amber-500 flex-shrink-0 fill-amber-500" />}
                </div>

                {(formats.length > 0 || hasPlatforms) && (
                  <div className="flex flex-col gap-1 mt-2">
                    {formats.map((format, idx) => {
                      const isStatic = isStaticFormat(format);
                      const isLastRow = idx === formats.length - 1;

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

                    {formats.length === 0 && hasPlatforms && (
                      <div className="flex items-center justify-end">{renderPlatformIcons()}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Drag hint */}
      {unscheduledCards.length > 0 && !selectedCard && (
        <p className="text-center text-xs text-gray-400 mt-4 italic">
          Drag to calendar to schedule
        </p>
      )}

      {/* Selected Card Details */}
      {selectedCard && (
        <div className="mt-4 pt-4 border-t border-indigo-200">
          <div className="mb-4">
            <h4 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">Hook</h4>
            <p className="text-base font-medium text-gray-900">{selectedCard.hook || selectedCard.title || "No hook"}</p>
          </div>

          {selectedCard.script && (
            <div className="mb-4">
              <h4 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">Script</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedCard.script}</p>
            </div>
          )}

          {selectedCard.formats && selectedCard.formats.length > 0 && (
            <div className="mb-4">
              <h4 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">How It's Shot</h4>
              <div className="space-y-1">
                {selectedCard.formats.map((format, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    {isStaticFormat(format) ? <Camera className="w-4 h-4 text-gray-400" /> : <Video className="w-4 h-4 text-gray-400" />}
                    <span>{format}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedCard.platforms && selectedCard.platforms.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">Platform</h4>
              <div className="flex items-center gap-2.5">
                {selectedCard.platforms.map((platform, idx) => (
                  <span key={idx} className="text-gray-700" title={platform}>{getPlatformIcon(platform, "w-5 h-5")}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchSchedulePanel;
