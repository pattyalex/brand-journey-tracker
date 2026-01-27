import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Archive, RefreshCw, Search, Video, Camera, Calendar, PartyPopper, Undo2, Trash2, AlertTriangle, ArrowLeft } from "lucide-react";
import ContentFlowProgress from "./ContentFlowProgress";
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
  onRestore: (card: ProductionCard) => void;
  onDelete: (card: ProductionCard) => void;
  onNavigateToStep?: (step: number) => void;
  embedded?: boolean;
}

const ArchiveDialog: React.FC<ArchiveDialogProps> = ({
  isOpen,
  onOpenChange,
  archivedCards,
  onRepurpose,
  onRestore,
  onDelete,
  onNavigateToStep,
  embedded = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<ProductionCard | null>(null);
  const [cardToDelete, setCardToDelete] = useState<ProductionCard | null>(null);

  const handleConfirmDelete = () => {
    if (cardToDelete) {
      if (selectedCard?.id === cardToDelete.id) {
        setSelectedCard(null);
      }
      onDelete(cardToDelete);
      setCardToDelete(null);
    }
  };

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

  const content = (
    <>
      {/* Step Progress Indicator - Fixed */}
      <div className="flex-shrink-0 pt-4 pb-2">
        <div className="flex items-center justify-center max-w-xl mx-auto px-4">
          <ContentFlowProgress currentStep={6} allCompleted className="flex-1" onStepClick={onNavigateToStep} />
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-hidden flex">
          {/* Left side - Header + Cards list */}
          <div className="w-1/2 overflow-y-auto flex flex-col">
            {/* Header - Scrolls with content */}
            <div className="px-6 pt-4 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#4A3542] flex items-center justify-center shadow-lg">
                    <Archive className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Published Content</h2>
                    <p className="text-sm text-[#8B7082]">
                      {archivedCards.length} {archivedCards.length === 1 ? 'post' : 'posts'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search in the archive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D8CDD4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B7082] focus:border-transparent"
                />
              </div>
            </div>

            {/* Cards list */}
            <div className="flex-1 p-4">
              {filteredCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#F5F0F4] flex items-center justify-center mb-4">
                  <Archive className="w-8 h-8 text-[#8B7082]" />
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
                        onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                        className={cn(
                          "p-3 rounded-xl border-2 cursor-pointer transition-all group",
                          selectedCard?.id === card.id
                            ? "border-[#8B7082] bg-[#FAF8F9] shadow-md"
                            : "border-gray-100 bg-white hover:border-[#D8CDD4] hover:shadow-sm"
                        )}
                      >
                        {/* Title row with action buttons */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 flex-1">
                            {card.hook || card.title || "Untitled"}
                          </h4>

                          {/* Action icons */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {/* Restore button */}
                            <div className="relative group/restore">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRestore(card);
                                }}
                                className="p-1.5 rounded-lg bg-[#F5F0F4] hover:bg-amber-100 text-[#8B7082] hover:text-amber-600 transition-colors"
                              >
                                <Undo2 className="w-3.5 h-3.5" />
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 text-white text-[10px] rounded-md opacity-0 group-hover/restore:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none z-10">
                                Reschedule
                              </div>
                            </div>

                            {/* Repurpose button */}
                            <div className="relative group/repurpose">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRepurpose(card);
                                  onOpenChange(false);
                                }}
                                className="p-1.5 rounded-lg bg-[#F5F0F4] hover:bg-[#E8F0E3] text-[#8B7082] hover:text-[#4A7A42] transition-colors"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 text-white text-[10px] rounded-md opacity-0 group-hover/repurpose:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none z-10">
                                Repurpose
                              </div>
                            </div>

                            {/* Delete button */}
                            <div className="relative group/delete">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCardToDelete(card);
                                }}
                                className="p-1.5 rounded-lg bg-[#F5F0F4] hover:bg-red-100 text-[#8B7082] hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 text-white text-[10px] rounded-md opacity-0 group-hover/delete:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none z-10">
                                Delete
                              </div>
                            </div>
                          </div>
                        </div>

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
          </div>

          {/* Detail panel */}
          <div className="w-1/2 overflow-y-auto p-6">
            {selectedCard ? (
              <div className="space-y-5">
                {/* Header with repurpose button */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {selectedCard.hook || selectedCard.title || "Untitled"}
                    </h3>
                    {(selectedCard as any).archivedAt && (
                      <p className="text-xs text-[#8B7082] flex items-center gap-1">
                        <PartyPopper className="w-3 h-3" />
                        Published {formatDate((selectedCard as any).archivedAt)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative group">
                      <button
                        onClick={() => {
                          onRestore(selectedCard);
                          setSelectedCard(null);
                          onOpenChange(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#F5F0F4] hover:bg-[#E8DFE6] text-[#6B5060] rounded-xl font-medium text-sm transition-all hover:shadow-md hover:scale-105 active:scale-95 border border-[#D8CDD4]"
                      >
                        <Undo2 className="w-4 h-4" />
                        Restore
                      </button>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none">
                        Send back to To Schedule
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                    <div className="relative group">
                      <button
                        onClick={() => {
                          onRepurpose(selectedCard);
                          onOpenChange(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#4A3542] hover:bg-[#3A2832] text-white rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Repurpose
                      </button>
                      <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none w-56 text-center leading-relaxed">
                        <span className="block font-semibold mb-1">Want to reuse this idea?</span>
                        Send a copy to Ideate and refine it for a new post
                        <div className="absolute bottom-full right-6 border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Script */}
                <div>
                  <h4 className="text-[11px] font-semibold text-[#8B7082] uppercase tracking-wider mb-2">
                    Script
                  </h4>
                  {selectedCard.script ? (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white rounded-lg p-3 border border-gray-100">
                      {selectedCard.script}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No script added</p>
                  )}
                </div>

                {/* How it's shot (Formats) */}
                <div>
                  <h4 className="text-[11px] font-semibold text-[#8B7082] uppercase tracking-wider mb-2">
                    How it's shot
                  </h4>
                  {selectedCard.formats && selectedCard.formats.length > 0 ? (
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {selectedCard.formats.map((format, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                          {isStaticFormat(format) ? <Camera className="w-4 h-4 text-gray-400" /> : <Video className="w-4 h-4 text-gray-400" />}
                          {format}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No format specified</p>
                  )}
                </div>

                {/* Platforms */}
                <div>
                  <h4 className="text-[11px] font-semibold text-[#8B7082] uppercase tracking-wider mb-2">
                    Platforms
                  </h4>
                  {selectedCard.platforms && selectedCard.platforms.length > 0 ? (
                    <div className="flex gap-3">
                      {selectedCard.platforms.map((platform, idx) => (
                        <span key={idx} className="text-gray-600" title={platform}>
                          {getPlatformIcon(platform, "w-5 h-5")}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No platforms specified</p>
                  )}
                </div>

                {/* Filming Plan */}
                <div>
                  <h4 className="text-[11px] font-semibold text-[#8B7082] uppercase tracking-wider mb-2">
                    Filming Plan
                  </h4>
                  {(selectedCard.locationText || selectedCard.outfitText || selectedCard.propsText || selectedCard.filmingNotes) ? (
                    <div className="space-y-2 text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-100">
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
                  ) : (
                    <p className="text-sm text-gray-400 italic">No filming plan added</p>
                  )}
                </div>

                {/* Notes / Brain Dump */}
                {selectedCard.notes && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-[#8B7082] uppercase tracking-wider mb-2">
                      Notes
                    </h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white rounded-lg p-3 border border-gray-100">
                      {selectedCard.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center h-full text-center pt-32">
                <div className="w-14 h-14 rounded-full bg-[#F5F0F4] flex items-center justify-center mb-3">
                  <ArrowLeft className="w-7 h-7 text-[#8B7082]" />
                </div>
                <p className="text-sm text-gray-400">
                  Click on a content card to view details
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Overlay */}
        {cardToDelete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 rounded-2xl">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this content? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setCardToDelete(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  No
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Yes, proceed
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );

  // If embedded, return just the content without Dialog wrapper
  if (embedded) {
    return <div className="flex flex-col h-full overflow-hidden">{content}</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[calc(100vh-4rem)] max-h-[700px] sm:max-w-[900px] border-0 shadow-2xl p-0 overflow-hidden flex flex-col bg-gradient-to-br from-[#E8F0E3] via-white to-[#FAFCF9]">
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveDialog;
