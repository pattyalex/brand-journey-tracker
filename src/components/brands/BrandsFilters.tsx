import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  X,
  Archive,
  SlidersHorizontal,
} from "lucide-react";
import { statusConfig, statusOrder } from "./brandsTypes";

interface BrandsFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  paymentFilter: string;
  setPaymentFilter: (p: string) => void;
  showArchived: boolean;
  setShowArchived: (v: boolean) => void;
  archivedCount: number;
  onAddDeal: () => void;
}

const BrandsFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  paymentFilter,
  setPaymentFilter,
  showArchived,
  setShowArchived,
  archivedCount,
  onAddDeal,
}: BrandsFiltersProps) => {
  const hasFilters = searchQuery || statusFilter !== 'all' || paymentFilter !== 'all';
  const filterCount = [searchQuery, statusFilter !== 'all', paymentFilter !== 'all'].filter(Boolean).length;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
      {/* Active filter pills - left side */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(hasFilters || showArchived) ? (
          <>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#612a4f]/[0.05] text-[#612a4f] border border-[#612a4f]/10">
                <Search className="w-2.5 h-2.5 text-[#612a4f]/40" />
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-1 text-[#612a4f]/40 hover:text-[#612a4f] transition-colors duration-150">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#612a4f]/[0.05] text-[#612a4f] border border-[#612a4f]/10">
                {statusConfig[statusFilter as keyof typeof statusConfig]?.label}
                <button onClick={() => setStatusFilter('all')} className="ml-1 text-[#612a4f]/40 hover:text-[#612a4f] transition-colors duration-150">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {paymentFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#612a4f]/[0.05] text-[#612a4f] border border-[#612a4f]/10">
                {paymentFilter === 'paid' ? 'Paid in Full' : 'Expected'}
                <button onClick={() => setPaymentFilter('all')} className="ml-1 text-[#612a4f]/40 hover:text-[#612a4f] transition-colors duration-150">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {showArchived && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#612a4f]/[0.05] text-[#612a4f] border border-[#612a4f]/10">
                <Archive className="w-2.5 h-2.5" />
                Archive
                <button onClick={() => setShowArchived(false)} className="ml-1 text-[#612a4f]/40 hover:text-[#612a4f] transition-colors duration-150">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {hasFilters && (
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); setPaymentFilter('all'); }}
                className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors duration-150 ml-1"
              >
                Clear all
              </button>
            )}
          </>
        ) : (
          <div />
        )}
      </div>

      {/* Right side - Filter button + Add Deal */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {/* Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200",
                hasFilters
                  ? "bg-[#612a4f]/[0.05] text-[#612a4f] border-[#612a4f]/15"
                  : "bg-white text-gray-400 border-gray-200 hover:text-gray-600 hover:border-gray-300"
              )}
            >
              <SlidersHorizontal className="w-3 h-3" />
              Filter
              {filterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#612a4f] text-white text-[9px] flex items-center justify-center font-semibold">
                  {filterCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0 bg-white rounded-lg border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]" align="end" sideOffset={4}>
            <div className="p-3 space-y-3">
              <div>
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                  <Input
                    placeholder="Search brands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 bg-white border-gray-200 rounded-lg text-sm pl-8 focus:border-[#612a4f]/30 focus:ring-0"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 bg-white border-gray-200 rounded-lg text-sm">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOrder.map(status => (
                      <SelectItem key={status} value={status}>{statusConfig[status].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Payments</label>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="h-8 bg-white border-gray-200 rounded-lg text-sm">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="paid">Paid in Full</SelectItem>
                    <SelectItem value="unpaid">Expected Payments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={cn(
                    "w-full flex items-center justify-between py-2 px-2.5 rounded-lg transition-all duration-200 text-[13px]",
                    showArchived ? "bg-[#612a4f]/[0.06] text-[#612a4f] font-medium" : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Archive className="w-3.5 h-3.5" />
                    <span>{showArchived ? "Viewing Archive" : "View Archive"}</span>
                  </div>
                  {archivedCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-full min-w-[20px] text-center">
                      {archivedCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <button
          onClick={onAddDeal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#612a4f] hover:bg-[#4d2240] text-white shadow-[0_2px_8px_rgba(97,42,79,0.25)] hover:shadow-[0_4px_16px_rgba(97,42,79,0.3)] hover:-translate-y-[1px] transition-all duration-200"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Deal</span>
        </button>
      </div>
    </div>
  );
};

export default BrandsFilters;
