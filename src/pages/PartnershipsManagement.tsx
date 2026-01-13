import { useState } from "react";
import { ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import CollabFilters from "@/components/collab/CollabFilters";
import BrandsCollabTable from "@/components/collab/BrandsCollabTable";
import { useCollabBrands } from "@/hooks/useCollabBrands";
import { useSidebar } from "@/components/ui/sidebar";

export default function PartnershipsManagement() {
  const [statusFilter, setStatusFilter] = useState<string>('Contract Signed');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const {
    brands,
    columns,
    handleAddNewBrand,
    handleDeleteBrand,
    handleUpdateBrand,
    handleUpdateColumnTitle,
    handleAddColumn,
    handleDeleteColumn,
  } = useCollabBrands();

  const { state, toggleSidebar } = useSidebar();

  const loading = false;
  const error = null;

  const filteredBrands = brands.filter(brand => {
    // Apply status filter if not 'all'
    if (statusFilter && statusFilter !== 'all' && brand.status !== statusFilter) return false;

    // Apply payment status filter if not 'all'
    if (paymentStatusFilter && paymentStatusFilter !== 'all') {
      if (paymentStatusFilter === 'paid' && brand.paymentReceived !== 'Paid') return false;
      if (paymentStatusFilter === 'unpaid' && brand.paymentReceived !== 'Unpaid') return false;
      if (paymentStatusFilter === 'overdue' && brand.paymentReceived !== 'Overdue') return false;
    }

    return true;
  });

  return (
    <div className="w-full h-full mx-auto px-8 py-6 bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white shadow-md hover:bg-white hover:shadow-lg transition-all"
            onClick={toggleSidebar}
            aria-label={state === "collapsed" ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={`h-5 w-5 transition-transform duration-200 ${state === 'collapsed' ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-3 items-center flex-wrap">
              <CollabFilters
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                paymentStatusFilter={paymentStatusFilter}
                setPaymentStatusFilter={setPaymentStatusFilter}
              />
            </div>
            <Button
              onClick={handleAddNewBrand}
              className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm"
            >
              + Add Partnership
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600">Loading partnerships data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-red-200">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <BrandsCollabTable
            brands={filteredBrands}
            columns={columns}
            handleUpdateBrand={handleUpdateBrand}
            handleAddBrand={handleAddNewBrand}
            handleDeleteBrand={handleDeleteBrand}
            handleUpdateColumnTitle={handleUpdateColumnTitle}
            handleAddColumn={handleAddColumn}
            handleDeleteColumn={handleDeleteColumn}
          />
        )}
      </div>
    </div>
  );
}