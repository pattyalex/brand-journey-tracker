
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DailyPlanner } from "@/components/planner/DailyPlanner";
import WeeklyPlanner from "@/components/planner/WeeklyPlanner";
import { PlannerDay } from "@/types/planner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TaskBoard() {
  const [plannerData, setPlannerData] = useState<PlannerDay[]>(() => {
    const saved = localStorage.getItem("plannerData");
    return saved ? JSON.parse(saved) : [];
  });

  const handleUpdatePlannerData = (updatedData: PlannerDay[]) => {
    setPlannerData(updatedData);
    localStorage.setItem("plannerData", JSON.stringify(updatedData));
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
            <p className="text-muted-foreground">
              Plan your tasks and keep track of your progress.
            </p>
          </div>

          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="daily">Daily View</TabsTrigger>
              <TabsTrigger value="weekly">Weekly View</TabsTrigger>
              <TabsTrigger value="x-section">X</TabsTrigger>
              <TabsTrigger value="weekly-content-flow">Weekly Content Flow</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="mt-0">
              <DailyPlanner />
            </TabsContent>

            <TabsContent value="weekly" className="mt-0">
              <WeeklyPlanner 
                plannerData={plannerData} 
                onUpdatePlannerData={handleUpdatePlannerData} 
              />
            </TabsContent>

            <TabsContent value="x-section" className="mt-0">
              <Card className="border-none shadow-none">
                <CardHeader className="px-0">
                  <CardTitle>X Section</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <p className="text-muted-foreground">
                    This is the new X section. More details will be added soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weekly-content-flow" className="mt-0">
              <Card className="border-none shadow-none">
                <CardHeader className="px-0">
                  <CardTitle>Weekly Content Flow</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <p className="text-muted-foreground">
                    Content planning section - waiting for further instructions.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
