
import React, { useState, useRef, useEffect } from 'react';
import { Task } from '@/types/task';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Circle, CheckCircle, Plus, Edit, ArrowLeft } from "lucide-react";

interface SimplifiedTaskListProps {
  tasks: Task[];
  status: Task["status"];
  moveTask: (taskId: string, newStatus: Task["status"]) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  setIsAddDialogOpen: (isOpen: boolean) => void;
  setNewTask: (task: Partial<Task>) => void;
  onAddQuickTask: (title: string, status: Task["status"]) => void;
  toggleTaskCompletion: (taskId: string) => void;
  getPriorityIcon?: (priority: Task["priority"]) => React.ReactNode;
}

const SimplifiedTaskList = ({ 
  tasks, 
  status, 
  moveTask, 
  onEditTask, 
  onDeleteTask,
  setIsAddDialogOpen,
  setNewTask,
  onAddQuickTask,
  toggleTaskCompletion,
  getPriorityIcon
}: SimplifiedTaskListProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddQuickTask(newTaskTitle, status);
      setNewTaskTitle("");
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTask();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewTaskTitle("");
    }
  };

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);
  
  return (
    <DragDropContext onDragEnd={(result) => {
      if (!result.destination) return;
      
      const task = tasks.find(t => t.id === result.draggableId);
      if (!task) return;
      
      if (result.destination.droppableId !== status) {
        moveTask(task.id, result.destination.droppableId as Task["status"]);
      }
    }}>
      <Droppable droppableId={status}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="bg-gray-50 p-3 rounded-lg"
          >
            {tasks.length === 0 && !isAdding ? (
              <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">No tasks in this section</p>
                  <Button 
                    variant="link" 
                    className="mt-2 text-sm"
                    onClick={() => setIsAdding(true)}
                  >
                    Add a task
                  </Button>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-2 pr-2">
                  {tasks.map((task, index) => (
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
                              <button 
                                className="flex-shrink-0" 
                                onClick={() => toggleTaskCompletion(task.id)}
                              >
                                {task.isCompleted ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Circle className="h-4 w-4 text-gray-400 hover:text-primary" />
                                )}
                              </button>
                              <div className="flex-1 flex items-center gap-1.5">
                                <span className={`text-gray-800 text-sm ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                                  {task.title}
                                </span>
                                {getPriorityIcon && getPriorityIcon(task.priority)}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  className="text-gray-400 hover:text-gray-600"
                                  onClick={() => onEditTask(task)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                {task.isCompleted && (
                                  <button
                                    className="text-green-500 hover:text-green-600"
                                    onClick={() => moveTask(task.id, "completed")}
                                  >
                                    <ArrowLeft className="h-3.5 w-3.5 rotate-90" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </ScrollArea>
            )}
            
            {isAdding ? (
              <div className="mt-3 bg-white rounded-lg border py-1.5 px-2">
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4 text-gray-400" />
                  <Input
                    ref={inputRef}
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What needs to be done?"
                    className="flex-1 border-0 p-1 text-sm focus-visible:ring-0"
                    autoFocus
                  />
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 px-2 text-xs" 
                    onClick={handleAddTask}
                  >
                    Add
                  </Button>
                </div>
              </div>
            ) : (
              <button
                className="mt-3 flex items-center gap-2 text-muted-foreground hover:text-primary p-2 rounded-lg text-sm"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Add a task</span>
              </button>
            )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default SimplifiedTaskList;
