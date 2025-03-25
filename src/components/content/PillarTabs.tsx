
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
import { motion } from "framer-motion";

// Refined color palette with more elegant, less saturated colors
const PILLAR_COLORS = [
  "#7C3AED", // Deep purple
  "#0CA678", // Teal
  "#E67E22", // Soft orange
  "#9B59B6", // Lavender
  "#3498DB", // Sky blue
  "#C0392B", // Crimson
  "#16A085", // Green teal
  "#D35400", // Burnt orange
];

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

  // Get color for a pillar based on its index
  const getPillarColor = (index: number): string => {
    return PILLAR_COLORS[index % PILLAR_COLORS.length];
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex flex-col">
        <div className="flex items-center mb-1">
          <h3 className="text-sm font-medium text-gray-500 mr-2">Content Categories</h3>
        </div>
        <div className="flex items-center">
          <TabsList className="bg-gray-50 border shadow-sm overflow-x-auto flex items-center h-12 relative">
            {pillars.map((pillar, index) => {
              const pillColor = getPillarColor(index);
              return (
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
                    <div className="flex items-center relative">
                      <TabsTrigger 
                        value={pillar.id}
                        pillColor={pillColor}
                        className={`relative px-5 py-3 text-base transition-all duration-300
                          ${activeTab === pillar.id 
                            ? "text-gray-800 font-medium" 
                            : "text-gray-600 hover:text-gray-800"}`}
                        style={{
                          backgroundColor: activeTab === pillar.id ? `${pillColor}10` : 'transparent',
                          borderLeft: activeTab === pillar.id ? `3px solid ${pillColor}` : `3px solid transparent`,
                          boxShadow: activeTab === pillar.id ? `0 2px 8px ${pillColor}25` : 'none',
                        }}
                        onClick={() => onTabChange(pillar.id)}
                      >
                        {activeTab === pillar.id && (
                          <motion.div 
                            className="absolute inset-0 -z-10" 
                            layoutId="activeTab"
                            style={{ 
                              borderBottom: `2px solid ${pillColor}`,
                              backgroundColor: `${pillColor}10`,
                              borderRadius: '0.25rem',
                            }}
                            transition={{ type: "spring", duration: 0.5 }}
                          />
                        )}
                        <span
                          style={{ 
                            color: activeTab === pillar.id ? pillColor : 'inherit',
                            fontWeight: activeTab === pillar.id ? '600' : 'normal'
                          }}
                        >
                          {pillar.name}
                        </span>
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
              );
            })}
          </TabsList>
          
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    variant="outline" 
                    onClick={onAddPillar} 
                    className="h-10 w-10 p-0 ml-6 border-gray-200"
                  >
                    <Plus className="h-5 w-5 text-gray-600" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add pillar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default PillarTabs;
