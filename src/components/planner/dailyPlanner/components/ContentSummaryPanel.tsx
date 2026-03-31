import { useState, useEffect, useRef } from "react";
import { X, Pencil, Check, Video, Image as ImageIcon, Calendar, Clock, FileText, Type } from "lucide-react";
import { SiInstagram, SiTiktok, SiYoutube, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import { ProductionCard, KanbanColumn } from "@/pages/production/types";
import { StorageKeys, getString, setString } from "@/lib/storage";
import { EVENTS, emit } from "@/lib/events";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const getPlatformIcon = (platform: string, size: string = "w-3.5 h-3.5"): React.ReactNode => {
  const p = platform.toLowerCase();
  if (p.includes("youtube")) return <SiYoutube className={size} />;
  if (p.includes("tiktok") || p === "tt") return <SiTiktok className={size} />;
  if (p.includes("instagram") || p === "ig") return <SiInstagram className={size} />;
  if (p.includes("facebook")) return <SiFacebook className={size} />;
  if (p.includes("linkedin")) return <SiLinkedin className={size} />;
  if (p.includes("twitter") || p.includes("x.com")) return <RiTwitterXLine className={size} />;
  if (p.includes("threads")) return <RiThreadsLine className={size} />;
  return null;
};

const ALL_PLATFORMS = ["Instagram", "TikTok", "YouTube", "Facebook", "LinkedIn", "X / Twitter", "Threads"];

const to12h = (time24: string): string => {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
};

interface ContentSummaryPanelProps {
  content: ProductionCard;
  onClose: () => void;
}

export const ContentSummaryPanel = ({ content, onClose }: ContentSummaryPanelProps) => {
  const [editingCaption, setEditingCaption] = useState(false);
  const [editingPlatforms, setEditingPlatforms] = useState(false);
  const [captionValue, setCaptionValue] = useState(content.caption || "");
  const [platformsValue, setPlatformsValue] = useState<string[]>(content.platforms || []);
  const captionRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCaptionValue(content.caption || "");
    setPlatformsValue(content.platforms || []);
    setEditingCaption(false);
    setEditingPlatforms(false);
  }, [content.id]);

  useEffect(() => {
    if (editingCaption && captionRef.current) {
      captionRef.current.focus();
    }
  }, [editingCaption]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const saveField = (field: "caption" | "platforms", value: string | string[]) => {
    const savedData = getString(StorageKeys.productionKanban);
    if (!savedData) return;
    try {
      const columns: KanbanColumn[] = JSON.parse(savedData);
      for (const col of columns) {
        const card = col.cards.find((c) => c.id === content.id);
        if (card) {
          if (field === "caption") card.caption = value as string;
          if (field === "platforms") card.platforms = value as string[];
          break;
        }
      }
      setString(StorageKeys.productionKanban, JSON.stringify(columns));
      emit(window, EVENTS.productionKanbanUpdated);
    } catch (err) {
      console.error("Error saving field:", err);
    }
  };

  const handleSaveCaption = () => {
    saveField("caption", captionValue);
    setEditingCaption(false);
  };

  const handleTogglePlatform = (platform: string) => {
    const updated = platformsValue.includes(platform)
      ? platformsValue.filter((p) => p !== platform)
      : [...platformsValue, platform];
    setPlatformsValue(updated);
    saveField("platforms", updated);
  };

  const isScheduled = !!content.scheduledDate;
  const isVideo = content.contentType !== "image";
  const title = content.hook || content.title || "Untitled";
  const formats = content.formats || [];
  const hasScript = !!content.script;

  return (
    <div
      ref={panelRef}
      className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3"
        style={{
          background: isScheduled
            ? "linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)"
            : "linear-gradient(135deg, #8B7082 0%, #6B5060 100%)",
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              {isVideo ? (
                <Video className="w-3 h-3 text-white/70" />
              ) : (
                <ImageIcon className="w-3 h-3 text-white/70" />
              )}
              <span className="text-[10px] font-medium text-white/60 uppercase tracking-wider">
                {isScheduled ? "Scheduled" : "Ready to Post"}
              </span>
            </div>
            <h3 className="text-white font-semibold text-[15px] leading-snug line-clamp-2">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center flex-shrink-0 mt-0.5"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>

        {/* Date & time pills */}
        {isScheduled && content.scheduledDate && (
          <div className="flex items-center gap-2 mt-2.5">
            <div className="flex items-center gap-1 bg-white/15 rounded-full px-2.5 py-0.5">
              <Calendar className="w-2.5 h-2.5 text-white/80" />
              <span className="text-[10px] text-white/90 font-medium">
                {format(new Date(content.scheduledDate + "T12:00:00"), "EEE, MMM d")}
              </span>
            </div>
            {content.scheduledStartTime && (
              <div className="flex items-center gap-1 bg-white/15 rounded-full px-2.5 py-0.5">
                <Clock className="w-2.5 h-2.5 text-white/80" />
                <span className="text-[10px] text-white/90 font-medium">
                  {to12h(content.scheduledStartTime)}
                  {content.scheduledEndTime ? ` – ${to12h(content.scheduledEndTime)}` : ""}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {/* Format */}
        {formats.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Format</p>
            <div className="flex flex-wrap gap-1">
              {formats.map((f) => (
                <span
                  key={f}
                  className="text-[11px] font-medium text-[#612a4f] bg-[#612a4f]/8 px-2 py-0.5 rounded-full"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Platforms — editable */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Platforms</p>
            <button
              onClick={() => setEditingPlatforms(!editingPlatforms)}
              className="w-5 h-5 rounded-md hover:bg-gray-100 flex items-center justify-center"
            >
              {editingPlatforms ? (
                <Check className="w-3 h-3 text-[#612a4f]" />
              ) : (
                <Pencil className="w-3 h-3 text-gray-400" />
              )}
            </button>
          </div>
          {editingPlatforms ? (
            <div className="flex flex-wrap gap-1.5">
              {ALL_PLATFORMS.map((p) => {
                const isSelected = platformsValue.some(
                  (pv) => pv.toLowerCase() === p.toLowerCase()
                );
                return (
                  <button
                    key={p}
                    onClick={() => handleTogglePlatform(p)}
                    className={cn(
                      "flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full border transition-colors",
                      isSelected
                        ? "border-[#612a4f]/30 bg-[#612a4f]/10 text-[#612a4f]"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    )}
                  >
                    {getPlatformIcon(p, "w-3 h-3")}
                    <span>{p}</span>
                  </button>
                );
              })}
            </div>
          ) : platformsValue.length > 0 ? (
            <div className="flex items-center gap-1.5">
              {platformsValue.map((p) => (
                <span key={p} className="text-[#612a4f]/70">
                  {getPlatformIcon(p, "w-4 h-4")}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-gray-300 italic">No platforms set</p>
          )}
        </div>

        {/* Caption — editable */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Caption</p>
            <button
              onClick={() => {
                if (editingCaption) handleSaveCaption();
                else setEditingCaption(true);
              }}
              className="w-5 h-5 rounded-md hover:bg-gray-100 flex items-center justify-center"
            >
              {editingCaption ? (
                <Check className="w-3 h-3 text-[#612a4f]" />
              ) : (
                <Pencil className="w-3 h-3 text-gray-400" />
              )}
            </button>
          </div>
          {editingCaption ? (
            <textarea
              ref={captionRef}
              value={captionValue}
              onChange={(e) => setCaptionValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveCaption();
                }
              }}
              placeholder="Add a caption..."
              className="w-full text-[12px] text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-[#8B7082] focus:ring-1 focus:ring-[#8B7082]/20"
              rows={3}
            />
          ) : captionValue ? (
            <p className="text-[12px] text-gray-600 leading-relaxed line-clamp-3">{captionValue}</p>
          ) : (
            <p className="text-[12px] text-gray-300 italic">No caption yet</p>
          )}
        </div>

        {/* Script preview (read-only) */}
        {hasScript && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Script</p>
            <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">{content.script}</p>
          </div>
        )}
      </div>
    </div>
  );
};
