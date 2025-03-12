import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContentItem, Platform } from "@/types/content-flow";
import AddPlatformDialog from "@/components/content/weeklyFlow/AddPlatformDialog";
import ContentSchedule from "@/components/content/weeklyFlow/ContentSchedule";
import PlatformIcon from "@/components/content/weeklyFlow/PlatformIcon";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";

const WeeklyContentFlow = () => {
  // Define initial platforms including the new ones
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

  const addPlatform = (platform: Platform) => {
    setPlatforms([...platforms, platform]);
  };

  const handleDragEnd = (result: DropResult) => {
    // This can be used for drag and drop within the schedule
    // Currently not implemented but can be added for rearranging items
  };

  // Handle the drag start event with custom drag image
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, platformId: string) => {
    // Store the platform ID in the dataTransfer object
    e.dataTransfer.setData("platformId", platformId);
    
    // Get the platform
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;
    
    // Set effectAllowed to copy to indicate we're copying, not moving
    e.dataTransfer.effectAllowed = "copy";

    // Optional: Create a custom drag image that looks like the platform icon
    const dragPreview = document.createElement("div");
    dragPreview.className = "bg-gray-100 rounded-full p-3 flex items-center shadow-lg";
    dragPreview.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="icon-container"></div>
        <span class="font-medium">${platform.name}</span>
      </div>
    `;
    
    // Append it to the body temporarily (needed for Firefox)
    document.body.appendChild(dragPreview);
    
    // Hide it but keep it in the DOM for the drag operation
    dragPreview.style.position = "absolute";
    dragPreview.style.top = "-1000px";
    dragPreview.style.opacity = "0.8";
    
    // Set it as the drag image
    e.dataTransfer.setDragImage(dragPreview, 20, 20);
    
    // Clean up the drag preview element after a short delay
    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 100);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 max-w-6xl">
        <h1 className="text-4xl font-bold mb-2">Content Creation Schedule</h1>
        <p className="text-gray-600 text-lg mb-8">
          Plan your content across different platforms for the week
        </p>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Platforms</h2>
              <Button 
                onClick={() => setIsAddPlatformOpen(true)} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Platform
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-8">
              {platforms.map((platform) => (
                <div 
                  key={platform.id} 
                  className="flex flex-col items-center"
                  draggable
                  onDragStart={(e) => handleDragStart(e, platform.id)}
                >
                  <div className="bg-gray-100 rounded-full p-3 mb-2 cursor-grab active:cursor-grabbing">
                    <PlatformIcon platform={platform} size={12} />
                  </div>
                  <span className="text-center">{platform.name}</span>
                </div>
              ))}
              
              {/* Add Your Own Platform Button */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => setIsAddPlatformOpen(true)}
                  className="bg-purple-100 rounded-full p-3 mb-2 hover:bg-purple-200 transition-colors"
                >
                  <Plus className="h-3 w-3 text-purple-600" />
                </button>
                <span className="text-center">Add your own</span>
              </div>
            </div>
          </div>
          
          <div className="pt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Weekly Schedule</h2>
            </div>
            
            <ContentSchedule 
              platforms={platforms} 
              contentItems={contentItems}
              setContentItems={setContentItems}
            />
          </div>
        </DragDropContext>
        
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
