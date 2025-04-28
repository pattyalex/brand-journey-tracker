import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CollabBrand, TableColumn } from "@/types/collab";

const DEFAULT_COLUMNS: TableColumn[] = [
  { key: 'brandName', title: 'Brand Name', editable: true },
  { key: 'contact', title: 'Contact', editable: true },
  { key: 'product', title: 'Product', editable: true },
  { key: 'status', title: 'Status', editable: true },
  { key: 'deliverables', title: 'Deliverables', editable: true },
  { key: 'rate', title: 'Rate', editable: true },
  { key: 'postDate', title: 'Post Date', editable: true },
  { key: 'depositPaid', title: 'Deposit Paid', editable: true },
  { key: 'finalPaymentDueDate', title: 'Final Payment Due Date', editable: true },
  { key: 'invoiceSent', title: 'Invoice Sent', editable: true },
  { key: 'paymentReceived', title: 'Payment Received', editable: true },
];

export function useCollabBrands() {
  const [brands, setBrands] = useState<CollabBrand[]>([]);
  const [columns, setColumns] = useState<TableColumn[]>(DEFAULT_COLUMNS);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load initial data or from localStorage
    const savedBrands = localStorage.getItem('collabBrands');
    if (savedBrands) {
      const parsedBrands = JSON.parse(savedBrands);
      // Add required fields if they don't exist
      const updatedBrands = parsedBrands.map((brand: CollabBrand) => ({
        ...brand,
        invoiceSent: brand.invoiceSent || "No",
        paymentReceived: brand.paymentReceived || "Unpaid",
        postDate: brand.postDate || "Not set"
      }));
      setBrands(updatedBrands);
    } else {
      // Set default brand if no saved data
      setBrands([
        {
          id: '1',
          brandName: 'Brand X',
          contact: 'contact@brandx.com',
          product: 'Beauty Products',
          status: 'Pitched',
          deliverables: '3 Posts + 1 Story',
          rate: '$2,500',
          postDate: 'Not set',
          depositPaid: 'No',
          finalPaymentDueDate: 'Not set',
          invoiceSent: 'No',
          paymentReceived: 'Unpaid',
        }
      ]);
    }

    // Load saved columns if available
    const savedColumns = localStorage.getItem('collabColumns');
    if (savedColumns) {
      const parsedColumns = JSON.parse(savedColumns);
      
      // Check if required columns already exist
      const postDateColumnExists = parsedColumns.some((col: TableColumn) => col.key === 'postDate');
      const invoiceSentColumnExists = parsedColumns.some((col: TableColumn) => col.key === 'invoiceSent');
      const paymentReceivedColumnExists = parsedColumns.some((col: TableColumn) => col.key === 'paymentReceived');
      
      let newColumns = [...parsedColumns];
      let columnsUpdated = false;
      
      // Add postDate column if it doesn't exist
      if (!postDateColumnExists) {
        const rateIndex = newColumns.findIndex(
          (col: TableColumn) => col.key === 'rate'
        );
        
        if (rateIndex !== -1) {
          newColumns.splice(rateIndex + 1, 0, { 
            key: 'postDate', 
            title: 'Post Date', 
            editable: true 
          });
          columnsUpdated = true;
        }
      }
      
      // Add invoiceSent column if it doesn't exist
      if (!invoiceSentColumnExists) {
        const finalPaymentIndex = newColumns.findIndex(
          (col: TableColumn) => col.key === 'finalPaymentDueDate'
        );
        
        if (finalPaymentIndex !== -1) {
          newColumns.splice(finalPaymentIndex + 1, 0, { 
            key: 'invoiceSent', 
            title: 'Invoice Sent', 
            editable: true 
          });
          columnsUpdated = true;
        }
      }
      
      // Add paymentReceived column if it doesn't exist
      if (!paymentReceivedColumnExists) {
        const invoiceSentIndex = newColumns.findIndex(
          (col: TableColumn) => col.key === 'invoiceSent'
        );
        
        if (invoiceSentIndex !== -1) {
          newColumns.splice(invoiceSentIndex + 1, 0, { 
            key: 'paymentReceived', 
            title: 'Payment Received', 
            editable: true 
          });
          columnsUpdated = true;
        }
      }
      
      if (columnsUpdated) {
        setColumns(newColumns);
      } else {
        setColumns(parsedColumns);
      }
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
      product: 'Product Details',
      status: 'Pitched',
      deliverables: 'TBD',
      rate: '$0',
      postDate: 'Not set',
      depositPaid: 'No',
      finalPaymentDueDate: 'Not set',
      invoiceSent: 'No',
      paymentReceived: 'Unpaid',
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

  const handleAddColumn = () => {
    // Create a unique key for the new column
    const timestamp = Date.now().toString();
    const newColumnKey = `column${timestamp}` as keyof CollabBrand;
    
    // Add the new column to the columns array
    const newColumn: TableColumn = {
      key: newColumnKey,
      title: "New Column",
      editable: true,
    };
    
    setColumns([...columns, newColumn]);
    
    // Add the new column property to all existing brands
    const updatedBrands = brands.map(brand => ({
      ...brand,
      [newColumnKey]: ""
    }));
    
    setBrands(updatedBrands);
    
    toast({
      title: "Column added",
      description: "New column has been added to the table",
    });
  };

  return {
    brands,
    columns,
    handleUpdateBrand,
    handleAddBrand,
    handleDeleteBrand,
    handleUpdateColumnTitle,
    handleAddColumn,
  };
}
