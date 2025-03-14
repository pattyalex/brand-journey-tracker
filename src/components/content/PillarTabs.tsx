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

// Define the pillar color classes
export const getPillarColorClass = (pillarId: string): string => {
  switch (pillarId) {
    case "1":
      return "pillar-pink"; // Pastel Pink for Pillar 1
    case "2":
      return "pillar-green"; // Pastel Green for Pillar 2 
    case "3":
      return "pillar-yellow"; // Pastel Yellow for Pillar 3
    default:
      const id = parseInt(pillarId);
      if (id % 3 === 1) return "pillar-pink";
      if (id % 3 === 2) return "pillar-green";
      return "pillar-yellow";
  }
};

export const getPillarBgColor = (pillarId: string): string => {
  switch (pillarId) {
    case "1":
      return "#FFB6C1"; // Pastel Pink for Pillar 1
    case "2":
      return "#98FB98"; // Pastel Green for Pillar 2
    case "3":
      return "#FFFF99"; // Pastel Yellow for Pillar 3
    default:
      const id = parseInt(pillarId);
      if (id % 3 === 1) return "#FFB6C1";
      if (id % 3 === 2) return "#98FB98";
      return "#FFFF99";
  }
};

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

  // Get the active pillar tab color
  const getTabBgColor = (pillarId: string): string => {
    if (pillarId === activeTab) {
      return getPillarBgColor(pillarId);
    }
    return "";
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <TabsList className="bg-background border overflow-x-auto flex items-center h-12">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="relative flex items-center">
              {editingPillarId === pillar.id ? (
                <div className="px-4 py-2 flex items-center bg-primary text-primary-foreground rounded-sm">
                  <Input
                    value={editingPillarName}
                    onChange={(e) => setEditingPillarName(e.target.value)}
                    onKeyDown={handlePillarNameKeyDown}
                    onBlur={saveEditingPillar}
                    autoFocus
                    className="h-7 px-1 py-0 text-base w-40 bg-transparent border-0 focus-visible:ring-0 text-primary-foreground"
                    data-testid="edit-pillar-name-input"
                  />
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={saveEditingPillar}
                    className="ml-1 text-primary-foreground hover:text-primary-foreground/90 hover:bg-transparent p-0 h-6 w-6"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={cancelEditingPillar}
                    className="text-primary-foreground hover:text-primary-foreground/90 hover:bg-transparent p-0 h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center">
                  <TabsTrigger 
                    value={pillar.id}
                    className={`px-5 py-2 text-base text-foreground`}
                    onClick={() => onTabChange(pillar.id)}
                    style={{
                      backgroundColor: getTabBgColor(pillar.id),
                      color: pillar.id === activeTab ? 'white' : ''
                    }}
                  >
                    {pillar.name}
                  </TabsTrigger>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="ml-1 px-1 h-7 text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical className="h-4 w-4" />
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
        </TabsList>
        
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                onClick={onAddPillar} 
                className="h-10 w-10 p-0 ml-6 bg-transparent"
              >
                <Plus className="h-6 w-6 text-purple-500" />
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
