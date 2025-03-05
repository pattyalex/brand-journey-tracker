
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckSquare } from "lucide-react";
import { useState } from "react";

// Define task types
interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
}

const TaskBoard = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Create content calendar", description: "Plan out content for the next month", status: "todo" },
    { id: "2", title: "Write blog post", description: "Complete draft for review", status: "in-progress" },
    { id: "3", title: "Record Instagram Reel", description: "Film short tutorial clip", status: "todo" },
    { id: "4", title: "Edit YouTube video", description: "Final edits and add transitions", status: "in-progress" },
    { id: "5", title: "Schedule social posts", description: "Queue up content for next week", status: "done" },
  ]);

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status);
  };

  const moveTask = (taskId: string, newStatus: Task["status"]) => {
    const updatedTasks = tasks.map((task) => 
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-playfair font-bold text-primary">Task Board</h1>
          <Button className="flex items-center gap-2">
            <PlusCircle size={16} />
            Add New Task
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* To Do Column */}
          <TaskColumn 
            title="To Do" 
            tasks={getTasksByStatus("todo")}
            moveTask={moveTask}
          />
          
          {/* In Progress Column */}
          <TaskColumn 
            title="In Progress" 
            tasks={getTasksByStatus("in-progress")}
            moveTask={moveTask}
          />
          
          {/* Done Column */}
          <TaskColumn 
            title="Done" 
            tasks={getTasksByStatus("done")}
            moveTask={moveTask}
          />
        </div>
      </div>
    </Layout>
  );
};

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  moveTask: (taskId: string, newStatus: Task["status"]) => void;
}

const TaskColumn = ({ title, tasks, moveTask }: TaskColumnProps) => {
  const getStatusFromTitle = (title: string): Task["status"] => {
    if (title === "To Do") return "todo";
    if (title === "In Progress") return "in-progress";
    return "done";
  };

  const columnStatus = getStatusFromTitle(title);
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare size={18} />
          {title} <span className="ml-2 text-sm bg-primary/10 px-2 py-0.5 rounded-full">{tasks.length}</span>
        </CardTitle>
        <CardDescription>
          {title === "To Do" ? "Tasks to be started" : 
           title === "In Progress" ? "Tasks currently being worked on" : 
           "Completed tasks"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 min-h-40">
          {tasks.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">No tasks</p>
          ) : (
            tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                currentStatus={columnStatus}
                moveTask={moveTask} 
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface TaskCardProps {
  task: Task;
  currentStatus: Task["status"];
  moveTask: (taskId: string, newStatus: Task["status"]) => void;
}

const TaskCard = ({ task, currentStatus, moveTask }: TaskCardProps) => {
  const getNextStatus = (current: Task["status"]): Task["status"] => {
    if (current === "todo") return "in-progress";
    if (current === "in-progress") return "done";
    return "todo"; // Cycling back
  };

  const handleMoveTask = () => {
    moveTask(task.id, getNextStatus(currentStatus));
  };

  return (
    <Card className="p-3 shadow-sm border cursor-pointer hover:shadow-md transition-shadow" onClick={handleMoveTask}>
      <div>
        <h3 className="font-medium mb-1">{task.title}</h3>
        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}
      </div>
    </Card>
  );
};

export default TaskBoard;
