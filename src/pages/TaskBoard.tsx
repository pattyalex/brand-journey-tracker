
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlannerDay } from '@/types/planner';
import WeeklyPlanner from '@/components/planner/WeeklyPlanner';

const TaskBoard = () => {
  // Sample data - in a real app this would come from an API or state management
  const [plannerData, setPlannerData] = useState<PlannerDay[]>([
    {
      date: "2023-09-18",
      items: [
        {
          id: "1",
          text: "Team Meeting",
          section: "morning",
          isCompleted: false,
          date: "2023-09-18",
          startTime: "10:00",
          endTime: "11:00",
          location: "Conference Room A"
        },
        {
          id: "2",
          text: "Lunch with Client",
          section: "midday",
          isCompleted: false,
          date: "2023-09-18",
          startTime: "12:00",
          endTime: "13:30",
          location: "Downtown Bistro"
        }
      ]
    },
    {
      date: "2023-09-19",
      items: [
        {
          id: "3",
          text: "Project Deadline",
          section: "afternoon",
          isCompleted: false,
          date: "2023-09-19",
          category: "Work",
          categoryColor: "#4f46e5"
        },
        {
          id: "4",
          text: "Gym Session",
          section: "evening",
          isCompleted: true,
          date: "2023-09-19",
          startTime: "18:00",
          endTime: "19:30",
          category: "Personal",
          categoryColor: "#10b981"
        }
      ]
    }
  ]);

  const handleUpdatePlannerData = (updatedData: PlannerDay[]) => {
    setPlannerData(updatedData);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Task Board</h1>
        </div>
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList>
            <TabsTrigger value="weekly">Weekly View</TabsTrigger>
            <TabsTrigger value="daily">Daily View</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly" className="space-y-4">
            <WeeklyPlanner plannerData={plannerData} onUpdatePlannerData={handleUpdatePlannerData} />
          </TabsContent>
          <TabsContent value="daily" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily View</CardTitle>
                <CardDescription>View and manage your tasks for today</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Daily view coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="agenda" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agenda View</CardTitle>
                <CardDescription>See your tasks in a list format</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Agenda view coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TaskBoard;
