import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CollabFilters from "@/components/collab/CollabFilters";
import BrandsCollabTable from "@/components/collab/BrandsCollabTable";
import { useCollabBrands } from "@/hooks/useCollabBrands";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const CollabManagement = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const navigate = useNavigate();
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

  const handleGoBack = () => {
    // Navigate to the partnerships management page explicitly
    navigate('/partnerships-management');
  };

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
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={handleGoBack} 
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back
        </Button>
      </div>

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