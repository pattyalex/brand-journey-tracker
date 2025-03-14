
import { useState } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pillar } from "@/pages/BankOfContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Edit, Trash2, Plus, MoreVertical } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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
      <TabsList className="bg-background border overflow-x-auto flex items-end">
        {pillars.map((pillar) => (
          <div key={pillar.id} className="relative flex items-center">
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
              <div className="flex items-center">
                <TabsTrigger 
                  value={pillar.id}
                  className={`data-[state=active]:bg-[#8B6B4E] data-[state=active]:text-white ${
                    pillar.id === "1" && activeTab === "1" ? "bg-[#8B6B4E] text-white" : ""
                  }`}
                  onClick={() => onTabChange(pillar.id)}
                >
                  {pillar.name}
                </TabsTrigger>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="xs"
                      className="ml-1 px-1 h-6 text-muted-foreground hover:text-foreground"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40">
                    <DropdownMenuItem onClick={() => startEditingPillar(pillar.id, pillar.name)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        ))}
        
        {/* Add Pillar Button - now more compact and right after the tabs */}
        <div className="flex flex-col items-center mx-2 mb-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onAddPillar} 
            className="h-8 w-8 rounded-full hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="text-[10px] text-muted-foreground -mt-1">Add Pillar</span>
        </div>
      </TabsList>
      
      {/* Removed the original Add Pillar button that was here */}
    </div>
  );
};

export default PillarTabs;
