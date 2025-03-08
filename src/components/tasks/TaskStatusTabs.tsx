
import React from 'react';
import { Task } from '@/types/task';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import TasksBoard from './TasksBoard';
import SimplifiedTaskList from './SimplifiedTaskList';

interface TaskStatusTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
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
  getStatusDisplayName: (status: Task["status"]) => string;
}

const TaskStatusTabs = ({
  activeTab,
  setActiveTab,
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
  handleDragEnd,
  getStatusDisplayName
}: TaskStatusTabsProps) => {
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
      <TabsList className="mb-6">
        <TabsTrigger value="all">All Tasks</TabsTrigger>
        <TabsTrigger value="todo-all">All</TabsTrigger>
        <TabsTrigger value="todo-today">Today</TabsTrigger>
        <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="m-0">
        <TasksBoard 
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
        />
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
              </DragDropContext>
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default TaskStatusTabs;
