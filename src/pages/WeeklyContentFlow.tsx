
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContentItem, Platform } from "@/types/content-flow";
import AddPlatformDialog from "@/components/content/weeklyFlow/AddPlatformDialog";
import ContentSchedule from "@/components/content/weeklyFlow/ContentSchedule";
import PlatformIcon from "@/components/content/weeklyFlow/PlatformIcon";
import { DragDropContext, Draggable, DropResult } from "react-beautiful-dnd";
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
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    
    // Extract platform ID and day from the destination droppableId
    const [platformId, day] = destination.droppableId.split("-");
    
    // Check if there's already content for this platform on this day
    const exists = contentItems.some(item => 
      item.platformId === platformId && item.day === day
    );
    
    if (exists) return;
    
    // Create a new content item
    const newItem: ContentItem = {
      id: uuidv4(),
      platformId: draggableId,
      day,
      title: `New ${platforms.find(p => p.id === draggableId)?.name || 'Content'} task`,
    };
    
    setContentItems([...contentItems, newItem]);
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
              {platforms.map((platform, index) => (
                <div 
                  key={platform.id} 
                  className="flex flex-col items-center"
                >
                  <div className="bg-gray-100 rounded-full p-3 mb-2">
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
          
          <div className="border-t border-gray-200 pt-8">
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
