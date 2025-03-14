
import { useState } from "react";
import { Pillar } from "@/pages/BankOfContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Edit, Trash2, Plus, MoreHorizontal } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

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
    <div className="pillar-tabs-container rounded-lg mb-6">
      <div className="flex w-full">
        {pillars.map((pillar) => (
          <div key={pillar.id} className="relative flex">
            {editingPillarId === pillar.id ? (
              <div className="flex items-center bg-[#8B6B4E] text-white px-4 py-2">
                <Input
                  value={editingPillarName}
                  onChange={(e) => setEditingPillarName(e.target.value)}
                  onKeyDown={handlePillarNameKeyDown}
                  onBlur={saveEditingPillar}
                  autoFocus
                  className="h-7 px-1 py-0 text-base w-40 bg-transparent border-0 focus-visible:ring-0 text-white"
                  data-testid="edit-pillar-name-input"
                />
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={saveEditingPillar}
                  className="ml-1 text-white hover:text-white/90 hover:bg-transparent p-0 h-6 w-6"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={cancelEditingPillar}
                  className="text-white hover:text-white/90 hover:bg-transparent p-0 h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center">
                <button
                  className={`pillar-tab ${pillar.id === activeTab ? "active" : ""}`}
                  onClick={() => onTabChange(pillar.id)}
                >
                  {pillar.name}
                </button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="more-options-button px-2">
                      <MoreHorizontal className="h-5 w-5 tab-menu-icon" />
                    </button>
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
        
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                onClick={onAddPillar} 
                className="h-10 w-10 p-0 flex items-center justify-center text-purple-500"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add pillar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default PillarTabs;
