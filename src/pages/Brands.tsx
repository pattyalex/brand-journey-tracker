
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format, isSameMonth, isSameYear, addMonths, subMonths, addYears, subYears } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBrandsPage } from "@/components/brands/useBrandsPage";
import BrandsFilters from "@/components/brands/BrandsFilters";
import BrandsKanban from "@/components/brands/BrandsKanban";
import BrandDealDialog from "@/components/brands/BrandDealDialog";
import { BrandDeal } from "@/components/brands/brandsTypes";
import { useBrandDealsContext } from "@/contexts/BrandDealsContext";

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
  const { updateDeal } = useBrandDealsContext();

  const currentMonthName = format(selectedMonth, "MMM");
  const currentYear = format(selectedMonth, "yyyy");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 lg:px-10">

        {/* Hero stat row */}
        <div className="mb-8">
          <div className="flex items-baseline gap-3">
            <span
              className="text-[56px] font-medium text-gray-900 leading-none"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif", letterSpacing: '-0.02em' }}
            >
              ${filteredDeals.length > 0 ? metrics.yearlyEarnings.toLocaleString() : '0,000'}
            </span>
            <span className="text-[13px] text-[#8A8A8A]">earned in {currentYear}</span>
          </div>
          <div className="flex items-center gap-0 mt-2 text-[12px]">
            <span><span className="font-medium text-gray-900">{metrics.activeDeals}</span> <span className="text-[#8A8A8A]">active deal{metrics.activeDeals !== 1 ? 's' : ''}</span></span>
            <span className="text-[#D4D4D4] mx-2.5">&bull;</span>
            <span><span className="font-medium text-gray-900">${metrics.pendingAmount.toLocaleString()}</span> <span className="text-[#8A8A8A]">expected this month</span></span>
            <span className="text-[#D4D4D4] mx-2.5">&bull;</span>
            <span><span className="font-medium text-gray-900">${metrics.monthlyEarnings.toLocaleString()}</span> <span className="text-[#8A8A8A]">earned in {currentMonthName}</span></span>
          </div>
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] uppercase tracking-[0.06em] text-[#8A8A8A] font-medium">
            {showArchived ? 'Archived' : 'Active'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedMonth(prev => isYearView ? subYears(prev, 1) : subMonths(prev, 1))}
              className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-gray-500 font-medium select-none">
              {isYearView ? format(selectedMonth, "yyyy") : format(selectedMonth, "MMM yyyy")}
            </span>
            <button
              onClick={() => setSelectedMonth(prev => isYearView ? addYears(prev, 1) : addMonths(prev, 1))}
              className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Toolbar — hide in empty state */}
        {filteredDeals.length > 0 && <BrandsFilters
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
        />}

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
          onQuickUpdate={(id, updates) => {
            updateDeal(id, updates);
          }}
        />
      </div>
    </div>
  );
};

export default Brands;
