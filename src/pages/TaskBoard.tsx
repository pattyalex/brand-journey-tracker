
import { useState } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, ListChecks, KanbanSquare } from "lucide-react";
import WeeklyContentTasks from "./WeeklyContentTasks";

const TaskBoard = () => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <Layout>
      <div className="container mx-auto py-6 max-w-7xl">
        <h1 className="text-4xl font-bold mb-2">Task Board</h1>
        <p className="text-gray-600 text-lg mb-8">
          Organize your tasks and projects to stay on top of your goals
        </p>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">
              <ListChecks className="h-4 w-4 mr-2" />
              All Tasks
            </TabsTrigger>
            <TabsTrigger value="weekly-view">
              <KanbanSquare className="h-4 w-4 mr-2" />
              Weekly View
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="m-0">
            <div className="container mx-auto max-w-6xl">
              <h1 className="text-2xl font-bold mb-2">All Tasks</h1>
              <p className="text-gray-600 text-lg mb-8">
                View and manage all your scheduled tasks
              </p>
            </div>
          </TabsContent>
          <TabsContent value="weekly-view" className="m-0">
            <WeeklyContentTasks />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TaskBoard;
