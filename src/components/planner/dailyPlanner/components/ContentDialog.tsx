import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import {
  X,
  Lightbulb,
  Video,
  FileText,
  MapPin,
  Shirt,
  Package,
  Calendar,
  Palette,
  Check,
  ExternalLink,
  CalendarCheck,
  Camera,
  Image
} from "lucide-react";
import { SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiLinkedin, SiPinterest } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { ProductionCard, KanbanColumn } from "@/pages/production/types";
import { StorageKeys, getString, setString } from "@/lib/storage";
import { EVENTS, emit } from "@/lib/events";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ProductionCard | null;
  type: 'scheduled' | 'planned';
  onSave?: () => void;
}

// Platform display names and icons
const platformLabels: Record<string, string> = {
  'instagram-reels': 'Instagram Reels',
  'instagram-stories': 'Instagram Stories',
  'instagram-post': 'Instagram Post',
  'tiktok': 'TikTok',
  'youtube-shorts': 'YouTube Shorts',
  'youtube': 'YouTube',
  'facebook': 'Facebook',
  'twitter': 'Twitter/X',
  'linkedin': 'LinkedIn',
  'pinterest': 'Pinterest',
};

const colorOptions = [
  { name: 'violet', bg: '#ede9fe', border: '#8b5cf6' },
  { name: 'indigo', bg: '#e0e7ff', border: '#6366f1' },
  { name: 'rose', bg: '#ffe4e6', border: '#f43f5e' },
  { name: 'amber', bg: '#fef3c7', border: '#f59e0b' },
  { name: 'emerald', bg: '#d1fae5', border: '#10b981' },
  { name: 'sky', bg: '#e0f2fe', border: '#0ea5e9' },
  { name: 'orange', bg: '#ffedd5', border: '#f97316' },
  { name: 'cyan', bg: '#cffafe', border: '#06b6d4' },
];

// Platform icon helper
const getPlatformIcon = (platform: string): React.ReactNode => {
  const lowercased = platform.toLowerCase();
  const iconClass = "w-5 h-5 text-gray-600";

  if (lowercased.includes("youtube")) {
    return <SiYoutube className={iconClass} />;
  }
  if (lowercased.includes("tiktok") || lowercased === "tt") {
    return <SiTiktok className={iconClass} />;
  }
  if (lowercased.includes("instagram") || lowercased === "ig") {
    return <SiInstagram className={iconClass} />;
  }
  if (lowercased.includes("facebook")) {
    return <SiFacebook className={iconClass} />;
  }
  if (lowercased.includes("linkedin")) {
    return <SiLinkedin className={iconClass} />;
  }
  if (lowercased.includes("twitter") || lowercased.includes("x")) {
    return <FaXTwitter className={iconClass} />;
  }
  if (lowercased.includes("pinterest")) {
    return <SiPinterest className={iconClass} />;
  }
  return null;
};

// Format icon helper
const getFormatIcon = (format: string): React.ReactNode => {
  const lowercased = format.toLowerCase();

  if (lowercased.includes("video") || lowercased.includes("reel") || lowercased.includes("short")) {
    return <Video className="w-4 h-4 text-indigo-500" />;
  }
  if (lowercased.includes("photo") || lowercased.includes("image") || lowercased.includes("post") || lowercased.includes("carousel")) {
    return <Image className="w-4 h-4 text-indigo-500" />;
  }
  return <Camera className="w-4 h-4 text-indigo-500" />;
};

