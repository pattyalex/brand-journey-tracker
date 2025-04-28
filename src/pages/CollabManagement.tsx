
import { useState } from "react";
import CollabFilters from "@/components/collab/CollabFilters";
import BrandsCollabTable from "@/components/collab/BrandsCollabTable";
import CampaignCardSection from "@/components/collab/CampaignCardSection";
import CampaignWorkspace from "@/components/collab/CampaignWorkspace";
import { useCollabBrands } from "@/hooks/useCollabBrands";

const CollabManagement = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const { 
    brands, 
    columns, 
    handleUpdateBrand, 
    handleAddBrand, 
    handleDeleteBrand,
    handleUpdateColumnTitle
  } = useCollabBrands();

  const filteredBrands = brands.filter(brand => {
    if (statusFilter && statusFilter !== 'all' && brand.status !== statusFilter) return false;
    // We would implement payment status filter here if we had that field
    return true;
  });

  return (
    <div className="container mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Collab & Brand Management</h1>
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
      />

      <CampaignCardSection
        selectedCampaign={selectedCampaign}
        setSelectedCampaign={setSelectedCampaign}
      />

      {selectedCampaign && (
        <CampaignWorkspace campaignName={selectedCampaign} />
      )}
    </div>
  );
};

export default CollabManagement;
