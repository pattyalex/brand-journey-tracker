
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContentItem, Platform } from "@/types/content-flow";
import AddPlatformDialog from "@/components/content/weeklyFlow/AddPlatformDialog";
import ContentSchedule from "@/components/content/weeklyFlow/ContentSchedule";
import PlatformIcon from "@/components/content/weeklyFlow/PlatformIcon";
import AddContentDialog from "@/components/content/weeklyFlow/AddContentDialog";

// Sample content items
const initialContentItems: ContentItem[] = [
  {
    id: "1",
    platformId: "instagram",
    day: "Monday",
    title: "Instagram Story: Behind the scenes",
    description: "",
    time: ""
  },
  {
    id: "2",
    platformId: "newsletter",
    day: "Tuesday",
    title: "Newsletter post: Industry trends",
    description: "",
    time: ""
  },
  {
    id: "3",
    platformId: "youtube",
    day: "Wednesday",
    title: "Tutorial video on new feature",
    description: "",
    time: ""
  },
  {
    id: "4",
    platformId: "instagram",
    day: "Friday",
    title: "Carousel post: Top 5 tips",
    description: "",
    time: ""
  }
];

const WeeklyContentFlow = () => {
  // Define initial platforms
  const initialPlatforms: Platform[] = [
    { id: "instagram", name: "Instagram", icon: "instagram" },
    { id: "youtube", name: "YouTube", icon: "youtube" },
    { id: "newsletter", name: "Newsletter", icon: "mail" }
  ];

  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms);
  const [contentItems, setContentItems] = useState<ContentItem[]>(initialContentItems);
  const [isAddPlatformOpen, setIsAddPlatformOpen] = useState(false);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);

  const addPlatform = (platform: Platform) => {
    setPlatforms([...platforms, platform]);
  };

  const addContentItem = (item: ContentItem) => {
    setContentItems([...contentItems, item]);
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
            <Button 
              onClick={() => setIsAddContentOpen(true)}
              className="flex items-center gap-2 bg-[#8B6B4E] hover:bg-[#75593e]"
            >
              <Plus className="h-5 w-5" />
              Add Content
            </Button>
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
        
        <AddContentDialog
          open={isAddContentOpen}
          onOpenChange={setIsAddContentOpen}
          onAdd={addContentItem}
          platforms={platforms}
        />
      </div>
    </Layout>
  );
};

export default WeeklyContentFlow;
