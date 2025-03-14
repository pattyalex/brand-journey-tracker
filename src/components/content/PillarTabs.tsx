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

  const getPillarColor = (pillarId: string) => {
    const colors = {
      "1": "#8B6B4E", // Brown
      "2": "#6E59A5", // Purple
      "3": "#0EA5E9", // Blue
    };
    
    return colors[pillarId as keyof typeof colors] || "#8B6B4E";
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center">
        <TabsList className="bg-background border overflow-x-auto flex items-center h-14 relative">
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
                    className={`px-6 py-3 text-lg font-medium relative ${
                      pillar.id === activeTab 
                        ? "bg-[var(--pillar-color)] text-white shadow-md z-10" 
                        : "bg-background text-foreground"
                    }`}
                    onClick={() => onTabChange(pillar.id)}
                    style={{
                      '--pillar-color': getPillarColor(pillar.id),
                      backgroundColor: pillar.id === activeTab ? getPillarColor(pillar.id) : '',
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                      borderTop: pillar.id === activeTab ? `4px solid ${getPillarColor(pillar.id)}` : '',
                      zIndex: pillar.id === activeTab ? 10 : 1,
                      transition: 'all 0.3s ease-in-out',
                      transform: pillar.id === activeTab ? 'translateY(-4px)' : 'none',
                      color: pillar.id === activeTab ? '#ffffff' : ''
                    } as React.CSSProperties}
                  >
                    {pillar.id === activeTab && (
                      <div className="absolute -top-2 left-3 w-3 h-3 bg-white rounded-full animate-pulse" 
                        style={{ 
                          boxShadow: `0 0 0 2px ${getPillarColor(pillar.id)}` 
                        }}
                      />
                    )}
                    <span>{pillar.name}</span>
                    
                    {pillar.id === activeTab && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-1 bg-white"
                        style={{ 
                          backgroundColor: getPillarColor(pillar.id),
                          boxShadow: `0 4px 6px -1px ${getPillarColor(pillar.id)}40`
                        }}
                      />
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
          
          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{
              backgroundColor: getPillarColor(activeTab),
              boxShadow: `0 4px 6px -1px ${getPillarColor(activeTab)}40`
            }}
          />
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
    </div>
  );
};

export default PillarTabs;
