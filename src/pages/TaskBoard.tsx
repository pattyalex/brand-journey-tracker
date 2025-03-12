
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { DailyPlanner } from "@/components/planner/DailyPlanner";
import { ContentItem, Platform } from "@/types/content-flow";
import { PlannerDay } from "@/types/task-board";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import PlannerHeader from "@/components/task-board/PlannerHeader";
import WeeklyContentView from "@/components/task-board/WeeklyContentView";

const TaskBoard = () => {
  const [activeTab, setActiveTab] = useState<string>("daily-planner");
  const [activePage, setActivePage] = useState<string>("daily-planner");
  const [plannerData, setPlannerData] = useState<PlannerDay[]>([]);

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

  useEffect(() => {
    const savedPlannerData = localStorage.getItem("plannerData");
    if (savedPlannerData) {
      setPlannerData(JSON.parse(savedPlannerData));
    }

    const savedContentItems = localStorage.getItem("contentItems");
    if (savedContentItems) {
      setContentItems(JSON.parse(savedContentItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("contentItems", JSON.stringify(contentItems));
  }, [contentItems]);

  return (
    <Layout>
      <div className="container mx-auto py-6 fade-in">
        <PlannerHeader activePage={activePage} setActivePage={setActivePage} />
        
        <div className="mt-40">
          <Tabs value={activePage} onValueChange={setActivePage}>
            <TabsContent value="daily-planner" className="m-0">
              <DailyPlanner />
            </TabsContent>

            <TabsContent value="weekly-content-tasks" className="m-0">
              <WeeklyContentView 
                contentItems={contentItems}
                setContentItems={setContentItems}
                platforms={platforms}
                setPlatforms={setPlatforms}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default TaskBoard;
