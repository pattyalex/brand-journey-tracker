
import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PlannerTabs from "@/components/planner/PlannerTabs";

const TaskBoard = () => {
  return (
    <Layout>
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:gap-8 pb-20">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
            <p className="text-muted-foreground mt-1">
              Manage your daily tasks and schedule.
            </p>
          </div>
          
          <div className="w-full">
            <PlannerTabs />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TaskBoard;
