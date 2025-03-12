
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckSquare, Calendar, Clock, CheckCircle2, Edit, Trash2, CalendarIcon, Plus, Circle, CheckCircle, ArrowLeft, Flag } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { DailyPlanner } from "@/components/planner/DailyPlanner";
import { ContentItem, Platform } from "@/types/content-flow";
import { PlannerDay, Task } from "@/types/task-board";
import ContentSchedule from "@/components/content/weeklyFlow/ContentSchedule";
import PlatformIcon from "@/components/content/weeklyFlow/PlatformIcon";
import AddPlatformDialog from "@/components/content/weeklyFlow/AddPlatformDialog";

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

  const getStatusDisplayName = (status: Task["status"]) => {
    switch (status) {
      case "todo-all": return "All";
      case "todo-today": return "Today";
      case "scheduled": return "Scheduled";
      case "completed": return "Completed";
      default: return status;
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high": return "text-red-500";
      case "medium": return "text-amber-500";
      case "low": return "text-green-500";
      default: return "";
    }
  };

  const getPriorityIcon = (priority: Task["priority"]) => {
    switch (priority) {
      case "high": 
        return <Flag className="h-3 w-3 text-red-500 fill-red-500" />;
      case "medium": 
        return <Flag className="h-3 w-3 text-amber-500 fill-amber-500" />;
      case "low": 
        return <Flag className="h-3 w-3 text-green-500 fill-green-500" />;
      default: 
        return null;
    }
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

  const AddYourOwnIcon = ({ size = 24 }: { size?: number }) => {
    return (
      <div className="bg-gradient-to-tr from-purple-100 to-purple-200 rounded-full p-1 flex items-center justify-center">
        <Plus size={size} className="text-purple-600" />
      </div>
    );
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
            <TabsTrigger 
              value="weekly-content-tasks" 
              className="px-8 py-3 text-base font-medium bg-primary/5 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Weekly Content Tasks
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
                <DragDropContext onDragEnd={handleDragEnd}>
                  <div className="grid grid-cols-1 gap-6">
                    <SimplifiedTaskColumn 
                      title="All"
                      icon={<CheckSquare size={18} />}
                      tasks={getTasksByStatus("todo-all")}
                      moveTask={moveTask}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                      setIsAddDialogOpen={setIsAddDialogOpen}
                      setNewTask={setNewTask}
                      columnId="todo-all"
                      onAddQuickTask={handleAddQuickTask}
                      toggleTaskCompletion={toggleTaskCompletion}
                      getPriorityIcon={getPriorityIcon}
                    />
                  </div>
                </DragDropContext>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily-planner" className="m-0">
            <DailyPlanner />
          </TabsContent>

          <TabsContent value="weekly-content-tasks" className="m-0">
            {/* Weekly content tasks content */}
            <div className="container mx-auto max-w-6xl">
              <h1 className="text-2xl font-bold mb-2">Weekly Content Tasks</h1>
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
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Task" : "Add New Task"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Add more details about this task"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newTask.status}
                  onValueChange={(value: string) => setNewTask({ ...newTask, status: value as Task["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo-all">To Do</SelectItem>
                    <SelectItem value="todo-today">Today</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value: string) => setNewTask({ ...newTask, priority: value as Task["priority"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(newTask.status === "scheduled") && (
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleAddTask}>
              {isEditMode ? "Update Task" : "Add Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

interface TaskColumnProps {
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  moveTask: (taskId: string, newStatus: Task["status"]) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  getPriorityColor: (priority: Task["priority"]) => string;
  columnId: Task["status"];
}

// Keep TaskColumn component for reference but it's not used in the simplified view
const TaskColumn = ({ title, icon, tasks, moveTask, onEditTask, onDeleteTask, getPriorityColor, columnId }: TaskColumnProps) => {
  const getStatusFromTitle = (title: string): Task["status"] => {
    switch (title) {
      case "All": return "todo-all";
      case "Today": return "todo-today";
      case "Scheduled": return "scheduled";
      case "Completed": return "completed";
      default: return "todo-all";
    }
  };

  return (
    <Card className="col-span-1 h-full">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-base">{title}</CardTitle>
            <div className="text-xs rounded-full bg-gray-100 px-2 py-0.5">
              {tasks.length}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <Droppable droppableId={columnId}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-3 min-h-[200px]"
            >
              {tasks.length === 0 ? (
                <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">No tasks in this column</p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-350px)] pr-3">
                  {tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${snapshot.isDragging ? "opacity-70" : ""}`}
                        >
                          <Card className="group hover:shadow-md transition-shadow">
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium">{task.title}</h3>
                                    <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    </span>
                                  </div>
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
                                  )}
                                  {task.dueDate && (
                                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                                      <CalendarIcon className="mr-1 h-3 w-3" />
                                      {new Date(task.dueDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => onEditTask(task)}
                                  >
                                    <Edit size={14} />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 hover:text-destructive"
                                    onClick={() => onDeleteTask(task.id)}
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                </ScrollArea>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  );
};

interface SimplifiedTaskColumnProps {
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  moveTask: (taskId: string, newStatus: Task["status"]) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  setIsAddDialogOpen: (open: boolean) => void;
  setNewTask: (task: Partial<Task>) => void;
  columnId: Task["status"];
  onAddQuickTask: (title: string, status: Task["status"]) => void;
  toggleTaskCompletion: (taskId: string) => void;
  getPriorityIcon: (priority: Task["priority"]) => React.ReactNode;
}

const SimplifiedTaskColumn = ({ 
  title, 
  icon, 
  tasks, 
  moveTask, 
  onEditTask, 
  onDeleteTask, 
  setIsAddDialogOpen, 
  setNewTask, 
  columnId,
  onAddQuickTask,
  toggleTaskCompletion,
  getPriorityIcon
}: SimplifiedTaskColumnProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddQuickTask(newTaskTitle, columnId);
      setNewTaskTitle("");
    }
  };

  return (
    <Card className="col-span-1 h-full">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-base">{title}</CardTitle>
            <div className="text-xs rounded-full bg-gray-100 px-2 py-0.5">
              {tasks.length}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => {
              setNewTask({ status: columnId });
              setIsAddDialogOpen(true);
            }}
          >
            <PlusCircle size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <Droppable droppableId={columnId}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-3"
            >
              <form onSubmit={handleAddQuickTask} className="flex gap-2 mb-3">
                <Input
                  ref={inputRef}
                  placeholder="Add a quick task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="h-9 text-sm"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="h-9 px-3"
                  disabled={!newTaskTitle.trim()}
                >
                  Add
                </Button>
              </form>

              {tasks.length === 0 ? (
                <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">No tasks in this column</p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-350px)] pr-3">
                  {tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-3 ${snapshot.isDragging ? "opacity-70" : ""}`}
                        >
                          <div className="p-3 border rounded-md bg-white hover:shadow-sm transition-shadow group">
                            <div className="flex items-start gap-2">
                              <div 
                                className="mt-0.5 cursor-pointer" 
                                onClick={() => toggleTaskCompletion(task.id)}
                              >
                                {task.isCompleted ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Circle className="h-4 w-4 text-gray-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                  <span className={`${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'} font-medium text-sm`}>
                                    {task.title}
                                  </span>
                                  {getPriorityIcon(task.priority)}
                                </div>
                                {task.description && (
                                  <p className={`text-xs ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-500'} line-clamp-2`}>
                                    {task.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => onEditTask(task)}
                                >
                                  <Edit size={12} />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 hover:text-destructive"
                                  onClick={() => onDeleteTask(task.id)}
                                >
                                  <Trash2 size={12} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ScrollArea>
              )}
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  );
};

export default TaskBoard;
