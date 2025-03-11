
import { useState } from "react";
import { DailyPlanner } from "./DailyPlanner";
import WeeklyPlanner from "./WeeklyPlanner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarDays, Calendar } from "lucide-react";

export const PlannerTabs = () => {
  const [activeTab, setActiveTab] = useState("daily");

  return (
    <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex justify-center mb-4">
        <TabsList className="grid grid-cols-2 w-80">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Daily View</span>
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>Weekly View</span>
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="daily" className="mt-0">
        <DailyPlanner />
      </TabsContent>
      
      <TabsContent value="weekly" className="mt-0">
        <WeeklyPlanner />
      </TabsContent>
    </Tabs>
  );
};

export default PlannerTabs;
