import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckSquare, Clock, CheckCircle2, Edit, Trash2, Plus, Circle, CheckCircle, ArrowLeft, Flag } from "lucide-react";
import { CalendarIcon as CalendarIconBase } from "lucide-react";
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
import { LovableCalendar } from "@/components/planner/LovableCalendar";
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

  const handleUpdatePlannerData = (updatedData: PlannerDay[]) => {
    setPlannerData(updatedData);
    localStorage.setItem("plannerData", JSON.stringify(updatedData));
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
              value="lovable-calendar" 
              className="px-8 py-3 text-base font-medium bg-primary/5 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Lovable Calendar
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
                        <TaskColumn 
                          title="All"
                          icon={<CheckSquare size={18} />}
                          tasks={getTasksByStatus("todo-all")}
                          moveTask={moveTask}
                          onEditTask={handleEditTask}
                          onDeleteTask={handleDeleteTask}
                          getPriorityColor={getPriorityColor}
                          columnId="todo-all"
                        />
                        
                        <TaskColumn 
                          title="Today"
                          icon={<Clock size={18} />}
                          tasks={getTasksByStatus("todo-today")}
                          moveTask={moveTask}
                          onEditTask={handleEditTask}
                          onDeleteTask={handleDeleteTask}
                          getPriorityColor={getPriorityColor}
                          columnId="todo-today"
                        />
                        
                        <TaskColumn 
                          title="Scheduled"
                          icon={<CalendarIconBase size={18} />}
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
                          <TaskList 
                            tasks={getTasksByStatus(status as Task["status"])} 
                            status={status as Task["status"]}
                            moveTask={moveTask}
                            onEditTask={handleEditTask}
                            onDeleteTask={handleDeleteTask}
                            getPriorityIcon={getPriorityIcon}
                            toggleTaskCompletion={(taskId) => {
                              const updatedTasks = tasks.map((task) => 
                                task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
                              );
                              setTasks(updatedTasks);
                            }}
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
                                                            <CalendarIconBase className="mr-1 h-3 w-3" />
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
                                                          <CalendarIconBase size={12} className="mr-1" />
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
            <WeeklyPlanner plannerData={plannerData} onUpdatePlannerData={handleUpdatePlannerData} />
          </TabsContent>

          <TabsContent value="lovable-calendar" className="m-0">
            <LovableCalendar plannerData={plannerData} onUpdatePlannerData={handleUpdatePlannerData} />
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
                  <CalendarIconBase className="mr-2 h-4 w-4 text-muted-foreground" />
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

const TaskColumn = ({ title, icon, tasks, moveTask, onEditTask, onDeleteTask, getPriorityColor, columnId }: TaskColumnProps) => {
  const getStatusFromTitle = (title: string): Task["status"] => {
    switch (title) {
      case "All": return "todo-all";
      case "Today": return "todo-today";
      case "Scheduled": return "scheduled";
      default: return "completed";
    }
  };

  if (columnId === "completed") {
    return (
      <Card className="h-full bg-gray-50">
        <CardHeader className="pb-2 p-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title} <span className="ml-2 text-sm bg-primary/10 px-2.5 py-0.5 rounded-full">{tasks.length}</span>
          </CardTitle>
          <CardDescription>
            Completed tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <Droppable droppableId={columnId}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="h-[calc(100vh-280px)]"
              >
                <ScrollArea className="h-full">
                  <div className="flex flex-col gap-2 min-h-40 pr-2">
                    {tasks.length === 0 ? (
                      <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
                        <p className="text-center text-muted-foreground text-sm px-2">No completed tasks</p>
                      </div>
                    ) : (
                      tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${snapshot.isDragging ? "opacity-70" : ""}`}
                            >
                              <div className="group bg-white rounded-lg border py-2.5 px-3 hover:shadow-sm transition-shadow">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  <div className="flex-1">
                                    <span className="text-gray-800 text-sm line-through">{task.title}</span>
                                    {task.dueDate && (
                                      <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                        <CalendarIconBase className="mr-1 h-3 w-3" />
                                        {new Date(task.dueDate).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                      variant="ghost" 
                                      className="h-7 px-2" 
                                      size="sm"
                                      onClick={() => moveTask(task.id, "todo-all")}
                                    >
                                      <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                                      <span className="text-xs">Restore</span>
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-6 w-6 text-gray-500 hover:text-gray-700" 
                                      onClick={() => onDeleteTask(task.id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                </ScrollArea>
              </div>
            )}
          </Droppable>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title} <span className="ml-2 text-sm bg-primary/10 px-2.5 py-0.5 rounded-full">{tasks.length}</span>
        </CardTitle>
        <CardDescription>
          {title === "All" ? "Tasks to be completed" : 
           title === "Today" ? "Tasks for today" : 
           title === "Scheduled" ? "Future scheduled tasks" :
           "Completed tasks"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Droppable droppableId={columnId}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="h-[calc(100vh-280px)]"
            >
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-3 min-h-40 pr-4">
                  {tasks.length === 0 ? (
                    <div className="flex h-[130px] items-center justify-center rounded-md border border-dashed">
                      <p className="text-center text-muted-foreground text-sm px-2">No tasks in this section</p>
                      <Button 
                        variant="link" 
                        className="mt-2"
                        onClick={() => {
                          setNewTask({ ...newTask, status: columnId as Task["status"] });
                          setIsAddDialogOpen(true);
