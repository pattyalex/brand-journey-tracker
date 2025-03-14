
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

  // Get colors for different pillars
  const getPillarColor = (pillarId: string) => {
    const colors = {
      "1": "#F5F5F5", // Light gray for inactive
      "2": "#F5F5F5", 
      "3": "#F5F5F5",
    };
    
    return colors[pillarId as keyof typeof colors] || "#F5F5F5";
  };

  return (
    <div className="relative">
      <div className="flex items-center mb-0 relative">
        <TabsList className="bg-transparent border-b-0 overflow-x-auto flex items-center h-auto relative z-10">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="relative flex items-center">
              {editingPillarId === pillar.id ? (
                <div className="px-5 py-3 flex items-center bg-primary text-primary-foreground rounded-sm">
                  <Input
                    value={editingPillarName}
                    onChange={(e) => setEditingPillarName(e.target.value)}
                    onKeyDown={handlePillarNameKeyDown}
                    onBlur={saveEditingPillar}
                    autoFocus
                    className="h-8 px-2 py-0 text-base w-48 bg-transparent border-0 focus-visible:ring-0 text-primary-foreground"
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
                    className={`px-6 py-2 font-medium text-center relative rounded-t-lg transition-all duration-200 ease-in-out
                      ${pillar.id === activeTab ? "bg-white text-black font-bold h-14 z-20" : "bg-gray-100 text-foreground h-12 z-10"}`}
                    onClick={() => onTabChange(pillar.id)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderBottom: pillar.id === activeTab ? 'none' : '1px solid #e2e8f0',
                      minWidth: '120px',
                      fontSize: pillar.id === activeTab ? '1.1rem' : '1rem',
                      marginRight: '2px',
                    }}
                  >
                    {pillar.name}
                    
                    {/* Red line for active tab */}
                    {pillar.id === activeTab && (
                      <>
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500 rounded-t-sm"></div>
                        <div className="absolute top-0 left-0 w-[3px] h-full bg-red-500"></div>
                        <div className="absolute top-0 right-0 w-[3px] h-full bg-red-500"></div>
                      </>
                    )}
                  </TabsTrigger>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="ml-1 px-1 h-8 text-muted-foreground hover:text-foreground"
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
                className="h-12 w-12 p-0 ml-6 bg-transparent"
              >
                <Plus className="h-7 w-7 text-purple-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add pillar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Red line extension for content container */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500" 
        style={{ 
          display: activeTab ? 'block' : 'none',
          zIndex: 30
        }}>
      </div>
    </div>
  );
};

export default PillarTabs;
