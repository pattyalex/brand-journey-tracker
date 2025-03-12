
import { useState } from "react";
import Layout from "@/components/Layout";
import { ContentItem, Platform } from "@/types/content-flow";
import AddPlatformDialog from "@/components/content/weeklyFlow/AddPlatformDialog";
import ContentSchedule from "@/components/content/weeklyFlow/ContentSchedule";
import PlatformIcon from "@/components/content/weeklyFlow/PlatformIcon";
import { v4 as uuidv4 } from "uuid";

const WeeklyContentFlow = () => {
  // Define initial platforms
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

  return (
    <Layout>
      <div className="container mx-auto py-6 max-w-6xl">
        <h1 className="text-4xl font-bold mb-2">Content Creation Schedule</h1>
        <p className="text-gray-600 text-lg mb-8">
          Plan your content across different platforms for the week
        </p>
        
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Content Tasks</h2>
              <p className="text-gray-600 mt-1">Map out your content workflow: Drag and drop tasks into the day you want to complete them</p>
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
          </div>
        </div>
        
        <div className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Weekly Schedule</h2>
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
