
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContentItem, Platform } from "@/types/content-flow";
import AddPlatformDialog from "@/components/content/weeklyFlow/AddPlatformDialog";
import ContentSchedule from "@/components/content/weeklyFlow/ContentSchedule";
import PlatformIcon from "@/components/content/weeklyFlow/PlatformIcon";

const WeeklyContentFlow = () => {
  // Define initial platforms including the new ones
  const initialPlatforms: Platform[] = [
    { id: "film", name: "Film", icon: "camera" },
    { id: "edit", name: "Edit", icon: "laptop" },
    { id: "script", name: "Script", icon: "pen-line" },
    { id: "admin", name: "Admin", icon: "user-cog" },
    { id: "record", name: "Record", icon: "mic" },
    { id: "brainstorm", name: "Brainstorming", icon: "lightbulb" },
    { id: "planning", name: "Planning", icon: "calendar" },
    { id: "styling", name: "Styling", icon: "shirt" },
    { id: "emails", name: "Emails", icon: "at-sign" },
    { id: "marketing", name: "Marketing", icon: "megaphone" },
    { id: "financials", name: "Financials", icon: "wallet" }
  ];

  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isAddPlatformOpen, setIsAddPlatformOpen] = useState(false);

  const addPlatform = (platform: Platform) => {
    setPlatforms([...platforms, platform]);
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
              <div key={platform.id} className="flex flex-col items-center">
                <div className="bg-gray-100 rounded-full p-6 mb-2">
                  <PlatformIcon platform={platform} size={24} />
                </div>
                <span className="text-center">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Weekly Schedule</h2>
          </div>
          
          <ContentSchedule 
            platforms={platforms} 
            contentItems={contentItems} 
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
