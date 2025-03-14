
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
import { Separator } from "@/components/ui/separator";

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
    <div className="flex flex-col mb-6 relative">
      <div className="flex items-center justify-between relative">
        <div className="flex items-center relative z-10">
          <TabsList className="bg-transparent border-0 overflow-x-auto flex items-center h-12 relative">
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
                      className={`relative px-5 py-2 text-base transition-colors
                        ${pillar.id === activeTab 
                          ? "bg-[#8B6B4E] text-white rounded-t-md shadow-sm" 
                          : "bg-transparent text-foreground hover:bg-muted/30"
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

      {/* Enhanced organic line that wraps the active pillar */}
      <div className="relative w-full h-[4px] mt-0">
        {/* Background line */}
        <div className="absolute top-0 left-0 w-full h-full bg-[#0EA5E9] opacity-40"></div>

        {/* The organic line effect with improved aesthetics */}
        {pillars.length > 0 && (
          <svg 
            className="absolute top-[-15px] left-0 w-full h-[24px] overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#0EA5E9" stopOpacity="1" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glowShadow" x="-20%" y="-40%" width="140%" height="180%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0EA5E9" floodOpacity="0.5" />
              </filter>
            </defs>
            
            <path 
              d={`
                M0,16 
                ${pillars.findIndex(p => p.id === activeTab) > 0 ? 
                  `C${Math.max(30, pillars.findIndex(p => p.id === activeTab) * 120 - 60)},14 
                   ${Math.max(60, pillars.findIndex(p => p.id === activeTab) * 120 - 40)},13 
                   ${Math.max(90, pillars.findIndex(p => p.id === activeTab) * 120 - 20)},16` : 
                  'L60,16'} 
                L${pillars.findIndex(p => p.id === activeTab) * 120 + 30},16 
                C${pillars.findIndex(p => p.id === activeTab) * 120 + 40},4 
                ${pillars.findIndex(p => p.id === activeTab) * 120 + 60},1 
                ${pillars.findIndex(p => p.id === activeTab) * 120 + 80},1 
                C${pillars.findIndex(p => p.id === activeTab) * 120 + 100},1 
                ${pillars.findIndex(p => p.id === activeTab) * 120 + 120},4 
                ${pillars.findIndex(p => p.id === activeTab) * 120 + 140},16 
                ${pillars.findIndex(p => p.id === activeTab) < pillars.length - 1 ? 
                  `C${((pillars.findIndex(p => p.id === activeTab) + 1) * 120 + 30)},14 
                   ${((pillars.findIndex(p => p.id === activeTab) + 1) * 120 + 60)},13 
                   ${((pillars.findIndex(p => p.id === activeTab) + 1) * 120 + 90)},16` : 
                  ''} 
                L100%,16
              `}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              filter="url(#glowShadow)"
              className="transition-all duration-500 ease-in-out"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default PillarTabs;
