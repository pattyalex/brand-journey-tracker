
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

// Export pillar color - using the same color for all pillars
export const pillarColor = {
  bg: '#8B6B4E',
  light: '#D4C4B0',
  text: 'text-[#8B6B4E]',
  veryLight: '#F5F1ED'
};

export const getPillarColor = (index: number) => {
  return pillarColor;
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

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <TabsList className="bg-background border overflow-x-auto flex items-center h-14 relative p-1 gap-1">
          {pillars.map((pillar, index) => {
            const color = getPillarColor(index);
            const isActive = activeTab === pillar.id;

            return (
              <div key={pillar.id} className="relative flex items-center">
                {editingPillarId === pillar.id ? (
                  <div
                    className="px-4 py-2 flex items-center text-white rounded-md"
                    style={{ backgroundColor: color.bg }}
                  >
                    <Input
                      value={editingPillarName}
                      onChange={(e) => setEditingPillarName(e.target.value)}
                      onKeyDown={handlePillarNameKeyDown}
                      onBlur={saveEditingPillar}
                      autoFocus
                      className="h-7 px-1 py-0 text-base w-40 bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-white/60"
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
                  <div className="relative group">
                    <TabsTrigger
                      value={pillar.id}
                      className={`px-5 py-2.5 text-base font-medium transition-all duration-300 relative overflow-hidden rounded-md border-2 ${
                        isActive
                          ? 'shadow-md scale-105'
                          : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                      }`}
                      style={{
                        backgroundColor: isActive ? color.bg : 'transparent',
                        borderColor: isActive ? color.bg : 'transparent',
                        color: isActive ? '#ffffff' : 'inherit',
                      }}
                      onClick={() => onTabChange(pillar.id)}
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startEditingPillar(pillar.id, pillar.name);
                      }}
                    >
                      <span className="relative z-10">
                        {pillar.name}
                      </span>
                      {isActive && (
                        <div
                          className="absolute bottom-0 left-0 right-0 h-1 animate-in slide-in-from-bottom-1 duration-300"
                          style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
                        />
                      )}
                    </TabsTrigger>

                    <button
                      className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDeletePillar(pillar.id);
                      }}
                    >
                      <X className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                    </button>
                  </div>
              )}
            </div>
            );
          })}
        </TabsList>
        
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button 
                  variant="ghost" 
                  onClick={onAddPillar} 
                  className="h-10 w-10 p-0 ml-6 bg-transparent"
                >
                  <Plus className="h-6 w-6 text-purple-500" />
                </Button>
              </div>
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
