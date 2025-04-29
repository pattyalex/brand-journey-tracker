
import { useState } from "react";
import CollabFilters from "@/components/collab/CollabFilters";
import BrandsCollabTable from "@/components/collab/BrandsCollabTable";
import { useCollabBrands } from "@/hooks/useCollabBrands";

const CollabManagement = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const { 
    brands, 
    columns, 
    handleUpdateBrand, 
    handleAddBrand, 
    handleDeleteBrand,
    handleUpdateColumnTitle,
    handleAddColumn,
    handleDeleteColumn
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
    <div className="container mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Partnerships Management</h1>
        <CollabFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          paymentStatusFilter={paymentStatusFilter}
          setPaymentStatusFilter={setPaymentStatusFilter}
        />
      </header>

      <BrandsCollabTable
        brands={filteredBrands}
        columns={columns}
        handleUpdateBrand={handleUpdateBrand}
        handleAddBrand={handleAddBrand}
        handleDeleteBrand={handleDeleteBrand}
        handleUpdateColumnTitle={handleUpdateColumnTitle}
        handleAddColumn={handleAddColumn}
        handleDeleteColumn={handleDeleteColumn}
      />
    </div>
  );
};

export default CollabManagement;
