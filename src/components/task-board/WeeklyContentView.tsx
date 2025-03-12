
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentItem, Platform } from "@/types/content-flow";
import PlatformIcon from "@/components/content/weeklyFlow/PlatformIcon";
import ContentSchedule from "@/components/content/weeklyFlow/ContentSchedule";
import AddPlatformDialog from "@/components/content/weeklyFlow/AddPlatformDialog";
import { AddYourOwnIcon } from "@/components/task-board";

interface WeeklyContentViewProps {
  contentItems: ContentItem[];
  setContentItems: (items: ContentItem[]) => void;
  platforms: Platform[];
  setPlatforms: (platforms: Platform[]) => void;
}

const WeeklyContentView = ({ 
  contentItems, 
  setContentItems, 
  platforms, 
  setPlatforms 
}: WeeklyContentViewProps) => {
  const [isAddPlatformOpen, setIsAddPlatformOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, platformId: string) => {
    e.dataTransfer.setData("platformId", platformId);
    
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;
    
    e.dataTransfer.effectAllowed = "copy";
    
    const dragPreview = document.createElement("div");
    dragPreview.className = "bg-white rounded-lg p-3 flex items-center shadow-lg";
    dragPreview.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="icon-container"></div>
        <span class="font-medium">${platform.name}</span>
      </div>
    `;
    
    document.body.appendChild(dragPreview);
    dragPreview.style.position = "absolute";
    dragPreview.style.top = "-1000px";
    dragPreview.style.opacity = "0.8";
    
    e.dataTransfer.setDragImage(dragPreview, 20, 20);
    
    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 100);
  };

  const clearSchedule = () => {
    setContentItems([]);
    toast.success("Schedule cleared", {
      description: "All tasks have been removed from the schedule",
    });
  };

  const addPlatform = (platform: Platform) => {
    setPlatforms([...platforms, platform]);
    toast.success("Platform added", {
      description: `${platform.name} has been added to your content tasks`
    });
  };

  return (
    <div className="container mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold mb-2">Weekly View</h1>
      <p className="text-gray-600 text-lg mb-8">
        Plan your content workflow: Drag and drop tasks into the day you want to complete them
      </p>
      
      <div className="mb-10">
        <div className="flex flex-wrap gap-8">
          {platforms.map((platform) => (
            <div 
              key={platform.id} 
              className="flex flex-col items-center"
              draggable
              onDragStart={(e) => handleDragStart(e, platform.id)}
            >
              <div className="p-3 mb-2 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
                <PlatformIcon platform={platform} size={24} />
              </div>
              <span className="text-center text-sm font-medium">{platform.name}</span>
            </div>
          ))}
          
          <div 
            className="flex flex-col items-center"
            onClick={() => setIsAddPlatformOpen(true)}
          >
            <div className="p-3 mb-2 cursor-pointer hover:scale-110 transition-transform">
              <AddYourOwnIcon size={24} />
            </div>
            <span className="text-center text-sm font-medium">Add your own</span>
          </div>
        </div>
      </div>
      
      <div className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Weekly Schedule</h2>
          <Button 
            variant="outline" 
            size="xs"
            onClick={clearSchedule}
            className="gap-1.5 text-gray-600 hover:text-gray-700"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </Button>
        </div>
        
        <ContentSchedule 
          platforms={platforms} 
          contentItems={contentItems}
          setContentItems={setContentItems}
        />
      </div>
      
      <AddPlatformDialog 
        open={isAddPlatformOpen} 
        onOpenChange={setIsAddPlatformOpen}
        onAdd={addPlatform}
      />
    </div>
  );
};

export default WeeklyContentView;
