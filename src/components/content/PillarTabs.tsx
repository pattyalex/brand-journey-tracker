
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
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div 
      className="flex items-center justify-between mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center">
        <TabsList className="bg-background border overflow-x-auto flex items-center h-12 relative">
          <motion.div 
            className="absolute bottom-0 h-1 bg-[#8B6B4E]" 
            layoutId="tab-underline"
            style={{
              width: "100%",
              left: 0,
              right: 0,
              height: "2px"
            }}
          />
          
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
                <div className="flex items-center relative">
                  <TabsTrigger 
                    value={pillar.id}
                    className={`relative px-5 py-2 text-base transition-all duration-300 overflow-hidden z-10
                      ${activeTab === pillar.id ? "text-white font-medium" : "text-gray-700 hover:text-gray-900"}`}
                    onClick={() => onTabChange(pillar.id)}
                  >
                    {/* Animated background for active tab */}
                    {activeTab === pillar.id && (
                      <motion.div 
                        className="absolute inset-0 bg-[#8B6B4E] -z-10"
                        layoutId="pillar-background"
                        style={{ borderRadius: '0.375rem' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                    
                    {/* Text animation */}
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`${pillar.id}-${activeTab === pillar.id ? 'active' : 'inactive'}`}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                      >
                        {pillar.name}
                      </motion.span>
                    </AnimatePresence>
                    
                    {/* Bottom highlight for active tab */}
                    {activeTab === pillar.id && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 bg-white"
                        layoutId="active-tab-highlight"
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ 
                          scaleX: 1, 
                          opacity: 1,
                          height: "3px",
                          y: 2
                        }}
                        style={{ 
                          originX: 0,
                          width: "100%"
                        }}
                        transition={{ 
                          duration: 0.5,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                      />
                    )}
                    
                    {/* Ripple effect when clicked */}
                    {activeTab === pillar.id && (
                      <motion.div
                        initial={{ scale: 0, x: "-50%", y: "-50%", opacity: 0.7 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute rounded-full bg-white/30 w-40 h-40 pointer-events-none"
                        style={{ left: "50%", top: "50%", zIndex: -1 }}
                      />
                    )}
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
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  variant="ghost" 
                  onClick={onAddPillar} 
                  className="h-10 w-10 p-0 ml-6 bg-transparent"
                >
                  <Plus className="h-6 w-6 text-purple-500" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add pillar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  );
};

export default PillarTabs;
