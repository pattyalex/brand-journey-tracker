
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import CollabFilters from "@/components/collab/CollabFilters";
import BrandsCollabTable from "@/components/collab/BrandsCollabTable";
import ModernBrandsTable from "@/components/collab/ModernBrandsTable";
import { useCollabBrands } from "@/hooks/useCollabBrands";
import Layout from "@/components/Layout";

export default function CollabManagement() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('Contract Signed');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const { 
    brands, 
    columns,
    loading, 
    error,
    handleAddNewBrand,
    handleUpdateBrand,
    handleDeleteBrand,
    handleUpdateColumnTitle,
    handleAddColumn,
    handleDeleteColumn
  } = useCollabBrands();

  const handleGoBack = () => {
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
    <Layout>
      <div className="w-full max-w-[1600px] mx-auto px-8 py-8">
        <ModernBrandsTable />
      </div>
    </Layout>
  );
}
