import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format, parseISO, isBefore, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import {
  Plus,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Archive,
  Trash2,
  Diamond,
} from "lucide-react";
import { Handshake } from "lucide-react";
import { BrandDeal, Deliverable, contentTypeConfig, statusOrder } from "./brandsTypes";

interface KanbanViewProps {
  dealsByStatus: Record<string, BrandDeal[]>;
  selectedMonth: Date;
  isYearView?: boolean;
  showArchived?: boolean;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (status: BrandDeal['status']) => void;
  onEdit: (deal: BrandDeal) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onQuickUpdate: (id: string, updates: Partial<BrandDeal>) => void;
  onAddDeal?: () => void;
}

const PlaceholderDealCard = ({ onDismiss }: { onDismiss: (e: React.MouseEvent) => void }) => (
  <div className="group relative bg-gradient-to-br from-white via-white to-[#FAF9F8] rounded-xl p-3 sm:p-4 border-2 border-dashed border-[#D8C8D3] min-h-[260px] sm:min-h-[300px] flex flex-col opacity-50 hover:opacity-70 transition-opacity" style={{ fontFamily: "'DM Sans', sans-serif" }}>
    {/* "Example" label */}
    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-[#8B7082]/10 text-[#8B7082] text-[9px] font-semibold tracking-wide uppercase">Example</div>
    <button
      onClick={onDismiss}
      className="absolute top-2.5 right-2.5 w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all opacity-50 hover:opacity-100 z-10"
      title="Dismiss"
    >
      <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    </button>
    <div className="mt-6 mb-3">
      <h3 className="text-base sm:text-lg font-bold text-[#612a4f] tracking-[-0.02em]" style={{ fontFamily: "'Playfair Display', serif" }}>Brand Name</h3>
      <p className="text-xs text-[#8B7082] mt-0.5">Product Campaign</p>
    </div>
    <div className="flex items-center gap-2 mb-3">
      <span className="text-lg sm:text-[22px] font-semibold text-[#612a4f] tracking-[-0.02em]" style={{ fontFamily: "'Playfair Display', serif" }}>$2,500</span>
      <span className="px-2 py-0.5 bg-[#F5F0F3] text-[#612a4f] text-[10px] font-medium rounded-full border border-[#612a4f]/15">In Progress</span>
    </div>
    <div className="mb-3">
      <div className="flex items-center gap-2 text-xs text-[#8B7082] mb-2">
        <span>0/1 delivered</span>
        <div className="flex-1 h-1.5 bg-[#F5F3F4] rounded-full overflow-hidden" />
      </div>
      <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-[#F5F0F3] text-[#612a4f] border border-[#612a4f]/20">Instagram Reel</span>
    </div>
    <div className="flex flex-col gap-1.5 pt-2.5 border-t border-[#F5F3F4] mt-auto text-xs text-[#8B7082]">
      <div className="flex items-center gap-1.5"><CalendarIcon className="w-2.5 h-2.5" /><span>Submit: Apr 10</span></div>
      <div className="flex items-center gap-1.5"><CalendarIcon className="w-2.5 h-2.5" /><span>Publish: Apr 15</span></div>
    </div>
  </div>
);

// Deal Card Component
interface DealCardProps {
  deal: BrandDeal;
  selectedMonth: Date;
  isYearView?: boolean;
  showArchived?: boolean;
  onDragStart: (id: string) => void;
  onEdit: (deal: BrandDeal) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onQuickUpdate: (id: string, updates: Partial<BrandDeal>) => void;
}

const DealCard = ({ deal, selectedMonth, isYearView, showArchived, onDragStart, onEdit, onDelete, onArchive, onUnarchive, onQuickUpdate }: DealCardProps) => {
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string | null>(null);
  const now = new Date();
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const selectedYear = selectedMonth.getFullYear();

  // Helper to check if a deliverable is in the selected period (month or year)
  const isDeliverableInPeriod = (d: Deliverable) => {
    const submitDate = d.submissionDeadline ? parseISO(d.submissionDeadline) : null;
    const publishDate = d.publishDeadline ? parseISO(d.publishDeadline) : null;
    if (isYearView) {
      return (submitDate && submitDate.getFullYear() === selectedYear) ||
             (publishDate && publishDate.getFullYear() === selectedYear);
    }
    return (submitDate && isWithinInterval(submitDate, { start: monthStart, end: monthEnd })) ||
           (publishDate && isWithinInterval(publishDate, { start: monthStart, end: monthEnd }));
  };

  // Get deliverables that are in this period (for auto-selection)
  const deliverablesInPeriod = deal.deliverables?.filter(isDeliverableInPeriod) || [];

  // All deliverables for display
  const allDeliverables = deal.deliverables || [];

  // Get the selected deliverable - prefer one in the current period
  const selectedDeliverable = selectedDeliverableId
    ? allDeliverables.find(d => d.id === selectedDeliverableId)
    : null;

  // Auto-select: if selected is not in current period, default to first one in period
  // Otherwise show first with pending work in this period, or just the first one in period
  const displayDeliverable = (selectedDeliverable && isDeliverableInPeriod(selectedDeliverable))
    ? selectedDeliverable
    : deliverablesInPeriod.find(d => (!d.isSubmitted && d.submissionDeadline) || (!d.isPublished && d.publishDeadline))
      || deliverablesInPeriod[0]
      || selectedDeliverable
      || allDeliverables[0];

  const displaySubmitDate = displayDeliverable?.submissionDeadline;
  const displayPublishDate = displayDeliverable?.publishDeadline;
  const isSubmitDone = displayDeliverable?.isSubmitted || false;
  const isPublishDone = displayDeliverable?.isPublished || false;

  const isSubmitPastDue = displaySubmitDate && !isSubmitDone && isBefore(parseISO(displaySubmitDate), now);
  const isPublishPastDue = displayPublishDate && !isPublishDone && isBefore(parseISO(displayPublishDate), now);
  // Progress bar shows TOTAL deliverables (across all months)
  const totalPublishedCount = deal.deliverables?.filter(d => d.isPublished).length || 0;
  const totalDeliverablesCount = deal.deliverables?.length || 0;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(deal.id)}
      onClick={() => onEdit(deal)}
      className="group bg-gradient-to-br from-white via-white to-[#FAF9F8] rounded-xl p-3 sm:p-4 shadow-none border border-[#D8C8D3] cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_3px_8px_rgba(0,0,0,0.04)] transition-shadow duration-200 min-h-[260px] sm:min-h-[300px] flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1 mr-2">
          <h3 className="text-base sm:text-lg font-bold text-[#612a4f] tracking-[-0.02em] truncate" style={{ fontFamily: "'Playfair Display', serif" }}>{deal.brandName}</h3>
          <p className="text-xs text-[#8B7082] min-h-[16px] mt-0.5 truncate">{deal.productCampaign || '\u00A0'}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1 hover:bg-[#8B7082]/10 rounded-lg text-[#8B7082] hover:text-[#612a4f] transition-all duration-200 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="rounded-xl">
            {showArchived ? (
              <DropdownMenuItem
                onClick={() => onUnarchive(deal.id)}
                className="text-[#612a4f]"
              >
                <Archive className="w-4 h-4 mr-2" />
                Restore
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => onArchive(deal.id)}
                className="text-[#8B7082]"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete(deal.id)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Fee */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-lg sm:text-[22px] font-semibold text-[#612a4f] tracking-[-0.02em]" style={{ fontFamily: "'Playfair Display', serif" }}>${deal.totalFee.toLocaleString()}</span>
        <div className="flex gap-1.5">
          {deal.depositPaid && (
            <span className="px-3 py-1 bg-[#E8F0E8] text-[#5A8A5A] text-[10px] font-medium rounded-full border border-[#C5D9C5]/40 flex items-center gap-1">
              <span>Deposit Paid</span>
              {deal.depositAmount ? <span className="font-semibold">${deal.depositAmount.toLocaleString()}</span> : null}
            </span>
          )}
          {displayDeliverable?.isPaid && (
            <span className="px-3 py-1 bg-[#E8F0E8] text-[#5A8A5A] text-[10px] font-medium rounded-full border border-[#C5D9C5]/40">
              Content Paid
            </span>
          )}
        </div>
      </div>

      {/* Deliverables Summary */}
      {allDeliverables.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-xs text-[#8B7082]">
            <span>{totalPublishedCount}/{totalDeliverablesCount} delivered</span>
            <div className="flex-1 h-1.5 bg-[#F5F3F4] rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#5A8A5A] to-[#6B9B6B] rounded-full transition-all shadow-[0_0_8px_rgba(90,138,90,0.4)]"
                style={{ width: `${(totalPublishedCount / totalDeliverablesCount) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex gap-1 mt-2 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {allDeliverables.map(d => {
              const inThisPeriod = isDeliverableInPeriod(d);
              const isSelected = displayDeliverable?.id === d.id;
              return (
                <button
                  key={d.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDeliverableId(d.id);
                  }}
                  className={cn(
                    "px-1.5 py-0.5 text-[9px] font-semibold rounded transition-all duration-200 flex-shrink-0",
                    isSelected
                      ? "bg-gradient-to-r from-[#612a4f] to-[#7a3d65] text-white shadow-[0_2px_8px_rgba(97,42,79,0.3)]"
                      : inThisPeriod
                        ? "bg-gradient-to-r from-[#F5F0F3] to-[#F0EAF0] text-[#612a4f] border border-[#612a4f]/20 hover:border-[#612a4f]/40 hover:shadow-sm"
                        : "bg-[#F8F6F7] text-[#8B7082]/60 border border-transparent"
                  )}
                >
                  {d.contentType === 'other' && d.customContentType ? d.customContentType : contentTypeConfig[d.contentType].short}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col gap-1.5 pt-2.5 border-t border-[#F5F3F4] mt-auto">
        {displaySubmitDate && (
          <div className="flex items-center justify-between text-xs text-[#8B7082]">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-2.5 h-2.5" />
              <span className={cn(isSubmitDone && "opacity-50")}>
                Submit: {format(parseISO(displaySubmitDate), "MMM d")}
              </span>
            </div>
            <label className="flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isSubmitDone}
                onCheckedChange={(checked) => {
                  if (displayDeliverable) {
                    const updatedDeliverables = deal.deliverables.map(d =>
                      d.id === displayDeliverable.id ? { ...d, isSubmitted: checked as boolean } : d
                    );
                    onQuickUpdate(deal.id, { deliverables: updatedDeliverables });
                  }
                }}
                className="h-4 w-4 rounded-full border-[#8B7082]/30 data-[state=checked]:bg-gradient-to-b data-[state=checked]:from-[#6B9B6B] data-[state=checked]:to-[#4A7A4A] data-[state=checked]:border-[#4A7A4A] data-[state=checked]:shadow-[0_2px_8px_rgba(74,122,74,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]"
              />
            </label>
          </div>
        )}
        {displayPublishDate && (
          <div className="flex items-center justify-between text-xs font-medium text-[#612a4f]">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-2.5 h-2.5" />
              <span className={cn(isPublishDone && "opacity-50")}>
                Publish: {format(parseISO(displayPublishDate), "MMM d")}
              </span>
            </div>
            <label className="flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isPublishDone}
                onCheckedChange={(checked) => {
                  if (displayDeliverable) {
                    const updatedDeliverables = deal.deliverables.map(d =>
                      d.id === displayDeliverable.id ? { ...d, isPublished: checked as boolean } : d
                    );
                    onQuickUpdate(deal.id, { deliverables: updatedDeliverables });
                  }
                }}
                className="h-4 w-4 rounded-full border-[#8B7082]/30 data-[state=checked]:bg-gradient-to-b data-[state=checked]:from-[#6B9B6B] data-[state=checked]:to-[#4A7A4A] data-[state=checked]:border-[#4A7A4A] data-[state=checked]:shadow-[0_2px_8px_rgba(74,122,74,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]"
              />
            </label>
          </div>
        )}
        {/* Paid checkbox - always visible for selected deliverable */}
        {displayDeliverable && (() => {
          // Calculate effective paid amount: use paymentAmount if set, otherwise derive from balance after deposit
          // Deposit is PART of totalFee, so deliverable payment = (totalFee - depositAmount) / numDeliverables
          const balanceAfterDeposit = deal.totalFee ? deal.totalFee - (deal.depositAmount || 0) : 0;
          const effectivePaidAmount = displayDeliverable.paymentAmount ||
            (displayDeliverable.isPaid ? Math.round(balanceAfterDeposit / (deal.deliverables?.length || 1)) : 0);

          return (
          <div className={cn(
            "flex items-center justify-between text-xs pt-1.5 mt-1 border-t border-[#F5F3F4] font-medium",
            displayDeliverable.isPaid ? "text-[#5A8A5A]" : "text-[#612a4f]"
          )}>
            <div className="flex items-center gap-1.5">
              <Diamond className="w-2.5 h-2.5 fill-current" />
              <span className="font-semibold">
                Content Paid{effectivePaidAmount > 0 ? ` $${effectivePaidAmount.toLocaleString()}` : ''}
              </span>
            </div>
            <label className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={displayDeliverable.isPaid || false}
                onCheckedChange={(checked) => {
                  const updatedDeliverables = deal.deliverables.map(d =>
                    d.id === displayDeliverable.id ? {
                      ...d,
                      isPaid: checked as boolean,
                      paidDate: checked ? new Date().toISOString() : undefined
                    } : d
                  );
                  // Auto-set "Fully Paid" when all deliverables are paid
                  const allPaid = updatedDeliverables.every(d => d.isPaid);
                  onQuickUpdate(deal.id, {
                    deliverables: updatedDeliverables,
                    paymentReceived: allPaid,
                    paymentReceivedDate: allPaid ? new Date().toISOString() : null as unknown as string,
                  });
                }}
                className="h-4 w-4 rounded-full border-[#8B7082]/30 data-[state=checked]:bg-gradient-to-b data-[state=checked]:from-[#6B9B6B] data-[state=checked]:to-[#4A7A4A] data-[state=checked]:border-[#4A7A4A] data-[state=checked]:shadow-[0_2px_8px_rgba(74,122,74,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]"
              />
            </label>
          </div>
          );
        })()}
      </div>
    </div>
  );
};

const BrandsKanban = ({ dealsByStatus, selectedMonth, isYearView, showArchived, onDragStart, onDragOver, onDrop, onEdit, onDelete, onArchive, onUnarchive, onQuickUpdate, onAddDeal }: KanbanViewProps) => {
  const { user } = useAuth();
  const [dismissedPlaceholders, setDismissedPlaceholders] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!user?.id) return;
    try { setDismissedPlaceholders(JSON.parse(localStorage.getItem(`dismissedBrandDealPlaceholders_${user.id}`) || '{}')); }
    catch { setDismissedPlaceholders({}); }
  }, [user?.id]);
  const dismissPlaceholder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedPlaceholders(prev => {
      const next = { ...prev, [id]: true };
      localStorage.setItem(`dismissedBrandDealPlaceholders_${user?.id}`, JSON.stringify(next));
      return next;
    });
  };

  // Only show columns that have deals
  const activeStatuses = statusOrder.filter(status => dealsByStatus[status].length > 0);

  if (activeStatuses.length === 0) {
    if (showArchived) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-white/80 via-white/60 to-[#F8F6F5]/80 backdrop-blur-sm rounded-2xl border border-[#8B7082]/10 shadow-[0_4px_24px_rgba(97,42,79,0.04)]">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#8B7082]/10 to-[#8B7082]/5 mb-4">
            <Archive className="w-10 h-10 text-[#8B7082]/40" />
          </div>
          <p className="text-[#612a4f] font-medium text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>No archived deals</p>
          <p className="text-sm text-[#8B7082]/70 mt-1">Archived deals will appear here</p>
        </div>
      );
    }

    if (!dismissedPlaceholders['pd-0']) {
      return (
        <div className="flex flex-col sm:flex-row items-center gap-10 py-6 px-2">
          {/* Example card */}
          <div className="w-full sm:w-60 flex-shrink-0">
            <PlaceholderDealCard onDismiss={(e) => dismissPlaceholder('pd-0', e)} />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px self-stretch bg-gradient-to-b from-transparent via-[#D8C8D3] to-transparent" />

          {/* Text + CTA */}
          <div className="flex flex-col gap-5 max-w-sm">
            <div>
<h2 className="text-3xl font-bold text-[#2d2a26] leading-tight mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                No brand deals yet
              </h2>
              <p className="text-sm text-[#8B7082] leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Track every partnership from first contact to final payment — deadlines, deliverables, and dollars all in one place.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onAddDeal}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#612a4f] to-[#4d2140] hover:from-[#4d2140] hover:to-[#3a1830] text-white text-sm font-semibold shadow-[0_4px_16px_rgba(97,42,79,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_24px_rgba(97,42,79,0.4)] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <Plus className="w-4 h-4" />
                Add your first deal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(97,42,79,0.07)' }}>
          <Handshake className="w-5 h-5 text-[#612a4f]" />
        </div>
        <p className="text-sm text-[#8B7082] text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>Your next brand deal is just around the corner</p>
        <button onClick={onAddDeal} className="px-5 py-2 rounded-full text-sm font-semibold text-[#612a4f] border border-[#612a4f]/30 hover:bg-[#612a4f] hover:text-white transition-all" style={{ fontFamily: "'DM Sans', sans-serif" }}>Add a brand deal</button>
      </div>
    );
  }

  // Flatten all deals into a single array for grid layout, sorted by earliest deadline
  const getEarliestDealDate = (deal: BrandDeal) => {
    const dates = deal.deliverables
      .map(d => d.submissionDeadline || d.publishDeadline)
      .filter(Boolean)
      .sort();
    return dates[0] || 'z';
  };
  const allDeals = activeStatuses
    .flatMap(status => dealsByStatus[status])
    .sort((a, b) => getEarliestDealDate(a).localeCompare(getEarliestDealDate(b)));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {allDeals.map(deal => (
        <DealCard
          key={deal.id}
          deal={deal}
          selectedMonth={selectedMonth}
          isYearView={isYearView}
          showArchived={showArchived}
          onDragStart={onDragStart}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          onQuickUpdate={onQuickUpdate}
        />
      ))}
    </div>
  );
};

export default BrandsKanban;
