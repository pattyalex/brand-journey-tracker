
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CollabBrand, TableColumn } from "@/types/collab";
import { PROTECTED_COLUMNS, createNewBrand } from "./useCollabStorage";

export interface CollabActions {
  handleUpdateBrand: (id: string, field: keyof CollabBrand, value: string) => void;
  handleAddBrand: () => void;
  handleDeleteBrand: (id: string) => void;
  handleUpdateColumnTitle: (index: number, newTitle: string) => void;
  handleAddColumn: () => void;
  handleDeleteColumn: (columnKey: string) => void;
}

export function useCollabActions(
  brands: CollabBrand[],
  setBrands: React.Dispatch<React.SetStateAction<CollabBrand[]>>,
  columns: TableColumn[],
  setColumns: React.Dispatch<React.SetStateAction<TableColumn[]>>
): CollabActions {
  const { toast } = useToast();

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
    const newBrand = createNewBrand();
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
    if (PROTECTED_COLUMNS.includes(columnKey)) {
      toast({
        title: "Cannot delete column",
        description: "This is a required column and cannot be deleted",
        variant: "destructive",
      });
      return;
    }
    
    const updatedColumns = columns.filter(col => col.key !== columnKey);
    setColumns(updatedColumns);
    
    toast({
      title: "Column deleted",
      description: "Column has been removed from the table",
      variant: "destructive",
    });
  };

  return {
    handleUpdateBrand,
    handleAddBrand,
    handleDeleteBrand,
    handleUpdateColumnTitle,
    handleAddColumn,
    handleDeleteColumn,
  };
}
