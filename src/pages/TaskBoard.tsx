
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Task } from "@/types/task";
import TaskStatusTabs from "@/components/tasks/TaskStatusTabs";
import TaskAddEditDialog from "@/components/tasks/TaskAddEditDialog";
import { getStatusDisplayName, getPriorityColor, getPriorityIcon, getExampleTasks } from "@/utils/taskUtils";

const TaskBoard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    status: "todo-all",
    priority: "medium"
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activePage, setActivePage] = useState<string>("tasks-board");

  useEffect(() => {
    const savedTasks = localStorage.getItem("taskBoardTasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      const exampleTasks = getExampleTasks();
      setTasks(exampleTasks);
      localStorage.setItem("taskBoardTasks", JSON.stringify(exampleTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("taskBoardTasks", JSON.stringify(tasks));
  }, [tasks]);

  const toggleTaskCompletion = (taskId: string) => {
    const updatedTasks = tasks.map((task) => 
      task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
    );
    setTasks(updatedTasks);
  };

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status);
  };

  const moveTask = (taskId: string, newStatus: Task["status"]) => {
    const updatedTasks = tasks.map((task) => 
      task.id === taskId ? { ...task, status: newStatus, isCompleted: newStatus === "completed" ? true : false } : task
    );
    setTasks(updatedTasks);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    const newTasks = tasks.filter(t => t.id !== draggableId);
    
    const updatedTask = { ...task, status: destination.droppableId as Task["status"] };
    
    const sourceColumnTasks = getTasksByStatus(source.droppableId as Task["status"]);
    const destinationColumnTasks = source.droppableId === destination.droppableId ? 
      sourceColumnTasks : getTasksByStatus(destination.droppableId as Task["status"]);
    
    const remainingTasks = newTasks.filter(t => 
      t.status !== source.droppableId && t.status !== destination.droppableId
    );

    const updatedSourceTasks = sourceColumnTasks.filter(t => t.id !== draggableId);
    
    let updatedDestinationTasks = [...destinationColumnTasks];
    if (source.droppableId === destination.droppableId) {
      updatedDestinationTasks = updatedSourceTasks;
    }
    
    updatedDestinationTasks.splice(destination.index, 0, updatedTask);
    
    const finalTasks = [
      ...remainingTasks,
      ...updatedSourceTasks.filter(t => t.id !== updatedTask.id),
      ...updatedDestinationTasks
    ];
    
    setTasks(finalTasks);
  };

  const handleAddTask = () => {
    if (!newTask.title?.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    const task: Task = {
      id: isEditMode && editTaskId ? editTaskId : Date.now().toString(),
      title: newTask.title,
      description: newTask.description || "",
      status: newTask.status as Task["status"] || "todo-all",
      dueDate: newTask.dueDate,
      priority: newTask.priority as Task["priority"] || "medium",
      createdAt: isEditMode && editTaskId ? 
        tasks.find(t => t.id === editTaskId)?.createdAt || new Date().toISOString() : 
        new Date().toISOString()
    };

    if (isEditMode && editTaskId) {
      const updatedTasks = tasks.map((t) => t.id === editTaskId ? task : t);
      setTasks(updatedTasks);
      toast.success("Task updated successfully");
    } else {
      setTasks([task, ...tasks]);
      toast.success("Task added successfully");
    }

    setNewTask({
      title: "",
      description: "",
      status: "todo-all",
      priority: "medium"
    });
    setIsAddDialogOpen(false);
    setIsEditMode(false);
    setEditTaskId(null);
  };

  const handleEditTask = (task: Task) => {
    setNewTask({
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate,
      priority: task.priority
    });
    setIsEditMode(true);
    setEditTaskId(task.id);
    setIsAddDialogOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    toast.success("Task deleted successfully");
  };

  const handleDialogClose = () => {
    setNewTask({
      title: "",
      description: "",
      status: "todo-all",
      priority: "medium"
    });
    setIsEditMode(false);
    setEditTaskId(null);
    setIsAddDialogOpen(false);
  };

  const handleAddQuickTask = (title: string, status: Task["status"]) => {
    if (!title.trim()) {
      return;
    }
    
    const task: Task = {
      id: Date.now().toString(),
      title: title,
      description: "",
      status: status,
      priority: "medium",
      createdAt: new Date().toISOString()
    };
    
    setTasks([task, ...tasks]);
    toast.success("Task added successfully");
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-primary">To-Dos</h1>
            <p className="text-muted-foreground">Organize and track your content creation tasks</p>
          </div>
        </div>
        
        <Tabs defaultValue="tasks-board" value={activePage} onValueChange={setActivePage} className="mb-8">
          <TabsList className="mb-6 w-full justify-start">
            <TabsTrigger 
              value="tasks-board" 
              className="px-8 py-3 text-base font-medium bg-primary/5 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Tasks Board
            </TabsTrigger>
            <TabsTrigger 
              value="daily-planner" 
              className="px-8 py-3 text-base font-medium bg-primary/5 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Daily Planner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks-board" className="m-0">
            <Card className="border-none shadow-none">
              <CardHeader className="px-0">
                <CardTitle className="text-xl">Tasks Board</CardTitle>
                <CardDescription>
                  Organize your tasks by status and track your progress
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <TaskStatusTabs 
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  tasks={tasks}
                  getTasksByStatus={getTasksByStatus}
                  moveTask={moveTask}
                  handleEditTask={handleEditTask}
                  handleDeleteTask={handleDeleteTask}
                  setIsAddDialogOpen={setIsAddDialogOpen}
                  setNewTask={setNewTask}
                  handleAddQuickTask={handleAddQuickTask}
                  toggleTaskCompletion={toggleTaskCompletion}
                  getPriorityColor={getPriorityColor}
                  getPriorityIcon={getPriorityIcon}
                  handleDragEnd={handleDragEnd}
                  getStatusDisplayName={getStatusDisplayName}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily-planner" className="m-0">
            <Card className="border-none shadow-none">
              <CardHeader className="px-0">
                <CardTitle className="text-xl">Daily Planner</CardTitle>
                <CardDescription>
                  Plan your day and organize your schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="bg-muted/50 p-12 rounded-lg flex items-center justify-center h-[500px]">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Daily Planner Coming Soon</h3>
                    <p className="text-muted-foreground">
                      This section is under development. Check back soon for updates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <TaskAddEditDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        newTask={newTask}
        setNewTask={setNewTask}
        handleAddTask={handleAddTask}
        handleDialogClose={handleDialogClose}
        isEditMode={isEditMode}
      />
    </Layout>
  );
};

export default TaskBoard;
