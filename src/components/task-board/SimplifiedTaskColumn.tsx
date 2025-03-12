
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task } from "@/types/task-board";
import { Circle, CheckCircle, PlusCircle, Edit, Trash2 } from "lucide-react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import React, { useState, useRef } from "react";

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

export default SimplifiedTaskColumn;
