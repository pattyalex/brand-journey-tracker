
import { useState } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pillar } from "@/pages/BankOfContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Edit, Trash2, Plus } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

interface PillarTabsProps {
  pillars: Pillar[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onAddPillar: () => void;
  onRenamePillar: (pillarId: string, newName: string) => void;
  onDeletePillar: (pillarId: string) => void;
}

const PillarTabs = ({ 
  pillars, 
  activeTab, 
  onTabChange, 
  onAddPillar,
  onRenamePillar,
  onDeletePillar
}: PillarTabsProps) => {
  const [editingPillarId, setEditingPillarId] = useState<string | null>(null);
  const [editingPillarName, setEditingPillarName] = useState("");

  const startEditingPillar = (pillarId: string, currentName: string) => {
    setEditingPillarId(pillarId);
    setEditingPillarName(currentName);
  };

  const saveEditingPillar = () => {
    if (editingPillarId && editingPillarName.trim()) {
      onRenamePillar(editingPillarId, editingPillarName.trim());
      setEditingPillarId(null);
      setEditingPillarName("");
    }
  };

  const cancelEditingPillar = () => {
    setEditingPillarId(null);
    setEditingPillarName("");
  };

  const handlePillarNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditingPillar();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditingPillar();
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <TabsList className="bg-background border overflow-x-auto">
        {pillars.map((pillar) => (
          <div key={pillar.id} className="relative group flex items-center">
            {editingPillarId === pillar.id ? (
              <div className="px-3 py-1.5 flex items-center bg-primary text-primary-foreground rounded-sm">
                <Input
                  value={editingPillarName}
                  onChange={(e) => setEditingPillarName(e.target.value)}
                  onKeyDown={handlePillarNameKeyDown}
                  onBlur={saveEditingPillar}
                  autoFocus
                  className="h-6 px-1 py-0 text-sm w-32 bg-transparent border-0 focus-visible:ring-0 text-primary-foreground"
                  data-testid="edit-pillar-name-input"
                />
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={saveEditingPillar}
                  className="ml-1 text-primary-foreground hover:text-primary-foreground/90 hover:bg-transparent p-0 h-5 w-5"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={cancelEditingPillar}
                  className="text-primary-foreground hover:text-primary-foreground/90 hover:bg-transparent p-0 h-5 w-5"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <TabsTrigger 
                  value={pillar.id}
                  className={`data-[state=active]:bg-[#8B6B4E] data-[state=active]:text-white ${
                    pillar.id === "1" && activeTab === "1" ? "bg-[#8B6B4E] text-white" : ""
                  }`}
                  onDoubleClick={() => startEditingPillar(pillar.id, pillar.name)}
                  onClick={() => onTabChange(pillar.id)}
                >
                  {pillar.name}
                </TabsTrigger>
                
                <div className="absolute hidden group-hover:flex top-full left-0 z-50 bg-white border shadow-md rounded-md p-1 mt-1 flex-col w-32">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => startEditingPillar(pillar.id, pillar.name)}
                    className="justify-start"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Rename
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive justify-start"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {pillar.name} Pillar</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the "{pillar.name}" pillar and all its content. 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDeletePillar(pillar.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </div>
        ))}
      </TabsList>
      <Button variant="outline" size="sm" onClick={onAddPillar} className="ml-2 flex items-center">
        <Plus className="h-4 w-4 mr-2" /> Add Pillar
      </Button>
    </div>
  );
};

export default PillarTabs;
