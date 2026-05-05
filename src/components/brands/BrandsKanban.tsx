import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { BrandDeal, Deliverable, contentTypeConfig, statusOrder, statusConfig } from "./brandsTypes";

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

// Status accent colors for the left border
const statusAccent: Record<string, string> = {
  'inbound': '#8B7082',
  'negotiating': '#D4915E',
  'signed': '#5B8FB9',
  'in-progress': '#612a4f',
  'completed': '#5BA67A',
  'other': '#9CA3AF',
};

const PlaceholderDealCard = ({ onDismiss }: { onDismiss: (e: React.MouseEvent) => void }) => (
  <div className="group relative bg-white rounded-lg p-4 border border-gray-200 min-h-[260px] flex flex-col opacity-90 hover:opacity-100 transition-opacity duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-[#612a4f]/[0.06] text-[#612a4f] text-[9px] font-semibold tracking-wide uppercase">Example</div>
    <button
      onClick={onDismiss}
      className="absolute top-2.5 right-2.5 w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all opacity-50 hover:opacity-100 z-10"
      title="Dismiss"
    >
      <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    </button>
    <div className="mt-6 mb-3">
      <h3 className="text-sm font-semibold text-gray-800">Sephora</h3>
      <p className="text-xs text-gray-400 mt-0.5">Summer Campaign</p>
    </div>
    <div className="flex items-center gap-2 mb-3">
      <span className="text-lg font-semibold text-gray-900 tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>$2,500</span>
      <span className="px-2 py-0.5 bg-[#612a4f]/[0.05] text-[#612a4f] text-[10px] font-medium rounded-full border border-[#612a4f]/10">In Progress</span>
    </div>
    <div className="mb-3">
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
        <span>0/1 delivered</span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden" />
      </div>
      <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-[#612a4f]/[0.05] text-[#612a4f] border border-[#612a4f]/10">Instagram Reel</span>
    </div>
    <div className="flex flex-col gap-1.5 pt-2.5 border-t border-gray-100 mt-auto text-xs text-gray-400">
      <div className="flex items-center gap-1.5"><CalendarIcon className="w-3 h-3" /><span>Submit: Apr 10</span></div>
      <div className="flex items-center gap-1.5"><CalendarIcon className="w-3 h-3" /><span>Publish: Apr 15</span></div>
    </div>
  </div>
);

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

  const deliverablesInPeriod = deal.deliverables?.filter(isDeliverableInPeriod) || [];
  const allDeliverables = deal.deliverables || [];
  const selectedDeliverable = selectedDeliverableId
    ? allDeliverables.find(d => d.id === selectedDeliverableId)
    : null;

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
  const totalPublishedCount = deal.deliverables?.filter(d => d.isPublished).length || 0;
  const totalDeliverablesCount = deal.deliverables?.length || 0;
  const accentColor = statusAccent[deal.status] || '#9CA3AF';
  const allDone = totalDeliverablesCount > 0 && totalPublishedCount === totalDeliverablesCount;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(deal.id)}
      onClick={() => onEdit(deal)}
      className="group relative bg-white rounded-lg p-4 border border-gray-100 cursor-pointer min-h-[220px] flex flex-col hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 border-l-[3px]"
      style={{ borderLeftColor: accentColor }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div className="min-w-0 flex-1 mr-2">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{deal.brandName}</h3>
          </div>
          <p className="text-xs text-gray-400 min-h-[16px] truncate">{deal.productCampaign || '\u00A0'}</p>
        </div>
        <div className="flex items-center gap-1">
          {/* Status pill */}
          <span
            className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border"
            style={{
              color: accentColor,
              backgroundColor: `${accentColor}10`,
              borderColor: `${accentColor}25`,
            }}
          >
            {deal.status === 'other' ? (deal.customStatus || 'Other') : statusConfig[deal.status]?.label}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-300 hover:text-gray-500 transition-all duration-150 flex-shrink-0 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="rounded-lg">
              {showArchived ? (
                <DropdownMenuItem onClick={() => onUnarchive(deal.id)} className="text-[#612a4f]">
                  <Archive className="w-4 h-4 mr-2" /> Restore
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onArchive(deal.id)} className="text-gray-500">
                  <Archive className="w-4 h-4 mr-2" /> Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(deal.id)} className="text-red-500">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Fee — the hero */}
      <div className="flex items-baseline gap-2.5 mb-3 mt-2 flex-wrap">
        <span className="text-lg font-semibold text-gray-900 tracking-tight leading-none">
          ${deal.totalFee.toLocaleString()}
        </span>
        <div className="flex gap-1.5 items-center">
          {deal.depositPaid && (
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full border border-emerald-200/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Deposit{deal.depositAmount ? ` $${deal.depositAmount.toLocaleString()}` : ''}
            </span>
          )}
          {displayDeliverable?.isPaid && (
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full border border-emerald-200/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Paid
            </span>
          )}
        </div>
      </div>

      {/* Deliverables */}
      {allDeliverables.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-xs mb-2">
            <span className="font-semibold text-gray-600">{totalPublishedCount}/{totalDeliverablesCount}</span>
            <span className="text-gray-300">delivered</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${totalDeliverablesCount > 0 ? (totalPublishedCount / totalDeliverablesCount) * 100 : 0}%`,
                  backgroundColor: allDone ? '#5BA67A' : accentColor,
                }}
              />
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {allDeliverables.map(d => {
              const inThisPeriod = isDeliverableInPeriod(d);
              const isSelected = displayDeliverable?.id === d.id;
              return (
                <button
                  key={d.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedDeliverableId(d.id); }}
                  className={cn(
                    "px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded-md transition-all duration-200 flex-shrink-0",
                    isSelected
                      ? "text-white shadow-sm"
                      : inThisPeriod
                        ? "text-[#612a4f] bg-[#612a4f]/[0.06] border border-[#612a4f]/10 hover:bg-[#612a4f]/10"
                        : "bg-gray-50 text-gray-400 border border-transparent"
                  )}
                  style={isSelected ? { backgroundColor: accentColor } : undefined}
                >
                  {d.contentType === 'other' && d.customContentType ? d.customContentType : contentTypeConfig[d.contentType].short}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dates Footer */}
      <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-100 mt-auto">
        {displaySubmitDate && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gray-400">
              <CalendarIcon className="w-3 h-3" />
              <span className={cn(
                isSubmitDone && "line-through opacity-40",
                isSubmitPastDue && "text-amber-500 font-semibold"
              )}>
                Submit {format(parseISO(displaySubmitDate), "MMM d")}
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
                className="h-4 w-4 rounded border-gray-200 data-[state=checked]:bg-[#612a4f] data-[state=checked]:border-[#612a4f]"
              />
            </label>
          </div>
        )}
        {displayPublishDate && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gray-600 font-medium">
              <CalendarIcon className="w-3 h-3 text-[#612a4f]/40" />
              <span className={cn(
                isPublishDone && "line-through opacity-40",
                isPublishPastDue && "text-red-400 font-semibold"
              )}>
                Publish {format(parseISO(displayPublishDate), "MMM d")}
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
                className="h-4 w-4 rounded border-gray-200 data-[state=checked]:bg-[#612a4f] data-[state=checked]:border-[#612a4f]"
              />
            </label>
          </div>
        )}
        {displayDeliverable && (() => {
          const balanceAfterDeposit = deal.totalFee ? deal.totalFee - (deal.depositAmount || 0) : 0;
          const effectivePaidAmount = displayDeliverable.paymentAmount ||
            (displayDeliverable.isPaid ? Math.round(balanceAfterDeposit / (deal.deliverables?.length || 1)) : 0);
          return (
          <div className={cn(
            "flex items-center justify-between text-xs pt-2 mt-1 border-t border-gray-50 font-semibold",
            displayDeliverable.isPaid ? "text-emerald-600" : "text-gray-500"
          )}>
            <div className="flex items-center gap-1.5">
              <Diamond className="w-3 h-3 fill-current" />
              <span>
                Paid{effectivePaidAmount > 0 ? ` $${effectivePaidAmount.toLocaleString()}` : ''}
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
                  const allPaid = updatedDeliverables.every(d => d.isPaid);
                  onQuickUpdate(deal.id, {
                    deliverables: updatedDeliverables,
                    paymentReceived: allPaid,
                    paymentReceivedDate: allPaid ? new Date().toISOString() : null as unknown as string,
                  });
                }}
                className="h-4 w-4 rounded border-gray-200 data-[state=checked]:bg-[#612a4f] data-[state=checked]:border-[#612a4f]"
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

  const activeStatuses = statusOrder.filter(status => dealsByStatus[status].length > 0);

  if (activeStatuses.length === 0) {
    if (showArchived) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-[#612a4f]/10 flex items-center justify-center mb-4">
            <Archive className="w-6 h-6 text-[#612a4f]/30" />
          </div>
          <p className="text-sm font-semibold text-gray-700">No archived deals</p>
          <p className="text-xs text-gray-400 mt-1">Archived deals will appear here</p>
        </div>
      );
    }

    return (
      <motion.div
        className="flex flex-col sm:flex-row items-center gap-10 py-6 px-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      >
        {/* Example card */}
        <div className="w-full sm:w-60 flex-shrink-0">
          <PlaceholderDealCard onDismiss={(e) => dismissPlaceholder('pd-0', e)} />
        </div>

        {/* Text + CTA */}
        <div className="flex flex-col gap-4 max-w-sm">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 mb-2">No brand deals yet</h2>
          </div>
          <button
            onClick={onAddDeal}
            className="w-fit flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-[#612a4f] hover:bg-[#4d2240] text-white shadow-[0_2px_8px_rgba(97,42,79,0.25)] hover:shadow-[0_4px_16px_rgba(97,42,79,0.3)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add your first deal
          </button>
        </div>
      </motion.div>
    );
  }

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
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
    >
      {allDeals.map(deal => (
        <motion.div
          key={deal.id + '-wrapper'}
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } } }}
        >
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
        </motion.div>
      ))}
    </motion.div>
  );
};

export default BrandsKanban;
