import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CollabBrand, TableColumn } from "@/types/collab";

const DEFAULT_COLUMNS: TableColumn[] = [
  { key: 'brandName', title: 'Brand Name', editable: true },
  { key: 'contact', title: 'Contact', editable: true },
  { key: 'product', title: 'Product', editable: true },
  { key: 'status', title: 'Status', editable: true },
  { key: 'deliverables', title: 'Deliverables', editable: true },
  { key: 'briefContract', title: 'Brief/Contract Terms', editable: true },
  { key: 'rate', title: 'Rate', editable: true },
  { key: 'postDate', title: 'Post Date', editable: true },
  { key: 'depositPaid', title: 'Deposit Paid', editable: true },
  { key: 'finalPaymentDueDate', title: 'Final Payment Due Date', editable: true },
  { key: 'invoiceSent', title: 'Invoice Sent', editable: true },
  { key: 'paymentReceived', title: 'Payment Received', editable: true },
  { key: 'notes', title: 'Notes', editable: true },
];

export function useCollabBrands() {
  const [brands, setBrands] = useState<CollabBrand[]>([]);
  const [columns, setColumns] = useState<TableColumn[]>(DEFAULT_COLUMNS);
  const { toast } = useToast();
  
  useEffect(() => {
    const savedBrands = localStorage.getItem('collabBrands');
    if (savedBrands) {
      const parsedBrands = JSON.parse(savedBrands);
      const updatedBrands = parsedBrands.map((brand: CollabBrand) => ({
        ...brand,
        invoiceSent: brand.invoiceSent || "No",
        paymentReceived: brand.paymentReceived || "Unpaid",
        postDate: brand.postDate || "Not set",
        briefContract: brand.briefContract || "None",
        notes: brand.notes || "None"
      }));
      setBrands(updatedBrands);
    } else {
      setBrands([
        {
          id: '1',
          brandName: 'Brand X',
          contact: 'contact@brandx.com',
          product: 'Beauty Products',
          status: 'Pitched',
          deliverables: '3 Posts + 1 Story',
          briefContract: 'None',
          rate: '$2,500',
          postDate: 'Not set',
          depositPaid: 'No',
          finalPaymentDueDate: 'Not set',
          invoiceSent: 'No',
          paymentReceived: 'Unpaid',
          notes: 'None',
        }
      ]);
    }

    const savedColumns = localStorage.getItem('collabColumns');
    if (savedColumns) {
      const parsedColumns = JSON.parse(savedColumns);
      
      const postDateColumnExists = parsedColumns.some((col: TableColumn) => col.key === 'postDate');
      const invoiceSentColumnExists = parsedColumns.some((col: TableColumn) => col.key === 'invoiceSent');
      const paymentReceivedColumnExists = parsedColumns.some((col: TableColumn) => col.key === 'paymentReceived');
      const briefContractColumnExists = parsedColumns.some((col: TableColumn) => col.key === 'briefContract');
      const notesColumnExists = parsedColumns.some((col: TableColumn) => col.key === 'notes');
      
      let newColumns = [...parsedColumns];
      let columnsUpdated = false;
      
      if (!briefContractColumnExists) {
        const deliverablesIndex = newColumns.findIndex(
          (col: TableColumn) => col.key === 'deliverables'
        );
        
        if (deliverablesIndex !== -1) {
          newColumns.splice(deliverablesIndex + 1, 0, { 
            key: 'briefContract', 
            title: 'Brief/Contract Terms', 
            editable: true 
          });
          columnsUpdated = true;
        }
      }
      
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
      
      if (!notesColumnExists) {
        const paymentReceivedIndex = newColumns.findIndex(
          (col: TableColumn) => col.key === 'paymentReceived'
        );
        
        if (paymentReceivedIndex !== -1) {
          newColumns.splice(paymentReceivedIndex + 1, 0, { 
            key: 'notes', 
            title: 'Notes', 
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
  
  useEffect(() => {
    localStorage.setItem('collabBrands', JSON.stringify(brands));
  }, [brands]);

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
      briefContract: 'None',
      rate: '$0',
      postDate: 'Not set',
      depositPaid: 'No',
      finalPaymentDueDate: 'Not set',
      invoiceSent: 'No',
      paymentReceived: 'Unpaid',
      notes: 'None',
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
    const timestamp = Date.now().toString();
    const newColumnKey = `column${timestamp}` as keyof CollabBrand;
    
    const newColumn: TableColumn = {
      key: newColumnKey,
      title: "New Column",
      editable: true,
    };
    
    setColumns([...columns, newColumn]);
    
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

  const handleDeleteColumn = (columnKey: string) => {
    const defaultColumnKeys = DEFAULT_COLUMNS.map(col => col.key);
    if (defaultColumnKeys.includes(columnKey as any)) {
      toast({
        title: "Cannot delete default column",
        description: "This is a system column and cannot be removed",
        variant: "destructive",
      });
      return;
    }
    
    const updatedColumns = columns.filter(col => col.key !== columnKey);
    setColumns(updatedColumns);
    
    const updatedBrands = brands.map(brand => {
      const newBrand = { ...brand };
      const brandObj = newBrand as any;
      if (columnKey in brandObj) {
        delete brandObj[columnKey];
      }
      return newBrand;
    });
    
    setBrands(updatedBrands);
    
    toast({
      title: "Column deleted",
      description: "The column has been removed from the table",
      variant: "destructive",
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
    handleDeleteColumn,
  };
}
