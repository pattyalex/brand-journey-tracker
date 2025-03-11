import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckSquare, Calendar, Clock, CheckCircle2, Edit, Trash2, CalendarIcon, Plus, Circle, CheckCircle, ArrowLeft, Flag } from "lucide-react";
import { Instagram, Youtube, Facebook, Twitter, Globe, Podcast, VideoIcon, MessageSquare, FileText, PlusIcon } from "lucide-react";
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
import { WeeklyPlanner } from "@/components/planner/WeeklyPlanner";
import { PlannerDay } from "@/types/planner";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo-all" | "todo-today" | "scheduled" | "completed";
  dueDate?: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
  isCompleted?: boolean;
}

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

  // Add new state for content schedule
  const [contentPlatforms, setContentPlatforms] = useState<ContentPlatform[]>([
    { id: "1", name: "Instagram", icon: "Instagram" },
    { id: "2", name: "YouTube", icon: "Youtube" },
    { id: "3", name: "Blog", icon: "FileText" }
  ]);

  const [contentSchedule, setContentSchedule] = useState<ContentScheduleItem[]>([
    { id: "1", platformId: "1", day: "monday", content: "Instagram Story: Behind the scenes" },
    { id: "2", platformId: "2", day: "wednesday", content: "Tutorial video on new feature" },
    { id: "3", platformId: "1", day: "friday", content: "Carousel post: Top 5 tips" },
    { id: "4", platformId: "3", day: "tuesday", content: "Blog post: Industry trends" }
  ]);
  
  const [newPlatform, setNewPlatform] = useState<Partial<ContentPlatform>>({
    name: "",
    icon: "Globe"
  });
  
  const [newScheduleItem, setNewScheduleItem] = useState<Partial<ContentScheduleItem>>({
    platformId: "",
    day: "monday",
    content: ""
  });
  
  const [isAddPlatformOpen, setIsAddPlatformOpen] = useState(false);
  const [isAddScheduleItemOpen, setIsAddScheduleItemOpen] = useState(false);
  const [editScheduleItemId, setEditScheduleItemId] = useState<string | null>(null);

  const handleAddPlatform = () => {
    if (!newPlatform.name?.trim()) {
      toast.error("Please enter a platform name");
      return;
    }

    const platform: ContentPlatform = {
      id: Date.now().toString(),
      name: newPlatform.name,
      icon: newPlatform.icon || "Globe"
    };

    setContentPlatforms([...contentPlatforms, platform]);
    setNewPlatform({ name: "", icon: "Globe" });
    setIsAddPlatformOpen(false);
    toast.success("Platform added successfully");
  };

  const handleDeletePlatform = (platformId: string) => {
    setContentPlatforms(contentPlatforms.filter(p => p.id !== platformId));
    setContentSchedule(contentSchedule.filter(item => item.platformId !== platformId));
    toast.success("Platform deleted");
  };

  const handleAddScheduleItem = () => {
    if (!newScheduleItem.platformId) {
      toast.error("Please select a platform");
      return;
    }
    
    if (!newScheduleItem.content?.trim()) {
      toast.error("Please enter content description");
      return;
    }

    if (editScheduleItemId) {
      // Update existing item
      const updatedSchedule = contentSchedule.map(item => 
        item.id === editScheduleItemId 
          ? { ...item, platformId: newScheduleItem.platformId!, day: newScheduleItem.day!, content: newScheduleItem.content! }
          : item
      );
      setContentSchedule(updatedSchedule);
      toast.success("Schedule item updated");
    } else {
      // Add new item
      const scheduleItem: ContentScheduleItem = {
        id: Date.now().toString(),
        platformId: newScheduleItem.platformId,
        day: newScheduleItem.day as WeekDay,
        content: newScheduleItem.content
      };
      setContentSchedule([...contentSchedule, scheduleItem]);
      toast.success("Content added to schedule");
    }
    
    setNewScheduleItem({ platformId: "", day: "monday", content: "" });
    setIsAddScheduleItemOpen(false);
    setEditScheduleItemId(null);
  };

  const handleEditScheduleItem = (item: ContentScheduleItem) => {
    setNewScheduleItem({
      platformId: item.platformId,
      day: item.day,
      content: item.content
    });
    setEditScheduleItemId(item.id);
    setIsAddScheduleItemOpen(true);
  };

  const handleDeleteScheduleItem = (itemId: string) => {
    setContentSchedule(contentSchedule.filter(item => item.id !== itemId));
    toast.success("Schedule item removed");
  };

  const getPlatformById = (platformId: string) => {
    return contentPlatforms.find(p => p.id === platformId);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Instagram": return <Instagram className="w-5 h-5" />;
      case "Youtube": return <Youtube className="w-5 h-5" />;
      case "Facebook": return <Facebook className="w-5 h-5" />;
      case "Twitter": return <Twitter className="w-5 h-5" />;
      case "FileText": return <FileText className="w-5 h-5" />;
      case "Globe": return <Globe className="w-5 h-5" />;
      case "Podcast": return <Podcast className="w-5 h-5" />;
      case "VideoIcon": return <VideoIcon className="w-5 h-5" />;
      case "MessageSquare": return <MessageSquare className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
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
              value="weekly-view" 
              className="px-8 py-3 text-base font-medium bg-primary/5 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Weekly View
            </TabsTrigger>
            <TabsTrigger 
              value="x-section" 
              className="px-8 py-3 text-base font-medium bg-primary/5 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              X
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
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
                  <TabsList className="mb-6">
                    <TabsTrigger value="all">All Tasks</TabsTrigger>
                    <TabsTrigger value="todo-all">All</TabsTrigger>
                    <TabsTrigger value="todo-today">Today</TabsTrigger>
                    <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="m-0">
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        
                        <SimplifiedTaskColumn 
                          title="Today"
                          icon={<Clock size={18} />}
                          tasks={getTasksByStatus("todo-today")}
                          moveTask={moveTask}
                          onEditTask={handleEditTask}
                          onDeleteTask={handleDeleteTask}
                          setIsAddDialogOpen={setIsAddDialogOpen}
                          setNewTask={setNewTask}
                          columnId="todo-today"
                          onAddQuickTask={handleAddQuickTask}
                          toggleTaskCompletion={toggleTaskCompletion}
                          getPriorityIcon={getPriorityIcon}
                        />
                        
                        <TaskColumn 
                          title="Scheduled"
                          icon={<Calendar size={18} />}
                          tasks={getTasksByStatus("scheduled")}
                          moveTask={moveTask}
                          onEditTask={handleEditTask}
                          onDeleteTask={handleDeleteTask}
                          getPriorityColor={getPriorityColor}
                          columnId="scheduled"
                        />
                        
                        <TaskColumn 
                          title="Completed"
                          icon={<CheckCircle2 size={18} />}
                          tasks={getTasksByStatus("completed")}
                          moveTask={moveTask}
                          onEditTask={handleEditTask}
                          onDeleteTask={handleDeleteTask}
                          getPriorityColor={getPriorityColor}
                          columnId="completed"
                        />
                      </div>
                    </DragDropContext>
                  </TabsContent>

                  {["todo-all", "todo-today"].map((status) => (
                    <TabsContent key={status} value={status} className="m-0">
                      <div className="space-y-4">
                        <div className="flex items-center mb-2">
                          <h2 className="text-xl font-semibold">{getStatusDisplayName(status as Task["status"])} Tasks</h2>
                          <span className="ml-2 text-sm bg-primary/10 px-2.5 py-0.5 rounded-full">
                            {getTasksByStatus(status as Task["status"]).length}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          <SimplifiedTaskList 
                            tasks={getTasksByStatus(status as Task["status"])} 
                            status={status as Task["status"]}
                            moveTask={moveTask}
                            onEditTask={handleEditTask}
                            onDeleteTask={handleDeleteTask}
                            setIsAddDialogOpen={setIsAddDialogOpen}
                            setNewTask={setNewTask}
                            onAddQuickTask={handleAddQuickTask}
                            toggleTaskCompletion={toggleTaskCompletion}
                            getPriorityIcon={getPriorityIcon}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  ))}

                  {["scheduled", "completed"].map((status) => (
                    <TabsContent key={status} value={status} className="m-0">
                      <div className="space-y-4">
                        <div className="flex items-center mb-2">
                          <h2 className="text-xl font-semibold">{getStatusDisplayName(status as Task["status"])} Tasks</h2>
                          <span className="ml-2 text-sm bg-primary/10 px-2.5 py-0.5 rounded-full">
                            {getTasksByStatus(status as Task["status"]).length}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId={status}>
                              {(provided) => (
                                <div 
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className="space-y-3"
                                >
                                  {getTasksByStatus(status as Task["status"]).length === 0 ? (
                                    <div className="flex h-[150px] items-center justify-center rounded-md border border-dashed">
                                      <div className="text-center">
                                        <p className="text-sm text-muted-foreground">No tasks in this section</p>
                                        <Button 
                                          variant="link" 
                                          className="mt-2"
                                          onClick={() => {
                                            setNewTask({ ...newTask, status: status as Task["status"] });
                                            setIsAddDialogOpen(true);
                                          }}
                                        >
                                          Add a task
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <ScrollArea className="h-[calc(100vh-250px)]">
                                      <div className="space-y-3 pr-4">
                                        {getTasksByStatus(status as Task["status"]).map((task, index) => (
                                          <Draggable key={task.id} draggableId={task.id} index={index}>
                                            {(provided, snapshot) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`${snapshot.isDragging ? "opacity-70" : ""}`}
                                              >
                                                <Card key={task.id} className="group hover:shadow-md transition-shadow">
                                                  <CardContent className="p-4">
                                                    <div className="flex justify-between items-start gap-4">
                                                      <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                          <h3 className="font-medium">{task.title}</h3>
                                                          <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                                          </span>
                                                        </div>
                                                        {task.description && (
                                                          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
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
                                                          onClick={() => handleEditTask(task)}
                                                        >
                                                          <Edit size={14} />
                                                        </Button>
                                                        <Button 
                                                          size="icon" 
                                                          variant="ghost" 
                                                          className="h-8 w-8 hover:text-destructive" 
                                                          onClick={() => handleDeleteTask(task.id)}
                                                        >
                                                          <Trash2 size={14} />
                                                        </Button>
                                                      </div>
                                                    </div>
                                                    
                                                    <div className="flex gap-2 mt-3 flex-wrap">
                                                      {status !== "todo-today" && (
                                                        <Button 
                                                          size="xs" 
                                                          variant="outline" 
                                                          className="text-xs"
                                                          onClick={() => moveTask(task.id, "todo-today")}
                                                        >
                                                          <Clock size={12} className="mr-1" />
                                                          Move to Today
                                                        </Button>
                                                      )}
                                                      {status !== "todo-all" && status !== "completed" && (
                                                        <Button 
                                                          size="xs" 
                                                          variant="outline" 
                                                          className="text-xs"
                                                          onClick={() => moveTask(task.id, "todo-all")}
                                                        >
                                                          <CheckSquare size={12} className="mr-1" />
                                                          Move to To Do
                                                        </Button>
                                                      )}
                                                      {status !== "scheduled" && (
                                                        <Button 
                                                          size="xs" 
                                                          variant="outline" 
                                                          className="text-xs"
                                                          onClick={() => {
                                                            const updatedTasks = tasks.map((t) => {
                                                              if (t.id === task.id) {
                                                                return { 
                                                                  ...t, 
                                                                  status: "scheduled" as Task["status"], 
                                                                  dueDate: t.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                                                };
                                                              }
                                                              return t;
                                                            });
                                                            setTasks(updatedTasks);
                                                          }}
                                                        >
                                                          <Calendar size={12} className="mr-1" />
                                                          Schedule
                                                        </Button>
                                                      )}
                                                      {status !== "completed" && (
                                                        <Button 
                                                          size="xs" 
                                                          variant="outline" 
                                                          className="text-xs text-green-600"
                                                          onClick={() => moveTask(task.id, "completed")}
                                                        >
                                                          <CheckCircle2 size={12} className="mr-1" />
                                                          Complete
                                                        </Button>
                                                      )}
                                                    </div>
                                                  </CardContent>
                                                </Card>
                                              </div>
                                            )}
                                          </Draggable>
                                        ))}
                                        {provided.placeholder}
                                      </div>
                                    </ScrollArea>
                                  )}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </DragDropContext>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily-planner" className="m-0">
            <DailyPlanner />
          </TabsContent>

          <TabsContent value="weekly-view" className="m-0">
            <WeeklyPlanner plannerData={plannerData} />
          </TabsContent>

          <TabsContent value="x-section" className="m-0">
            <Card className="border-none shadow-none">
              <CardHeader className="px-0">
                <CardTitle className="text-xl">Content Creation Schedule</CardTitle>
                <CardDescription>
                  Plan your content across different platforms for the week
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-medium">Platforms</h3>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsAddPlatformOpen(true)}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Platform
                  </Button>
                </div>

                <div className="mb-6 flex flex-wrap gap-4">
                  {contentPlatforms.map(platform => (
                    <div key={platform.id} className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1 relative group">
                        {getIconComponent(platform.icon)}
                        <button 
                          className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeletePlatform(platform.id)}
                        >
                          ×
                        </button>
                      </div>
                      <span className="text-xs text-center">{platform.name}</span>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-medium">Weekly Schedule</h3>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setNewScheduleItem({ platformId: "", day: "monday", content: "" });
                      setIsAddScheduleItemOpen(true);
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Content
                  </Button>
                </div>

                <div className="grid grid-cols-6 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="col-span-1 flex flex-col">
                    <div className="h-10 flex items-end justify-center mb-2">
                      <h4 className="font-medium text-muted-foreground">Platforms</h4>
                    </div>
                    {contentPlatforms.map(platform => (
                      <div key={platform.id} className="py-2 px-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {getIconComponent(platform.icon)}
                        </div>
                        <span className="text-sm">{platform.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  {["monday", "tuesday", "wednesday", "thursday", "friday"].map((day) => (
                    <div key={day} className="col-span-1">
                      <div className="h-10 flex items-center justify-center font-medium capitalize bg-primary/5 rounded mb-2">
                        {day}
                      </div>
                      <div className="min-h-[200px]">
                        {contentSchedule
                          .filter(item => item.day === day)
                          .map(item => {
                            const platform = getPlatformById(item.platformId);
                            return (
                              <div key={item.id} className="mb-2 p-2 bg-white rounded border group">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-5 h-5 flex-shrink-0">
                                    {platform && getIconComponent(platform.icon)}
                                  </div>
                                  <span className="text-xs font-medium">{platform?.name}</span>
                                </div>
                                <p className="text-sm">{item.content}</p>
                                <div className="flex justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={() => handleEditScheduleItem(item)}
                                  >
                                    <Edit size={
