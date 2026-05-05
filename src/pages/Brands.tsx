
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format, isSameMonth, isSameYear, addMonths, subMonths, addYears, subYears } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowUpRight,
  Wallet,
  Archive,
  Sparkles,
} from "lucide-react";
import { useBrandsPage } from "@/components/brands/useBrandsPage";
import BrandsFilters from "@/components/brands/BrandsFilters";
import BrandsKanban from "@/components/brands/BrandsKanban";
import BrandDealDialog from "@/components/brands/BrandDealDialog";
import { BrandDeal } from "@/components/brands/brandsTypes";
import { useBrandDealsContext } from "@/contexts/BrandDealsContext";

const summaryCards = [
  { key: 'earnings', icon: Wallet, tint: 'bg-[#612a4f]/10', iconTint: 'text-[#612a4f]' },
  { key: 'yearly', icon: ArrowUpRight, tint: 'bg-blue-100', iconTint: 'text-blue-600' },
  { key: 'expected', icon: Clock, tint: 'bg-amber-100', iconTint: 'text-amber-600' },
  { key: 'active', icon: Sparkles, tint: 'bg-emerald-100', iconTint: 'text-emerald-600' },
];

const cardStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const cardFade = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] } },
};

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

  const isZero = (v: number) => v === 0;
  const cardData = [
    { label: isYearView ? `${format(selectedMonth, "yyyy")} Earnings` : `${format(selectedMonth, "MMM")} Earnings`, value: `$${isYearView ? metrics.yearlyEarnings.toLocaleString() : metrics.monthlyEarnings.toLocaleString()}`, zero: isZero(isYearView ? metrics.yearlyEarnings : metrics.monthlyEarnings) },
    { label: isYearView ? "Total Deals" : `${format(selectedMonth, "yyyy")} Earnings`, value: isYearView ? filteredDeals.length.toString() : `$${metrics.yearlyEarnings.toLocaleString()}`, zero: isYearView ? filteredDeals.length === 0 : isZero(metrics.yearlyEarnings) },
    { label: "Expected", value: `$${metrics.pendingAmount.toLocaleString()}`, zero: isZero(metrics.pendingAmount) },
    { label: "Active Deals", value: metrics.activeDeals.toString(), zero: isZero(metrics.activeDeals) },
  ];

  return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 lg:px-10">

            {/* Month Picker */}
            {showArchived ? (
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={() => setShowArchived(false)}
                  className="p-2 rounded-lg border border-gray-200 hover:border-[#612a4f]/20 hover:bg-white transition-all duration-200 text-gray-400 hover:text-[#612a4f]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-sm font-semibold text-gray-800">Archive</h2>
                  <p className="text-[11px] text-gray-400">{archivedCount} deals</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => setSelectedMonth(prev => isYearView ? subYears(prev, 1) : subMonths(prev, 1))}
                    className="p-0.5 text-gray-300 hover:text-gray-500 transition-colors duration-150"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                  <h2 className="text-sm font-semibold text-gray-800 select-none px-0.5">
                    {isYearView ? format(selectedMonth, "yyyy") : format(selectedMonth, "MMMM yyyy")}
                  </h2>
                  <button
                    onClick={() => setSelectedMonth(prev => isYearView ? addYears(prev, 1) : addMonths(prev, 1))}
                    className="p-0.5 text-gray-300 hover:text-gray-500 transition-colors duration-150"
                  >
                    <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
                {(isYearView ? !isSameYear(selectedMonth, new Date()) : !isSameMonth(selectedMonth, new Date())) && (
                  <button
                    onClick={() => setSelectedMonth(new Date())}
                    className="text-[11px] text-gray-400 hover:text-[#612a4f] transition-colors duration-200"
                  >
                    Today
                  </button>
                )}
                <button
                  onClick={() => setIsYearView(prev => !prev)}
                  className={cn(
                    "text-[11px] font-medium transition-colors duration-200",
                    isYearView
                      ? "text-[#612a4f]"
                      : "text-gray-400 hover:text-[#612a4f]"
                  )}
                >
                  {isYearView ? "By Month" : `All ${format(selectedMonth, "yyyy")} Deals`}
                </button>
              </div>
            )}

            {/* Dashboard Summary Cards */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8"
              variants={cardStagger}
              initial="hidden"
              animate="show"
            >
              {summaryCards.map((card, i) => {
                const data = cardData[i];
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.key}
                    variants={cardFade}
                    className="relative bg-white rounded-lg border border-gray-100 p-4 overflow-hidden group shadow-[0_1px_3px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">
                        {data.label}
                      </p>
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center -mt-0.5 -mr-0.5", card.tint)}>
                        <Icon className={cn("w-3.5 h-3.5", card.iconTint)} strokeWidth={1.5} />
                      </div>
                    </div>
                    <p className={cn(
                      "text-xl font-bold text-gray-900 tracking-tight leading-none transition-all duration-300",
                      isReady ? 'opacity-100' : 'opacity-0',
                      'text-gray-900'
                    )} style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {data.value}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Toolbar — hidden when no deals */}
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
