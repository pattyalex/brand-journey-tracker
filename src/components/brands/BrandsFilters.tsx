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
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
      {/* Active filter pills - left side */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(searchQuery || statusFilter !== 'all' || paymentFilter !== 'all' || showArchived) ? (
          <>
            {searchQuery && (
              <span className="px-2 py-1 bg-[#F8F6F5] text-[#612a4f] text-xs rounded-full flex items-center gap-1">
                "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer hover:text-[#612a4f]/70" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="px-2 py-1 bg-[#F8F6F5] text-[#612a4f] text-xs rounded-full flex items-center gap-1">
                {statusConfig[statusFilter as keyof typeof statusConfig]?.label}
                <X className="w-3 h-3 cursor-pointer hover:text-[#612a4f]/70" onClick={() => setStatusFilter('all')} />
              </span>
            )}
            {paymentFilter !== 'all' && (
              <span className="px-2 py-1 bg-[#F8F6F5] text-[#612a4f] text-xs rounded-full flex items-center gap-1">
                {paymentFilter === 'paid' ? 'Paid in Full' : 'Expected Payments'}
                <X className="w-3 h-3 cursor-pointer hover:text-[#612a4f]/70" onClick={() => setPaymentFilter('all')} />
              </span>
            )}
            {showArchived && (
              <span className="px-2 py-1 bg-[#612a4f]/10 text-[#612a4f] text-xs rounded-full flex items-center gap-1">
                Archive
                <X className="w-3 h-3 cursor-pointer hover:text-[#612a4f]/70" onClick={() => setShowArchived(false)} />
              </span>
            )}
          </>
        ) : (
          <div />
        )}
      </div>

      {/* Right side - Filter button + Add Deal */}
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
        {/* Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 relative",
                "bg-white border border-[#E8E4E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
                "hover:border-[#612a4f]/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
                (searchQuery || statusFilter !== 'all' || paymentFilter !== 'all' || showArchived) && "border-[#612a4f]/40"
              )}
            >
              <Search className="w-4 h-4 text-[#612a4f]" />
              {(searchQuery || statusFilter !== 'all' || paymentFilter !== 'all') && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#612a4f] rounded-full" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4 bg-white rounded-2xl" align="end" sideOffset={8}>
            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="text-xs font-medium text-[#8B7082] uppercase tracking-wide mb-1.5 block">Search</label>
                <Input
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 bg-white border-[#E8E4E6] rounded-lg text-sm"
                />
              </div>
              {/* Status */}
              <div>
                <label className="text-xs font-medium text-[#8B7082] uppercase tracking-wide mb-1.5 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 bg-white border-[#E8E4E6] rounded-lg text-sm">
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
              {/* Payments */}
              <div>
                <label className="text-xs font-medium text-[#8B7082] uppercase tracking-wide mb-1.5 block">Payments</label>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="h-9 bg-white border-[#E8E4E6] rounded-lg text-sm">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="paid">Paid in Full</SelectItem>
                    <SelectItem value="unpaid">Expected Payments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Archive Toggle */}
              <div className="pt-2 border-t border-[#E8E4E6]">
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={cn(
                    "w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 text-sm text-[#612a4f]",
                    showArchived ? "bg-[#612a4f]/10" : "hover:bg-[#F8F6F5]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4" />
                    <span>{showArchived ? "Viewing Archive" : "View Archive"}</span>
                  </div>
                  {archivedCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-[#8B7082]/20 text-[#8B7082] text-xs rounded-full">
                      {archivedCount}
                    </span>
                  )}
                </button>
              </div>
              {/* Clear Filters */}
              {(searchQuery || statusFilter !== 'all' || paymentFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPaymentFilter('all');
                  }}
                  className="w-full text-xs text-[#8B7082] hover:text-[#612a4f] transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          onClick={onAddDeal}
          className="h-10 sm:h-11 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-[#612a4f] to-[#4d2140] hover:from-[#4d2140] hover:to-[#3a1830] text-white shadow-[0_4px_16px_rgba(97,42,79,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_24px_rgba(97,42,79,0.4)] hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Deal</span>
        </Button>
      </div>
    </div>
  );
};

export default BrandsFilters;
