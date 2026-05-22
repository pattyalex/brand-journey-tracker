import React, { useState } from "react";
import { motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format, parseISO, isBefore, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import {
  Plus,
  Check,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Archive,
  Trash2,
  Diamond,
} from "lucide-react";
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

const PlaceholderDealCard = () => (
  <div className="relative bg-white rounded-xl p-5 flex flex-col opacity-70 border border-dashed border-black/15 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] group/example">
    <span className="absolute top-3.5 right-4 text-[9px] text-[#888] tracking-[0.08em] uppercase font-medium group-hover/example:text-[12px] group-hover/example:text-[#444] transition-all duration-300">Example</span>
    {/* Header */}
    <div className="mb-1">
      <h3 className="text-sm font-medium text-gray-900">Sephora</h3>
      <p className="text-[12px] text-[#8A8A8A] mt-0.5">Summer Campaign</p>
    </div>
    {/* Fee + Paid badge */}
    <div className="flex items-baseline gap-2 mt-3 mb-0.5">
      <span className="text-lg font-semibold text-gray-900 tracking-tight">$7,000</span>
      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full border border-emerald-200/60 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Paid
      </span>
    </div>
    <p className="text-[10px] text-[#8A8A8A] mb-3">Total deal value</p>
    {/* Deliverables progress */}
    <div className="mb-3">
      <div className="flex items-center gap-2 text-xs mb-2">
        <span className="font-semibold text-gray-600">1/2</span>
        <span className="text-gray-300">delivered</span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: '50%', backgroundColor: '#9B6B8D' }} />
        </div>
      </div>
      <div className="flex gap-1">
        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded-md text-[#9B6B8D] bg-[#9B6B8D]/[0.08] border border-[#9B6B8D]/15">Reel</span>
        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded-md text-white" style={{ backgroundColor: '#9B6B8D' }}>TikTok</span>
      </div>
    </div>
    {/* Dates */}
    <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-100 mt-auto">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-gray-400 line-through opacity-40">
          <CalendarIcon className="w-3 h-3" />
          Submit May 22
        </div>
        <div className="w-4 h-4 rounded bg-[#9B6B8D] flex items-center justify-center">
          <Check size={10} className="text-white" strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-gray-400 line-through opacity-40">
          <CalendarIcon className="w-3 h-3" />
          Publish May 25
        </div>
        <div className="w-4 h-4 rounded bg-[#9B6B8D] flex items-center justify-center">
          <Check size={10} className="text-white" strokeWidth={2.5} />
        </div>
      </div>
      {/* Paid row */}
      <div className="flex items-center justify-between text-xs pt-2 mt-1 border-t border-gray-50 font-semibold text-emerald-600">
        <div className="flex items-center gap-1.5">
          <Diamond className="w-3 h-3 fill-current" />
          Paid $4,000
        </div>
        <div className="w-4 h-4 rounded bg-[#9B6B8D] flex items-center justify-center">
          <Check size={10} className="text-white" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  </div>
);

const GhostAddCard = ({ onClick }: { onClick?: () => void }) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center justify-center rounded-xl cursor-pointer min-h-[180px] bg-white border border-black/10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:bg-[#5F2B4F]/[0.03] hover:border-[#5F2B4F]/30 hover:shadow-[0_2px_8px_rgba(95,43,79,0.08)] transition-all duration-200 group"
  >
    <Plus className="w-[18px] h-[18px] text-[#666] group-hover:text-[#5F2B4F] group-hover:rotate-90 group-hover:scale-110 mb-2 transition-all duration-300" />
    <span className="text-[13px] font-medium text-[#444] group-hover:text-[#5F2B4F] transition-colors duration-200">Add a deal</span>
    <span className="text-[11px] text-[#777] mt-0.5">Log a new brand partnership</span>
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
      className="group relative bg-white rounded-lg p-4 border border-gray-200 cursor-pointer min-h-[220px] flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
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
                    const updatedDeliverables = (deal.deliverables || []).map(d =>
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
                    const updatedDeliverables = (deal.deliverables || []).map(d =>
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
                  const updatedDeliverables = (deal.deliverables || []).map(d =>
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

  const activeStatuses = statusOrder.filter(status => (dealsByStatus[status] || []).length > 0);

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
      <div className="flex flex-col sm:flex-row items-start gap-8">
        <div style={{ width: '320px', flexShrink: 0 }}>
          <PlaceholderDealCard />
        </div>
        <div className="flex flex-col justify-center pt-[80px]">
          <p className="text-[15px] font-medium text-gray-700 mb-1.5">No brand deals yet</p>
          <p className="text-[12px] text-[#8A8A8A] mb-4">Track your brand partnerships, deliverables, and earnings.</p>
          <button
            onClick={onAddDeal}
            className="w-fit flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#612a4f] hover:bg-[#4d2240] text-white shadow-[0_2px_8px_rgba(97,42,79,0.25)] hover:shadow-[0_4px_16px_rgba(97,42,79,0.3)] hover:-translate-y-[1px] transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Deal
          </button>
        </div>
      </div>
    );
  }

  const getEarliestDealDate = (deal: BrandDeal) => {
    const dates = (deal.deliverables || [])
      .map(d => d.submissionDeadline || d.publishDeadline)
      .filter(Boolean)
      .sort();
    return dates[0] || 'z';
  };
  const allDeals = activeStatuses
    .flatMap(status => dealsByStatus[status])
    .sort((a, b) => getEarliestDealDate(a).localeCompare(getEarliestDealDate(b)));

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 320px))' }}
    >
      {allDeals.map(deal => (
        <div key={deal.id + '-wrapper'}>
          <DealCard
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
        </div>
      ))}
    </div>
  );
};

export default BrandsKanban;
