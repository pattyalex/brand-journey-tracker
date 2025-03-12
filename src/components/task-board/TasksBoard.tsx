
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Task } from "@/types/task-board";
import { CheckSquare } from "lucide-react";
import { SimplifiedTaskColumn } from "./";
import { getPriorityIcon } from "./TaskUtils";

interface TasksBoardProps {
  tasks: Task[];
  getTasksByStatus: (status: Task["status"]) => Task[];
  handleDragEnd: (result: DropResult) => void;
  moveTask: (taskId: string, newStatus: Task["status"]) => void;
  handleEditTask: (task: Task) => void;
  handleDeleteTask: (taskId: string) => void;
  setIsAddDialogOpen: (open: boolean) => void;
  setNewTask: (task: Partial<Task>) => void;
  handleAddQuickTask: (title: string, status: Task["status"]) => void;
  toggleTaskCompletion: (taskId: string) => void;
}

const TasksBoard = ({
  tasks,
  getTasksByStatus,
  handleDragEnd,
  moveTask,
  handleEditTask,
  handleDeleteTask,
  setIsAddDialogOpen,
  setNewTask,
  handleAddQuickTask,
  toggleTaskCompletion
}: TasksBoardProps) => {
  return (
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
  );
};

export default TasksBoard;
