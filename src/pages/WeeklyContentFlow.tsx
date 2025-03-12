
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
  // Define initial platforms with more intuitive names matching the image
  const initialPlatforms: Platform[] = [
    { id: "youtube", name: "YouTube", icon: "youtube" },
    { id: "instagram", name: "Instagram", icon: "instagram" },
    { id: "edit", name: "Edit", icon: "laptop" },
    { id: "script", name: "Script", icon: "scroll" },
    { id: "record", name: "Record", icon: "mic" },
    { id: "film", name: "Film", icon: "camera" },
    { id: "submit", name: "Submit", icon: "mail" },
    { id: "review", name: "Review", icon: "file-text" }
  ];

  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isAddPlatformOpen, setIsAddPlatformOpen] = useState(false);

  const addPlatform = (platform: Platform) => {
    setPlatforms([...platforms, platform]);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    
    // Extract platform ID and day from the destination droppableId
    const [_, day] = destination.droppableId.split("-");
    
    // Create a new content item
    const platform = platforms.find(p => p.id === draggableId);
    if (!platform) return;
    
    const newItem: ContentItem = {
      id: uuidv4(),
      platformId: draggableId,
      day,
      title: platform.name.toLowerCase(),
    };
    
    setContentItems([...contentItems, newItem]);
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

    // Create a custom drag image
    const dragPreview = document.createElement("div");
    dragPreview.className = "bg-white rounded p-3 flex items-center shadow-lg";
    dragPreview.innerHTML = `
      <div class="flex flex-col items-center">
        <div class="icon-container"></div>
        <span class="text-sm mt-1">${platform.name.toLowerCase()}</span>
      </div>
    `;
    
    document.body.appendChild(dragPreview);
    
    // Position it off-screen
    dragPreview.style.position = "absolute";
    dragPreview.style.top = "-1000px";
    dragPreview.style.opacity = "0.9";
    
    // Set it as the drag image
    e.dataTransfer.setDragImage(dragPreview, 20, 20);
    
    // Clean up after a short delay
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
                  <div className="bg-white border border-gray-300 rounded-md p-3 mb-2 cursor-grab active:cursor-grabbing flex flex-col items-center">
                    <PlatformIcon platform={platform} size={24} />
                    <span className="text-sm mt-1">{platform.name.toLowerCase()}</span>
                  </div>
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
          
          <div className="pt-4">
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
