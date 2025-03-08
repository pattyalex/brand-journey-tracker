
import React from 'react';
import { Task } from '@/types/task';
import { CheckSquare, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import SimplifiedTaskColumn from './SimplifiedTaskColumn';
import ScheduledTaskColumn from './ScheduledTaskColumn';
import CompletedTaskColumn from './CompletedTaskColumn';

interface TasksBoardProps {
  tasks: Task[];
  getTasksByStatus: (status: Task["status"]) => Task[];
  moveTask: (taskId: string, newStatus: Task["status"]) => void;
  handleEditTask: (task: Task) => void;
  handleDeleteTask: (taskId: string) => void;
  setIsAddDialogOpen: (isOpen: boolean) => void;
  setNewTask: (task: Partial<Task>) => void;
  handleAddQuickTask: (title: string, status: Task["status"]) => void;
  toggleTaskCompletion: (taskId: string) => void;
  getPriorityColor: (priority: Task["priority"]) => string;
  getPriorityIcon: (priority: Task["priority"]) => React.ReactNode;
  handleDragEnd: (result: DropResult) => void;
}

const TasksBoard = ({
  tasks,
  getTasksByStatus,
  moveTask,
  handleEditTask,
  handleDeleteTask,
  setIsAddDialogOpen,
  setNewTask,
  handleAddQuickTask,
  toggleTaskCompletion,
  getPriorityColor,
  getPriorityIcon,
  handleDragEnd
}: TasksBoardProps) => {
  return (
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
        
        <ScheduledTaskColumn 
          title="Scheduled"
          icon={<Calendar size={18} />}
          tasks={getTasksByStatus("scheduled")}
          moveTask={moveTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          getPriorityColor={getPriorityColor}
          columnId="scheduled"
        />
        
        <CompletedTaskColumn 
          title="Completed"
          icon={<CheckCircle2 size={18} />}
          tasks={getTasksByStatus("completed")}
          moveTask={moveTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          columnId="completed"
        />
      </div>
    </DragDropContext>
  );
};

export default TasksBoard;
