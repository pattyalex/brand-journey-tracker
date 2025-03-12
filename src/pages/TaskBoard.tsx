
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckSquare, Calendar, Edit, Trash2, CalendarIcon, Plus, Flag } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { DailyPlanner } from "@/components/planner/DailyPlanner";
import { ContentItem, Platform } from "@/types/content-flow";
import { PlannerDay, Task } from "@/types/task-board";
import ContentSchedule from "@/components/content/weeklyFlow/ContentSchedule";
import PlatformIcon from "@/components/content/weeklyFlow/PlatformIcon";
import AddPlatformDialog from "@/components/content/weeklyFlow/AddPlatformDialog";
import { 
  TaskDialog, 
  TasksBoard, 
  AddYourOwnIcon, 
  getPriorityIcon 
} from "@/components/task-board";

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
  const [isAddPlatformOpen, setIsAddPlatformOpen] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem("taskBoardTasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      const exampleTasks: Task[] = [
        { 
          id: "1", 
          title: "Create content calendar", 
          description: "Plan out content for the next month", 
          status: "todo-all", 
          priority: "high",
          createdAt: new Date().toISOString()
        },
        { 
          id: "2", 
          title: "Write blog post", 
          description: "Complete draft for review", 
          status: "todo-today", 
          priority: "medium",
          createdAt: new Date().toISOString()
        },
        { 
          id: "3", 
          title: "Record Instagram Reel", 
          description: "Film short tutorial clip", 
          status: "todo-all", 
          priority: "low",
          createdAt: new Date().toISOString()
        },
        { 
          id: "4", 
          title: "Edit YouTube video", 
          description: "Final edits and add transitions", 
          status: "scheduled", 
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: "medium",
          createdAt: new Date().toISOString()
        },
        { 
          id: "5", 
          title: "Schedule social posts", 
          description: "Queue up content for next week", 
          status: "completed", 
          priority: "medium",
          createdAt: new Date().toISOString()
        },
      ];
      setTasks(exampleTasks);
      localStorage.setItem("taskBoardTasks", JSON.stringify(exampleTasks));
    }

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
    localStorage.setItem("taskBoardTasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("contentItems", JSON.stringify(contentItems));
  }, [contentItems]);

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

    const updatedSourceTasks = sourceColumnTasks.filter(t => t.id !== updatedTask.id);
    
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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, platformId: string) => {
    e.dataTransfer.setData("platformId", platformId);
    
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;
    
    e.dataTransfer.effectAllowed = "copy";
    
    const dragPreview = document.createElement("div");
    dragPreview.className = "bg-white rounded-lg p-3 flex items-center shadow-lg";
    dragPreview.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="icon-container"></div>
        <span class="font-medium">${platform.name}</span>
      </div>
    `;
    
    document.body.appendChild(dragPreview);
    dragPreview.style.position = "absolute";
    dragPreview.style.top = "-1000px";
    dragPreview.style.opacity = "0.8";
    
    e.dataTransfer.setDragImage(dragPreview, 20, 20);
    
    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 100);
  };

  const clearSchedule = () => {
    setContentItems([]);
    toast.success("Schedule cleared", {
      description: "All tasks have been removed from the schedule",
    });
  };

  const addPlatform = (platform: Platform) => {
    setPlatforms([...platforms, platform]);
    toast.success("Platform added", {
      description: `${platform.name} has been added to your content tasks`
    });
  };

  const renderWeeklyContentTasks = () => (
    <div className="container mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold mb-2">Weekly View</h1>
      <p className="text-gray-600 text-lg mb-8">
        Map out your content workflow: Drag and drop tasks into the day you want to complete them
      </p>
      
      <div className="mb-10">
        <div className="flex flex-wrap gap-8">
          {platforms.map((platform) => (
            <div 
              key={platform.id} 
              className="flex flex-col items-center"
              draggable
              onDragStart={(e) => handleDragStart(e, platform.id)}
            >
              <div className="p-3 mb-2 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
                <PlatformIcon platform={platform} size={24} />
              </div>
              <span className="text-center text-sm font-medium">{platform.name}</span>
            </div>
          ))}
          
          <div 
            className="flex flex-col items-center"
            onClick={() => setIsAddPlatformOpen(true)}
          >
            <div className="p-3 mb-2 cursor-pointer hover:scale-110 transition-transform">
              <AddYourOwnIcon size={24} />
            </div>
            <span className="text-center text-sm font-medium">Add your own</span>
          </div>
        </div>
      </div>
      
      <div className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Weekly Schedule</h2>
          <Button 
            variant="outline" 
            size="xs"
            onClick={clearSchedule}
            className="gap-1.5 text-gray-600 hover:text-gray-700"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </Button>
        </div>
        
        <ContentSchedule 
          platforms={platforms} 
          contentItems={contentItems}
          setContentItems={setContentItems}
        />
      </div>
      
      <AddPlatformDialog 
        open={isAddPlatformOpen} 
        onOpenChange={setIsAddPlatformOpen}
        onAdd={addPlatform}
      />
    </div>
  );

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
            <TabsTrigger 
              value="weekly-content-tasks" 
              className="px-8 py-3 text-base font-medium bg-primary/5 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Weekly View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks-board" className="m-0">
            <TasksBoard 
              tasks={tasks}
              getTasksByStatus={getTasksByStatus}
              handleDragEnd={handleDragEnd}
              moveTask={moveTask}
              handleEditTask={handleEditTask}
              handleDeleteTask={handleDeleteTask}
              setIsAddDialogOpen={setIsAddDialogOpen}
              setNewTask={setNewTask}
              handleAddQuickTask={handleAddQuickTask}
              toggleTaskCompletion={toggleTaskCompletion}
            />
          </TabsContent>

          <TabsContent value="daily-planner" className="m-0">
            <DailyPlanner />
          </TabsContent>

          <TabsContent value="weekly-content-tasks" className="m-0">
            {renderWeeklyContentTasks()}
          </TabsContent>
        </Tabs>
      </div>

      <TaskDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        isEditMode={isEditMode}
        newTask={newTask}
        setNewTask={setNewTask}
        handleAddTask={handleAddTask}
        handleDialogClose={handleDialogClose}
      />
    </Layout>
  );
};

export default TaskBoard;