export const ContentDialog = ({
  open,
  onOpenChange,
  content,
  type,
  onSave
}: ContentDialogProps) => {
  const navigate = useNavigate();
  const [editHook, setEditHook] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editColor, setEditColor] = useState("violet");

  // Sync form state when content changes
  useEffect(() => {
    if (content && type === 'planned') {
      setEditHook(content.hook || content.title || "");
      setEditDescription(content.description || "");
      setEditColor(content.plannedColor || "violet");
    }
  }, [content, type]);

  if (!open || !content) return null;

  const handleSavePlannedContent = () => {
    const savedData = getString(StorageKeys.productionKanban);
    if (savedData) {
      try {
        const columns: KanbanColumn[] = JSON.parse(savedData);
        const ideateColumn = columns.find(c => c.id === 'ideate');
        if (ideateColumn) {
          const card = ideateColumn.cards.find(c => c.id === content.id);
          if (card) {
            card.hook = editHook;
            card.title = editHook;
            card.description = editDescription;
            card.plannedColor = editColor as any;
            setString(StorageKeys.productionKanban, JSON.stringify(columns));
            emit(window, EVENTS.productionKanbanUpdated);
            emit(window, EVENTS.scheduledContentUpdated);
            onSave?.();
            toast.success('Content updated');
            onOpenChange(false);
          }
        }
      } catch (err) {
        console.error('Error saving planned content:', err);
        toast.error('Failed to save changes');
      }
    }
  };

  const handleGoToContentHub = () => {
    onOpenChange(false);
    navigate('/production');
  };

  // Scheduled content - read only view
  if (type === 'scheduled') {
    return (
      <div className="fixed inset-0 z-[300]">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => onOpenChange(false)}
        />

        {/* Dialog */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-indigo-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Scheduled Content</h2>
                  {content.scheduledDate && (
                    <>
                      <p className="text-sm text-gray-500">
                        {format(new Date(content.scheduledDate + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}
                      </p>
                      {/* Progress lines - first 5 colored for scheduled content */}
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5, 6].map((step) => (
                          <div
                            key={step}
                            className={`h-1 w-6 rounded-full ${
                              step <= 5 ? 'bg-indigo-500' : 'bg-indigo-200'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 hover:bg-white/80 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Hook */}
              <div>
                <label className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Hook</label>
                <p className="mt-1 text-gray-900 font-medium">
                  {content.hook || content.title || 'No hook specified'}
                </p>
              </div>

              {/* Script */}
              {content.script && (
                <div>
                  <label className="text-xs font-medium text-indigo-600 uppercase tracking-wide flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Script
                  </label>
                  <div className="mt-2 p-4 bg-indigo-50/50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto border border-indigo-100">
                    {content.script}
                  </div>
                </div>
              )}

              {/* Platforms */}
              {content.platforms && content.platforms.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Platforms</label>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {content.platforms.map((platform) => (
                      <div key={platform}>
                        {getPlatformIcon(platform)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formats */}
              {content.formats && content.formats.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Formats</label>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {content.formats.map((format) => (
                      <div
                        key={format}
                        className="flex items-center gap-2"
                      >
                        {getFormatIcon(format)}
                        <span className="text-sm text-gray-700">{format}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-indigo-100 bg-indigo-50/50 flex justify-end">
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Planned content - editable view
  return (
    <div className="fixed inset-0 z-[300]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit Content Idea</h2>
                {content.plannedDate && (
                  <p className="text-sm text-gray-500">
                    Planned for {format(new Date(content.plannedDate + 'T12:00:00'), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-white/80 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Hook/Title */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hook / Title</label>
              <input
                type="text"
                value={editHook}
                onChange={(e) => setEditHook(e.target.value)}
                placeholder="Enter your hook..."
                className="mt-2 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add notes about this idea..."
                rows={3}
                className="mt-2 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Color */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Palette className="w-3 h-3" />
                Color
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setEditColor(color.name)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      editColor === color.name ? "ring-2 ring-offset-2 ring-violet-400 scale-110" : "hover:scale-105"
                    )}
                    style={{ backgroundColor: color.bg, border: `2px solid ${color.border}` }}
                  >
                    {editColor === color.name && (
                      <Check className="w-4 h-4 mx-auto" style={{ color: color.border }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Go to Content Hub */}
            <button
              onClick={handleGoToContentHub}
              className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100 hover:border-violet-200 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Video className="w-4 h-4 text-violet-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Develop this idea in Content Hub</span>
              </div>
              <ExternalLink className="w-4 h-4 text-violet-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePlannedContent}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
