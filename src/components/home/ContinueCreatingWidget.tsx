import React from "react";
import { useNavigate } from "react-router-dom";
import { Clapperboard, ArrowRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { ContinueCreatingCard } from "./types";

interface ContinueCreatingWidgetProps {
  continueCreatingCards: ContinueCreatingCard[];
  dismissedPlaceholders: Record<string, boolean>;
  dismissPlaceholder: (key: string, e: React.MouseEvent) => void;
}

const ContinueCreatingWidget: React.FC<ContinueCreatingWidgetProps> = ({
  continueCreatingCards,
  dismissedPlaceholders,
  dismissPlaceholder,
}) => {
  const navigate = useNavigate();

  return (
    <section className="bg-white/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-[#e0d5db]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Clapperboard className="w-5 h-5 text-[#612a4f]" />
          <h3
            className="text-base text-[#2d2a26]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Continue Creating
          </h3>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate('/production')}
                className="text-[#8B7082] hover:text-[#612a4f] hover:bg-[#612a4f]/10 p-1 rounded transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white border-black">
              <p>Go to Content Hub</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Content Cards */}
      <div className="space-y-2">
        {continueCreatingCards.length > 0 ? (
          continueCreatingCards.map((card) => {
            const stageBadgeColors: Record<string, string> = {
              'Edit': '#6b4a5e',
              'Film': '#8b6a7e',
              'Script': '#a8899a',
              'Bank of Ideas': 'rgba(184, 169, 170, 0.6)',
            };

            return (
              <div
                key={card.id}
                onClick={() => navigate('/production')}
                className="py-3 cursor-pointer border-b border-[#8B7082]/10 last:border-b-0 transition-all"
              >
                {/* Title */}
                <p
                  className="text-sm font-semibold text-[#2d2a26] mb-1.5 line-clamp-2"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {card.title}
                </p>

                {/* Stage Badge */}
                <span
                  className="inline-block text-[10px] font-semibold text-white px-2 py-0.5 rounded mb-1"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    backgroundColor: stageBadgeColors[card.stage],
                  }}
                >
                  {card.stage}
                </span>
                {/* Last Updated */}
                <span
                  className="block text-[10px] text-[#8b7a85]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {formatDistanceToNow(card.lastUpdated, { addSuffix: false })} ago
                </span>
              </div>
            );
          })
        ) : (
          (() => {
            const rows = [
              { label: 'Script', title: 'Your next video idea goes here' },
              { label: 'Film', title: 'Add content you\'re working on' },
            ].filter((_, i) => !dismissedPlaceholders[`cc-${i}`]);
            return rows.length === 0 ? (
              <div className="py-6 flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(97,42,79,0.07)' }}>
                  <Clapperboard className="w-4 h-4 text-[#612a4f]" />
                </div>
                <p className="text-xs text-[#8b7a85] text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>No content in progress yet</p>
                <button onClick={() => navigate('/production')} className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#612a4f] border border-[#612a4f]/30 hover:bg-[#612a4f] hover:text-white transition-all" style={{ fontFamily: "'DM Sans', sans-serif" }}>Start creating</button>
              </div>
            ) : (
              <div className="py-2 flex flex-col gap-2">
                {rows.map((item, i) => {
                  const origIdx = [{ label: 'Script', title: 'Your next video idea goes here' }, { label: 'Film', title: 'Add content you\'re working on' }].findIndex(r => r.title === item.title);
                  return (
                    <div key={i} className="group flex items-start justify-between py-3 border-b border-[#8B7082]/10 last:border-b-0 opacity-40 hover:opacity-70 transition-opacity">
                      <div className="cursor-pointer flex-1" onClick={() => navigate('/production')}>
                        <p className="text-sm font-semibold text-[#2d2a26] mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>{item.title}</p>
                        <span className="inline-block text-[10px] font-semibold text-white px-2 py-0.5 rounded" style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#8b6a7e' }}>{item.label}</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={(e) => dismissPlaceholder(`cc-${origIdx}`, e)} className="opacity-0 group-hover:opacity-100 mt-0.5 ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-300 transition-all flex-shrink-0">
                              <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-700 text-white border-gray-700"><p>Remove</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  );
                })}
                <button onClick={() => navigate('/production')} className="mt-1 text-xs font-semibold text-[#612a4f] hover:text-[#4a3442] transition-colors text-left" style={{ fontFamily: "'DM Sans', sans-serif" }}>+ Start your first piece of content</button>
              </div>
            );
          })()
        )}
      </div>
    </section>
  );
};

export default ContinueCreatingWidget;
