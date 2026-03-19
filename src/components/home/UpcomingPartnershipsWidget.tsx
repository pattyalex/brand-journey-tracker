import React from "react";
import { useNavigate } from "react-router-dom";
import { Handshake, ArrowRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { BrandDealsState } from "./types";

interface UpcomingPartnershipsWidgetProps {
  brandDealsData: BrandDealsState;
  dismissedPlaceholders: Record<string, boolean>;
  dismissPlaceholder: (key: string, e: React.MouseEvent) => void;
}

const UpcomingPartnershipsWidget: React.FC<UpcomingPartnershipsWidgetProps> = ({
  brandDealsData,
  dismissedPlaceholders,
  dismissPlaceholder,
}) => {
  const navigate = useNavigate();

  return (
    <section className="bg-white/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-[#e0d5db]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Handshake className="w-5 h-5 text-[#612a4f]" />
          <h3
            className="text-base text-[#2d2a26]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Upcoming Partnerships
          </h3>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate('/brands')}
                className="text-[#8B7082] hover:text-[#612a4f] hover:bg-[#612a4f]/10 p-1 rounded transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white border-black">
              <p>View All</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Upcoming Deadlines */}
      <div className="mb-5">
        {brandDealsData.deadlines.length === 0 ? (
          (() => {
            const allRows = [
              { brand: 'Brand deal name', action: 'Submit content by Mar 20', type: 'Instagram Reel' },
              { brand: 'Sponsorship', action: 'Publish by Mar 25', type: 'TikTok' },
            ];
            const rows = allRows.filter((_, i) => !dismissedPlaceholders[`up-${i}`]);
            return rows.length === 0 ? (
              <div className="py-4 flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(97,42,79,0.07)' }}>
                  <Handshake className="w-4 h-4 text-[#612a4f]" />
                </div>
                <p className="text-xs text-[#8b7a85] text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>No upcoming deadlines</p>
                <button onClick={() => navigate('/brands')} className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#612a4f] border border-[#612a4f]/30 hover:bg-[#612a4f] hover:text-white transition-all" style={{ fontFamily: "'DM Sans', sans-serif" }}>Add a brand deal</button>
              </div>
            ) : (
              <div className="space-y-1.5 mb-2">
                {rows.map((item) => {
                  const origIdx = allRows.findIndex(r => r.brand === item.brand);
                  return (
                    <div key={origIdx} className="group flex items-center pb-4 pt-2 border-b border-[#8B7082]/10 last:border-b-0 opacity-30 hover:opacity-50 transition-opacity">
                      <div className="flex-1 cursor-pointer" onClick={() => navigate('/brands')}>
                        <p className="text-sm font-semibold text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{item.brand}</p>
                        <p className="text-[11px] text-[#8b7a85]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{item.action}</p>
                      </div>
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded tracking-wide mr-2" style={{ fontFamily: "'DM Sans', sans-serif", color: '#8b7a85', background: 'rgba(139, 115, 130, 0.1)' }}>{item.type}</span>
                      <button onClick={(e) => dismissPlaceholder(`up-${origIdx}`, e)} className="w-4 h-4 flex items-center justify-center rounded-full text-gray-300 hover:text-gray-600 hover:bg-gray-200 transition-all opacity-50 hover:opacity-100 flex-shrink-0" title="Remove">
                        <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                  );
                })}
                <button onClick={() => navigate('/brands')} className="text-xs font-semibold text-[#612a4f] hover:text-[#4a3442] transition-colors pt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>+ Add your first brand deal</button>
              </div>
            );
          })()
        ) : (
          <div className="space-y-1.5">
            {brandDealsData.deadlines.map((deadline, index) => (
              <div
                key={`${deadline.brandName}-${index}`}
                className="flex items-center justify-between pb-4 pt-2 border-b border-[#8B7082]/10 last:border-b-0"
              >
                <div>
                  <p
                    className="text-sm font-semibold text-[#2d2a26]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {deadline.brandName}
                  </p>
                  <p
                    className="text-[11px] text-[#8b7a85]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {deadline.action} by {format(deadline.dueDate, 'MMM d')}
                  </p>
                </div>
                {deadline.contentType && (
                  <span
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded tracking-wide"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: '#8b7a85',
                      background: 'rgba(139, 115, 130, 0.1)',
                    }}
                  >
                    {deadline.contentType.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expected Payments */}
      <div
        className="rounded-lg p-3"
        style={{
          background: 'linear-gradient(145deg, rgba(122, 154, 122, 0.06) 0%, rgba(122, 154, 122, 0.1) 100%)',
          border: '1px solid rgba(122, 154, 122, 0.12)',
        }}
      >
        <p
          className="text-[10px] font-semibold uppercase mb-0.5"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#5a8a5a',
            letterSpacing: '0.08em',
          }}
        >
          Expected This Month
        </p>
        <p
          className="text-xl text-[#2d2a26]"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
        >
          ${brandDealsData.expectedPayments.toLocaleString()}
        </p>
      </div>
    </section>
  );
};

export default UpcomingPartnershipsWidget;
