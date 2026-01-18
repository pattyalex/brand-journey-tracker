import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Archive, RefreshCw, Search, X, Video, Camera, Calendar, PartyPopper } from "lucide-react";
import { SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { RiTwitterXLine, RiThreadsLine } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { ProductionCard } from "../types";
import { motion, AnimatePresence } from "framer-motion";

// Helper to get platform icon
const getPlatformIcon = (platform: string, size: string = "w-4 h-4"): React.ReactNode => {
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

interface ArchiveDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  archivedCards: ProductionCard[];
  onRepurpose: (card: ProductionCard) => void;
}

const ArchiveDialog: React.FC<ArchiveDialogProps> = ({
  isOpen,
  onOpenChange,
  archivedCards,
  onRepurpose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<ProductionCard | null>(null);

  // Filter cards based on search
  const filteredCards = archivedCards.filter(card => {
    const query = searchQuery.toLowerCase();
    return (
      card.title?.toLowerCase().includes(query) ||
      card.hook?.toLowerCase().includes(query) ||
      card.script?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[calc(100vh-4rem)] max-h-[700px] sm:max-w-[900px] border-0 shadow-2xl p-0 overflow-hidden flex flex-col bg-gradient-to-br from-emerald-50 via-white to-green-50">
        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-emerald-100 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                <Archive className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Content Archive</h2>
                <p className="text-sm text-emerald-600">
                  {archivedCards.length} {archivedCards.length === 1 ? 'post' : 'posts'} archived
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search archived content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Cards list */}
          <div className="w-1/2 border-r border-emerald-100 overflow-y-auto p-4">
            {filteredCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <Archive className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-gray-700 mb-1">
                  {searchQuery ? "No results found" : "Archive is empty"}
                </h3>
                <p className="text-sm text-gray-500 max-w-[200px]">
                  {searchQuery
                    ? "Try a different search term"
                    : "Drop published content to the archive column to store it here"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {filteredCards.map((card, index) => {
                    const formats = card.formats || [];
                    const platforms = card.platforms || [];

                    return (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedCard(card)}
                        className={cn(
                          "p-3 rounded-xl border-2 cursor-pointer transition-all",
                          selectedCard?.id === card.id
                            ? "border-emerald-500 bg-emerald-50 shadow-md"
                            : "border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm"
                        )}
                      >
                        {/* Title */}
                        <h4 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2">
                          {card.hook || card.title || "Untitled"}
                        </h4>

                        {/* Meta row */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {/* Format icon */}
                            {formats.length > 0 && (
                              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                {isStaticFormat(formats[0]) ? (
                                  <Camera className="w-3 h-3" />
                                ) : (
                                  <Video className="w-3 h-3" />
                                )}
                              </span>
                            )}
                            {/* Archived date */}
                            {(card as any).archivedAt && (
                              <span className="text-[10px] text-gray-400">
                                {formatDate((card as any).archivedAt)}
                              </span>
                            )}
                          </div>

                          {/* Platforms */}
                          {platforms.length > 0 && (
                            <div className="flex gap-1">
                              {platforms.slice(0, 3).map((platform, idx) => (
                                <span key={idx} className="text-gray-400">
                                  {getPlatformIcon(platform, "w-3 h-3")}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Detail panel */}
          <div className="w-1/2 overflow-y-auto p-6 bg-white/50">
            {selectedCard ? (
              <div className="space-y-5">
                {/* Header with repurpose button */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {selectedCard.hook || selectedCard.title || "Untitled"}
                    </h3>
                    {(selectedCard as any).archivedAt && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <PartyPopper className="w-3 h-3" />
                        Published {formatDate((selectedCard as any).archivedAt)}
                      </p>
                    )}
                  </div>
                  <div className="relative group">
                    <button
                      onClick={() => {
                        onRepurpose(selectedCard);
                        onOpenChange(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Repurpose
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none">
                      Send a copy to Script Ideas
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                    </div>
                  </div>
                </div>

                {/* Script */}
                {selectedCard.script && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider mb-2">
                      Script
                    </h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white rounded-lg p-3 border border-gray-100">
                      {selectedCard.script}
                    </p>
                  </div>
                )}

                {/* Formats */}
                {selectedCard.formats && selectedCard.formats.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider mb-2">
                      Format
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCard.formats.map((format, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                          {isStaticFormat(format) ? <Camera className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                          {format}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Platforms */}
                {selectedCard.platforms && selectedCard.platforms.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider mb-2">
                      Platforms
                    </h4>
                    <div className="flex gap-3">
                      {selectedCard.platforms.map((platform, idx) => (
                        <span key={idx} className="text-gray-600" title={platform}>
                          {getPlatformIcon(platform, "w-5 h-5")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filming Plan */}
                {(selectedCard.locationText || selectedCard.outfitText || selectedCard.propsText || selectedCard.filmingNotes) && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider mb-2">
                      Filming Plan
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      {selectedCard.locationText && (
                        <p><span className="font-medium text-gray-700">Location:</span> {selectedCard.locationText}</p>
                      )}
                      {selectedCard.outfitText && (
                        <p><span className="font-medium text-gray-700">Outfit:</span> {selectedCard.outfitText}</p>
                      )}
                      {selectedCard.propsText && (
                        <p><span className="font-medium text-gray-700">Props:</span> {selectedCard.propsText}</p>
                      )}
                      {selectedCard.filmingNotes && (
                        <p><span className="font-medium text-gray-700">Notes:</span> {selectedCard.filmingNotes}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <Archive className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-gray-600 mb-1">Select a post</h3>
                <p className="text-sm text-gray-400">
                  Click on an archived post to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveDialog;
