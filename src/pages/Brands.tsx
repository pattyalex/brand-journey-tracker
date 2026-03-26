
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, isSameMonth, isSameYear, addMonths, subMonths, addYears, subYears } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowUpRight,
  Wallet,
  Archive,
} from "lucide-react";
import { useBrandsPage } from "@/components/brands/useBrandsPage";
import BrandsFilters from "@/components/brands/BrandsFilters";
import BrandsKanban from "@/components/brands/BrandsKanban";
import BrandDealDialog from "@/components/brands/BrandDealDialog";
import { BrandDeal } from "@/components/brands/brandsTypes";

const Brands = () => {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingDeal,
    setEditingDeal,
    selectedMonth,
    setSelectedMonth,
    isYearView,
    setIsYearView,
    showArchived,
    setShowArchived,
    isReady,
    metrics,
    archivedCount,
    filteredDeals,
    dealsByStatus,
    handleAddDeal,
    handleUpdateDeal,
    handleDeleteDeal,
    handleArchiveDeal,
    handleUnarchiveDeal,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = useBrandsPage();

  return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0EAED] via-[#F8F6F6] to-[#FFFAF3]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="p-4 sm:p-6 lg:p-10">
            {/* Month Picker / Archive Header */}
            {showArchived ? (
              <div className="flex items-center justify-center gap-4 mb-10">
                <button
                  onClick={() => setShowArchived(false)}
                  className="p-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-[#8B7082]/10 hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-[#8B7082] hover:text-[#612a4f]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <Archive className="w-6 h-6 text-[#612a4f]" />
                  <h2 className="text-3xl text-[#612a4f] tracking-[-0.02em]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Archive
                  </h2>
                  <span className="text-sm text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>({archivedCount} deals)</span>
                </div>
                <div className="w-11" /> {/* Spacer for alignment */}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8 sm:mb-10">
                <div className="flex items-center gap-4 sm:gap-8">
                  <button
                    onClick={() => setSelectedMonth(prev => isYearView ? subYears(prev, 1) : subMonths(prev, 1))}
                    className="text-[#612a4f] hover:text-[#612a4f]/80 transition-colors duration-200"
                  >
                    <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <h2 className="text-2xl sm:text-3xl font-medium text-[#612a4f] min-w-[180px] sm:min-w-[240px] text-center tracking-[-0.02em]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>
                      {isYearView ? format(selectedMonth, "yyyy") : format(selectedMonth, "MMMM yyyy")}
                    </h2>
                    {(isYearView ? !isSameYear(selectedMonth, new Date()) : !isSameMonth(selectedMonth, new Date())) && (
                      <button
                        onClick={() => setSelectedMonth(new Date())}
                        className="text-xs text-[#8B7082] hover:text-[#612a4f] underline tracking-wide uppercase"
                      >
                        Today
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedMonth(prev => isYearView ? addYears(prev, 1) : addMonths(prev, 1))}
                    className="text-[#612a4f] hover:text-[#612a4f]/80 transition-colors duration-200"
                  >
                    <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>
                {/* Year View Toggle */}
                <button
                  onClick={() => setIsYearView(prev => !prev)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200",
                    isYearView
                      ? "bg-[#612a4f] text-white border-[#612a4f]"
                      : "bg-white text-[#612a4f] border-[#E8E4E6] hover:border-[#612a4f]/30"
                  )}
                >
                  {isYearView ? "By Month" : `All ${format(selectedMonth, "yyyy")} Deals`}
                </button>
              </div>
            )}

            {/* Dashboard Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8 sm:mb-10">
              <Card className="group p-4 sm:p-6 bg-white border border-[#D8C8D3] rounded-xl sm:rounded-2xl shadow-none">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <Wallet className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#8B7082]" strokeWidth={1.5} />
                  <p className="text-[9px] sm:text-[10px] text-[#8B7082] font-medium uppercase tracking-[0.08em] truncate">
                    {isYearView ? `${format(selectedMonth, "yyyy")} EARNINGS` : `${format(selectedMonth, "MMM").toUpperCase()} EARNINGS`}
                  </p>
                </div>
                <p className={`text-xl sm:text-[32px] font-normal text-[#612a4f] tracking-[-0.02em] leading-none transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                  ${isYearView ? metrics.yearlyEarnings.toLocaleString() : metrics.monthlyEarnings.toLocaleString()}
                </p>
              </Card>
              <Card className="group p-4 sm:p-6 bg-white border border-[#D8C8D3] rounded-xl sm:rounded-2xl shadow-none">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <ArrowUpRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#8B7082]" />
                  <p className="text-[9px] sm:text-[10px] text-[#8B7082] font-medium uppercase tracking-[0.08em] truncate">
                    {isYearView ? "TOTAL DEALS" : `${format(selectedMonth, "yyyy")} EARNINGS`}
                  </p>
                </div>
                <p className={`text-xl sm:text-[32px] font-normal text-[#612a4f] tracking-[-0.02em] leading-none transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                  {isYearView ? filteredDeals.length : `$${metrics.yearlyEarnings.toLocaleString()}`}
                </p>
              </Card>
              <Card className="group p-4 sm:p-6 bg-white border border-[#D8C8D3] rounded-xl sm:rounded-2xl shadow-none">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#8B7082]" strokeWidth={1.5} />
                  <p className="text-[9px] sm:text-[10px] text-[#8B7082] font-medium uppercase tracking-[0.08em] truncate">EXPECTED</p>
                </div>
                <p className={`text-xl sm:text-[32px] font-normal text-[#612a4f] tracking-[-0.02em] leading-none transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                  ${metrics.pendingAmount.toLocaleString()}
                </p>
              </Card>
              <Card className="group p-4 sm:p-6 bg-white border border-[#D8C8D3] rounded-xl sm:rounded-2xl shadow-none">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#8B7082]" viewBox="0 0 24 24" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" /></svg>
                  <p className="text-[9px] sm:text-[10px] text-[#8B7082] font-medium uppercase tracking-[0.08em] truncate">ACTIVE DEALS</p>
                </div>
                <p className={`text-xl sm:text-[32px] font-normal text-[#612a4f] tracking-[-0.02em] leading-none transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                  {metrics.activeDeals}
                </p>
              </Card>
            </div>

            {/* Toolbar */}
            <BrandsFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              paymentFilter={paymentFilter}
              setPaymentFilter={setPaymentFilter}
              showArchived={showArchived}
              setShowArchived={setShowArchived}
              archivedCount={archivedCount}
              onAddDeal={() => setIsAddDialogOpen(true)}
            />

            {/* Main Content */}
            <BrandsKanban
              dealsByStatus={dealsByStatus}
              selectedMonth={selectedMonth}
              isYearView={isYearView}
              showArchived={showArchived}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onEdit={setEditingDeal}
              onDelete={handleDeleteDeal}
              onArchive={handleArchiveDeal}
              onUnarchive={handleUnarchiveDeal}
              onQuickUpdate={handleUpdateDeal}
              onAddDeal={() => setIsAddDialogOpen(true)}
            />

            {/* Add/Edit Dialog */}
            <BrandDealDialog
              open={isAddDialogOpen || !!editingDeal}
              onOpenChange={(open) => {
                if (!open) {
                  setIsAddDialogOpen(false);
                  setEditingDeal(null);
                }
              }}
              deal={editingDeal}
              onSave={(deal) => {
                if (editingDeal) {
                  handleUpdateDeal(editingDeal.id, deal);
                } else {
                  handleAddDeal(deal as Omit<BrandDeal, 'id' | 'createdAt'>);
                }
              }}
            />
        </div>
      </div>
  );
};

export default Brands;
