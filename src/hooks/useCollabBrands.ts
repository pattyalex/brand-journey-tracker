
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CollabBrand, TableColumn } from "@/types/collab";

const DEFAULT_COLUMNS: TableColumn[] = [
  { key: 'brandName', title: 'Brand Name', editable: true },
  { key: 'contact', title: 'Contact', editable: true },
  { key: 'lastFollowUp', title: 'Last Follow-Up', editable: true },
  { key: 'status', title: 'Status', editable: true },
  { key: 'deliverables', title: 'Deliverables', editable: true },
  { key: 'rate', title: 'Rate', editable: true },
  { key: 'nextReminder', title: 'Next Reminder', editable: true },
];

export function useCollabBrands() {
  const [brands, setBrands] = useState<CollabBrand[]>([]);
  const [columns, setColumns] = useState<TableColumn[]>(DEFAULT_COLUMNS);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load initial data or from localStorage
    const savedBrands = localStorage.getItem('collabBrands');
    if (savedBrands) {
      setBrands(JSON.parse(savedBrands));
    } else {
      // Set default brand if no saved data
      setBrands([
        {
          id: '1',
          brandName: 'Brand X',
          contact: 'contact@brandx.com',
          lastFollowUp: 'April 20, 2025',
          status: 'Negotiation',
          deliverables: '3 Posts + 1 Story',
          rate: '$2,500',
          nextReminder: 'April 25, 2025',
        }
      ]);
    }

    // Load saved columns if available
    const savedColumns = localStorage.getItem('collabColumns');
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    }
  }, []);
  
  // Save brands to localStorage when they change
  useEffect(() => {
    localStorage.setItem('collabBrands', JSON.stringify(brands));
  }, [brands]);

  // Save columns to localStorage when they change
  useEffect(() => {
    localStorage.setItem('collabColumns', JSON.stringify(columns));
  }, [columns]);

  const handleUpdateBrand = (id: string, field: keyof CollabBrand, value: string) => {
    setBrands(brands.map(brand => 
      brand.id === id ? { ...brand, [field]: value } : brand
    ));
    
    toast({
      title: "Updated",
      description: "Brand information has been updated",
    });
  };
  
  const handleAddBrand = () => {
    const newBrand: CollabBrand = {
      id: Date.now().toString(),
      brandName: 'New Brand',
      contact: 'email@example.com',
      lastFollowUp: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      status: 'Sent',
      deliverables: 'TBD',
      rate: '$0',
      nextReminder: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    };
    
    setBrands([...brands, newBrand]);
    
    toast({
      title: "Brand added",
      description: "New brand has been added to the table",
    });
  };
  
  const handleDeleteBrand = (id: string) => {
    setBrands(brands.filter(brand => brand.id !== id));
    
    toast({
      title: "Brand deleted",
      description: "Brand has been removed from the table",
      variant: "destructive",
    });
  };

  const handleUpdateColumnTitle = (index: number, newTitle: string) => {
    const updatedColumns = [...columns];
    updatedColumns[index] = { ...updatedColumns[index], title: newTitle };
    setColumns(updatedColumns);
    
    toast({
      title: "Column renamed",
      description: "Column name has been updated",
    });
  };

  return {
    brands,
    columns,
    handleUpdateBrand,
    handleAddBrand,
    handleDeleteBrand,
    handleUpdateColumnTitle,
  };
}
