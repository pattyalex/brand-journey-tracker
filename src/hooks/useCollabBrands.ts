
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CollabBrand, TableColumn } from "@/types/collab";

export function useCollabBrands() {
  const [brands, setBrands] = useState<CollabBrand[]>([]);
  const [columns, setColumns] = useState<TableColumn[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load initial data or from localStorage
    const savedBrands = localStorage.getItem('collabBrands');
    const savedColumns = localStorage.getItem('collabColumns');
    
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

    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    } else {
      // Set default columns if no saved data
      setColumns([
        { id: '1', name: 'Brand Name', key: 'brandName' },
        { id: '2', name: 'Contact', key: 'contact' },
        { id: '3', name: 'Last Follow-Up', key: 'lastFollowUp' },
        { id: '4', name: 'Status', key: 'status' },
        { id: '5', name: 'Deliverables', key: 'deliverables' },
        { id: '6', name: 'Rate', key: 'rate' },
        { id: '7', name: 'Next Reminder', key: 'nextReminder' },
      ]);
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

  const handleUpdateBrand = (id: string, field: string, value: string) => {
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
    };
    
    // Add all current column keys with default values
    columns.forEach(column => {
      if (column.key === 'brandName') {
        newBrand[column.key] = 'New Brand';
      } else if (column.key === 'contact') {
        newBrand[column.key] = 'email@example.com';
      } else if (column.key === 'status') {
        newBrand[column.key] = 'Sent';
      } else if (column.key === 'lastFollowUp' || column.key === 'nextReminder') {
        newBrand[column.key] = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      } else if (column.key === 'rate') {
        newBrand[column.key] = '$0';
      } else {
        newBrand[column.key] = 'TBD';
      }
    });
    
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

  const handleAddColumn = (columnName: string) => {
    const columnKey = columnName.toLowerCase().replace(/\s+/g, '');
    const newColumn: TableColumn = {
      id: Date.now().toString(),
      name: columnName,
      key: columnKey,
    };

    // Add the new column to all existing brands with default value
    setBrands(brands.map(brand => ({
      ...brand,
      [columnKey]: 'TBD'
    })));

    setColumns([...columns, newColumn]);
    
    toast({
      title: "Column added",
      description: `New column "${columnName}" has been added`,
    });
  };

  const handleDeleteColumn = (columnId: string) => {
    const columnToDelete = columns.find(col => col.id === columnId);
    
    if (!columnToDelete) return;

    // Remove the column from all brands
    setBrands(brands.map(brand => {
      const newBrand = { ...brand };
      delete newBrand[columnToDelete.key];
      return newBrand;
    }));

    setColumns(columns.filter(col => col.id !== columnId));
    
    toast({
      title: "Column deleted",
      description: `Column "${columnToDelete.name}" has been removed`,
      variant: "destructive",
    });
  };

  return {
    brands,
    columns,
    handleUpdateBrand,
    handleAddBrand,
    handleDeleteBrand,
    handleAddColumn,
    handleDeleteColumn,
  };
}
