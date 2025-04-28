
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CollabBrand } from "@/types/collab";

export function useCollabBrands() {
  const [brands, setBrands] = useState<CollabBrand[]>([]);
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
  }, []);
  
  // Save brands to localStorage when they change
  useEffect(() => {
    localStorage.setItem('collabBrands', JSON.stringify(brands));
  }, [brands]);

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

  return {
    brands,
    handleUpdateBrand,
    handleAddBrand,
    handleDeleteBrand,
  };
}
