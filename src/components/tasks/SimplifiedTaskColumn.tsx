
import React, { useState, useRef, useEffect } from 'react';
import { Task } from '@/types/task';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Circle, CheckCircle, Plus, Edit, ArrowLeft } from "lucide-react";

interface SimplifiedTaskColumnProps {
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  moveTask: (taskId: string, newStatus: Task["status"]) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  setIsAddDialogOpen: (isOpen: boolean) => void;
  setNewTask: (task: Partial<Task>) => void;
  columnId: Task["status"];
  onAddQuickTask: (title: string, status: Task["status"]) => void;
  toggleTaskCompletion: (taskId: string) => void;
  getPriorityIcon?: (priority: Task["priority"]) => React.ReactNode;
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
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddQuickTask(newTaskTitle, columnId);
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
    <Card className="h-full bg-gray-50">
      <CardHeader className="pb-2 p-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title} <span className="ml-2 text-sm bg-primary/10 px-2.5 py-0.5 rounded-full">{tasks.length}</span>
        </CardTitle>
        <CardDescription>
          {title === "All" ? "Tasks to be completed" : "Tasks for today"}
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
                  {tasks.length === 0 && !isAdding ? (
                    <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
                      <p className="text-center text-muted-foreground text-sm px-2">No tasks in this section</p>
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
                    ))
                  )}
                  {provided.placeholder}
                  
                  {isAdding ? (
                    <div className="bg-white rounded-lg border py-1.5 px-2">
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
                      className="mt-1 flex items-center gap-2 text-muted-foreground hover:text-primary p-2 rounded-lg text-sm"
                      onClick={() => setIsAdding(true)}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add a task</span>
                    </button>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  );
};

export default SimplifiedTaskColumn;
