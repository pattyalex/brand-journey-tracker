
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import AddPlatformDialog from "@/components/content/weeklyFlow/AddPlatformDialog";
import WeeklyAgenda from "@/components/content/weeklyFlow/WeeklyAgenda";
import { Platform } from "@/types/content-flow";

const WeeklyContentFlow = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isAddPlatformOpen, setIsAddPlatformOpen] = useState(false);

  const addPlatform = (platform: Platform) => {
    setPlatforms([...platforms, platform]);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Weekly Content Flow</h1>
        
        <div className="flex gap-4 relative">
          {/* Platforms sidebar */}
          <div className="w-56 shrink-0">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium">Platforms</h2>
                  <Button 
                    onClick={() => setIsAddPlatformOpen(true)}
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Platform</span>
                  </Button>
                </div>
                
                {platforms.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4 text-center bg-slate-50 dark:bg-slate-900 rounded-md">
                    No platforms added yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {platforms.map((platform) => {
                      const Icon = platform.icon;
                      return (
                        <div 
                          key={platform.id}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Icon className="h-4 w-4 text-purple-500" />
                          <span>{platform.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Weekly agenda */}
          <div className="flex-1 ml-14">
            <WeeklyAgenda platforms={platforms} />
          </div>
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
