
import { useState, useEffect } from "react";
import { CollabBrand, TableColumn } from "@/types/collab";
import { 
  loadBrands, 
  loadColumns, 
  saveBrands, 
  saveColumns 
} from "@/hooks/collab/useCollabStorage";
import { 
  useCollabActions,
  type CollabActions 
} from "@/hooks/collab/useCollabActions";

export function useCollabBrands() {
  const [brands, setBrands] = useState<CollabBrand[]>([]);
  const [columns, setColumns] = useState<TableColumn[]>([]);
  
  // Load initial data
  useEffect(() => {
    const initialBrands = loadBrands();
    setBrands(initialBrands);

    const initialColumns = loadColumns();
    setColumns(initialColumns);
  }, []);
  
  // Save data when it changes
  useEffect(() => {
    if (brands.length > 0) {
      saveBrands(brands);
    }
  }, [brands]);

  useEffect(() => {
    if (columns.length > 0) {
      saveColumns(columns);
    }
  }, [columns]);

  // Get all action handlers
  const actions = useCollabActions(brands, setBrands, columns, setColumns);

  return {
    brands,
    columns,
    ...actions
  };
}
