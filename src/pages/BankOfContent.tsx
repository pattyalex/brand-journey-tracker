
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

const BankOfContent = () => {
  // Default pillars
  const defaultPillars = [
    { id: 1, name: "Pillar 1", content: "Content for Pillar 1" },
    { id: 2, name: "Pillar 2", content: "Content for Pillar 2" },
    { id: 3, name: "Pillar 3", content: "Content for Pillar 3" },
  ];

  // Load pillars from localStorage or use defaults
  const [pillars, setPillars] = useState(() => {
    const savedPillars = localStorage.getItem("contentPillars");
    return savedPillars ? JSON.parse(savedPillars) : defaultPillars;
  });
  
  const [activeTab, setActiveTab] = useState(pillars[0]?.id.toString());
  const [editingPillar, setEditingPillar] = useState<number | null>(null);
  const [newPillarName, setNewPillarName] = useState("");

  // Save pillars to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("contentPillars", JSON.stringify(pillars));
  }, [pillars]);

  const addNewPillar = () => {
    const newId = pillars.length > 0 ? Math.max(...pillars.map(p => p.id)) + 1 : 1;
    const newPillar = {
      id: newId,
      name: `Pillar ${newId}`,
      content: `Content for Pillar ${newId}`
    };
    
    setPillars([...pillars, newPillar]);
    setActiveTab(newId.toString());
    toast.success("New pillar added");
  };

  const startEditingPillar = (id: number, currentName: string) => {
    setEditingPillar(id);
    setNewPillarName(currentName);
  };

  const savePillarName = (id: number) => {
    if (newPillarName.trim() === "") {
      toast.error("Pillar name cannot be empty");
      return;
    }
    
    setPillars(pillars.map(pillar => 
      pillar.id === id ? { ...pillar, name: newPillarName } : pillar
    ));
    
    setEditingPillar(null);
    setNewPillarName("");
    toast.success("Pillar renamed");
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === "Enter") {
      savePillarName(id);
    } else if (e.key === "Escape") {
      setEditingPillar(null);
      setNewPillarName("");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-8 fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Bank of Content</h1>
          <Button onClick={addNewPillar} className="gap-2">
            <Plus size={16} />
            Add Pillar
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start mb-6 bg-gray-100 p-1 overflow-x-auto flex-nowrap">
              {pillars.map((pillar) => (
                <TabsTrigger 
                  key={pillar.id} 
                  value={pillar.id.toString()}
                  className="relative min-w-[120px] flex items-center justify-center gap-2"
                >
                  {editingPillar === pillar.id ? (
                    <Input
                      value={newPillarName}
                      onChange={(e) => setNewPillarName(e.target.value)}
                      onBlur={() => savePillarName(pillar.id)}
                      onKeyDown={(e) => handleKeyDown(e, pillar.id)}
                      autoFocus
                      className="h-8 w-full"
                    />
                  ) : (
                    <>
                      <span>{pillar.name}</span>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingPillar(pillar.id, pillar.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 absolute right-1"
                      >
                        <Pencil size={12} />
                      </Button>
                    </>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {pillars.map((pillar) => (
              <TabsContent key={pillar.id} value={pillar.id.toString()} className="p-4 border rounded-md">
                <h2 className="text-2xl font-semibold mb-4">{pillar.name}</h2>
                <p className="text-muted-foreground">
                  This is where content for {pillar.name} will be displayed. 
                  Add your content ideas, plans, and drafts here.
                </p>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default BankOfContent;
