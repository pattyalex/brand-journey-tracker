
import { useState } from "react";
import Layout from "@/components/Layout";
import { ContentItem, Platform } from "@/types/content-flow";
import AddPlatformDialog from "@/components/content/weeklyFlow/AddPlatformDialog";
import ContentSchedule from "@/components/content/weeklyFlow/ContentSchedule";
import PlatformIcon from "@/components/content/weeklyFlow/PlatformIcon";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WeeklyContentFlow = () => {
  const initialPlatforms: Platform[] = [
    { id: "film", name: "Film", icon: "camera" },
    { id: "edit", name: "Edit", icon: "laptop" },
    { id: "script", name: "Script", icon: "scroll" },
    { id: "admin", name: "Admin", icon: "user-cog" },
    { id: "record", name: "Record", icon: "mic" },
    { id: "ideation", name: "Ideation", icon: "lightbulb" },
    { id: "planning", name: "Planning", icon: "calendar" },
    { id: "styling", name: "Styling", icon: "dress" },
    { id: "emails", name: "Emails", icon: "at-sign" },
    { id: "strategy", name: "Strategy", icon: "target" },
    { id: "financials", name: "Financials", icon: "wallet" }
  ];

  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isAddPlatformOpen, setIsAddPlatformOpen] = useState(false);
  const { toast } = useToast();

  const addPlatform = (platform: Platform) => {
    setPlatforms([...platforms, platform]);
    toast({
      title: "Platform added",
      description: `${platform.name} has been added to your content tasks`
    });
  };

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
    toast({
      title: "Schedule cleared",
      description: "All tasks have been removed from the schedule",
    });
  };

  const AddYourOwnIcon = ({ size = 24 }: { size?: number }) => {
    return (
      <div className="bg-gradient-to-tr from-purple-100 to-purple-200 rounded-full p-1 flex items-center justify-center">
        <Plus size={size} className="text-purple-600" />
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 max-w-6xl">
        <h1 className="text-4xl font-bold mb-2">Y</h1>
        <p className="text-gray-600 text-lg mb-8">
          Map out your content workflow: Drag and drop tasks into the day you want to complete them
        </p>
        
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              {/* Removed the text "Map out your content workflow: Drag and drop tasks into the day you want to complete them" */}
            </div>
          </div>
          
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
    </Layout>
  );
};

export default WeeklyContentFlow;
