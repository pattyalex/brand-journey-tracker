
import { useState } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pillar } from "@/pages/BankOfContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Edit, Trash2, Plus, MoreVertical, Bookmark } from "lucide-react";
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

// Define pillar color schemes with a visual folder-like appearance
const pillarColors = [
  {
    tabBg: "bg-purple-600", 
    tabBgActive: "bg-purple-700",
    textColor: "text-white",
    borderColor: "border-purple-800",
    tabHighlight: "after:bg-purple-300"
  },
  {
    tabBg: "bg-orange-500", 
    tabBgActive: "bg-orange-600",
    textColor: "text-white",
    borderColor: "border-orange-700",
    tabHighlight: "after:bg-orange-300"
  },
  {
    tabBg: "bg-teal-500", 
    tabBgActive: "bg-teal-600",
    textColor: "text-white",
    borderColor: "border-teal-700",
    tabHighlight: "after:bg-teal-300"
  },
  {
    tabBg: "bg-pink-500", 
    tabBgActive: "bg-pink-600",
    textColor: "text-white",
    borderColor: "border-pink-700",
    tabHighlight: "after:bg-pink-300"
  },
  {
    tabBg: "bg-blue-500", 
    tabBgActive: "bg-blue-600",
    textColor: "text-white",
    borderColor: "border-blue-700",
    tabHighlight: "after:bg-blue-300"
  },
  {
    tabBg: "bg-green-500", 
    tabBgActive: "bg-green-600",
    textColor: "text-white",
    borderColor: "border-green-700",
    tabHighlight: "after:bg-green-300"
  },
];

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

  // Get color scheme based on pillar index
  const getPillarColorScheme = (pillarIndex: number) => {
    const colorIndex = pillarIndex % pillarColors.length;
    return pillarColors[colorIndex];
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <TabsList className="bg-background border overflow-x-auto flex items-center rounded-lg shadow-md">
          {pillars.map((pillar, index) => {
            const colorScheme = getPillarColorScheme(index);
            return (
              <div key={pillar.id} className="relative flex items-center">
                {editingPillarId === pillar.id ? (
                  <div className={`px-3 py-1.5 flex items-center ${colorScheme.tabBgActive} ${colorScheme.textColor} rounded-t-lg`}>
                    <Input
                      value={editingPillarName}
                      onChange={(e) => setEditingPillarName(e.target.value)}
                      onKeyDown={handlePillarNameKeyDown}
                      onBlur={saveEditingPillar}
                      autoFocus
                      className={`h-6 px-1 py-0 text-sm w-32 bg-transparent border-0 focus-visible:ring-0 ${colorScheme.textColor}`}
                      data-testid="edit-pillar-name-input"
                    />
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={saveEditingPillar}
                      className={`ml-1 ${colorScheme.textColor} hover:${colorScheme.textColor}/90 hover:bg-transparent p-0 h-5 w-5`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={cancelEditingPillar}
                      className={`${colorScheme.textColor} hover:${colorScheme.textColor}/90 hover:bg-transparent p-0 h-5 w-5`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center relative">
                    <TabsTrigger 
                      value={pillar.id}
                      className={`relative transition-all duration-200 ${colorScheme.textColor} ${
                        pillar.id === activeTab 
                          ? `${colorScheme.tabBgActive} border-t-2 border-l-2 border-r-2 ${colorScheme.borderColor} rounded-t-lg rounded-b-none z-10 after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:w-full after:h-1 ${colorScheme.tabHighlight}` 
                          : `${colorScheme.tabBg} hover:brightness-110`
                      }`}
                      onClick={() => onTabChange(pillar.id)}
                    >
                      {pillar.id === activeTab && (
                        <Bookmark className="h-3 w-3 absolute -left-1 -top-1 text-white opacity-70" />
                      )}
                      {pillar.name}
                      {pillar.id === activeTab && (
                        <div className={`absolute bottom-0 left-0 w-full h-1 ${colorScheme.tabBgActive}`}></div>
                      )}
                    </TabsTrigger>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="xs"
                          className={`ml-1 px-1 h-6 ${
                            pillar.id === activeTab 
                              ? colorScheme.textColor 
                              : "text-muted-foreground hover:text-foreground"
                          }`}
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
            );
          })}
        </TabsList>
        
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline"
                onClick={onAddPillar} 
                className="h-8 w-8 p-0 ml-6 hover:border-purple-500 text-purple-500 bg-transparent"
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
