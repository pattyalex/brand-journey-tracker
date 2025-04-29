import { useState } from "react";
import { ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import CollabFilters from "@/components/collab/CollabFilters";
import BrandsCollabTable from "@/components/collab/BrandsCollabTable";
import { useCollabBrands } from "@/hooks/useCollabBrands";
import Layout from "@/components/Layout";

export default function CollabManagement() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const { 
    brands, 
    loading, 
    error,
    handleAddNewBrand,
  } = useCollabBrands();

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
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Partnerships Management</h1>
          <CollabFilters
            onStatusChange={setStatusFilter} 
            onPaymentStatusChange={setPaymentStatusFilter}
            onAddNewBrand={handleAddNewBrand}
          />
        </header>

        {loading ? (
          <div className="text-center py-8">Loading partnerships data...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <BrandsCollabTable brands={filteredBrands} />
        )}
      </div>
    </Layout>
  );
}